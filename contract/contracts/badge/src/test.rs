#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup<'a>() -> (Env, Address, BadgeContractClient<'a>) {
    let env = Env::default();
    env.mock_all_auths();

    // In production `admin` is the StellarFund contract address; for unit tests
    // any address works because we mock the cross-contract authorization.
    let admin = Address::generate(&env);
    let contract_id = env.register(BadgeContract, (admin.clone(),));
    let client = BadgeContractClient::new(&env, &contract_id);

    (env, admin, client)
}

#[test]
fn starts_empty() {
    let (env, _admin, client) = setup();
    let who = Address::generate(&env);
    assert_eq!(client.minted(), 0);
    assert_eq!(client.tier(&who), 0);
}

#[test]
fn awards_bronze_then_upgrades() {
    let (env, _admin, client) = setup();
    let donor = Address::generate(&env);

    // 1 XLM → Bronze (tier 1)
    assert_eq!(client.award(&donor, &10_000_000), 1);
    assert_eq!(client.tier(&donor), 1);
    assert_eq!(client.minted(), 1);

    // 10 XLM cumulative → Silver (tier 2), still one unique donor
    assert_eq!(client.award(&donor, &100_000_000), 2);
    assert_eq!(client.tier(&donor), 2);
    assert_eq!(client.minted(), 1);

    // 100 XLM cumulative → Gold (tier 3)
    assert_eq!(client.award(&donor, &1_000_000_000), 3);
    assert_eq!(client.tier(&donor), 3);
}

#[test]
fn tier_never_downgrades() {
    let (env, _admin, client) = setup();
    let donor = Address::generate(&env);

    client.award(&donor, &1_000_000_000); // Gold
    assert_eq!(client.tier(&donor), 3);

    // A smaller total should not strip the donor of their earned tier.
    assert_eq!(client.award(&donor, &10_000_000), 3);
    assert_eq!(client.tier(&donor), 3);
}

#[test]
fn below_threshold_earns_nothing() {
    let (env, _admin, client) = setup();
    let donor = Address::generate(&env);

    // Under 1 XLM → no badge.
    assert_eq!(client.award(&donor, &5_000_000), 0);
    assert_eq!(client.tier(&donor), 0);
    assert_eq!(client.minted(), 0);
}

#[test]
fn counts_unique_donors() {
    let (env, _admin, client) = setup();
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    client.award(&a, &10_000_000);
    client.award(&b, &100_000_000);
    assert_eq!(client.minted(), 2);
    assert_eq!(client.admin(), client.admin()); // admin view is readable
}

#[test]
#[should_panic(expected = "HostError")]
fn unauthorized_award_fails() {
    let env = Env::default();
    
    let admin = Address::generate(&env);
    let contract_id = env.register(BadgeContract, (admin.clone(),));
    let client = BadgeContractClient::new(&env, &contract_id);
    
    let donor = Address::generate(&env);
    
    client.award(&donor, &1_000_000_000);
}
