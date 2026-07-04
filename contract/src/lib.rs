#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,
    Token,
    Goal,
    Raised,
}

#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {
    pub fn initialize(env: Env, owner: Address, token: Address, goal: i128) {
        assert!(!env.storage().instance().has(&DataKey::Owner), "Already initialized");
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Goal, &goal);
        env.storage().instance().set(&DataKey::Raised, &0i128);
    }

    pub fn donate(env: Env, donor: Address, amount: i128) {
        donor.require_auth();
        assert!(amount > 0, "Donation amount must be positive");
        
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer native tokens (XLM) from the donor to the contract address
        token_client.transfer(&donor, &env.current_contract_address(), &amount);
        
        let mut raised: i128 = env.storage().instance().get(&DataKey::Raised).unwrap_or(0);
        raised += amount;
        env.storage().instance().set(&DataKey::Raised, &raised);
        
        // Emit donation event
        let topics = (symbol_short!("donate"), donor.clone());
        env.events().publish(topics, (amount, raised));
    }

    pub fn withdraw(env: Env) {
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        owner.require_auth();

        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        let balance = token_client.balance(&env.current_contract_address());
        assert!(balance > 0, "No funds to withdraw");

        token_client.transfer(&env.current_contract_address(), &owner, &balance);
    }

    pub fn get_total_raised(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Raised).unwrap_or(0)
    }

    pub fn get_goal(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Goal).unwrap_or(0)
    }
}
