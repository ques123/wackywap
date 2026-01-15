import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebApp from '@twa-dev/sdk';
import Header from './components/Header';
import Animal from './components/Animal';
import ShieldButton from './components/ShieldButton';
import UserList from './components/UserList';
import AttackModal from './components/AttackModal';
import DeathScreen from './components/DeathScreen';
import Leaderboard from './components/Leaderboard';

// Sound effect using Web Audio API
const createBonkSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  return () => {
    // Resume audio context if suspended (needed for mobile)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create oscillator for bonk sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure bonk sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    // Add a secondary "boing" for comedy
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();

    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(150, audioContext.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.25);

    gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc2.start(audioContext.currentTime + 0.05);
    osc2.stop(audioContext.currentTime + 0.3);
  };
};

// API helper
const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
  const initData = WebApp.initData || '';

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [targetDied, setTargetDied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRespawning, setIsRespawning] = useState(false);

  const playBonk = useRef(null);

  // Initialize sound on mount
  useEffect(() => {
    playBonk.current = createBonkSound();
  }, []);

  // Initialize Telegram WebApp
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();

      // Set theme
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        WebApp.backgroundColor || '#FFF5F8'
      );
    } catch (e) {
      console.log('Not in Telegram environment');
    }
  }, []);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const userData = await fetchAPI('/user');
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch user:', err);
    }
  }, []);

  // Fetch other users
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await fetchAPI('/users');
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await fetchAPI('/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUser();
      await fetchUsers();
      await fetchLeaderboard();
      setLoading(false);
    };
    init();
  }, [fetchUser, fetchUsers, fetchLeaderboard]);

  // Polling for updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUser();
      fetchUsers();
      if (showLeaderboard) {
        fetchLeaderboard();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUser, fetchUsers, fetchLeaderboard, showLeaderboard]);

  // Wack own animal
  const handleWackSelf = async () => {
    if (!user?.is_alive) return;

    // Play sound
    if (playBonk.current) {
      playBonk.current();
    }

    // Optimistic update
    setUser(prev => ({ ...prev, points: prev.points + 100 }));

    try {
      const result = await fetchAPI('/wack-self', { method: 'POST' });
      setUser(prev => ({ ...prev, points: result.points }));
    } catch (err) {
      // Revert on error
      fetchUser();
      console.error('Wack failed:', err);
    }
  };

  // Attack another user
  const handleAttack = async (targetId) => {
    if (!user?.is_alive) return null;

    // Play sound
    if (playBonk.current) {
      playBonk.current();
    }

    try {
      const result = await fetchAPI(`/wack-user/${targetId}`, { method: 'POST' });

      // Update local state
      setUser(prev => ({ ...prev, points: result.attackerPoints }));

      // Update target in list
      setUsers(prev =>
        prev.map(u =>
          u.id === targetId
            ? { ...u, points: result.targetPoints, is_alive: !result.targetDied }
            : u
        )
      );

      // Update selected target
      if (selectedTarget && selectedTarget.id === targetId) {
        setSelectedTarget(prev => ({
          ...prev,
          points: result.targetPoints,
          is_alive: !result.targetDied,
        }));

        if (result.targetDied) {
          setTargetDied(true);
        }
      }

      return { stolenAmount: result.stolenAmount, targetDied: result.targetDied };
    } catch (err) {
      if (err.message === 'protected') {
        // Update target to show shield
        setSelectedTarget(prev => prev ? { ...prev, shield_active: true } : null);
        return { protected: true };
      }
      console.error('Attack failed:', err);
      return null;
    }
  };

  // Activate shield
  const handleActivateShield = async () => {
    if (!user || user.points <= 1000) return;

    try {
      const result = await fetchAPI('/activate-shield', { method: 'POST' });
      setUser(result);
    } catch (err) {
      console.error('Shield activation failed:', err);
    }
  };

  // Respawn
  const handleRespawn = async () => {
    setIsRespawning(true);
    try {
      const result = await fetchAPI('/respawn', { method: 'POST' });
      setUser(result);
    } catch (err) {
      console.error('Respawn failed:', err);
    } finally {
      setIsRespawning(false);
    }
  };

  // Close attack modal
  const handleCloseAttack = () => {
    setSelectedTarget(null);
    setTargetDied(false);
    fetchUsers(); // Refresh user list
  };

  // Toggle leaderboard
  const handleLeaderboardToggle = () => {
    if (!showLeaderboard) {
      fetchLeaderboard();
    }
    setShowLeaderboard(!showLeaderboard);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce-slow mb-4">🐹</div>
          <p className="text-xl font-bold text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-6 shadow-lg max-w-sm">
          <div className="text-5xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full bg-primary text-white font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header
        user={user}
        onLeaderboardClick={handleLeaderboardToggle}
        showLeaderboard={showLeaderboard}
      />

      {/* Main content */}
      <main className="flex-1 p-4 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          {showLeaderboard ? (
            <Leaderboard leaderboard={leaderboard} currentUserId={user?.id} />
          ) : user?.is_alive ? (
            <>
              {/* Own animal section */}
              <div className="text-center">
                <Animal
                  onWack={handleWackSelf}
                  disabled={false}
                  hasShield={user?.shield_active}
                  isOwnAnimal={true}
                />
              </div>

              {/* Shield button */}
              <div className="flex justify-center">
                <ShieldButton
                  user={user}
                  onActivate={handleActivateShield}
                  disabled={false}
                />
              </div>

              {/* User list */}
              <UserList
                users={users}
                onSelectUser={setSelectedTarget}
                currentUserDead={!user?.is_alive}
              />
            </>
          ) : (
            /* Death screen */
            <DeathScreen
              diedAt={user?.died_at}
              onRespawn={handleRespawn}
              isRespawning={isRespawning}
            />
          )}
        </div>
      </main>

      {/* Attack modal */}
      {selectedTarget && (
        <AttackModal
          target={selectedTarget}
          onClose={handleCloseAttack}
          onAttack={handleAttack}
          isProtected={selectedTarget.shield_active}
          targetDied={targetDied}
          attackerDead={!user?.is_alive}
        />
      )}
    </div>
  );
}
