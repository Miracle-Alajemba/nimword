# NimWord

> A real-time multiplayer word game built on Nimiq. Stake NIM, build words, beat the clock, and earn rewards.

🎮 Play now: https://nimword.vercel.app

## How It Works

Players connect a Nimiq wallet, join a room, stake 1 NIM entry fee, and race to build valid words from a shared source word in 60 seconds. Rewards are split based on score — 90% to players, 10% to treasury.

## Game Modes

- **Multiplayer Rooms** — Stake 1 NIM, compete live, earn NIM rewards
- **Practice Arena** — Free to play, no wallet needed
- **Daily Challenge** — Free round once per day, claim 0.1 NIM reward

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Socket.IO
- Wallet: Nimiq Pay + Nimiq Hub API
- Network: Nimiq Mainnet
- Database: PostgreSQL + Redis

## Getting Started

**Client**
```bash
cd client
npm install
npm run dev
```

**Server**
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```env
NIMIQ_TREASURY_ADDRESS=NQ...
NIMIQ_TREASURY_PRIVATE_KEY=...
NIMIQ_RPC_URL=https://rpc.nimiqwatch.com
JOIN_PAYMENT_NIM=1
DAILY_REWARD_NIM=0.1
PORT=4000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```
