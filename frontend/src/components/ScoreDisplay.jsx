export default function ScoreDisplay({ correct, incorrect, total }) {
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="bg-green-50 border-2 border-green-200 rounded-xl px-5 py-2 text-center min-w-[80px]">
        <p className="text-xs font-semibold text-green-700">Correct</p>
        <p className="text-2xl font-bold text-green-600">{correct} ✅</p>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-xl px-5 py-2 text-center min-w-[80px]">
        <p className="text-xs font-semibold text-red-700">Incorrect</p>
        <p className="text-2xl font-bold text-red-600">{incorrect} ❌</p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-2 text-center min-w-[80px]">
        <p className="text-xs font-semibold text-blue-700">Accuracy</p>
        <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl px-5 py-2 text-center min-w-[80px]">
        <p className="text-xs font-semibold text-purple-700">Progress</p>
        <p className="text-2xl font-bold text-purple-600">{correct + incorrect}/{total}</p>
      </div>
    </div>
  );
}
