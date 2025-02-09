#[allow(duplicate_alias,unused_field)]

module rift_token::rift_token {
    use std::option;
    use sui::url;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;

    /// The type identifier of Rift coin
    public struct RIFT_TOKEN has drop {}

    /// Capability that grants permission to mint and burn Rift tokens
    public struct AdminCap has key, store { 
        id: UID 
    }

    /// Main liquidity pool for Rift tokens
    public struct LiquidityPool has key, store {
        id: UID,
        pool_balance: Balance<RIFT_TOKEN>,
        sui_balance: Balance<SUI>,
        treasury_cap: TreasuryCap<RIFT_TOKEN>
    }

    /// Staking pool for Rift tokens
    public struct StakingPool has key, store {
        id: UID,
        total_staked: Balance<RIFT_TOKEN>,
        rewards_per_day: u64,
        last_reward_time: u64
    }

    /// Staking position for a user
    public struct StakePosition has key, store {
        id: UID,
        amount: Balance<RIFT_TOKEN>,
        last_claim_time: u64,
        owner: address
    }

    /// Betting pool for games
    public struct BettingPool has key, store {
        id: UID,
        pool_balance: Balance<RIFT_TOKEN>,
        burn_address: address
    }

    /// Game registry to track authorized games
    public struct GameRegistry has key, store {
        id: UID,
        authorized_games: vector<address>
    }

    // Events
    public struct StakeEvent has copy, drop {
        staker: address,
        amount: u64
    }

    public struct UnstakeEvent has copy, drop {
        staker: address,
        amount: u64
    }

    public struct RewardClaimEvent has copy, drop {
        staker: address,
        amount: u64
    }

    public struct BetPlacedEvent has copy, drop {
        player: address,
        amount: u64
    }

    // Error codes
    const ERR_INSUFFICIENT_BALANCE: u64 = 0;
    const ERR_UNAUTHORIZED_GAME: u64 = 1;
    const ERR_TOO_EARLY_TO_CLAIM: u64 = 2;
    const ERR_INVALID_BET_AMOUNT: u64 = 3;
    const ERR_INSUFFICIENT_POOL_BALANCE: u64 = 4;

    // Constants
    const CREATOR_ALLOCATION: u64 = 20_000_000_000; // 2% of total supply
    const POOL_ALLOCATION: u64 = 980_000_000_000; // 98% of total supply
    const DECIMALS: u8 = 9;
    const DAILY_REWARDS_RATE: u64 = 1_000_000; // 1 RIFT per day per staked token
    const MIN_STAKE_DURATION: u64 = 86400; // 24 hours in seconds
    const RIFT_PRICE_IN_SUI: u64 = 10_000_000; // 0.01 SUI per RIFT

    fun init(witness: RIFT_TOKEN, ctx: &mut TxContext) {
        // Create the Rift coin with metadata and image
        let (mut treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"RIFT",
            b"Rift Token",
            b"The native token of the Rift ecosystem - A revolutionary gaming and DeFi token",
            option::some(url::new_unsafe_from_bytes(b"https://rifttoken.com/logo.png")), // Replace with actual token image URL
            ctx
        );

        let creator = tx_context::sender(ctx);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        // Initial token distribution
        // Mint creator allocation (2%)
        let creator_coins = coin::mint(&mut treasury_cap, CREATOR_ALLOCATION, ctx);
        transfer::public_transfer(creator_coins, creator);

        // Mint pool allocation (98%)
        let pool_coins = coin::mint(&mut treasury_cap, POOL_ALLOCATION, ctx);
        let pool_balance = coin::into_balance(pool_coins);

        // Create liquidity pool with treasury cap
        let mut liquidity_pool = LiquidityPool {
            id: object::new(ctx),
            pool_balance: balance::zero(),
            sui_balance: balance::zero(),
            treasury_cap
        };

        // Add initial pool balance
        balance::join(&mut liquidity_pool.pool_balance, pool_balance);

        // Create staking pool
        let staking_pool = StakingPool {
            id: object::new(ctx),
            total_staked: balance::zero(),
            rewards_per_day: DAILY_REWARDS_RATE,
            last_reward_time: 0
        };

        // Create betting pool
        let betting_pool = BettingPool {
            id: object::new(ctx),
            pool_balance: balance::zero(),
            burn_address: creator
        };

        // Create game registry
        let game_registry = GameRegistry {
            id: object::new(ctx),
            authorized_games: vector::empty()
        };

        // Transfer the created objects
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(liquidity_pool);
        transfer::public_share_object(staking_pool);
        transfer::public_share_object(betting_pool);
        transfer::public_share_object(game_registry);
        transfer::public_transfer(admin_cap, creator);
    }

    // Function to register authorized games (admin only)
    public entry fun register_game(
        _admin_cap: &AdminCap,
        registry: &mut GameRegistry,
        game_address: address
    ) {
        vector::push_back(&mut registry.authorized_games, game_address);
    }

