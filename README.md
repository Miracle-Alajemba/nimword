<div align="center">

<img src="client/public/logo.png" alt="NimWord Logo" width="130" />

# NimWord

### Real-Time Multiplayer Word Battle Powered by Nimiq Blockchain

[![Play NimWord](https://img.shields.io/badge/🎮_Live_App-nimword.vercel.app-gold?style=for-the-badge)](https://nimword.vercel.app)
[![Nimiq](https://img.shields.io/badge/Network-Nimiq_Mainnet-E9B213?style=for-the-badge&logo=nimiq&logoColor=white)](https://nimiq.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Form words. Beat the clock. Win NIM.</strong><br>
  A high-speed, decentralized vocabulary arena where players stake NIM, compete in 60-second real-time rounds, and earn instant on-chain payouts.
</p>

---

</div>

## 🌟 Key Features

- ⚡ **Real-Time Multiplayer Arena**: 60-second high-intensity word scramble rounds powered by Socket.IO WebSocket synchronization.
- 🪙 **Customizable Stake Amounts**: Players can select their wager (**1, 5, 10, 25, 50, or 100 NIM**) with automated lobby tier matchmaking.
- 🏆 **90% Dynamic Prize Pool**: 90% of the total staked pot is distributed proportionally to top-scoring players based on performance, with 10% allocated to the game treasury.
- 📅 **Daily Challenge & Streaks**: Free-to-play daily puzzles with tiered difficulty (Warm Up, Standard, Expert) to earn daily NIM rewards and build win streaks.
- 🎯 **Practice Arena**: Zero-friction offline and online solo practice mode to train anagram spotting and typing speed without staking.
- 🦊 **Native Nimiq Integration**: Seamless non-custodial wallet authentication via `@nimiq/hub-api` and dynamic hexagonal player identicons via `@nimiq/identicons`.
- 📱 **Mobile-First Glassmorphic UI**: Fast, responsive dark-mode cyber interface designed for smartphones, tablets, and desktops.

---

## 🎮 Game Modes

| Mode | Entry Fee | Duration | Rewards |
| :--- | :---: | :---: | :--- |
| **Quick Match Arena** | 1 – 100 NIM | 60s | 90% of total pot distributed proportionally by score |
| **Private Rooms** | Custom NIM | 60s | Play with friends via instant shareable invite link |
| **Daily Challenge** | Free (Daily) | 60s | Up to 2.0 NIM daily reward + streak multiplier |
| **Practice Arena** | Free | 60s | XP & speed training (no wallet required) |

---

## 🕹️ How It Works

```mermaid
flowchart LR
    A[Connect Nimiq Wallet] --> B[Select Stake Amount]
    B --> C[Join 60s Match Lobby]
    C --> D[Pay Entry Fee via Hub]
    D --> E[Race & Form Valid Words]
    E --> F[Round Over & Score Audit]
    F --> G[Instant 90% Pot Payout]
```

1. **Connect Wallet**: Sign in seamlessly using your official Nimiq Hub wallet.
2. **Choose Stake & Difficulty**: Pick your stake tier (1, 5, 10, 25, 50, 100 NIM).
3. **Lock In Your Seat**: Confirm the transaction on-chain via Nimiq Hub.
4. **Form Words**: Unscramble sub-words from the shared 8-letter source word before the 60-second timer expires:
   - **3 Letters**: +3 Points
   - **4 Letters**: +5 Points
   - **5 Letters**: +8 Points
   - **6+ Letters**: +12 Points
5. **Collect Payout**: When the round concludes, 90% of the room pot is automatically split among winning players based on relative score.

---

## 🛠️ Architecture & Tech Stack

```
nimword/
├── client/              # React + Vite Frontend
│   ├── public/          # Static assets, branding, and manifest
│   └── src/
│       ├── components/  # Screen components (Home, Lobby, Arena, Daily, Board)
│       ├── hooks/       # Custom hooks (Nimiq wallet, music, timers)
│       ├── utils/       # Nimiq identicons, audio haptics, UI helpers
│       └── game.js      # Client game engine & offline dictionary validator
└── server/              # Node.js + Express + Socket.IO Backend
    ├── src/             # Matchmaking, room management, payout settlement
    └── tests/           # Automated test suite (175+ tests)
```

- **Frontend**: React 18, Vite, Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid)
- **Backend**: Node.js, Express, Socket.IO
- **Blockchain**: Nimiq Mainnet (`@nimiq/hub-api`, `@nimiq/identicons`, `@nimiq/utils`)
- **State & Caching**: Redis (Lobby matchmaking & rate limiting)
- **Storage**: PostgreSQL (Match history, leaderboards, daily claims)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Redis](https://redis.io/) (optional for local mock mode, required for production clustering)

### 1. Clone the Repository
```bash
git clone https://github.com/Miracle-Alajemba/nimword.git
cd nimword
```

### 2. Configure Environment Variables

**Server Configuration (`server/.env`)**:
```env
PORT=4000
NIMIQ_TREASURY_ADDRESS=NQ69 9B0U S1V8 8V6A T452 7954 6C4C S05J C298
NIMIQ_TREASURY_PRIVATE_KEY=your_private_key_here
NIMIQ_RPC_URL=https://rpc.nimiqwatch.com
JOIN_PAYMENT_NIM=1
DAILY_REWARD_NIM=0.1
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nimword
```

**Client Configuration (`client/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_URL=http://localhost:5173
```

### 3. Run Locally

**Start Server**:
```bash
cd server
npm install
npm run dev
```

**Start Client**:
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run the comprehensive test suite (175+ tests covering dictionary validation, scoring, payout algorithms, and matchmaking):

```bash
cd server
npm test
```

Build the production client bundle:

```bash
cd client
npm run build
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for the <a href="https://nimiq.com">Nimiq</a> Community.</sub>
</div>
