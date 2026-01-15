# Wacky Wap 🐹

A competitive clicking game Telegram Mini App where users wack cartoon animals to steal points from each other!

## Features

- **Wack Your Animal**: Click to earn +100 points
- **Attack Others**: Steal 100 points from other players
- **Shield Protection**: Spend 1000 points for 10 minutes of protection
- **Death & Respawn**: Animals die at 0 points and respawn after 90 seconds
- **Leaderboard**: Compete for the top spot
- **Telegram Notifications**: Get alerted when you're being attacked

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Telegram SDK**: @twa-dev/sdk

## Setup

### Prerequisites

- Node.js 18+
- A Telegram Bot Token (from @BotFather)

### Installation

1. Clone the repository:
```bash
cd wackywap
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```env
BOT_TOKEN=your_telegram_bot_token_here
MINI_APP_URL=https://your-app-url.com
PORT=3001
NODE_ENV=development
```

### Development

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In another terminal, start the frontend:
```bash
cd client
npm run dev
```

3. Open http://localhost:5173 in your browser

### Production Build

1. Build the frontend:
```bash
cd client
npm run build
```

2. Start the server (it will serve the built frontend):
```bash
cd server
npm start
```

## Telegram Bot Setup

1. Create a bot with @BotFather
2. Enable Web App for your bot: `/mybots` → Select bot → Bot Settings → Menu Button
3. Set the Mini App URL to your deployed app URL
4. Add the bot token to your `.env` file

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` | GET | Get or create user |
| `/api/users` | GET | Get all other users |
| `/api/leaderboard` | GET | Get top 100 users |
| `/api/wack-self` | POST | Wack own animal (+100 pts) |
| `/api/wack-user/:id` | POST | Attack another user |
| `/api/activate-shield` | POST | Activate 10-min shield |
| `/api/respawn` | POST | Respawn after death |

## Game Rules

1. **Starting Points**: All players start with 1000 points
2. **Self-Wack**: +100 points per click
3. **Attack**: Steal min(100, victim's points)
4. **Death**: At 0 points, wait 90 seconds to respawn
5. **Shield**: Costs 1000 points, lasts 10 minutes
6. **Notifications**:
   - Death notification sent via Telegram
   - Attack warning when losing 1000+ points in 60 seconds

## Project Structure

```
wackywap/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Animal.jsx
│   │   │   ├── AttackModal.jsx
│   │   │   ├── DeathScreen.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── ShieldButton.jsx
│   │   │   └── UserList.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── middleware/
│   │   └── validateTelegram.js
│   ├── routes/
│   │   ├── user.js
│   │   └── game.js
│   ├── services/
│   │   └── notifications.js
│   ├── db.js
│   ├── index.js
│   └── package.json
└── README.md
```

## License

MIT
