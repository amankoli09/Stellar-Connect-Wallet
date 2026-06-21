# Contributing to Stellar-Connect-Wallet

First off, thank you for considering contributing to Stellar-Connect-Wallet! It's people like you that make open-source such a great community.

This document serves as a guide for setting up your local environment, running tests, and understanding the Smart Contract API.

---

## 1. Local Setup

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16+) & **npm**
- **Rust** & Cargo (for smart contracts)
- **Soroban CLI** (to build and test contracts)
- **Freighter Wallet** browser extension

### Frontend Setup
To run the React dApp locally:

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/<your-username>/Stellar-Connect-Wallet.git
   cd Stellar-Connect-Wallet
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will run at `http://localhost:3000`. 
   > [!NOTE]
   > You might see a "Your connection is not private" warning because the project forces HTTPS for local development. This is safe to bypass for localhost.

### Wallet Setup (Freighter)
1. Install the Freighter browser extension.
2. Open Freighter settings and switch the Network to **Testnet**.
3. Create a new account and copy your Public Key.
4. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) or use Friendbot (`https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY`) to fund your test wallet with fake XLM.

---

## 2. Testing & Deployment

### Smart Contracts
The smart contracts are written in Rust under the `/contract` directory.
To run the full suite of Rust tests (11 tests in total):
```bash
cd contract
cargo test
```

To build the WASM binaries:
```bash
stellar contract build
```

### Frontend
To run the frontend Jest tests:
```bash
npm test
```

### Deployment
If you need to deploy the contracts to the Testnet yourself, refer to the step-by-step instructions in [`contract/README.md`](contract/README.md).

---

## 3. Pull Request Flow

1. **Fork** the repository to your own GitHub account.
2. **Clone** the project to your machine.
3. **Create a branch** for your feature or bug fix: `git checkout -b feature/my-awesome-feature`
4. **Commit** your changes with clear, descriptive messages.
5. **Push** your branch to your fork: `git push origin feature/my-awesome-feature`
6. **Open a Pull Request** against the `main` branch of the original repository.

> [!IMPORTANT]  
> All PRs must pass the GitHub Actions CI pipeline, which automatically runs `cargo test` and `npm test`. Make sure all tests pass locally before submitting!

---

## 4. Contract API Reference

This project consists of two cooperating Soroban smart contracts. Below is the API documentation for each method.

### 💰 StellarFund (`fund`)
The primary crowdfunding contract that accepts XLM and tracks campaign progress.

#### Write Methods
* `__constructor(env: Env, owner: Address, token: Address, goal: i128)`
  Initializes the campaign.
* `donate(env: Env, from: Address, amount: i128) -> Result<i128, Error>`
  Pulls `amount` of the campaign token (XLM) from the donor into the contract. Updates tracking and calls the badge contract.
  *Requires `from` authorization.*
* `set_badge(env: Env, badge: Address)`
  Registers the companion DonorBadge contract address.
  *Requires `owner` authorization.*
* `withdraw(env: Env) -> Result<i128, Error>`
  Withdraws all collected funds to the beneficiary. 
  *Requires `owner` authorization.*

#### Read-Only Views
* `goal(env: Env) -> i128`: Returns the fundraising target.
* `raised(env: Env) -> i128`: Returns the total amount raised so far.
* `donors(env: Env) -> u32`: Returns the count of unique donors.
* `is_closed(env: Env) -> bool`: Returns true if the goal has been reached.
* `contribution(env: Env, who: Address) -> i128`: Returns the running total for a specific donor.
* `owner(env: Env) -> Address`: Returns the beneficiary address.
* `token(env: Env) -> Address`: Returns the SAC token address being collected.
* `badge(env: Env) -> Option<Address>`: Returns the registered badge contract address, if any.

#### Errors
* `ZeroAmount` (1): Donation amount must be greater than zero.
* `CampaignClosed` (2): Goal already reached, donations are closed.
* `NothingRaised` (3): Withdrawal attempted but balance is empty.

---

### 🪪 DonorBadge (`badge`)
The companion contract that assigns loyalty tiers based on cumulative contributions.

#### Write Methods
* `__constructor(env: Env, admin: Address)`
  Initializes the contract. `admin` is the address of the StellarFund contract.
* `award(env: Env, donor: Address, total: i128) -> u32`
  Calculates and assigns a badge tier based on the total contribution.
  *Requires `admin` authorization (StellarFund).* Returns the new tier.

#### Read-Only Views
* `tier(env: Env, who: Address) -> u32`: Returns the current tier for the address (1=Bronze, 2=Silver, 3=Gold, 0=None).
* `minted(env: Env) -> u32`: Returns the total number of unique donors holding a badge.
* `admin(env: Env) -> Address`: Returns the authorized fund contract address.

#### Errors
* `NotInitialized` (1): Contract admin not set.
