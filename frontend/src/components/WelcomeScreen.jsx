import { useState } from 'react';

export default function WelcomeScreen({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    await onStartGame(selectedDifficulty);
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-xl flex flex-col gap-4">

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-1 animate-bounce">🐝</div>
          <h1 className="text-3xl font-bold text-amber-900">Spell Bee</h1>
          <p className="text-sm text-amber-700">Voice Bot</p>
          <div className="h-0.5 w-16 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mt-2 rounded-full" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-7 border-2 border-amber-200 flex flex-col gap-5">

          {/* Instructions */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <span>📝</span> How to Play
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'Listen to the bot say a word',
                'Spell it back letter by letter',
                'Get instant feedback on your spelling',
                'Try to beat your high score!'
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <span>⚡</span> Select Difficulty
            </p>
            <div className="flex gap-3">
              {[
                { value: 'easy',   label: 'Easy',   emoji: '🌱', desc: 'Beginner' },
                { value: 'medium', label: 'Medium', emoji: '🔥', desc: 'Standard' },
                { value: 'hard',   label: 'Hard',   emoji: '💎', desc: 'Advanced' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedDifficulty(level.value)}
                  className={`flex-1 py-4 px-3 rounded-xl font-semibold text-base transition-all duration-200 border-2 flex flex-col items-center gap-1 ${
                    selectedDifficulty === level.value
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-md scale-105'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  <span className="text-3xl">{level.emoji}</span>
                  <span className="font-bold">{level.label}</span>
                  <span className="text-xs font-normal text-gray-500">{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg hover:scale-105'
            }`}
          >
            {isLoading
              ? <><span className="animate-spin">⚙️</span><span>Starting…</span></>
              : <><span>🎮</span><span>Start Game</span></>
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by 🐝 Spell Bee Voice Technology
          </p>
        </div>
      </div>
    </div>
  );
}
