#[allow(duplicate_alias,unused_field,unused_use,unused_variable,unused_const)]

module rift_token::token_launchpad {
    use std::option;
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use std::vector;
    use rift_token::rift_token::{Self, RIFT_TOKEN, LiquidityPool};
    use sui::clock::{Self, Clock};

    // ======== Structs ========

    /// Main struct for a created token
    public struct AIToken has drop {}

    /// Capability for token creator
    public struct CreatorCap has key, store {
        id: UID,
        token_address: address
    }

    /// Main pool that holds all created tokens
    public struct TokenPool has key {
        id: UID,
        tokens: vector<TokenInfo>,
        sui_balance: Balance<SUI>,
        rift_balance: Balance<RIFT_TOKEN>
    }

    /// Information about each token
    public struct TokenInfo has store {
        name: String,
        symbol: String,
        description: String,
        image_url: Url,
        agent_prompt: String,
        treasury_cap: TreasuryCap<AIToken>,
        pool_balance: Balance<AIToken>,
        price_history: vector<u64>,
        last_price: u64,
        total_supply: u64
    }

    /// Staking pool for each token
    public struct TokenStakePool has key {
        id: UID,
        token_address: address,
        total_staked: Balance<AIToken>,
        rewards_per_hour: u64,
        last_update_time: u64
    }

    /// User's stake position
    public struct StakePosition has key, store {
        id: UID,
        token_address: address,
        amount: Balance<AIToken>,
        last_claim_time: u64,
        owner: address
    }

    // ======== Events ========

    public struct TokenCreatedEvent has copy, drop {
        creator: address,
        name: String,
        symbol: String,
        initial_supply: u64
    }

    public struct TokenSwapEvent has copy, drop {
        token_in_symbol: String,
        token_out_symbol: String,
        amount_in: u64,
        amount_out: u64
    }

    public struct BattleEvent has copy, drop {
        token1_symbol: String,
        token2_symbol: String,
        bet_token_symbol: String,
        bet_amount: u64,
        winner_symbol: String
    }

    public struct TokenBuyEvent has copy, drop {
        buyer: address,
        token_symbol: String,
        amount: u64,
        sui_amount: u64
    }

    public struct RewardClaimEvent has copy, drop {
        staker: address,
        token_address: address,
        reward_amount: u64
    }

    // ======== Constants ========

    const INITIAL_SUPPLY: u64 = 1_000_000_000; // 1 billion
    const CREATOR_ALLOCATION: u64 = 20_000_000; // 2%
    const POOL_ALLOCATION: u64 = 980_000_000; // 98%
    const INITIAL_PRICE: u64 = 1_000_000; // 0.001 SUI
    const DECIMALS: u8 = 9;
    const REWARD_CLAIM_INTERVAL: u64 = 14400000; // 4 hours in milliseconds
    const DAILY_REWARDS_RATE: u64 = 1_000_000; // Rewards per day per staked token
    const RIFT_TO_TOKEN_RATIO: u64 = 100; // 1 RIFT = 100 AI tokens
    const TOKEN_TO_RIFT_RATIO: u64 = 100; // 100 AI tokens = 1 RIFT
    const HOURS_TO_EPOCHS: u64 = 3600; // 1 hour in epochs
    const MIN_CLAIM_HOURS: u64 = 4; // 4 hours

    // ======== Error codes ========
    const ERR_INSUFFICIENT_BALANCE: u64 = 0;
    const ERR_INVALID_TOKEN: u64 = 1;
    const ERR_INSUFFICIENT_POOL_BALANCE: u64 = 2;
    const ERR_MIN_CLAIM_TIME: u64 = 3;
    const ERR_INVALID_SWAP: u64 = 4;
    const ERR_INVALID_BET: u64 = 5;

    // ======== Core Functions ========

    fun init(ctx: &mut TxContext) {
        // Create main token pool
        let token_pool = TokenPool {
            id: object::new(ctx),
            tokens: vector::empty(),
            sui_balance: balance::zero(),
            rift_balance: balance::zero()
        };

        transfer::share_object(token_pool);
    }