    // Buy Rift tokens with SUI
    public entry fun buy_rift(
        pool: &mut LiquidityPool,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Calculate SUI needed (0.01 SUI per RIFT)
        let sui_needed = (amount * RIFT_PRICE_IN_SUI) / 1_000_000_000;
        let sui_amount = coin::value(payment);
        assert!(sui_amount >= sui_needed, ERR_INSUFFICIENT_BALANCE);
        
        // Take payment in SUI
        let sui_payment = coin::split(payment, sui_needed, ctx);
        // Add SUI to pool's balance
        balance::join(&mut pool.sui_balance, coin::into_balance(sui_payment));
        
        // Transfer RIFT tokens from pool to buyer
        let rift_coins = coin::from_balance(balance::split(&mut pool.pool_balance, amount), ctx);
        transfer::public_transfer(rift_coins, tx_context::sender(ctx));
    }

    // Sell Rift tokens for SUI
    public entry fun sell_rift(
        pool: &mut LiquidityPool,
        rift_coins: Coin<RIFT_TOKEN>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&rift_coins);
        
        // Calculate SUI to return (0.01 SUI per RIFT)
        let sui_to_return = (amount * RIFT_PRICE_IN_SUI) / 1_000_000_000;
        
        // Verify pool has enough SUI
        assert!(balance::value(&pool.sui_balance) >= sui_to_return, ERR_INSUFFICIENT_POOL_BALANCE);

        // Transfer Rift tokens to pool
        balance::join(&mut pool.pool_balance, coin::into_balance(rift_coins));
        
        // Return SUI to seller from pool's balance
        let sui_payment = coin::from_balance(balance::split(&mut pool.sui_balance, sui_to_return), ctx);
        transfer::public_transfer(sui_payment, tx_context::sender(ctx));
    }

    // Stake Rift tokens
    public entry fun stake(
        pool: &mut StakingPool,
        rift_coins: Coin<RIFT_TOKEN>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&rift_coins);
        
        // Create stake position
        let stake_position = StakePosition {
            id: object::new(ctx),
            amount: coin::into_balance(rift_coins),
            last_claim_time: clock::timestamp_ms(clock),
            owner: tx_context::sender(ctx)
        };

        balance::join(&mut pool.total_staked, balance::zero());

        // Emit stake event
        event::emit(StakeEvent {
            staker: tx_context::sender(ctx),
            amount
        });

        transfer::public_transfer(stake_position, tx_context::sender(ctx));
    }

    // Claim staking rewards
    public entry fun claim_rewards(
        pool: &mut LiquidityPool,
        position: &mut StakePosition,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= position.last_claim_time + MIN_STAKE_DURATION, ERR_TOO_EARLY_TO_CLAIM);

        let time_elapsed = current_time - position.last_claim_time;
        let reward_amount = (balance::value(&position.amount) * DAILY_REWARDS_RATE * time_elapsed) / (24 * 60 * 60 * 1000);

        // Mint rewards from treasury
        let reward_coins = coin::mint(&mut pool.treasury_cap, reward_amount, ctx);
        transfer::public_transfer(reward_coins, position.owner);

        position.last_claim_time = current_time;

        // Emit reward claim event
        event::emit(RewardClaimEvent {
            staker: position.owner,
            amount: reward_amount
        });
    }

    // Place bet for games
    public entry fun place_bet(
        pool: &mut BettingPool,
        rift_coins: Coin<RIFT_TOKEN>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&rift_coins);
        assert!(amount > 0, ERR_INVALID_BET_AMOUNT);

        // Transfer bet amount to pool
        balance::join(&mut pool.pool_balance, coin::into_balance(rift_coins));

        // Emit bet placed event
        event::emit(BetPlacedEvent {
            player: tx_context::sender(ctx),
            amount
        });
    }

    // Process game result (called by authorized game contracts only)
    public entry fun process_game_result(
        registry: &GameRegistry,
        pool: &mut BettingPool,
        player: address,
        won: bool,
        bet_amount: u64,
        ctx: &mut TxContext
    ) {
        // Verify the caller is an authorized game
        let caller = tx_context::sender(ctx);
        assert!(vector::contains(&registry.authorized_games, &caller), ERR_UNAUTHORIZED_GAME);

        if (won) {
            // Player won - transfer winnings
            let winning_coins = coin::from_balance(balance::split(&mut pool.pool_balance, bet_amount * 2), ctx);
            transfer::public_transfer(winning_coins, player);
        } else {
            // Player lost - burn 50% and add 50% to pool
            let lost_amount = bet_amount / 2;
            let burn_coins = coin::from_balance(balance::split(&mut pool.pool_balance, lost_amount), ctx);
            transfer::public_transfer(burn_coins, pool.burn_address);
        }
    }

    // Helper functions for battle system
    public fun mint_battle_reward(
        pool: &mut LiquidityPool,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<RIFT_TOKEN> {
        coin::from_balance(balance::split(&mut pool.pool_balance, amount), ctx)
    }

    public fun burn_battle_loss(
        pool: &mut LiquidityPool,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let burn_amount = amount / 2;  // 50% burn
        coin::burn(
            &mut pool.treasury_cap,
            coin::from_balance(balance::split(&mut pool.pool_balance, burn_amount), ctx)
        );
    }
}
