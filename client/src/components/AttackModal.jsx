import React, { useState, useEffect } from 'react';
import Animal from './Animal';

// Gravestone component for when target dies
function Gravestone({ username }) {
  return (
    <div className="flex flex-col items-center animate-bounce-slow">
      <div className="text-8xl mb-4">🪦</div>
      <p className="text-gray-500 font-bold">{username}</p>
      <p className="text-sm text-gray-400">R.I.P.</p>
    </div>
  );
}

export default function AttackModal({
  target,
  onClose,
  onAttack,
  isProtected,
  targetDied,
  attackerDead
}) {
  const [showProtectedMessage, setShowProtectedMessage] = useState(false);
  const [stolenAmount, setStolenAmount] = useState(null);

  const handleAttack = async () => {
    if (attackerDead || targetDied || target.shield_active) return;

    const result = await onAttack(target.id);
    if (result) {
      if (result.protected) {
        setShowProtectedMessage(true);
        setTimeout(() => setShowProtectedMessage(false), 2000);
      } else if (result.stolenAmount) {
        setStolenAmount(result.stolenAmount);
        setTimeout(() => setStolenAmount(null), 1000);
      }
    }
  };

  // Auto close if target dies after a short delay
  useEffect(() => {
    if (targetDied) {
      const timeout = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [targetDied, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-extrabold text-gray-700">
            {targetDied ? 'Victory!' : 'Attack!'}
          </h2>
          <p className="text-gray-500">
            {target.username}
          </p>
        </div>

        {/* Target display */}
        <div className="flex flex-col items-center py-4">
          {targetDied ? (
            <Gravestone username={target.username} />
          ) : (
            <>
              <Animal
                onWack={handleAttack}
                disabled={attackerDead || target.shield_active}
                hasShield={target.shield_active}
                isOwnAnimal={false}
              />

              {/* Target's points */}
              <div className="mt-4 text-center">
                <span className="text-3xl font-extrabold text-primary">
                  {target.points?.toLocaleString() || 0}
                </span>
                <span className="text-gray-400 ml-2">points</span>
              </div>
            </>
          )}
        </div>

        {/* Protected message overlay */}
        {showProtectedMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/90 rounded-3xl">
            <div className="text-center text-white">
              <div className="text-6xl mb-2">🛡️</div>
              <p className="text-2xl font-bold">Protected!</p>
            </div>
          </div>
        )}

        {/* Stolen amount popup */}
        {stolenAmount !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 points-float">
            <span className="text-4xl font-extrabold text-red-500">
              -{stolenAmount}
            </span>
          </div>
        )}

        {/* Death message */}
        {targetDied && (
          <div className="text-center">
            <p className="text-accent font-bold text-lg">
              You defeated {target.username}!
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Returning to list...
            </p>
          </div>
        )}

        {/* Attacker dead message */}
        {attackerDead && !targetDied && (
          <div className="text-center bg-red-50 rounded-xl p-3 mt-4">
            <p className="text-red-500 font-bold">
              💀 Your animal is dead!
            </p>
            <p className="text-red-400 text-sm">
              Wait to respawn before attacking
            </p>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors"
        >
          ← Back to List
        </button>
      </div>
    </div>
  );
}
