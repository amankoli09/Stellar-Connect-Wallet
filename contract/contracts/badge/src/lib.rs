#![no_std]
//! DonorBadge — a companion contract to StellarFund.
//!
//! StellarFund calls [`BadgeContract::award`] on every successful donation.
//! This contract assigns each donor a loyalty **tier** derived from their
//! cumulative contribution (Bronze / Silver / Gold) and tracks how many unique
//! donors have minted a badge. Only the registered fund contract is allowed to
//! call `award` — this is the trust boundary for the cross-contract call.
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,          // the StellarFund contract authorized to call `award`
    Tier(Address),  // current badge tier per donor (1=Bronze, 2=Silver, 3=Gold)
    Minted,         // count of unique donors who have earned a badge
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
}

/// Emitted whenever a donor's tier increases.
#[contractevent]
#[derive(Clone)]
pub struct BadgeAwarded {
    #[topic]
    pub donor: Address,
    pub tier: u32,
    pub total: i128,
}

#[contract]
pub struct BadgeContract;

// Tier thresholds, in stroops (1 XLM = 10_000_000 stroops).
const BRONZE: i128 = 10_000_000; //   ≥ 1 XLM
const SILVER: i128 = 100_000_000; //  ≥ 10 XLM
const GOLD: i128 = 1_000_000_000; //  ≥ 100 XLM

/// Map a cumulative contribution to a tier number (0 = none).
fn tier_for(total: i128) -> u32 {
    if total >= GOLD {
        3
    } else if total >= SILVER {
        2
    } else if total >= BRONZE {
        1
    } else {
        0
    }
}

#[contractimpl]
impl BadgeContract {
    /// Register the StellarFund contract that is permitted to award badges.
    pub fn __constructor(env: Env, admin: Address) {
        let s = env.storage().instance();
        s.set(&DataKey::Admin, &admin);
        s.set(&DataKey::Minted, &0u32);
    }

    /// Award (or upgrade) a donor's badge based on their cumulative `total`.
    ///
    /// Called cross-contract by StellarFund after each donation. The fund
    /// contract's own address must authorize the call (`require_auth`), which
    /// Soroban satisfies automatically for the contract making the invocation —
    /// so no external party can forge badges. Returns the donor's current tier.
    pub fn award(env: Env, donor: Address, total: i128) -> u32 {
        let s = env.storage().instance();
        let admin: Address = s.get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let new_tier = tier_for(total);
        let key = DataKey::Tier(donor.clone());
        let prev: u32 = env.storage().persistent().get(&key).unwrap_or(0);

        if new_tier > prev {
            if prev == 0 {
                let minted: u32 = s.get(&DataKey::Minted).unwrap();
                s.set(&DataKey::Minted, &(minted + 1));
            }
            env.storage().persistent().set(&key, &new_tier);
            BadgeAwarded {
                donor,
                tier: new_tier,
                total,
            }
            .publish(&env);
            new_tier
        } else {
            // Tiers never downgrade — return the donor's existing tier.
            prev
        }
    }

    // ── read-only views ──
    /// The current tier for `who` (0 if they have never donated).
    pub fn tier(env: Env, who: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Tier(who))
            .unwrap_or(0)
    }
    /// Total number of unique donors that have earned a badge.
    pub fn minted(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Minted).unwrap()
    }
    /// The fund contract authorized to award badges.
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

mod test;
