const BOT_TOKEN = process.env.BOT_TOKEN;

export async function sendTelegramMessage(chatId, text, inlineKeyboard = null) {
  if (!BOT_TOKEN) {
    console.log('[Notifications] No BOT_TOKEN set, skipping notification');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };

  if (inlineKeyboard) {
    body.reply_markup = {
      inline_keyboard: inlineKeyboard
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[Notifications] Telegram API error:', data);
    }

    return data;
  } catch (error) {
    console.error('[Notifications] Failed to send message:', error);
  }
}

export async function sendDeathNotification(telegramId, miniAppUrl) {
  const text = "💀 Oh no! Your Wacky Wap animal has been wacked to death! Wait 90 seconds and tap to respawn.";

  const keyboard = [
    [
      {
        text: "🎮 Open Wacky Wap",
        web_app: { url: miniAppUrl }
      }
    ]
  ];

  return sendTelegramMessage(telegramId, text, keyboard);
}

export async function sendAttackNotification(telegramId, miniAppUrl) {
  const text = "⚠️ Someone is attacking your animal! You've lost over 1000 points!";

  const keyboard = [
    [
      {
        text: "🎮 Defend Your Animal!",
        web_app: { url: miniAppUrl }
      }
    ]
  ];

  return sendTelegramMessage(telegramId, text, keyboard);
}