    // Create new AI token
    public entry fun create_token(
        pool: &mut TokenPool,
        name: vector<u8>,
        symbol: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        agent_prompt: vector<u8>,
        ctx: &mut TxContext
    ) {
        let (mut treasury_cap, metadata) = coin::create_currency(
            AIToken {},
            DECIMALS,
            symbol,
            name,
            description,
            option::some(url::new_unsafe_from_bytes(image_url)),
            ctx
        );

        // Mint initial supply first
        let creator_coins = coin::mint(&mut treasury_cap, CREATOR_ALLOCATION, ctx);
        let pool_coins = coin::mint(&mut treasury_cap, POOL_ALLOCATION, ctx);
        let pool_balance = coin::into_balance(pool_coins);

        let token_info = TokenInfo {
            name: string::utf8(name),
            symbol: string::utf8(symbol),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            agent_prompt: string::utf8(agent_prompt),
            treasury_cap,
            pool_balance,
            price_history: vector::empty(),
            last_price: INITIAL_PRICE,
            total_supply: INITIAL_SUPPLY
        };

        // Transfer creator allocation
        transfer::public_transfer(creator_coins, tx_context::sender(ctx));

        // Create stake pool for token
        let stake_pool = TokenStakePool {
            id: object::new(ctx),
            token_address: tx_context::sender(ctx),
            total_staked: balance::zero(),
            rewards_per_hour: DAILY_REWARDS_RATE / 24,
            last_update_time: 0
        };

        // Add token info to pool
        vector::push_back(&mut pool.tokens, token_info);

        // Create creator capability
        let creator_cap = CreatorCap {
            id: object::new(ctx),
            token_address: tx_context::sender(ctx)
        };

        // Transfer objects
        transfer::public_freeze_object(metadata);
        transfer::share_object(stake_pool);
        transfer::public_transfer(creator_cap, tx_context::sender(ctx));

        // Emit event
        event::emit(TokenCreatedEvent {
            creator: tx_context::sender(ctx),
            name: string::utf8(name),
            symbol: string::utf8(symbol),
            initial_supply: INITIAL_SUPPLY
        });
    }

    // Find token index by symbol
    fun find_token_index(tokens: &vector<TokenInfo>, symbol: &String): u64 {
        let len = vector::length(tokens);
        let mut i = 0;
        while (i < len) {
            let token = vector::borrow(tokens, i);
            if (token.symbol == *symbol) {
                return i
            };
            i = i + 1;
        };
        abort ERR_INVALID_TOKEN
    }

    // Buy token with SUI
    public entry fun buy_token(
        pool: &mut TokenPool,
        token_symbol: vector<u8>,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&pool.tokens);
        let mut i = 0;
        while (i < len) {
            let token = vector::borrow(&pool.tokens, i);
            if (string::utf8(token_symbol) == token.symbol) {
                break
            };
            i = i + 1;
        };
        assert!(i < len, ERR_INVALID_TOKEN);

        let token = vector::borrow_mut(&mut pool.tokens, i);
        // Calculate SUI needed
        let sui_needed = (amount * token.last_price) / 1_000_000_000;
        assert!(coin::value(payment) >= sui_needed, ERR_INSUFFICIENT_BALANCE);

        // Transfer SUI to pool
        let sui_payment = coin::split(payment, sui_needed, ctx);
        transfer::public_transfer(sui_payment, tx_context::sender(ctx));

        // Transfer tokens to buyer
        let token_coins = coin::from_balance(balance::split(&mut token.pool_balance, amount), ctx);
        transfer::public_transfer(token_coins, tx_context::sender(ctx));

