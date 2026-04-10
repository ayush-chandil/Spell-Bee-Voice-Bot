export default function GameHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No attempts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((entry, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border-l-4 transition-all ${
            entry.correct
              ? 'bg-green-50 border-green-500 hover:bg-green-100'
              : 'bg-red-50 border-red-500 hover:bg-red-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-gray-800">
                {entry.correct ? '✅' : '❌'} {entry.word}
              </p>
              {entry.userResponse && (
                <p className="text-sm text-gray-600 mt-1">
                  You said: <span className="italic">"{entry.userResponse}"</span>
                </p>
              )}
              {entry.feedback && (
                <p className="text-xs text-gray-500 mt-1">{entry.feedback}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
