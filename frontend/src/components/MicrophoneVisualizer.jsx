import { useEffect, useState } from 'react';

export default function MicrophoneVisualizer({ botSpeaking, userTurn }) {
  const [bars, setBars] = useState(Array(12).fill(0));

  useEffect(() => {
    if (!botSpeaking && !userTurn) {
      setBars(Array(12).fill(0));
      return;
    }
    const interval = setInterval(() => {
      setBars(Array(12).fill(0).map(() => Math.random() * (botSpeaking ? 60 : 80)));
    }, 100);
    return () => clearInterval(interval);
  }, [botSpeaking, userTurn]);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Icon circle */}
      <div className={`relative flex items-center justify-center ${botSpeaking || userTurn ? 'animate-pulse' : ''}`}>
        {(botSpeaking || userTurn) && (
          <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-pulse" style={{ animationDuration: '1.5s' }} />
        )}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
          botSpeaking
            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
            : userTurn
            ? 'bg-gradient-to-br from-green-400 to-green-600'
            : 'bg-gradient-to-br from-gray-300 to-gray-400'
        }`}>
          <span className="text-3xl">
            {botSpeaking ? '🤖' : userTurn ? '🎙️' : '🎧'}
          </span>
        </div>
      </div>

      {/* Bars */}
      {(botSpeaking || userTurn) && (
        <div className="flex items-end justify-center gap-1 h-12">
          {bars.map((height, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                botSpeaking
                  ? 'bg-gradient-to-t from-blue-600 to-blue-300'
                  : 'bg-gradient-to-t from-green-600 to-green-300'
              }`}
              style={{ height: `${Math.max(8, height)}px` }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${
        botSpeaking
          ? 'bg-blue-100 text-blue-800'
          : userTurn
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {botSpeaking ? '🤖 Bot Speaking' : userTurn ? '🎙️ Your Turn' : '⏳ Waiting…'}
      </div>
    </div>
  );
}
