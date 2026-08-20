<p align="center">
  <img src="client/public/logo.png" alt="NIMWORD Logo" width="160" />
</p>

<h1 align="center">🎮 NIMWORD</h1>

<p align="center">
  <strong>The First Word Game on Nimiq</strong>
</p>

<p align="center">
  <a href="https://github.com/Miracle-Alajemba/nimword"><img src="https://img.shields.io/badge/Nimiq-Ecosystem-00B4D8?style=for-the-badge&logo=nimiq&logoColor=white" alt="Nimiq" /></a>
  <a href="https://nimword.vercel.app"><img src="https://img.shields.io/badge/Nimiq_Pay-Mini_App-FFD700?style=for-the-badge&logo=nimiq&logoColor=black" alt="Nimiq Pay Mini App" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://nimword.vercel.app"><img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.style=for-the-badge" alt="License MIT" /></a>
</p>

---

## 🌟 About NIMWORD

**NIMWORD** is the **very first word game built natively for the Nimiq blockchain ecosystem**. Designed for the **Nimiq Mini Apps Competition**, NIMWORD combines real-time word puzzle mechanics with seamless, feeless Web3 payment infrastructure.

Players compete in 60-second timed rounds to construct valid English words from 7 shared letter tiles. By staking **1 NIM** per round, players build up a collective prize pool. At the end of the round, 90% of the pot is instantly distributed directly to players' Nimiq wallets based on their score ratio, while 10% supports the NIMWORD treasury.

### 🚀 Why NIMWORD is Unique

- **First-of-its-Kind**: The pioneer puzzle & word game on Nimiq Pay.
- **Dual-Mode Wallet Compatibility**: Operates natively inside the **Nimiq Pay mobile container** (`window.nimiq`) while offering an automatic fallback via **Nimiq Hub API** for standard desktop/mobile browsers.
- **Powered by Nimiq's Super-Fast & Feeless Network**: Sub-second tx confirmation speeds with zero friction.
- **Identity-First Design**: Custom Identicon avatars generated on-the-fly from standard `NQ...` Nimiq addresses.

---

## ⚡ Key Features