        // Emit buy event
        event::emit(TokenBuyEvent {
            buyer: tx_context::sender(ctx),
            token_symbol: token.symbol,
            amount,
            sui_amount: sui_needed
        });
    }

    // Swap tokens
    public entry fun swap_tokens(
        pool: &mut TokenPool,
        token_in_symbol: vector<u8>,
        token_out_symbol: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let token_in_str = string::utf8(token_in_symbol);
        let token_out_str = string::utf8(token_out_symbol);
        
        let i = find_token_index(&pool.tokens, &token_in_str);
        let j = find_token_index(&pool.tokens, &token_out_str);

        let is_rift_in = token_in_str == string::utf8(b"RIFT");
        let is_rift_out = token_out_str == string::utf8(b"RIFT");

        // Calculate swap amount
        let out_amount = if (is_rift_in) {
            amount * RIFT_TO_TOKEN_RATIO
        } else if (is_rift_out) {
            amount / TOKEN_TO_RIFT_RATIO
        } else {
            amount
        };

        // Get tokens and perform swap
        {
            let token_out = vector::borrow_mut(&mut pool.tokens, j);
            assert!(balance::value(&token_out.pool_balance) >= out_amount, ERR_INSUFFICIENT_POOL_BALANCE);

            // Transfer tokens
            let token_out_coins = coin::from_balance(balance::split(&mut token_out.pool_balance, out_amount), ctx);
            transfer::public_transfer(token_out_coins, tx_context::sender(ctx));
        };

        // Get token info for event emission (after previous borrow is dropped)
        let token_in = vector::borrow(&pool.tokens, i);
        let token_out = vector::borrow(&pool.tokens, j);

        // Emit swap event
        event::emit(TokenSwapEvent {
            token_in_symbol: token_in.symbol,
            token_out_symbol: token_out.symbol,
            amount_in: amount,
            amount_out: out_amount
        });
    }

    // Battle between agents using either agent tokens or RIFT tokens
    public entry fun battle(
        pool: &mut TokenPool,
        rift_pool: &mut LiquidityPool,
        token1_symbol: vector<u8>,     // First agent
        token2_symbol: vector<u8>,     // Second agent
        bet_token_symbol: vector<u8>,  // Token used for betting (can be RIFT or either agent token)
        bet_amount: u64,
        bet_on_symbol: vector<u8>,     // Which agent user is betting on
        ctx: &mut TxContext
    ) {
        let token1_str = string::utf8(token1_symbol);
        let token2_str = string::utf8(token2_symbol);
        let bet_token_str = string::utf8(bet_token_symbol);
        let bet_on_str = string::utf8(bet_on_symbol);
        
        // Verify betting on one of the fighting agents
        assert!(bet_on_str == token1_str || bet_on_str == token2_str, ERR_INVALID_BET);

        // Check if betting with RIFT tokens
        if (bet_token_str == string::utf8(b"RIFT")) {
            // Handle RIFT token betting
            if (bet_on_str == token1_str) {
                if (agent_battle(token1_str, token2_str)) { // Agent 1 wins
                    // Winner gets 2x RIFT tokens
                    let reward_coins = rift_token::mint_battle_reward(rift_pool, bet_amount * 2, ctx);
                    transfer::public_transfer(reward_coins, tx_context::sender(ctx));
                } else { // Agent 1 loses
                    // Burn 50% of RIFT tokens
                    rift_token::burn_battle_loss(rift_pool, bet_amount, ctx);
                }
            } else { // Betting on Agent 2
                if (!agent_battle(token1_str, token2_str)) { // Agent 2 wins
                    // Winner gets 2x RIFT tokens
                    let reward_coins = rift_token::mint_battle_reward(rift_pool, bet_amount * 2, ctx);
                    transfer::public_transfer(reward_coins, tx_context::sender(ctx));
                } else { // Agent 2 loses
                    // Burn 50% of RIFT tokens
                    rift_token::burn_battle_loss(rift_pool, bet_amount, ctx);
                }
            }
        } else {
            // Betting with agent tokens
            let i = find_token_index(&pool.tokens, &bet_token_str);
            let token = vector::borrow_mut(&mut pool.tokens, i);

            if (bet_on_str == bet_token_str) { // Betting on own agent
                if ((bet_token_str == token1_str && agent_battle(token1_str, token2_str)) || 
                    (bet_token_str == token2_str && !agent_battle(token1_str, token2_str))) {
                    // Winner gets 2x agent tokens
                    let reward_coins = coin::from_balance<AIToken>(
                        balance::split(&mut token.pool_balance, bet_amount * 2),
                        ctx
                    );
                    transfer::public_transfer(reward_coins, tx_context::sender(ctx));
                } else {
                    // Burn 50% of agent tokens
                    let burn_amount = bet_amount / 2;
                    coin::burn(
                        &mut token.treasury_cap,
                        coin::from_balance<AIToken>(
                            balance::split(&mut token.pool_balance, burn_amount),
                            ctx
                        )
                    );
                }
            }
        };

        // Emit battle event
        event::emit(BattleEvent {
            token1_symbol: token1_str,
            token2_symbol: token2_str,
            bet_token_symbol: bet_token_str,
            bet_amount,
            winner_symbol: if (agent_battle(token1_str, token2_str)) { token1_str } else { token2_str }
        });
    }

    // Helper function to determine battle winner
    fun agent_battle(agent1: String, agent2: String): bool {
        // TODO: Implement actual battle logic using agent prompts
        // For now, returning dummy value
        true
    }

    // Stake tokens
    public entry fun stake_tokens(
        pool: &mut TokenStakePool,
        token_coins: Coin<AIToken>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&token_coins);
        
        let stake_position = StakePosition {
            id: object::new(ctx),
            token_address: pool.token_address,
            amount: coin::into_balance(token_coins),
            last_claim_time: clock::timestamp_ms(clock),
            owner: tx_context::sender(ctx)
        };

        balance::join(&mut pool.total_staked, balance::zero());
        transfer::public_transfer(stake_position, tx_context::sender(ctx));
    }

    // Claim staking rewards
    public entry fun claim_rewards(
        pool: &mut TokenPool,
        stake_pool: &mut TokenStakePool,
        position: &mut StakePosition,
        ctx: &mut TxContext
    ) {
        // Calculate rewards
        let current_time = tx_context::epoch(ctx);
        let hours_elapsed = (current_time - position.last_claim_time) / HOURS_TO_EPOCHS;
        assert!(hours_elapsed >= MIN_CLAIM_HOURS, ERR_MIN_CLAIM_TIME);

        let reward_amount = (balance::value(&position.amount) * stake_pool.rewards_per_hour * hours_elapsed);

        // Find token in pool
        let len = vector::length(&pool.tokens);
        let mut i = 0;
        while (i < len) {
            let token = vector::borrow(&pool.tokens, i);
            if (position.token_address == stake_pool.token_address) {
                break
            };
            i = i + 1;
        };
        assert!(i < len, ERR_INVALID_TOKEN);

        let token = vector::borrow_mut(&mut pool.tokens, i);
        // Mint rewards
        let reward_coins = coin::mint(&mut token.treasury_cap, reward_amount, ctx);
        transfer::public_transfer(reward_coins, position.owner);

        // Update last claim time
        position.last_claim_time = current_time;

        // Emit reward claim event
        event::emit(RewardClaimEvent {
            staker: position.owner,
            token_address: position.token_address,
            reward_amount
        });
    }
}
