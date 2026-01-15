import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'wackywap.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    profile_photo_url TEXT,
    points INTEGER DEFAULT 1000,
    is_alive INTEGER DEFAULT 1,
    died_at TEXT,
    shield_active INTEGER DEFAULT 0,
    shield_expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_attacked_notification_at TEXT,
    points_lost_in_window INTEGER DEFAULT 0
  )
`);

// Helper to generate random username
function generateRandomUsername() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get user by telegram_id
export function getUserByTelegramId(telegramId) {
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  if (user) {
    // Check and expire shield if needed
    if (user.shield_active && user.shield_expires_at) {
      const expiresAt = new Date(user.shield_expires_at);
      if (expiresAt <= new Date()) {
        db.prepare('UPDATE users SET shield_active = 0, shield_expires_at = NULL WHERE id = ?').run(user.id);
        user.shield_active = 0;
        user.shield_expires_at = null;
      }
    }
    // Convert SQLite integers to booleans for frontend
    user.is_alive = !!user.is_alive;
    user.shield_active = !!user.shield_active;
  }
  return user;
}

// Create new user
export function createUser(telegramId, username, profilePhotoUrl) {
  const finalUsername = username || generateRandomUsername();
  const stmt = db.prepare(`
    INSERT INTO users (telegram_id, username, profile_photo_url, points, is_alive, shield_active, points_lost_in_window)
    VALUES (?, ?, ?, 1000, 1, 0, 0)
  `);
  const result = stmt.run(telegramId, finalUsername, profilePhotoUrl || null);
  return getUserByTelegramId(telegramId);
}

// Get user by id
export function getUserById(id) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (user) {
    // Check and expire shield if needed
    if (user.shield_active && user.shield_expires_at) {
      const expiresAt = new Date(user.shield_expires_at);
      if (expiresAt <= new Date()) {
        db.prepare('UPDATE users SET shield_active = 0, shield_expires_at = NULL WHERE id = ?').run(user.id);
        user.shield_active = 0;
        user.shield_expires_at = null;
      }
    }
    user.is_alive = !!user.is_alive;
    user.shield_active = !!user.shield_active;
  }
  return user;
}

// Update user points
export function updateUserPoints(id, points) {
  db.prepare('UPDATE users SET points = ? WHERE id = ?').run(points, id);
  return getUserById(id);
}

// Wack self (add 100 points)
export function wackSelf(userId) {
  const user = getUserById(userId);
  if (!user || !user.is_alive) {
    throw new Error('User not alive');
  }
  const newPoints = user.points + 100;
  return updateUserPoints(userId, newPoints);
}

// Wack another user (steal points) - uses transaction for safety
export function wackUser(attackerId, targetId) {
  const transaction = db.transaction(() => {
    const attacker = getUserById(attackerId);
    const target = getUserById(targetId);

    if (!attacker || !attacker.is_alive) {
      throw new Error('Attacker not alive');
    }
    if (!target) {
      throw new Error('Target not found');
    }
    if (!target.is_alive) {
      throw new Error('Target is dead');
    }
    if (target.shield_active) {
      throw new Error('Target is protected');
    }
    if (attackerId === targetId) {
      throw new Error('Cannot attack yourself');
    }

    // Calculate steal amount
    const stealAmount = Math.min(100, target.points);
    const newTargetPoints = target.points - stealAmount;
    const newAttackerPoints = attacker.points + stealAmount;
    const targetDied = newTargetPoints <= 0;

    // Update attacker
    db.prepare('UPDATE users SET points = ? WHERE id = ?').run(newAttackerPoints, attackerId);

    // Update target
    if (targetDied) {
      db.prepare('UPDATE users SET points = 0, is_alive = 0, died_at = ? WHERE id = ?')
        .run(new Date().toISOString(), targetId);
    } else {
      db.prepare('UPDATE users SET points = ? WHERE id = ?').run(newTargetPoints, targetId);
    }

    // Track points lost for notification
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60000); // 60 seconds ago

    let pointsLostInWindow = target.points_lost_in_window || 0;
    let lastNotificationAt = target.last_attacked_notification_at
      ? new Date(target.last_attacked_notification_at)
      : null;

    // Reset window if last notification was more than 60 seconds ago
    if (lastNotificationAt && lastNotificationAt < windowStart) {
      pointsLostInWindow = 0;
    }

    pointsLostInWindow += stealAmount;

    // Check if we should send notification
    let shouldNotify = false;
    if (pointsLostInWindow >= 1000) {
      // Only notify if we haven't notified in the last 60 seconds
      if (!lastNotificationAt || lastNotificationAt < windowStart) {
        shouldNotify = true;
        db.prepare('UPDATE users SET points_lost_in_window = 0, last_attacked_notification_at = ? WHERE id = ?')
          .run(now.toISOString(), targetId);
      }
    } else {
      db.prepare('UPDATE users SET points_lost_in_window = ? WHERE id = ?')
        .run(pointsLostInWindow, targetId);
    }

    return {
      attackerPoints: newAttackerPoints,
      targetPoints: newTargetPoints,
      targetDied,
      stolenAmount: stealAmount,
      shouldNotifyAttack: shouldNotify && !targetDied,
      shouldNotifyDeath: targetDied,
      targetTelegramId: target.telegram_id
    };
  });

  return transaction();
}

// Activate shield
export function activateShield(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.points <= 1000) {
    throw new Error('Need more than 1000 points to activate shield');
  }

  const newPoints = user.points - 1000;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  db.prepare('UPDATE users SET points = ?, shield_active = 1, shield_expires_at = ? WHERE id = ?')
    .run(newPoints, expiresAt, userId);

  return getUserById(userId);
}

// Respawn user
export function respawnUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.is_alive) {
    throw new Error('User is already alive');
  }

  const diedAt = new Date(user.died_at);
  const now = new Date();
  const secondsSinceDeath = (now - diedAt) / 1000;

  if (secondsSinceDeath < 90) {
    throw new Error('Must wait 90 seconds to respawn');
  }

  db.prepare('UPDATE users SET points = 1000, is_alive = 1, died_at = NULL, points_lost_in_window = 0 WHERE id = ?')
    .run(userId);

  return getUserById(userId);
}

// Get all users except the requesting user
export function getAllUsersExcept(excludeId) {
  const users = db.prepare(`
    SELECT id, username, points, is_alive, shield_active, shield_expires_at, created_at
    FROM users
    WHERE id != ?
    ORDER BY created_at DESC
  `).all(excludeId);

  const now = new Date();
  return users.map(user => {
    // Check shield expiry
    if (user.shield_active && user.shield_expires_at) {
      const expiresAt = new Date(user.shield_expires_at);
      if (expiresAt <= now) {
        db.prepare('UPDATE users SET shield_active = 0, shield_expires_at = NULL WHERE id = ?').run(user.id);
        user.shield_active = 0;
      }
    }
    return {
      id: user.id,
      username: user.username,
      points: user.points,
      is_alive: !!user.is_alive,
      shield_active: !!user.shield_active
    };
  });
}

// Get leaderboard
export function getLeaderboard(limit = 100) {
  const users = db.prepare(`
    SELECT id, username, points, shield_active, shield_expires_at
    FROM users
    ORDER BY points DESC
    LIMIT ?
  `).all(limit);

  const now = new Date();
  return users.map((user, index) => {
    // Check shield expiry
    if (user.shield_active && user.shield_expires_at) {
      const expiresAt = new Date(user.shield_expires_at);
      if (expiresAt <= now) {
        db.prepare('UPDATE users SET shield_active = 0, shield_expires_at = NULL WHERE id = ?').run(user.id);
        user.shield_active = 0;
      }
    }
    return {
      rank: index + 1,
      id: user.id,
      username: user.username,
      points: user.points,
      shield_active: !!user.shield_active
    };
  });
}

export default db;
