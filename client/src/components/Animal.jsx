import React, { useState, useEffect } from 'react';

// Cute blob hamster creature SVG
const AnimalSVG = ({ isHit, hasShield }) => (
  <svg viewBox="0 0 200 200" className={`w-full h-full transition-transform duration-100 ${isHit ? 'scale-90' : ''}`}>
    {/* Shadow */}
    <ellipse cx="100" cy="185" rx="60" ry="12" fill="rgba(0,0,0,0.1)" />

    {/* Shield glow effect */}
    {hasShield && (
      <circle cx="100" cy="100" r="90" fill="none" stroke="#7ED3B2" strokeWidth="4" opacity="0.6">
        <animate attributeName="r" values="85;90;85" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    )}

    {/* Body - round and squishy */}
    <ellipse cx="100" cy="110" rx="70" ry="65" fill="#FFB6C1">
      <animate attributeName="ry" values="65;63;65" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* Belly */}
    <ellipse cx="100" cy="125" rx="45" ry="40" fill="#FFF0F3" />

    {/* Left ear */}
    <ellipse cx="55" cy="55" rx="20" ry="25" fill="#FFB6C1" />
    <ellipse cx="55" cy="55" rx="12" ry="15" fill="#FF8FAB" />

    {/* Right ear */}
    <ellipse cx="145" cy="55" rx="20" ry="25" fill="#FFB6C1" />
    <ellipse cx="145" cy="55" rx="12" ry="15" fill="#FF8FAB" />

    {/* Left eye */}
    <ellipse cx="70" cy="95" rx="15" ry="18" fill="white" />
    <circle cx="73" cy="97" r="8" fill="#4A4A4A" />
    <circle cx="76" cy="94" r="3" fill="white" />

    {/* Right eye */}
    <ellipse cx="130" cy="95" rx="15" ry="18" fill="white" />
    <circle cx="127" cy="97" r="8" fill="#4A4A4A" />
    <circle cx="130" cy="94" r="3" fill="white" />

    {/* Blush marks */}
    <ellipse cx="50" cy="115" rx="12" ry="8" fill="#FF8FAB" opacity="0.5" />
    <ellipse cx="150" cy="115" rx="12" ry="8" fill="#FF8FAB" opacity="0.5" />

    {/* Nose */}
    <ellipse cx="100" cy="115" rx="8" ry="6" fill="#FF8FAB" />

    {/* Mouth - happy */}
    <path d="M 85 130 Q 100 145 115 130" fill="none" stroke="#FF6B9D" strokeWidth="3" strokeLinecap="round" />

    {/* Small arms */}
    <ellipse cx="40" cy="130" rx="15" ry="10" fill="#FFB6C1" />
    <ellipse cx="160" cy="130" rx="15" ry="10" fill="#FFB6C1" />

    {/* Feet */}
    <ellipse cx="70" cy="170" rx="18" ry="10" fill="#FFB6C1" />
    <ellipse cx="130" cy="170" rx="18" ry="10" fill="#FFB6C1" />

    {/* Shield icon overlay */}
    {hasShield && (
      <g transform="translate(155, 25)">
        <circle cx="20" cy="20" r="18" fill="#7ED3B2" />
        <text x="20" y="26" textAnchor="middle" fontSize="20">🛡️</text>
      </g>
    )}
  </svg>
);

// Cartoon hammer for bonk animation
const Hammer = ({ visible }) => (
  <div
    className={`absolute top-0 right-0 transform transition-all duration-150 ${
      visible ? 'translate-x-8 -translate-y-4 rotate-[-30deg] opacity-100' : 'translate-x-20 -translate-y-20 rotate-[-60deg] opacity-0'
    }`}
    style={{ width: '80px', height: '80px' }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Handle */}
      <rect x="45" y="40" width="12" height="55" fill="#8B4513" rx="3" />
      {/* Head */}
      <rect x="20" y="15" width="60" height="30" fill="#808080" rx="5" />
      <rect x="25" y="20" width="50" height="20" fill="#A0A0A0" rx="3" />
    </svg>
  </div>
);

// Floating points indicator
const FloatingPoints = ({ amount, position }) => (
  <div
    className="absolute points-float text-2xl font-extrabold text-accent"
    style={{ left: position.x, top: position.y }}
  >
    +{amount}
  </div>
);

// Star burst effect
const Stars = ({ visible }) => (
  <div className={`absolute inset-0 pointer-events-none ${visible ? '' : 'hidden'}`}>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute star-burst text-2xl"
        style={{
          left: `${30 + Math.random() * 40}%`,
          top: `${20 + Math.random() * 40}%`,
          animationDelay: `${i * 0.05}s`
        }}
      >
        ⭐
      </div>
    ))}
  </div>
);

export default function Animal({ onWack, disabled, hasShield, isOwnAnimal = true }) {
  const [isHit, setIsHit] = useState(false);
  const [showHammer, setShowHammer] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState([]);

  const handleClick = () => {
    if (disabled) return;

    // Visual feedback
    setIsHit(true);
    setShowHammer(true);
    setShowStars(true);

    // Add floating points
    const newPoints = {
      id: Date.now(),
      amount: 100,
      position: { x: '50%', y: '30%' }
    };
    setFloatingPoints(prev => [...prev, newPoints]);

    // Call the wack handler
    onWack();

    // Reset animations
    setTimeout(() => setIsHit(false), 150);
    setTimeout(() => setShowHammer(false), 200);
    setTimeout(() => setShowStars(false), 500);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== newPoints.id));
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Animal container */}
      <div
        className={`relative w-48 h-48 cursor-pointer transition-transform active:scale-95 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
        } ${isHit ? 'animate-shake' : 'animate-wiggle'}`}
        onClick={handleClick}
      >
        <AnimalSVG isHit={isHit} hasShield={hasShield} />
        <Hammer visible={showHammer} />
        <Stars visible={showStars} />

        {/* Floating points */}
        {floatingPoints.map(fp => (
          <FloatingPoints key={fp.id} amount={fp.amount} position={fp.position} />
        ))}
      </div>

      {/* Wack button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`mt-4 px-8 py-3 rounded-full font-bold text-lg text-white shadow-lg transition-all btn-press shine ${
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 active:scale-95'
        }`}
      >
        {isOwnAnimal ? '🔨 Wack!' : '⚔️ Attack!'}
      </button>
    </div>
  );
}

// Smaller animal for lists
export function SmallAnimal({ hasShield, isDead }) {
  if (isDead) {
    return (
      <div className="w-12 h-12 flex items-center justify-center text-2xl">
        🪦
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <ellipse cx="100" cy="110" rx="70" ry="65" fill="#FFB6C1" />
        <ellipse cx="100" cy="125" rx="45" ry="40" fill="#FFF0F3" />
        <ellipse cx="55" cy="55" rx="20" ry="25" fill="#FFB6C1" />
        <ellipse cx="145" cy="55" rx="20" ry="25" fill="#FFB6C1" />
        <circle cx="70" cy="95" r="8" fill="#4A4A4A" />
        <circle cx="130" cy="95" r="8" fill="#4A4A4A" />
        <ellipse cx="100" cy="115" rx="6" ry="4" fill="#FF8FAB" />
        <path d="M 85 125 Q 100 135 115 125" fill="none" stroke="#FF6B9D" strokeWidth="3" />
      </svg>
      {hasShield && (
        <div className="absolute -top-1 -right-1 text-sm">🛡️</div>
      )}
    </div>
  );
}
