#![no_std]
//! StellarFund — a minimal on-chain crowdfunding campaign.
//!
//! Donors send a Stellar asset (the native XLM SAC on testnet) into the
//! contract. The contract records the cumulative amount raised, the number of
//! unique donors, and each donor's running total. The campaign beneficiary
//! (`owner`) can withdraw the collected funds at any time.
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,                  // beneficiary who can withdraw
    Token,                  // SAC address of the asset being collected
    Goal,                   // fundraising target (in stroops)
    Raised,                 // cumulative amount raised (monotonic, for progress)
    Donors,                 // count of unique donors
    Closed,                 // true once the goal has been reached
    Contribution(Address),  // per-donor running total
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    ZeroAmount = 1,      // donation amount must be positive
    CampaignClosed = 2,  // goal already reached, no more donations
    NothingRaised = 3,   // withdraw called with an empty balance
}

/// Emitted on every successful donation.
#[contractevent]
#[derive(Clone)]
pub struct Donated {
    #[topic]
    pub from: Address,
    pub amount: i128,
    pub total: i128,
}

/// Emitted when the beneficiary withdraws collected funds.
#[contractevent]
#[derive(Clone)]
pub struct Withdrawn {
    #[topic]
    pub owner: Address,
    pub amount: i128,
}

#[contract]
pub struct FundContract;

#[contractimpl]
impl FundContract {
    /// Initialize the campaign at deploy time.
    pub fn __constructor(env: Env, owner: Address, token: Address, goal: i128) {
        let s = env.storage().instance();
        s.set(&DataKey::Owner, &owner);
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::Goal, &goal);
        s.set(&DataKey::Raised, &0i128);
        s.set(&DataKey::Donors, &0u32);
        s.set(&DataKey::Closed, &false);
    }

    /// Donate `amount` of the campaign token. Pulls funds from `from` into the
    /// contract, so `from` must authorize the call. Returns the new total raised.
    pub fn donate(env: Env, from: Address, amount: i128) -> Result<i128, Error> {
        from.require_auth();

        if amount <= 0 {
            return Err(Error::ZeroAmount);
        }

        let s = env.storage().instance();
        let closed: bool = s.get(&DataKey::Closed).unwrap();
        if closed {
            return Err(Error::CampaignClosed);
        }

        // Move the asset from the donor into the contract.
        let token: Address = s.get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).transfer(
            &from,
            &env.current_contract_address(),
            &amount,
        );

        // Update cumulative total.
        let mut raised: i128 = s.get(&DataKey::Raised).unwrap();
        raised += amount;
        s.set(&DataKey::Raised, &raised);

        // Track per-donor contribution and unique-donor count.
        let key = DataKey::Contribution(from.clone());
        let prev: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        if prev == 0 {
            let donors: u32 = s.get(&DataKey::Donors).unwrap();
            s.set(&DataKey::Donors, &(donors + 1));
        }
        env.storage().persistent().set(&key, &(prev + amount));

        // Close the campaign once the goal is met.
        let goal: i128 = s.get(&DataKey::Goal).unwrap();
        if raised >= goal {
            s.set(&DataKey::Closed, &true);
        }

        Donated { from, amount, total: raised }.publish(&env);
        Ok(raised)
    }

    /// Withdraw all collected funds to the beneficiary. Only the owner can call.
    pub fn withdraw(env: Env) -> Result<i128, Error> {
        let s = env.storage().instance();
        let owner: Address = s.get(&DataKey::Owner).unwrap();
        owner.require_auth();

        let token: Address = s.get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        let balance = client.balance(&env.current_contract_address());
        if balance <= 0 {
            return Err(Error::NothingRaised);
        }

        client.transfer(&env.current_contract_address(), &owner, &balance);
        Withdrawn { owner, amount: balance }.publish(&env);
        Ok(balance)
    }

    // ── read-only views ──
    pub fn goal(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Goal).unwrap()
    }
    pub fn raised(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Raised).unwrap()
    }
    pub fn donors(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Donors).unwrap()
    }
    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }
    pub fn token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }
    pub fn is_closed(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Closed).unwrap()
    }
    pub fn contribution(env: Env, who: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(who))
            .unwrap_or(0)
    }
}

mod test;
