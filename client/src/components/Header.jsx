import React from 'react';

const defaultAvatar = (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="#C490E4" />
    <circle cx="50" cy="40" r="18" fill="#FFF5F8" />
    <ellipse cx="50" cy="75" rx="25" ry="18" fill="#FFF5F8" />
  </svg>
);

export default function Header({ user, onLeaderboardClick, showLeaderboard }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary/30 ring-2 ring-primary/30">
          {user?.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            defaultAvatar
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Wacky Wap
          </h1>
          <button
            onClick={onLeaderboardClick}
            className={`text-xs font-semibold px-3 py-0.5 rounded-full transition-all ${
              showLeaderboard
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {showLeaderboard ? '← Back' : '🏆 Leaderboard'}
          </button>
        </div>

        {/* Points Display */}
        <div className="flex flex-col items-end">
          <span className="text-2xl font-extrabold text-primary">
            {user?.points?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-gray-500 font-medium">points</span>
        </div>
      </div>
    </header>
  );
}
