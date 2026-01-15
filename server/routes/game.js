import express from 'express';
import { getUserByTelegramId, wackSelf, wackUser, activateShield, respawnUser } from '../db.js';
import { telegramAuthMiddleware } from '../middleware/validateTelegram.js';
import { sendDeathNotification, sendAttackNotification } from '../services/notifications.js';

const router = express.Router();

// Mini app URL for notifications (should be set via environment)
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://t.me/your_bot/wackywap';

// Apply Telegram auth to all game routes
router.use(telegramAuthMiddleware);

// POST /api/wack-self - Wack your own animal (+100 points)
router.post('/wack-self', (req, res) => {
  try {
    const { id } = req.telegramUser;
    const currentUser = getUserByTelegramId(id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.is_alive) {
      return res.status(400).json({ error: 'Your animal is dead' });
    }

    const updatedUser = wackSelf(currentUser.id);
    res.json({ points: updatedUser.points });
  } catch (error) {
    console.error('Error in POST /api/wack-self:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/wack-user/:targetId - Attack another user
router.post('/wack-user/:targetId', async (req, res) => {
  try {
    const { id } = req.telegramUser;
    const targetId = parseInt(req.params.targetId, 10);

    const currentUser = getUserByTelegramId(id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.is_alive) {
      return res.status(400).json({ error: 'Your animal is dead' });
    }

    const result = wackUser(currentUser.id, targetId);

    // Send notifications asynchronously (don't await to avoid blocking response)
    if (result.shouldNotifyDeath) {
      sendDeathNotification(result.targetTelegramId, MINI_APP_URL).catch(console.error);
    } else if (result.shouldNotifyAttack) {
      sendAttackNotification(result.targetTelegramId, MINI_APP_URL).catch(console.error);
    }

    res.json({
      attackerPoints: result.attackerPoints,
      targetPoints: result.targetPoints,
      targetDied: result.targetDied,
      stolenAmount: result.stolenAmount
    });
  } catch (error) {
    console.error('Error in POST /api/wack-user:', error);

    if (error.message === 'Target is protected') {
      return res.status(400).json({ error: 'protected' });
    }
    if (error.message === 'Target is dead') {
      return res.status(400).json({ error: 'Target is dead' });
    }

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/activate-shield - Activate shield (costs 1000 points)
router.post('/activate-shield', (req, res) => {
  try {
    const { id } = req.telegramUser;
    const currentUser = getUserByTelegramId(id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.points <= 1000) {
      return res.status(400).json({ error: 'Need more than 1000 points to activate shield' });
    }

    const updatedUser = activateShield(currentUser.id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in POST /api/activate-shield:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/respawn - Respawn after death
router.post('/respawn', (req, res) => {
  try {
    const { id } = req.telegramUser;
    const currentUser = getUserByTelegramId(id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.is_alive) {
      return res.status(400).json({ error: 'Your animal is already alive' });
    }

    const diedAt = new Date(currentUser.died_at);
    const now = new Date();
    const secondsSinceDeath = (now - diedAt) / 1000;

    if (secondsSinceDeath < 90) {
      const remainingSeconds = Math.ceil(90 - secondsSinceDeath);
      return res.status(400).json({
        error: 'Must wait to respawn',
        remainingSeconds
      });
    }

    const updatedUser = respawnUser(currentUser.id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in POST /api/respawn:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