- 📱 **Nimiq Pay Auto-Detection**: Instantly connects your wallet when opened inside the Nimiq Pay mobile app.
- 🆔 **NQ Address & Identicon Avatar**: Formats addresses into 9-block `NQxx...xxxx` standard and dynamically generates colorful `identicon.js` profile badges.
- 💰 **Real-Time NIM Balance Display**: Shows live wallet balance in NIM right in the header.
- 🎯 **1 NIM Staking Checkout**: Simple, safe 1 NIM stake authorization using `@nimiq/hub-api` or `window.nimiq.checkout()`.
- 🏆 **Direct Wallet Payouts**: 90% of entry fee pots are distributed automatically to winners' wallets upon round completion.
- 🎨 **Nimiq Blue & Gold Glassmorphism Theme**: Mobile-first UI using Nimiq Blue (`#00B4D8`), Electric Teal (`#00E5FF`), Nimiq Gold (`#FFD700`), and dark glassmorphic cards.
- 🧠 **Practice Arena & Daily Challenges**: Zero-cost free practice mode to hone vocabulary plus daily challenge rewards.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | High-performance single page client |
| **Blockchain Integration** | `@nimiq/mini-app-sdk`, `@nimiq/hub-api` | Nimiq Pay container detection & Hub checkout |
| **Profile Avatars** | `identicon.js` | Client-side SVG/PNG avatar generator from `NQ...` addresses |
| **Styling** | Custom Vanilla CSS | Nimiq Blue & Gold dark glassmorphism system |
| **Backend API** | Node.js + Express | Game room coordination, dictionary validation, and telemetry |
| **Real-Time Sockets** | Socket.IO | Synchronized multiplayer state & room lobby updates |
| **Caching & DB** | Redis + PostgreSQL / SQLite | High-speed active room state and leaderboard tracking |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Nimiq Wallet**: [Nimiq Pay App](https://nimiq.com/pay) or [Nimiq Hub](https://hub.nimiq.com) account

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Miracle-Alajemba/nimword.git
   cd nimword
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set Up Environment Variables**
   Create `server/.env` based on `server/.env.example`:
   ```env
   PORT=4000
   JOIN_PAYMENT_WEI=100000
   JOIN_PAYMENT_DISPLAY="1 NIM"
   TREASURY_NIM_ADDRESS="NQ69 9B0U S1V8 8V6A T452 7954 6C4C S05J C298"
   ```

5. **Run Locally**

   **Client** (Runs on `http://localhost:5173`):
   ```bash
   cd client
   npm run dev
   ```

   **Server** (Runs on `http://localhost:4000`):
   ```bash
   cd server
   npm run dev
   ```

---

## 📁 Project Structure

```
nimword/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Static assets & logo
│   └── src/
│       ├── components/
│       │   ├── screens/        # HomeScreen, LobbyScreen, MatchRoomScreen, Practice
│       │   └── ui/             # AvatarCircle, GameHeader, GlassCard, Badges
│       ├── config/             # Nimiq network & stake configuration (nimiq.js)
│       ├── hooks/              # useNimiqWallet hook for window.nimiq & Hub API
│       ├── utils/              # Nimiq address formatters & identicon generator
│       ├── styles.css          # Nimiq Blue & Gold glassmorphic CSS token system
│       ├── App.jsx             # Root React game container
│       └── main.jsx            # Entry point
├── server/                     # Node.js + Express Backend
│   └── src/
│       ├── index.js            # Express API, Socket.IO server, & room engine
│       ├── rounds.js           # 7-letter source word generator & dictionary check
│       └── english-words.txt   # English dictionary lookup dataset
├── README.md                   # Project documentation
└── railway.json                # Deployment configuration
```

---

## 🎲 How to Play

1. **Connect Wallet**: Open NIMWORD inside **Nimiq Pay** (auto-connects!) or click **Connect Nimiq Wallet** to log in via Nimiq Hub.
2. **Join a Room**: Tap **Stake 1 NIM & Play** to enter a public room or invite friends using your unique room link.
3. **Approve 1 NIM Stake**: Confirm the 1 NIM entry checkout popup in Nimiq Pay / Hub.
4. **Form Words**: When the round starts, tap the 7 letter tiles to spell valid English words (3 to 7+ letters long).
5. **Race the Clock**: Submit as many valid words as possible before the 60-second timer runs out.
6. **Win Rewards**: Top scorers receive their share of the 90% NIM prize pool sent directly to their `NQ...` wallet!

---

## 📊 Game Scoring

Words are scored dynamically based on length:

| Word Length | Points | Bonus Multiplier |
| :---: | :---: | :---: |
| **3 Letters** | **3 pts** | 1.0x |
| **4 Letters** | **5 pts** | 1.0x |
| **5 Letters** | **8 pts** | 1.2x |
| **6+ Letters** | **12 pts** | 1.5x |

> 💡 **Prize Formula**: `Your Payout = (Your Score / Total Room Score) × Reward Pool (90% of total stakes)`

---

## 🌐 Live Demo & Repository

- 🎮 **Live App**: [https://nimword.vercel.app](https://nimword.vercel.app)
- 📦 **GitHub Repository**: [https://github.com/Miracle-Alajemba/nimword](https://github.com/Miracle-Alajemba/nimword)

---

## 🗺️ Roadmap

- [x] **Phase 1**: Core word engine, dictionary validation, and real-time Socket.IO sync.
- [x] **Phase 2**: Nimiq Pay `window.nimiq` container auto-connect & Hub API checkout integration.
- [x] **Phase 3**: Identicon profile avatars, Nimiq address formatting, & glassmorphism design refresh.
- [ ] **Phase 4**: Seasonal leaderboards with NIM tournament prize pools.
- [ ] **Phase 5**: Multi-language word dictionaries (Spanish, German, French).

---

## 🤝 Contributing

Contributions are welcome! If you would like to contribute:

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- **Nimiq Team**: For building Nimiq Pay, feeless blockchain infrastructure, and hosting the Nimiq Mini Apps Competition.
- **Vite & React**: For ultrafast developer tooling.
- **Identicon.js**: For beautiful deterministic address avatars.

---

## 📬 Contact & Links

- **Developer**: Miracle Alajemba
- **GitHub**: [@Miracle-Alajemba](https://github.com/Miracle-Alajemba)
- **Project Link**: [https://github.com/Miracle-Alajemba/nimword](https://github.com/Miracle-Alajemba/nimword)
- **Live Demo**: [https://nimword.vercel.app](https://nimword.vercel.app)
