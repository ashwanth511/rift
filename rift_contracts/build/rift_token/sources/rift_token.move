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
        amount: u64,
        game_type: u8  // 1: CyberBattle, 2: MemoryGame, 3: TicTacToe
    }

    public struct GameResultEvent has copy, drop {
        player: address,
        timestamp: u64
    }

    // Error codes
    const ERR_INSUFFICIENT_BALANCE: u64 = 0;
    const ERR_UNAUTHORIZED_GAME: u64 = 1;
    const ERR_TOO_EARLY_TO_CLAIM: u64 = 2;
    const ERR_INVALID_BET_AMOUNT: u64 = 3;
    const ERR_INSUFFICIENT_POOL_BALANCE: u64 = 4;
    const ERR_INVALID_GAME_TYPE: u64 = 5;

    // Constants
    // Total supply = 1 billion RIFT (with 9 decimals)
    const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000_000; // 1 billion RIFT
    const CREATOR_ALLOCATION: u64 = 20_000_000_000_000_000; // 2% of total supply (20 million RIFT)
    const POOL_ALLOCATION: u64 = 980_000_000_000_000_000; // 98% of total supply (980 million RIFT)
    const DECIMALS: u8 = 9;
    const DAILY_REWARDS_RATE: u64 = 1_000_000; // 1 RIFT per day per staked token
    const MIN_STAKE_DURATION: u64 = 86400; // 24 hours in seconds
    const RIFT_PRICE_IN_SUI: u64 = 10_000_000; // 0.01 SUI per RIFT
    const MIN_BET_AMOUNT: u64 = 100_000_000; // 0.1 RIFT
    const BURN_PERCENTAGE: u64 = 50; // 50% burn on loss
    const LIQUIDITY_PERCENTAGE: u64 = 50; // 50% to liquidity on loss
    const REWARD_MULTIPLIER: u64 = 2; // 2x reward on win

    // Game types
    const GAME_CYBER_BATTLE: u8 = 1;
    const GAME_MEMORY: u8 = 2;
    const GAME_TIC_TAC_TOE: u8 = 3;

    fun init(witness: RIFT_TOKEN, ctx: &mut TxContext) {
        // Create the Rift coin with metadata and image
        let (mut treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"RIFT",
            b"Rift Token",
            b"The native token of the Rift ecosystem - A revolutionary gaming and DeFi token",
            option::some(url::new_unsafe_from_bytes(b"https://blue-static-marlin-360.mypinata.cloud/ipfs/bafkreics5rhqqtgtnyquvqx2j2wxks2wyiszsxmgdrll3u6ujndoldlg3y")), // Replace with actual token image URL
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
        liquidity_pool: &mut LiquidityPool,
        rift_coins: Coin<RIFT_TOKEN>,
        game_type: u8,
        ctx: &mut TxContext
    ) {
        // Verify game type is valid
        assert!(
            game_type == GAME_CYBER_BATTLE || 
            game_type == GAME_MEMORY || 
            game_type == GAME_TIC_TAC_TOE,
            ERR_INVALID_GAME_TYPE
        );

        let amount = coin::value(&rift_coins);
        assert!(amount >= MIN_BET_AMOUNT, ERR_INVALID_BET_AMOUNT);

        // Transfer bet amount to pool
        balance::join(&mut pool.pool_balance, coin::into_balance(rift_coins));

        // Emit bet placed event
        event::emit(BetPlacedEvent {
            player: tx_context::sender(ctx),
            amount,
            game_type
        });
    }

    // Handle game result and distribute rewards/burns
    public entry fun handle_game_result(
        pool: &mut BettingPool,
        _liquidity_pool: &mut LiquidityPool,
        treasury_cap: &mut TreasuryCap<RIFT_TOKEN>,
        player: address,
        amount: u64,
        won: bool,
        ctx: &mut TxContext
    ) {
        let reward_amount = if (won) { amount * REWARD_MULTIPLIER } else { 0 };
        let burned_amount = if (!won) { (amount * BURN_PERCENTAGE) / 100 } else { 0 };
        let liquidity_amount = if (!won) { (amount * LIQUIDITY_PERCENTAGE) / 100 } else { 0 };

        if (won) {
            let reward_coins = coin::from_balance(
                balance::split(&mut pool.pool_balance, reward_amount),
                ctx
            );
            transfer::public_transfer(reward_coins, player);
        } else {
            let burn_coins = coin::from_balance(
                balance::split(&mut pool.pool_balance, burned_amount),
                ctx
            );
            coin::burn<RIFT_TOKEN>(treasury_cap, burn_coins);

            let liquidity_coins = coin::from_balance(
                balance::split(&mut pool.pool_balance, liquidity_amount),
                ctx
            );
            balance::join(&mut _liquidity_pool.pool_balance, coin::into_balance(liquidity_coins));
        };

        let game_event = GameResultEvent {
            player,
            timestamp: tx_context::epoch(ctx)
        };
        event::emit(game_event);
    }
}