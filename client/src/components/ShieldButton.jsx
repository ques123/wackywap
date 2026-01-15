import React, { useState, useEffect } from 'react';

export default function ShieldButton({ user, onActivate, disabled }) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (user?.shield_active && user?.shield_expires_at) {
      const updateTimer = () => {
        const now = new Date();
        const expiresAt = new Date(user.shield_expires_at);
        const diff = expiresAt - now;

        if (diff <= 0) {
          setTimeRemaining(null);
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [user?.shield_active, user?.shield_expires_at]);

  const canActivate = user && user.points > 1000 && !user.shield_active;
  const isShieldActive = user?.shield_active && timeRemaining;

  if (!user || user.points <= 1000 && !isShieldActive) {
    return null;
  }

  if (isShieldActive) {
    return (
      <div className="w-full max-w-xs mx-auto">
        <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent/20 border-2 border-accent text-accent font-bold animate-pulse-glow">
          <span className="text-xl">🛡️</span>
          <span>Shield active: {timeRemaining}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onActivate}
      disabled={disabled || !canActivate}
      className={`w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all btn-press shine ${
        disabled || !canActivate
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-accent to-secondary text-white hover:shadow-lg hover:scale-105'
      }`}
    >
      <span className="text-xl">🛡️</span>
      <span>1000 pts for 10 min protection</span>
    </button>
  );
}
