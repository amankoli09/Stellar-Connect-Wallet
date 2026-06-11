<div align="center">

# ✦ StellarFlow

### A non-custodial XLM payment dApp built on the Stellar Testnet

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Stellar SDK](https://img.shields.io/badge/Stellar_SDK-latest-000000?style=flat-square&logo=stellar)](https://stellar.org)
[![Freighter API](https://img.shields.io/badge/Freighter_API-v6-7B5EA7?style=flat-square)](https://www.freighter.app)
[![Network](https://img.shields.io/badge/Network-Testnet-orange?style=flat-square)](https://horizon-testnet.stellar.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Project Description

**StellarFlow** is a fully functional, non-custodial Web3 payment dApp that lets users send XLM (Stellar Lumens) to any Stellar address directly from their browser — no sign-up, no middleman, no fees beyond the base Stellar network fee (~$0.00001).

Built on the **Stellar Testnet** using the **Freighter wallet extension**, StellarFlow demonstrates:

- ✅ **Simple Payment dApp** — send XLM to any address with amount validation
- ✅ **Wallet Balance Checker** — live XLM balance displayed on connection
- ✅ **Transaction History Viewer** — persistent recent activity panel (survives disconnects via `localStorage`)

### Key Features

| Feature | Details |
|---|---|
| 🔗 Wallet Connection | Connects via Freighter browser extension (non-custodial) |
| 💸 Send XLM | Real Stellar Testnet transactions with Freighter signing |
| 📊 Live Balance | Auto-refreshes after every transaction |
| 🧾 Transaction History | Persisted in `localStorage` — survives navigation & reconnects |
| ✅ Address Validation | Client-side Stellar address format check before submission |
| 🌐 WebGL Landing Page | Interactive light-rays hero section using OGL + custom GLSL shaders |
| 📱 Responsive Design | Fully responsive across mobile, tablet, and desktop |

---

## 🖼️ Screenshots

### 🔌 Wallet Connected — Dashboard View
> Balance displayed, wallet address shown, Recent Activity panel ready

![Dashboard Connected State](./screenshots/connected.png)

### 📤 Sending XLM — Transfer Panel
> Recipient address input with Stellar format validation, amount field, and Process Transfer button

![Send XLM Panel](./screenshots/send.png)

### ✅ Successful Testnet Transaction
> Green "Transaction confirmed" badge with the on-chain transaction hash

![Transaction Confirmed](./screenshots/success.png)

### 🌌 Landing Page — Light Rays Hero
> Mouse-interactive WebGL background, glassmorphism nav, hero CTA

![Landing Page](./screenshots/landing.png)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Create React App) |
| **Blockchain** | Stellar Network (Testnet) |
| **Wallet** | Freighter Browser Extension |
| **Stellar SDK** | `@stellar/stellar-sdk` |
| **Freighter API** | `@stellar/freighter-api` v6 |
| **WebGL Rendering** | `ogl` (minimal WebGL library) |
| **Styling** | Vanilla CSS — glassmorphism + dark theme |
| **Fonts** | Google Fonts — Poppins + Orbitron |
| **Persistence** | Browser `localStorage` (transaction history) |

---

## ⚙️ Setup Instructions

### Prerequisites

Before running locally, make sure you have:

- **Node.js** v16+ — [Download](https://nodejs.org)
- **npm** v8+ (comes with Node)
- **Freighter Wallet** browser extension — [Install for Chrome](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/stellar-connect-wallet.git
cd stellar-connect-wallet/stellar-connect-wallet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

The app opens at **[http://localhost:3000](http://localhost:3000)**

### 4. Configure Freighter for Testnet

> This step is **required** before connecting.

1. Click the Freighter extension icon in your browser
2. Go to **Settings → Network**
3. Select **Testnet**
4. Return to `localhost:3000` and click **Connect**

### 5. Fund Your Testnet Wallet

New Testnet accounts need to be funded before use. Visit:

```
https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
```

Or use [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) to create & fund a new account instantly.

---

## 🚀 How to Use

```
1. Install & configure Freighter extension (switch to Testnet)
2. Open http://localhost:3000
3. Click "Connect" → approve in Freighter popup
4. Your XLM balance loads automatically
5. Enter a recipient Stellar address (G... 56 chars) + amount
6. Click "Process Transfer" → sign in Freighter
7. Watch the balance update and "Transaction confirmed" appear in green
8. Check Recent Activity — history persists even after disconnect
```

---

## 📁 Project Structure

```
stellar-connect-wallet/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js        # Main app logic — landing page + dashboard UI
│   │   ├── Freighter.js     # Wallet connection, balance fetch, send payment
│   │   ├── LightRays.js     # WebGL light-rays effect (OGL + GLSL shaders)
│   │   └── LightRays.css    # Canvas container styles
│   ├── App.js               # Root component
│   ├── App.css              # Full design system (glassmorphism dark theme)
│   └── index.css            # Global reset
├── package.json
└── README.md
```

---

## 🔐 Security Notes

- **Non-custodial**: StellarFlow never stores, transmits, or has access to your private keys
- All transaction signing happens **inside the Freighter extension**
- The app only calls the public [Stellar Horizon Testnet API](https://horizon-testnet.stellar.org)
- No backend, no database — 100% client-side

---

## 🌐 Live Demo

> Deployed at: **[your-deployment-link-here]**

---

## 📄 License

MIT © 2025 — Built for the Stellar Developer Track submission.

---

<div align="center">
  <sub>Built with ♥ on the Stellar Testnet</sub>
</div>
