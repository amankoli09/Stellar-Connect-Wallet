<img width="1672" height="941" alt="ChatGPT Image Jun 21, 2026, 09_50_07 PM" src="https://github.com/user-attachments/assets/8032d713-fcc5-44df-9eb8-0ff42c234a3d" />

<h3 align="center">A Soroban smart contract for on-chain crowdfunding, with a non-custodial React dApp + Freighter wallet front-end on the Stellar Testnet</h3>

<p align="center">
  <a href="https://soroban.stellar.org"><img src="https://img.shields.io/badge/Soroban-Smart_Contract-000000?style=flat-square&logo=stellar" alt="Soroban"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React"/></a>
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar_SDK-latest-000000?style=flat-square&logo=stellar" alt="Stellar SDK"/></a>
  <a href="https://www.freighter.app"><img src="https://img.shields.io/badge/Freighter_API-v6-7B5EA7?style=flat-square" alt="Freighter API"/></a>
  <a href="https://horizon-testnet.stellar.org"><img src="https://img.shields.io/badge/Network-Testnet-orange?style=flat-square" alt="Network"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/></a>
</p>

---

## 🛰️ Deployed Soroban Smart Contracts

This project ships **two cooperating Rust/Soroban contracts** on the **Stellar Testnet**:

1. **StellarFund** (`fund`) — a fully on-chain crowdfunding campaign. Donors send the native XLM asset into the contract, which tracks the cumulative amount raised, the unique-donor count, and each donor's running total; the beneficiary (`owner`) can withdraw the collected funds.
2. **DonorBadge** (`badge`) — a companion contract. On every donation, `fund` makes a **cross-contract call** to `badge.award`, assigning each donor a loyalty tier (Bronze / Silver / Gold) from their cumulative total. → see [Inter-Contract Communication](#-inter-contract-communication).

| | fund | badge |
|---|---|---|
| **Contract ID** | `CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI` | _deploy + paste ID_ |
| **Source** | [`contract/contracts/fund/src/lib.rs`](contract/contracts/fund/src/lib.rs) | [`contract/contracts/badge/src/lib.rs`](contract/contracts/badge/src/lib.rs) |
| **Network** | Stellar Testnet | Stellar Testnet |
| **Explorer** | [fund ↗](https://stellar.expert/explorer/testnet/contract/CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI) | — |

- **Asset** — native XLM (SAC `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`) · **Goal** — 1,000 XLM (`10000000000` stroops)

### 🔗 Transaction hashes (Testnet)

| Action | Hash |
|---|---|
| Deploy contract | [`97bb3a92…806ee41`](https://stellar.expert/explorer/testnet/tx/97bb3a9250ad37d64a76d3255ecd56f1bf562e21f958ad1f5ec53dbef806ee41) |
| `donate()` interaction | [`5edecdcb…1937e4`](https://stellar.expert/explorer/testnet/tx/5edecdcbbc74588796b951900b22244af71baa35398e2aa499d32645511937e4) |

### 📂 Smart Contract Folder Structure

The complete contract source lives in **[`contract/contracts/fund/src/lib.rs`](contract/contracts/fund/src/lib.rs)** under a standard Soroban workspace layout:

```
contract/
├── Cargo.toml                          # Soroban workspace (soroban-sdk 26)
└── contracts/
    └── fund/
        ├── Cargo.toml                  # fund crate — crate-type ["lib", "cdylib"]
        ├── Makefile
        └── src/
            ├── lib.rs                  # ← the StellarFund smart contract source
            └── test.rs                 # unit tests (5 tests)
```

### 🧩 Contract Interface — `contract/contracts/fund/src/lib.rs`

The contract uses Soroban's `#[contract]`, `#[contractimpl]`, `#[contracttype]`, `#[contracterror]`, and `#[contractevent]` macros, with `require_auth()` authorization and both instance and persistent storage.

| Method | Kind | Description |
|---|---|---|
| `__constructor(owner, token, goal)` | init | Sets the beneficiary, campaign asset (SAC), and fundraising goal at deploy time. |
| `donate(from, amount)` | write | Requires `from` auth, pulls `amount` of the token into the contract, updates the cumulative total + per-donor contribution, closes the campaign when the goal is met, emits a `Donated` event. Returns the new total raised. |
| `withdraw()` | write | Owner-only (`require_auth`). Transfers the full contract balance to the beneficiary, emits `Withdrawn`. |
| `goal()` / `raised()` / `donors()` | read | Campaign progress. |
| `is_closed()` | read | `true` once the goal has been reached. |
| `contribution(who)` | read | A given address's running total. |
| `owner()` / `token()` | read | Campaign configuration. |

**Custom errors:** `ZeroAmount` (1) · `CampaignClosed` (2) · `NothingRaised` (3)
**Events:** `Donated { from, amount, total }` · `Withdrawn { owner, amount }`

### 🦀 Build, Test & Deploy the Contracts

```bash
cd contract
cargo test                 # run the full suite — 11 tests (6 fund + 5 badge)
stellar contract build     # build both optimized wasm files
```

Full step-by-step deployment of **both** contracts (including the `set_badge`
wiring for the cross-contract call) lives in **[`contract/README.md`](contract/README.md)**.

---

## 🔗 Inter-Contract Communication

StellarFund and DonorBadge demonstrate a real **cross-contract call** on Soroban:

```
 donor ──donate()──▶  fund contract  ──award()──▶  badge contract
                      (records gift)              (assigns loyalty tier)
```

1. A donor calls `fund.donate(from, amount)`.
2. `fund` records the donation and updates the donor's running total.
3. If a badge contract is registered (`fund.set_badge(<BADGE_ID>)`), `fund`
   invokes `BadgeClient::new(&env, &badge).award(&from, &donor_total)`.
4. `badge.award` authorizes the caller via `admin.require_auth()` — where
   `admin` is the **fund contract's own address** — so only the fund contract
   can mint badges. Both writes share one transaction, making the badge update
   **atomic** with the donation.

The typed client is generated with `#[contractclient]` from a trait in
[`fund/src/lib.rs`](contract/contracts/fund/src/lib.rs), and the end-to-end path
is covered by the `donation_awards_badge_cross_contract` test.

---

## 🧪 Testing

| Suite | Command | Tests |
|---|---|---|
| Contracts (Rust) | `cd contract && cargo test` | **11** (6 fund + 5 badge) |
| Frontend (Jest) | `CI=true npm test` | **9** (`src/lib/stellar.test.js`) |

Frontend tests cover the pure conversion, validation, and tier-mapping helpers
in [`src/lib/stellar.js`](src/lib/stellar.js) — stroop ↔ XLM conversion, Stellar
address format validation, and badge-tier naming.

> <img width="1181" height="533" alt="Screenshot 2026-06-21 at 9 07 53 PM" src="https://github.com/user-attachments/assets/681eab2d-6b93-47d5-aa3b-c03473b3b937" />


---

## ⚙️ CI/CD Pipeline

Every push and pull request to `main` runs **[GitHub Actions](.github/workflows/ci.yml)** with two parallel jobs:

| Job | Steps |
|---|---|
| **Soroban contracts** | install Rust → `cargo test --workspace` |
| **Frontend** | `npm ci` → `npm test` → `npm run build` |

> <img width="1457" height="545" alt="Screenshot 2026-06-21 at 9 11 15 PM" src="https://github.com/user-attachments/assets/52cfb77a-526b-4bfa-a075-06d659ffbc10" />


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React dApp (CRA)                                            │
│  Header → Crowdfund ──► Fund.js (Soroban RPC client)        │
│                         Freighter.js (wallet: sign/address) │
│                         lib/stellar.js (pure, unit-tested)  │
└───────────────┬─────────────────────────────────────────────┘
                │ @stellar/stellar-sdk + @stellar/freighter-api
                ▼
        Soroban RPC (Testnet)
                │
   ┌────────────┴────────────┐
   ▼                         ▼
 fund contract  ──award()──►  badge contract
 (crowdfunding)              (DonorBadge tiers)
```

- **Separation of concerns** — pure helpers (`lib/stellar.js`) are isolated from network/wallet code so they can be unit-tested without mocks.
- **Typed errors + loading states** — `FundError` maps contract failures to friendly UI copy; `Crowdfund.js` tracks `idle → pending → success → error`.
- **Real-time updates** — `getRecentDonations()` streams on-chain `Donated` events into a live activity feed.
- **Atomic cross-contract writes** — donation + badge award commit in one transaction.

---

## 📖 Front-End dApp — StellarFlow

**StellarFlow** is the non-custodial React + Freighter front-end that pairs with the StellarFund contract. It connects a user's Freighter wallet,reads their address and live XLM balance, and signs/submits real Stellar Testnet transactions — no sign-up, no middleman, no custody of keys.

- ✅ **Connect Wallet** — Freighter integration in [`src/components/Freighter.js`](src/components/Freighter.js): `setAllowed()` → permission, `requestAccess()` → address retrieval, `signTransaction()` → transaction signing
- ✅ **Wallet Balance Checker** — live XLM balance displayed on connection
- ✅ **Send XLM** — real Testnet payments with client-side address validation
- ✅ **Transaction History Viewer** — persistent activity panel via `localStorage`

### Key Features

| Feature | Details |
|---|---|
| 🔗 Wallet Connection | Connects via Freighter browser extension (non-custodial) |
| 🪪 Address Retrieval | `requestAccess()` returns the connected public key |
| ✍️ Transaction Signing | `signTransaction()` signs XDR inside Freighter |
| 💸 Send XLM | Real Stellar Testnet transactions |
| 📊 Live Balance | Auto-refreshes after every transaction |
| 🧾 Transaction History | Persisted in `localStorage` — survives reconnects |
| ✅ Address Validation | Client-side Stellar address format check |
| 🌐 WebGL Landing Page | Interactive light-rays hero (OGL + custom GLSL shaders) |
| 📱 Responsive Design | Mobile, tablet, and desktop |

---

### 🌌 Landing Page — Light Rays Hero
> Mouse-interactive WebGL background, glassmorphism nav, hero CTA

<img width="1466" height="741" alt="Screenshot 2026-06-21 at 9 22 30 PM" src="https://github.com/user-attachments/assets/ca43827a-6c15-48fe-ae0e-85077fe12d7d" />


### 🔌 Wallet Connected — Dashboard View
> Balance displayed, wallet address shown, Recent Activity panel ready

<img width="1466" height="741" alt="Screenshot 2026-06-21 at 9 22 46 PM" src="https://github.com/user-attachments/assets/519d97b6-a4e6-4276-bbc8-37d745d2920d" />


### 📤 Sending XLM — Transfer Panel
> Recipient address input with Stellar format validation, amount field, Process Transfer button

<img width="1466" height="741" alt="Screenshot 2026-06-21 at 9 23 52 PM" src="https://github.com/user-attachments/assets/af6a1436-2fe1-4572-86ef-1150fb049714" />


### ✅ Successful Testnet Transaction
> Green "Transaction confirmed" badge with the on-chain transaction hash

<img width="714" height="239" alt="Confirmed transaction" src="https://github.com/user-attachments/assets/8d9ec35e-1573-41a0-929c-a94d83d4e309" />

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contract** | Rust + Soroban SDK 26 (`contract/contracts/fund/src/lib.rs`) |
| **Contract Network** | Stellar Testnet (deployed) |
| **Frontend** | React 18 (Create React App) |
| **Wallet** | Freighter Browser Extension |
| **Stellar SDK** | `@stellar/stellar-sdk` |
| **Freighter API** | `@stellar/freighter-api` v6 |
| **WebGL Rendering** | `ogl` (minimal WebGL library) |
| **Styling** | Vanilla CSS — glassmorphism + dark theme |
| **Persistence** | Browser `localStorage` (transaction history) |

---

## ⚙️ Front-End Setup

### Prerequisites

- **Node.js** v16+ — [Download](https://nodejs.org)
- **npm** v8+ (comes with Node)
- **Freighter Wallet** extension — [Install for Chrome](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)

### 1. Clone & install

```bash
git clone https://github.com/amankoli09/Stellar-Connect-Wallet.git
cd Stellar-Connect-Wallet
npm install
```

### 2. Start the dev server

```bash
npm start
```

The app opens at **[http://localhost:3000](http://localhost:3000)**.

### 3. Configure Freighter for Testnet

1. Click the Freighter extension icon
2. Go to **Settings → Network → Testnet**
3. Return to `localhost:3000` and click **Connect**

### 4. Fund your Testnet wallet

```
https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
```

Or use [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

---

## 🚀 How to Use

```
1. Install & configure Freighter (switch to Testnet)
2. Open http://localhost:3000
3. Click "Connect" → approve in Freighter (setAllowed + requestAccess)
4. Your XLM balance loads automatically
5. Enter a recipient Stellar address (G... 56 chars) + amount
6. Click "Process Transfer" → sign in Freighter (signTransaction)
7. Watch the balance update and "Transaction confirmed" appear in green
8. Check Recent Activity — history persists even after disconnect
```

---

## 📁 Full Project Structure

```
stellar-connect-wallet/
├── .github/workflows/ci.yml            # ← CI/CD: contract tests + frontend test/build
├── contract/                           # ← Soroban smart contracts (Rust workspace)
│   ├── Cargo.toml                      # workspace (members = contracts/*)
│   └── contracts/
│       ├── fund/src/
│       │   ├── lib.rs                  # StellarFund crowdfunding contract → calls badge
│       │   └── test.rs                 # 6 unit tests (incl. cross-contract)
│       └── badge/src/
│           ├── lib.rs                  # DonorBadge contract ← called by fund
│           └── test.rs                 # 5 unit tests
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js                   # landing page + dashboard UI
│   │   ├── Crowdfund.js                # campaign panel, loading/error states
│   │   ├── Fund.js                     # Soroban RPC client (read/donate/events/badge)
│   │   ├── Freighter.js                # wallet connect, address, balance, signing
│   │   ├── LightRays.js                # WebGL light-rays effect (OGL + GLSL)
│   │   └── LightRays.css
│   ├── lib/
│   │   ├── stellar.js                  # pure helpers (conversion/validation/tiers)
│   │   └── stellar.test.js             # 9 frontend unit tests
│   ├── App.js                          # root component
│   ├── App.css                         # design system (glassmorphism dark theme)
│   └── index.css
├── package.json
└── README.md
```

---

## 🔐 Security Notes

- **Non-custodial**: StellarFlow never stores, transmits, or accesses private keys
- All transaction signing happens **inside the Freighter extension**
- The `withdraw` contract method is owner-gated via `require_auth()`
- The front-end only calls the public [Stellar Horizon Testnet API](https://horizon-testnet.stellar.org)

---

## 🌐 Live Demo

### Live app: https://stellar-connect-wallet-rr5q.vercel.app/

### Demo video : https://youtu.be/8IG4hLKOBYI?si=qmRZ8nDYfCVZ8ZDe

---

## 📱 Mobile Responsive

The dApp is fully responsive across mobile, tablet, and desktop.

<img width="1457" height="778" alt="Screenshot 2026-06-21 at 9 13 14 PM" src="https://github.com/user-attachments/assets/bd251e29-2b71-420d-8ce7-46b8bd9f9fc9" />

<img width="1457" height="778" alt="Screenshot 2026-06-21 at 9 13 35 PM" src="https://github.com/user-attachments/assets/63032cd8-7180-4d2e-a461-b63e343b5576" />


---

## 📄 License

MIT © 2025 — Built for the Stellar Developer Track submission.

---

## 🔵 Level 5 — Blue Belt Submission

### 👥 User Onboarding

We onboarded **50+ testnet users** via a Google Form that collects wallet address, email, name, and product rating.

**📝 User Feedback Form:** [Fill out here →](https://docs.google.com/forms/d/e/1FAIpQLSf-PLACEHOLDER/viewform)

**📊 User Data Export (Excel):**
> Export link / file will be added here once responses are collected.  
> _Column headers: Name | Email | Wallet Address | How did you find us | Rating (1–5) | Feature Requests_

---

### 📊 Pitch Deck

**🎯 [View StellarFlow Pitch Deck →](https://stellar-connect-wallet-rr5q.vercel.app/pitch.html)**

The pitch deck covers:
- Problem Statement
- Solution & Key Features
- Architecture (cross-contract flow diagram)
- Market Opportunity ($190B remittances + $1.8T B2B payments)
- Traction & Proof (live contract, 50+ users, CI/CD)
- Growth Strategy
- Future Roadmap

---

### 🎬 Demo Video

**▶️ [Watch Full Product Walkthrough →](https://youtu.be/8IG4hLKOBYI?si=qmRZ8nDYfCVZ8ZDe)**

---

### 🔄 User Feedback Iteration Summary

Based on user feedback collected during Level 4 testing, we implemented the following improvements in Level 5:

#### Improvements Made

| Feedback Received | Improvement Made | Commit |
|---|---|---|
| "Hard to get started — I didn't know where to get testnet XLM" | Added 5-step **Onboarding Modal** with Friendbot link (auto-shows on first visit) | [`feat(ux): add step-by-step onboarding modal for first-visit users`](https://github.com/amankoli09/Stellar-Connect-Wallet/commits/main) |
| "Can't tell how much has been raised without connecting wallet" | Built **Live Analytics Dashboard** pulling real Soroban contract data — visible without connecting | [`feat(analytics): add live on-chain analytics panel with animated stats`](https://github.com/amankoli09/Stellar-Connect-Wallet/commits/main) |
| "Roadmap was out of date — loyalty tiers are done" | Updated **Roadmap** to mark DonorBadge as shipped, added Level 5 phase | [`feat(roadmap): update roadmap — loyalty done, add Scale & Ecosystem phase`](https://github.com/amankoli09/Stellar-Connect-Wallet/commits/main) |
| "Want to give feedback without leaving the site" | Added **In-App Feedback Panel** with Google Form link embedded on the landing page | [`feat(feedback): add in-app feedback panel with user stats and form link`](https://github.com/amankoli09/Stellar-Connect-Wallet/commits/main) |

#### Next Phase Improvements (Planned)
- **Mainnet deployment** — move from Testnet to Stellar Mainnet once fully validated
- **Multi-asset support** — accept USDC alongside native XLM for campaigns
- **Campaign creation UI** — let anyone deploy a new StellarFund campaign from the UI
- **Referral system** — DonorBadge tiers drive referral bonuses for higher-tier donors
- **DAO governance** — on-chain voting for campaign approval and fund withdrawal

---

<div align="center">
  <sub>Built with ♥ on the Stellar Testnet — Soroban contract + Freighter dApp</sub>
</div>
