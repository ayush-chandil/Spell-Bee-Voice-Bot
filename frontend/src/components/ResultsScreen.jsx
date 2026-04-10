import GameHistory from './GameHistory';

export default function ResultsScreen({ score, totalWords, gameHistory, onPlayAgain }) {
  const accuracy = totalWords ? Math.round((score.correct / totalWords) * 100) : 0;

  const getResult = (acc) => {
    if (acc === 100) return { title: '🏆 PERFECT!',    message: "You're a spelling champion!", color: 'from-yellow-400 to-orange-400', emoji: '👑' };
    if (acc >= 80)  return { title: '🌟 EXCELLENT!',   message: 'Outstanding performance!',    color: 'from-green-400 to-emerald-400',  emoji: '⭐' };
    if (acc >= 60)  return { title: '😊 GREAT JOB!',   message: 'Well done!',                  color: 'from-blue-400 to-cyan-400',      emoji: '👍' };
    if (acc >= 40)  return { title: '💪 GOOD EFFORT!', message: "You're getting there!",        color: 'from-purple-400 to-pink-400',    emoji: '🚀' };
    return           { title: '📚 KEEP GOING!',        message: 'Every attempt counts!',        color: 'from-amber-400 to-orange-400',   emoji: '🌱' };
  };

  const result = getResult(accuracy);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 py-3 overflow-hidden">
      <div className="w-full max-w-lg flex flex-col gap-3">

        {/* Emoji + title */}
        <div className="text-center">
          <div className="text-5xl mb-1 inline-block animate-bounce">{result.emoji}</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {result.title}
          </h1>
          <p className="text-sm text-gray-500">{result.message}</p>
        </div>

        {/* Score card */}
        <div className={`bg-gradient-to-r ${result.color} rounded-2xl px-6 py-4 text-white shadow-xl text-center`}>
          <p className="text-xs font-bold opacity-80 uppercase tracking-wide mb-1">Final Score</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold">{score.correct}</span>
            <span className="text-2xl opacity-70">/</span>
            <span className="text-3xl font-bold opacity-80">{totalWords}</span>
          </div>
          <p className="text-lg font-bold mt-1">{accuracy}% Accuracy</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200 text-center">
            <p className="text-xs font-bold text-green-700">Correct</p>
            <p className="text-2xl font-bold text-green-600">{score.correct}</p>
            <p className="text-xs">✅</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 border-2 border-red-200 text-center">
            <p className="text-xs font-bold text-red-700">Incorrect</p>
            <p className="text-2xl font-bold text-red-600">{score.incorrect}</p>
            <p className="text-xs">❌</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200 text-center">
            <p className="text-xs font-bold text-purple-700">Accuracy</p>
            <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
            <p className="text-xs">📊</p>
          </div>
        </div>

        {/* History */}
        {gameHistory.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-amber-200 p-3 overflow-hidden" style={{ maxHeight: '22vh' }}>
            <p className="text-xs font-bold text-gray-700 mb-1">📋 Your Attempts</p>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(22vh - 2rem)' }}>
              <GameHistory history={gameHistory} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            🎮 Play Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all shadow-md text-sm"
          >
            🏠 Home
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">Thanks for playing 🐝 Spell Bee Voice Bot!</p>
      </div>
    </div>
  );
}
