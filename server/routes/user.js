import express from 'express';
import { getUserByTelegramId, createUser, getAllUsersExcept, getLeaderboard } from '../db.js';
import { telegramAuthMiddleware } from '../middleware/validateTelegram.js';

const router = express.Router();

// Apply Telegram auth to all user routes
router.use(telegramAuthMiddleware);

// GET /api/user - Get or create user
router.get('/user', (req, res) => {
  try {
    const { id, username, photoUrl } = req.telegramUser;

    let user = getUserByTelegramId(id);

    if (!user) {
      // Create new user
      user = createUser(id, username, photoUrl);
    }

    res.json(user);
  } catch (error) {
    console.error('Error in GET /api/user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users - Get all other users
router.get('/users', (req, res) => {
  try {
    const { id } = req.telegramUser;
    const currentUser = getUserByTelegramId(id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const users = getAllUsersExcept(currentUser.id);
    res.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard - Get top users
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboard(100);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
