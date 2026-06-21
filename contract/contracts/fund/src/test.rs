#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env};

fn create_token<'a>(e: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    let addr = sac.address();
    (addr.clone(), token::StellarAssetClient::new(e, &addr))
}

fn setup<'a>() -> (Env, Address, Address, Address, FundContractClient<'a>) {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let donor = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env, &admin);
    token_admin.mint(&donor, &1_000);

    let goal = 500i128;
    let contract_id = env.register(FundContract, (owner.clone(), token_addr.clone(), goal));
    let client = FundContractClient::new(&env, &contract_id);

    (env, owner, donor, token_addr, client)
}

#[test]
fn donate_updates_state() {
    let (_env, _owner, donor, _token, client) = setup();

    assert_eq!(client.goal(), 500);
    assert_eq!(client.raised(), 0);
    assert_eq!(client.donors(), 0);

    let total = client.donate(&donor, &200);
    assert_eq!(total, 200);
    assert_eq!(client.raised(), 200);
    assert_eq!(client.donors(), 1);
    assert_eq!(client.contribution(&donor), 200);

    // same donor again — total grows, unique count does not
    client.donate(&donor, &100);
    assert_eq!(client.raised(), 300);
    assert_eq!(client.donors(), 1);
    assert_eq!(client.contribution(&donor), 300);
}

#[test]
fn withdraw_transfers_to_owner() {
    let (env, owner, donor, token_addr, client) = setup();
    client.donate(&donor, &300);

    let token_client = token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&client.address), 300);

    let withdrawn = client.withdraw();
    assert_eq!(withdrawn, 300);
    assert_eq!(token_client.balance(&owner), 300);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn rejects_zero_amount() {
    let (_env, _owner, donor, _token, client) = setup();
    let res = client.try_donate(&donor, &0);
    assert_eq!(res, Err(Ok(Error::ZeroAmount)));
}

#[test]
fn closes_when_goal_reached() {
    let (_env, _owner, donor, _token, client) = setup();
    client.donate(&donor, &500); // hits goal exactly
    assert!(client.is_closed());

    // further donations are rejected
    let res = client.try_donate(&donor, &10);
    assert_eq!(res, Err(Ok(Error::CampaignClosed)));
}

#[test]
fn withdraw_empty_fails() {
    let (_env, _owner, _donor, _token, client) = setup();
    let res = client.try_withdraw();
    assert_eq!(res, Err(Ok(Error::NothingRaised)));
}

/// Inter-contract communication: a donation on the fund contract triggers a
/// cross-contract `award` call on the companion DonorBadge contract, which
/// assigns the donor a loyalty tier from their cumulative total.
#[test]
fn donation_awards_badge_cross_contract() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let donor = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env, &admin);
    // Fund the donor with enough for a Gold-tier (≥ 100 XLM) donation.
    token_admin.mint(&donor, &2_000_000_000);

    // High goal so a single donation doesn't close the campaign.
    let goal = 10_000_000_000i128;
    let fund_id = env.register(FundContract, (owner.clone(), token_addr.clone(), goal));
    let fund = FundContractClient::new(&env, &fund_id);

    // Deploy the badge contract with the fund contract as its authorized admin.
    let badge_id = env.register(badge::BadgeContract, (fund_id.clone(),));
    let badge = badge::BadgeContractClient::new(&env, &badge_id);

    // Owner registers the badge contract on the fund.
    fund.set_badge(&badge_id);
    assert_eq!(fund.badge(), Some(badge_id.clone()));

    // No badge before donating.
    assert_eq!(badge.tier(&donor), 0);
    assert_eq!(badge.minted(), 0);

    // Donate 100 XLM → fund calls badge.award(donor, 1_000_000_000) → Gold (3).
    fund.donate(&donor, &1_000_000_000);
    assert_eq!(badge.tier(&donor), 3);
    assert_eq!(badge.minted(), 1);
    assert_eq!(badge.admin(), fund_id);
}

#[test]
fn multiple_donors_tracked_correctly() {
    let (env, _owner, donor1, token_addr, client) = setup();
    
    let donor2 = Address::generate(&env);
    
    let token_admin = token::StellarAssetClient::new(&env, &token_addr);
    token_admin.mint(&donor2, &1_000);
    
    client.donate(&donor1, &100);
    assert_eq!(client.donors(), 1);
    assert_eq!(client.contribution(&donor1), 100);
    
    client.donate(&donor2, &200);
    assert_eq!(client.donors(), 2);
    assert_eq!(client.contribution(&donor2), 200);
    
    client.donate(&donor1, &50);
    assert_eq!(client.donors(), 2);
    assert_eq!(client.contribution(&donor1), 150);
    
    assert_eq!(client.raised(), 350);
}

#[test]
fn withdraw_after_closed_works() {
    let (env, owner, donor, token_addr, client) = setup();
    
    client.donate(&donor, &500);
    assert!(client.is_closed());
    
    let token_client = token::Client::new(&env, &token_addr);
    let withdrawn = client.withdraw();
    
    assert_eq!(withdrawn, 500);
    assert_eq!(token_client.balance(&owner), 500);
    assert_eq!(token_client.balance(&client.address), 0);
}
