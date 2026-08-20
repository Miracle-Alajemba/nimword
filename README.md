<p align="center">
  <img src="client/public/logo.png" alt="WordPot Logo" width="160" />
</p>

# WordPot

> A Celo-powered word game where players race to form words, compete for points, join paid rooms, and earn rewards through wallet-based gameplay.

🎮 Play now: https://wordpot.vercel.app

---

## How It Works

Players can enter WordPot in two main ways.

**Paid multiplayer rooms** — Connect a Celo-compatible wallet, join or create a room, pay the entry fee, and invite friends with a room link. When the room starts, everyone gets the same source word and races to submit valid words before the timer ends. Longer words score more points. Rewards are split based on each player's final score.

**Practice Arena** — Free to play, no wallet required to start. Players can test their word skills, improve their vocabulary, and explore the game loop without any cost.

---

## Game Modes

**Paid Rooms**
Players join with CELO, compete in a live room, and rewards are distributed based on score. Each room has a 4-minute lobby window. If the game does not start in time the room expires and players are sent back to create a new one.

**Practice Arena**
Play freely without paying. Full word validation, scoring, and source word mechanics are active. No wallet needed to start.

**Daily Challenge**
Play one free timed round per wallet per day. Reach the target score, then claim a real `0.01 CELO` reward from the funded WordPot smart contract. Once a wallet has played or claimed for the day, it must wait until the next day.

---

## Scoring

Words are scored by length:

```
3 letters  =  3 points
4 letters  =  5 points
5 letters  =  8 points
6+ letters = 12 points
```

Players must form valid words using only the letters in the source word. Duplicate words are blocked, invalid words are rejected, and every accepted word adds to the player's score.

---

## Room System

Each room has a waiting lobby where players can join, pay the entry fee, and invite friends before the game starts.

Lobby features:
- Invite link to share with friends
- Player list with host and paid badges
- Entry payment status
- 4-minute countdown timer
- Start button for the host
- Contract mode notice

---

## Wallet and Payments

WordPot uses wallet identity for all players in paid rooms. The app supports MiniPay and other Celo-compatible injected wallets. Entry payments and reward claims run through Celo Mainnet transactions.

---

## Reward System

For paid rooms, the reward pool is 90% of total entry fees. Each player's payout is calculated as:

```
(player score / total room score) × reward pool
```

The remaining 10% goes to the WordPot treasury.

---

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Smart Contract: Solidity on Celo Mainnet
- Wallet: MiniPay + injected wallets via viem
- Network: Celo Mainnet
- Telemetry: Real-Time Operational Health Telemetry (`/api/health`)
- Caching: In-Memory TTL Cache Engine (`TtlCacheEngine`)
- Audio: Zero-Dependency Web Audio API Synthesizer (`WebAudioFxSynthesizer`)
- Room Contract Address: `0x764b3f8761CEB44e6FFA6480484b706C3c3A8284`
- Daily Challenge Contract Address: `0x4302D510383C6be4a284759BB0616fc6ED57e9A1`

---

## Onchain

- Live App: https://wordpot.vercel.app
- Room Contract: `0x764b3f8761CEB44e6FFA6480484b706C3c3A8284`
- Room Explorer: https://celoscan.io/address/0x764b3f8761CEB44e6FFA6480484b706C3c3A8284
- Daily Challenge Contract: `0x4302D510383C6be4a284759BB0616fc6ED57e9A1`
- Daily Challenge Explorer: https://celoscan.io/address/0x4302D510383C6be4a284759BB0616fc6ED57e9A1

---

## Getting Started

1. Open WordPot and connect your Celo-compatible wallet
2. Click **Join Game** to enter a room or **Practice Arena** to play free
3. Share your room invite link with friends and start competing

---

## Trust and Safety

- Room expiry prevents abandoned lobbies
- One claim per wallet per day for Daily Challenge
- Minimum score requirement before claiming
- Server-side claim recording
- Wallet address validation on all requests
- Duplicate word prevention
- Backend payout configuration so rewards can be adjusted or paused

---

## Project Structure

```
client/     React + Vite frontend
server/     Node.js + Express backend and room logic
contracts/  Solidity smart contract for escrow and claims
docs/       Product notes and specs
```

---

## Run Locally

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

**Environment variables** — create `server/.env` from `server/.env.example` and set:

```
TREASURY_WALLET
WORDPOT_CONTRACT_ADDRESS=0x4302D510383C6be4a284759BB0616fc6ED57e9A1
CONTRACT_OPERATOR_PRIVATE_KEY
CELO_CHAIN_ID
JOIN_PAYMENT_WEI
JOIN_PAYMENT_DISPLAY
```

`WORDPOT_CONTRACT_ADDRESS=0x4302D510383C6be4a284759BB0616fc6ED57e9A1` is the current contract used for Daily Challenge rewards.

If `WORDPOT_CONTRACT_ADDRESS` is not set the lobby falls back to treasury beta join-payment mode while contract payout stays in preview.


