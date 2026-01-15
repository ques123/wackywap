import React from 'react';
import { SmallAnimal } from './Animal';

export default function UserList({ users, onSelectUser, currentUserDead }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No other animals yet!</p>
        <p className="text-sm">Invite friends to join the fun</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-gray-700 px-2 flex items-center gap-2">
        <span>🐾</span>
        <span>Other Animals</span>
        <span className="text-sm font-normal text-gray-400">({users.length})</span>
      </h2>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onSelect={() => onSelectUser(user)}
            disabled={currentUserDead || !user.is_alive || user.shield_active}
          />
        ))}
      </div>

      {currentUserDead && (
        <p className="text-center text-sm text-red-400 font-medium mt-2">
          Your animal must be alive to attack!
        </p>
      )}
    </div>
  );
}

function UserCard({ user, onSelect, disabled }) {
  const isDead = !user.is_alive;
  const isShielded = user.shield_active;

  return (
    <div
      onClick={disabled ? undefined : onSelect}
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
        disabled
          ? 'bg-gray-100 cursor-not-allowed opacity-60'
          : 'bg-white shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* Animal avatar */}
      <SmallAnimal hasShield={isShielded} isDead={isDead} />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 truncate">
            {user.username}
          </span>
          {isShielded && <span className="text-sm">🛡️</span>}
        </div>
        <div className="text-sm text-gray-400">
          {isDead ? (
            <span className="text-red-400">💀 Dead</span>
          ) : (
            <span>{user.points.toLocaleString()} points</span>
          )}
        </div>
      </div>

      {/* Attack indicator */}
      {!disabled && (
        <div className="text-2xl">
          ⚔️
        </div>
      )}
    </div>
  );
}
