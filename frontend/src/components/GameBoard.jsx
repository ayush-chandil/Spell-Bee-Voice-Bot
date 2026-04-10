import ScoreDisplay from './ScoreDisplay';
import MicrophoneVisualizer from './MicrophoneVisualizer';

export default function GameBoard({
  isConnected,
  gameState,
  wordCount,
  totalWords,
  score,
  gameHistory,
  currentStatus,
  botSpeaking,
  userTurn,
  onEndGame,
}) {
  return (
    <div className="h-screen flex flex-col px-6 py-3 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <span>🐝</span><span>Spell Bee</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {gameState === 'connecting' && (
            <span className="px-3 py-1 rounded-full font-bold text-xs bg-blue-100 text-blue-800 animate-pulse">
              ⚙️ Connecting…
            </span>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">

        {/* Word Progress */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Word Progress</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl font-bold text-amber-600">{wordCount}</span>
            <span className="text-xl text-gray-400">/</span>
            <span className="text-4xl font-bold text-gray-400">{totalWords}</span>
          </div>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-400 h-full transition-all duration-300"
              style={{ width: `${totalWords ? (wordCount / totalWords) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Microphone */}
        <MicrophoneVisualizer botSpeaking={botSpeaking} userTurn={userTurn} />

        {/* Status */}
        <p className="text-base font-bold text-gray-800 text-center max-w-md px-4">
          {currentStatus || (botSpeaking ? '🤖 Bot speaking…' : '⏳ Waiting…')}
        </p>

        {/* Controls */}
        {gameState === 'playing' && (
          <button
            onClick={onEndGame}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            ⛔ End Game
          </button>
        )}
        {gameState === 'connecting' && (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="animate-spin text-lg">⚙️</span>
            <span className="text-sm font-semibold">Initializing…</span>
          </div>
        )}
      </div>

      {/* ── Score Strip (bottom, centred) ────────────────────── */}
      <div className="shrink-0 pb-2">
        <ScoreDisplay
          correct={score.correct}
          incorrect={score.incorrect}
          total={totalWords}
        />
      </div>

    </div>
  );
}
