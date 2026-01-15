import React from 'react';

export default function Leaderboard({ leaderboard, currentUserId }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">🏆</p>
        <p className="text-lg">No players yet!</p>
        <p className="text-sm">Be the first to climb the ranks</p>
      </div>
    );
  }

  // Find current user's rank
  const currentUserRank = leaderboard.find(u => u.id === currentUserId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h2>
        {currentUserRank && (
          <p className="text-sm text-gray-500 mt-1">
            Your rank: #{currentUserRank.rank}
          </p>
        )}
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex justify-center items-end gap-2 mb-4 px-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="text-3xl mb-1">🥈</div>
            <div className="bg-gray-200 rounded-t-xl p-3 w-20 h-24 flex flex-col items-center justify-end">
              <p className="text-xs font-bold text-gray-600 truncate w-full text-center">
                {leaderboard[1].username}
              </p>
              <p className="text-sm font-extrabold text-gray-700">
                {formatPoints(leaderboard[1].points)}
              </p>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-1">🥇</div>
            <div className="bg-yellow-200 rounded-t-xl p-3 w-24 h-32 flex flex-col items-center justify-end">
              <p className="text-sm font-bold text-yellow-700 truncate w-full text-center">
                {leaderboard[0].username}
              </p>
              <p className="text-lg font-extrabold text-yellow-800">
                {formatPoints(leaderboard[0].points)}
              </p>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-1">🥉</div>
            <div className="bg-orange-200 rounded-t-xl p-3 w-20 h-20 flex flex-col items-center justify-end">
              <p className="text-xs font-bold text-orange-600 truncate w-full text-center">
                {leaderboard[2].username}
              </p>
              <p className="text-sm font-extrabold text-orange-700">
                {formatPoints(leaderboard[2].points)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {leaderboard.map((user, index) => (
          <LeaderboardRow
            key={user.id}
            user={user}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderboardRow({ user, isCurrentUser }) {
  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
        isCurrentUser
          ? 'bg-primary/10 border-2 border-primary/30'
          : 'bg-white shadow-sm'
      }`}
    >
      {/* Rank */}
      <div className="w-10 text-center">
        <span className={`font-bold ${user.rank <= 3 ? 'text-xl' : 'text-gray-500'}`}>
          {getRankDisplay(user.rank)}
        </span>
      </div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-gray-700'}`}>
            {user.username}
            {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
          </span>
          {user.shield_active && <span className="text-sm">🛡️</span>}
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <span className={`font-extrabold ${isCurrentUser ? 'text-primary' : 'text-gray-700'}`}>
          {user.points.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 ml-1">pts</span>
      </div>
    </div>
  );
}

function formatPoints(points) {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1) + 'M';
  }
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + 'K';
  }
  return points.toString();
}
