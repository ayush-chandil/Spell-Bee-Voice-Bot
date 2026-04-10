import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import WelcomeScreen from './components/WelcomeScreen';
import GameBoard from './components/GameBoard';
import ResultsScreen from './components/ResultsScreen';
import { startSession } from './utils/api';

function App() {
  const [gameState, setGameState] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [userTurn, setUserTurn] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState(null);

  const sendMessageRef    = useRef(null);
  const recognitionRef    = useRef(null);
  const utteranceRef      = useRef(null);   // track active utterance to avoid onend on cancel
  const awaitingResultRef = useRef(false);  // lock: one spell sent, waiting for result
  const isListeningRef    = useRef(false);  // lock: only one recognition at a time
  const gameActiveRef     = useRef(false);  // track if game is still running

  // ── Text-to-Speech ──────────────────────────────────────────────────────────
  const speakWord = useCallback((text, onDone) => {
    if (!window.speechSynthesis) { onDone?.(); return; }

    // Nullify previous utterance's onend BEFORE cancelling so it doesn't fire
    if (utteranceRef.current) {
      utteranceRef.current.onend  = null;
      utteranceRef.current.onstart = null;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate  = 0.85;
    utterance.pitch = 1;

    utterance.onstart = () => { setBotSpeaking(true); setUserTurn(false); };
    utterance.onend   = () => { setBotSpeaking(false); onDone?.(); };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Speech Recognition ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    // Guard: don't start if already listening or awaiting a result
    if (isListeningRef.current || awaitingResultRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCurrentStatus('⚠️ Speech recognition not supported. Please use Chrome.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang            = 'en-US';
    recognition.continuous      = false;
    recognition.interimResults  = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    isListeningRef.current = true;

    recognition.onstart = () => {
      setCurrentStatus('🎙️ Listening… spell the word letter by letter!');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('Heard:', transcript);
      isListeningRef.current = false;
      recognitionRef.current = null;
      setCurrentStatus(`🗣️ You said: "${transcript}"`);
      setUserTurn(false);

      // Send only once per turn
      if (!awaitingResultRef.current && sendMessageRef.current) {
        awaitingResultRef.current = true;
        sendMessageRef.current({ type: 'spell', text: transcript });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isListeningRef.current = false;
      recognitionRef.current = null;
      if (event.error === 'not-allowed') {
        setCurrentStatus('❌ Microphone access denied. Allow it in browser settings.');
        setUserTurn(false);
      } else if (event.error === 'no-speech') {
        setCurrentStatus('🔇 No speech detected — try again.');
        // Retry after short delay if still user's turn
        setTimeout(() => { if (gameActiveRef.current && !awaitingResultRef.current) startListening(); }, 800);
      } else {
        setCurrentStatus(`⚠️ Speech error: ${event.error}`);
        setUserTurn(false);
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      console.log('Recognition ended');
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // Start listening when it becomes the user's turn
  useEffect(() => {
    if (userTurn) {
      startListening();
    } else {
      stopListening();
    }
  }, [userTurn]);

  // ── WebSocket message handler ───────────────────────────────────────────────
  const handleMessage = useCallback((message) => {
    console.log('Processing message:', message.type);

    switch (message.type) {

      case 'game_started':
        gameActiveRef.current = true;
        awaitingResultRef.current = false;
        setGameState('playing');
        setTotalWords(message.data.total_words);
        setWordCount(1);
        setScore({ correct: 0, incorrect: 0 });
        setGameHistory([]);
        setCurrentStatus('🎙️ Listen carefully and spell the word!');
        speakWord(
          `Welcome to Spell Bee! Word 1: ${message.data.current_word}. Please spell it letter by letter.`,
          () => setUserTurn(true)
        );
        break;

      case 'next_word':
        awaitingResultRef.current = false;
        setWordCount(message.round);
        setCurrentStatus('🎙️ Listen carefully and spell the word!');
        setUserTurn(false);
        speakWord(
          `Word ${message.round}: ${message.word}. Please spell it.`,
          () => setUserTurn(true)
        );
        break;

      case 'result': {
        // Unlock for next round
        const correct = message.correct;
        const target  = message.target;

        setGameHistory((prev) => [
          ...prev,
          { word: target, userResponse: '', correct, feedback: message.feedback || '' }
        ]);

        setScore((prev) => ({
          correct:   correct ? prev.correct + 1   : prev.correct,
          incorrect: correct ? prev.incorrect : prev.incorrect + 1
        }));

        setCurrentStatus(correct ? `✅ Correct! "${target}"` : `❌ Incorrect. The word was "${target}"`);

        speakWord(
          correct ? `Correct! Well done.` : `Incorrect. The correct spelling was ${target}.`,
          () => {
            // Only request next word if game is still active
            if (gameActiveRef.current && sendMessageRef.current) {
              sendMessageRef.current({ type: 'next' });
            }
          }
        );
        break;
      }

      case 'game_over':
      case 'game_end':
        gameActiveRef.current = false;
        awaitingResultRef.current = false;
        stopListening();
        setUserTurn(false);
        setGameState('finished');
        break;

      case 'error':
        console.error('Server error:', message.message);
        setCurrentStatus(`⚠️ ${message.message}`);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [speakWord, stopListening]);

  const { isConnected, sendMessage } = useWebSocket(
    sessionId ? `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${sessionId}` : null,
    handleMessage
  );

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  // Send start_game once WebSocket actually connects
  useEffect(() => {
    if (isConnected && pendingDifficulty) {
      sendMessage({ type: 'start_game', data: { difficulty: pendingDifficulty } });
      setPendingDifficulty(null);
    }
  }, [isConnected, pendingDifficulty, sendMessage]);

  // ── Game controls ───────────────────────────────────────────────────────────
  const handleStartGame = async (selectedDifficulty) => {
    try {
      setGameState('connecting');
      const response = await startSession(selectedDifficulty);
      setSessionId(response.session_id);
      setPendingDifficulty(selectedDifficulty);
    } catch (error) {
      console.error('Error starting game:', error);
      setGameState('idle');
      alert('Failed to start game. Please check the backend is running.');
    }
  };

  const handlePlayAgain = () => {
    gameActiveRef.current     = false;
    awaitingResultRef.current = false;
    stopListening();
    if (utteranceRef.current) { utteranceRef.current.onend = null; }
    window.speechSynthesis?.cancel();
    setGameState('idle');
    setSessionId(null);
    setScore({ correct: 0, incorrect: 0 });
    setWordCount(0);
    setTotalWords(0);
    setGameHistory([]);
    setCurrentStatus('');
    setBotSpeaking(false);
    setUserTurn(false);
    setPendingDifficulty(null);
  };

  const handleEndGame = () => {
    if (sessionId && sendMessage) sendMessage({ type: 'end_game', data: {} });
    handlePlayAgain();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 transition-all duration-300">
      {gameState === 'idle' && <WelcomeScreen onStartGame={handleStartGame} />}

      {(gameState === 'connecting' || gameState === 'playing') && (
        <GameBoard
          isConnected={isConnected}
          gameState={gameState}
          wordCount={wordCount}
          totalWords={totalWords}
          score={score}
          gameHistory={gameHistory}
          currentStatus={currentStatus}
          botSpeaking={botSpeaking}
          userTurn={userTurn}
          onEndGame={handleEndGame}
          sendMessage={sendMessage}
          sessionId={sessionId}
        />
      )}

      {gameState === 'finished' && (
        <ResultsScreen
          score={score}
          totalWords={totalWords}
          gameHistory={gameHistory}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
