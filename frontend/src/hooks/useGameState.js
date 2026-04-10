import { useState, useCallback } from 'react';

export function useGameState() {
  const [gameState, setGameState] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('');

  const processMessage = useCallback((message) => {
    if (!message) return;

    switch (message.type) {
      case 'game_started':
        setGameState('playing');
        setTotalWords(message.data.total_words);
        setScore({ correct: 0, incorrect: 0 });
        setGameHistory([]);
        setCurrentStatus('🎙️ Your turn - listen and spell the word!');
        break;

      case 'new_word':
        setWordCount(message.data.word_number);
        setCurrentStatus('🎙️ Your turn - listen and spell the word!');
        break;

      case 'bot_speaking':
        setCurrentStatus(`🤖 Bot is speaking... "${message.data.text}"`);
        break;

      case 'user_turn':
        setCurrentStatus('🎙️ Your turn - spell the word!');
        break;

      case 'evaluation':
        const isCorrect = message.data.correct;
        setGameHistory((prev) => [
          ...prev,
          {
            word: message.data.word,
            userResponse: message.data.user_response || '',
            correct: isCorrect,
            feedback: message.data.feedback || ''
          }
        ]);

        setScore((prev) => ({
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1
        }));

        if (isCorrect) {
          setCurrentStatus(`✅ Correct! "${message.data.word}"`);
        } else {
          setCurrentStatus(`❌ Incorrect. The word was "${message.data.word}"`);
        }
        break;

      case 'game_over':
        setGameState('finished');
        setScore({
          correct: message.data.final_score,
          incorrect: totalWords - message.data.final_score
        });
        break;

      default:
        break;
    }
  }, [totalWords]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setSessionId(null);
    setScore({ correct: 0, incorrect: 0 });
    setWordCount(0);
    setTotalWords(0);
    setGameHistory([]);
    setCurrentStatus('');
  }, []);

  return {
    gameState,
    setGameState,
    sessionId,
    setSessionId,
    score,
    wordCount,
    totalWords,
    gameHistory,
    currentStatus,
    processMessage,
    resetGame
  };
}
