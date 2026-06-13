# StellarFund — Soroban crowdfunding contract

An on-chain crowdfunding campaign for the StellarFlow dApp. Donors send a
Stellar asset (the native XLM SAC on Testnet) into the contract; the contract
tracks the cumulative amount raised, the number of unique donors, and each
donor's running total. The beneficiary (`owner`) can withdraw collected funds.

## Deployment (Testnet)

| | |
|---|---|
| **Contract ID** | `CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI` |
| **Network** | Stellar Testnet |
| **Asset** | native XLM (SAC `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`) |
| **Goal** | 1,000 XLM (`10000000000` stroops) |
| **Explorer** | https://stellar.expert/explorer/testnet/contract/CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI |

## Interface

| Method | Kind | Description |
|---|---|---|
| `donate(from, amount)` | write | Pulls `amount` from `from` into the contract, records the donation, emits a `Donated` event. Returns the new total raised. |
| `withdraw()` | write | Owner-only. Transfers the contract balance to the beneficiary, emits `Withdrawn`. |
| `goal()` / `raised()` / `donors()` | read | Campaign progress. |
| `is_closed()` | read | `true` once the goal has been reached. |
| `contribution(who)` | read | A given address's running total. |
| `owner()` / `token()` | read | Campaign configuration. |

### Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `ZeroAmount` | Donation amount must be positive. |
| 2 | `CampaignClosed` | Goal already reached; donations rejected. |
| 3 | `NothingRaised` | `withdraw` called with an empty balance. |

## Develop

```bash
cargo test                 # run the unit test suite (5 tests)
stellar contract build     # build the optimized wasm

# Deploy (constructor: owner, token, goal-in-stroops)
stellar contract deploy --wasm target/wasm32v1-none/release/fund.wasm \
  --source <identity> --network testnet \
  -- --owner <G...> --token <native-SAC> --goal 10000000000
```
