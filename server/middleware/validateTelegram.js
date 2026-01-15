import crypto from 'crypto';

export function validateTelegramInitData(initData, botToken) {
  if (!initData || !botToken) {
    return { valid: false, error: 'Missing initData or botToken' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return { valid: false, error: 'Missing hash in initData' };
    }

    // Remove hash from params and sort alphabetically
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key using HMAC-SHA256 with "WebAppData"
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid hash' };
    }

    // Parse user data
    const userDataStr = params.get('user');
    if (!userDataStr) {
      return { valid: false, error: 'Missing user data' };
    }

    const userData = JSON.parse(userDataStr);

    return {
      valid: true,
      user: {
        id: userData.id?.toString(),
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        photoUrl: userData.photo_url
      }
    };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

// Express middleware
export function telegramAuthMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  const botToken = process.env.BOT_TOKEN;

  // For development without a bot token, allow bypass
  if (!botToken && process.env.NODE_ENV === 'development') {
    // Use mock user data from header or default
    const mockUserId = req.headers['x-mock-user-id'] || '123456789';
    req.telegramUser = {
      id: mockUserId,
      username: `user_${mockUserId}`,
      photoUrl: null
    };
    return next();
  }

  if (!botToken) {
    return res.status(500).json({ error: 'Bot token not configured' });
  }

  const result = validateTelegramInitData(initData, botToken);

  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  req.telegramUser = result.user;
  next();
}
