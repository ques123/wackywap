import React, { useState, useEffect } from 'react';

export default function DeathScreen({ diedAt, onRespawn, isRespawning }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [canRespawn, setCanRespawn] = useState(false);

  useEffect(() => {
    if (!diedAt) return;

    const updateTimer = () => {
      const now = new Date();
      const deathTime = new Date(diedAt);
      const elapsed = (now - deathTime) / 1000;
      const remaining = 90 - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(null);
        setCanRespawn(true);
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      setCanRespawn(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [diedAt]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Gravestone */}
      <div className="relative mb-6">
        <div className="text-[120px] animate-bounce-slow">🪦</div>

        {/* Ghost floating above */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl animate-float-ghost">
          👻
        </div>
      </div>

      {/* Death message */}
      <h2 className="text-2xl font-extrabold text-gray-700 mb-2 text-center">
        Your Animal Has Fallen!
      </h2>
      <p className="text-gray-500 mb-6 text-center">
        Someone wacked your animal to death...
      </p>

      {/* Timer or Respawn button */}
      {!canRespawn ? (
        <div className="text-center">
          <p className="text-gray-400 mb-2">Respawn in:</p>
          <div className="text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {timeRemaining || '0:00'}
          </div>
        </div>
      ) : (
        <button
          onClick={onRespawn}
          disabled={isRespawning}
          className={`px-10 py-4 rounded-full font-bold text-xl text-white shadow-lg transition-all btn-press shine ${
            isRespawning
              ? 'bg-gray-300 cursor-wait'
              : 'bg-gradient-to-r from-accent to-secondary hover:shadow-xl hover:scale-105 animate-pulse-glow'
          }`}
        >
          {isRespawning ? 'Respawning...' : '✨ Respawn!'}
        </button>
      )}

      {/* Helpful tip */}
      <div className="mt-8 p-4 bg-white/50 rounded-2xl max-w-xs text-center">
        <p className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> Use a shield to protect yourself from attackers!
          Shields cost 1000 points and last 10 minutes.
        </p>
      </div>

      {/* Add custom animation for ghost */}
      <style>{`
        @keyframes float-ghost {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
        .animate-float-ghost {
          animation: float-ghost 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
