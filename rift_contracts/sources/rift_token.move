#[allow(duplicate_alias,unused_field,unused_const,unused_variable)]

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
    use std::string;

    /// The type identifier of Rift coin
    public struct RIFT_TOKEN has drop {}

    /// Capability that grants permission to mint and burn Rift tokens
    public struct AdminCap has key, store { 
        id: UID 
    }

    /// Token metadata
    public struct TokenMetadata has key {
        id: UID,
        name: String,
        symbol: String,
        description: String,
        icon_url: String,
        decimals: u8
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
        last_reward_time: u64,
        reward_balance: Balance<RIFT_TOKEN>
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
        timestamp: u64
    }

    // Error codes
    const ERR_INSUFFICIENT_BALANCE: u64 = 0;
    const ERR_UNAUTHORIZED_GAME: u64 = 1;
    const ERR_TOO_EARLY_TO_CLAIM: u64 = 2;
    const ERR_INVALID_BET_AMOUNT: u64 = 3;
    const ERR_INSUFFICIENT_POOL_BALANCE: u64 = 4;

    // Constants
    const DECIMALS: u8 = 9;
    const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000_000; // 1 billion tokens
    const CREATOR_ALLOCATION: u64 = 20_000_000_000_000_000; // 2% of total supply
    const LIQUIDITY_POOL_ALLOCATION: u64 = 950_000_000_000_000_000; // 95% for liquidity
    const STAKING_POOL_ALLOCATION: u64 = 20_000_000_000_000_000; // 2% for staking rewards
    const BETTING_POOL_ALLOCATION: u64 = 10_000_000_000_000_000; // 1% for initial betting pool

    const DAILY_REWARDS_RATE: u64 = 1_000_000; // 1 RIFT per day per staked token
    const MIN_STAKE_DURATION: u64 = 86400; // 24 hours in seconds
    const RIFT_PRICE_IN_SUI: u64 = 10_000_000; // 0.01 SUI per RIFT

    const WIN_MULTIPLIER: u64 = 2; // 2x for winning
    const LOSS_BURN_PERCENTAGE: u64 = 50; // 50% burned on loss
    const LOSS_POOL_PERCENTAGE: u64 = 50; // 50% to pool on loss

    /// Initialize token with metadata
    fun init(ctx: &mut TxContext) {
        // Create the Rift token with proper metadata
        let (treasury_cap, metadata) = coin::create_currency<RIFT_TOKEN>(
            RIFT_TOKEN {},
            DECIMALS, // decimals
            b"RIFT", // symbol
            b"Rift Token", // name
            b"Official token for the Rift gaming platform", // description
            option::some(url::new_unsafe_from_bytes(b"https://harlequin-imperial-armadillo-412.mypinata.cloud/ipfs/bafkreih4mag7tt75x3lxxcgg6tx5wsitcdypqti3fvmdq6kyypcb5fieoy")), // icon URL
            ctx
        );

        let creator = tx_context::sender(ctx);

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        // Mint and distribute initial allocations
        let creator_coins = coin::mint(&mut treasury_cap, CREATOR_ALLOCATION, ctx);
        let liquidity_coins = coin::mint(&mut treasury_cap, LIQUIDITY_POOL_ALLOCATION, ctx);
        let staking_coins = coin::mint(&mut treasury_cap, STAKING_POOL_ALLOCATION, ctx);
        let betting_coins = coin::mint(&mut treasury_cap, BETTING_POOL_ALLOCATION, ctx);

        // Create and initialize pools
        let liquidity_pool = LiquidityPool {
            id: object::new(ctx),
            pool_balance: coin::into_balance(liquidity_coins),
            sui_balance: balance::zero(),
            treasury_cap
        };

        let staking_pool = StakingPool {
            id: object::new(ctx),
            total_staked: balance::zero(),
            rewards_per_day: DAILY_REWARDS_RATE,
            last_reward_time: 0,
            reward_balance: coin::into_balance(staking_coins)
        };

        let betting_pool = BettingPool {
            id: object::new(ctx),
            pool_balance: coin::into_balance(betting_coins),
            burn_address: creator
        };

        // Create game registry
        let game_registry = GameRegistry {
            id: object::new(ctx),
            authorized_games: vector::empty()
        };

        // Transfer everything
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(liquidity_pool);
        transfer::public_share_object(staking_pool);
        transfer::public_share_object(betting_pool);
        transfer::public_share_object(game_registry);
        transfer::public_transfer(creator_coins, creator);
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

    // Place bet function - no game registration needed
    public entry fun place_bet(
        pool: &mut BettingPool,
        bet_amount: Coin<RIFT_TOKEN>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&bet_amount);
        balance::join(&mut pool.pool_balance, coin::into_balance(bet_amount));
        
        // Emit bet placed event
        event::emit(BetPlacedEvent {
            player: tx_context::sender(ctx),
            amount,
            timestamp: tx_context::epoch(ctx)
        });
    }

    // Process game result
    public entry fun process_game_result(
        pool: &mut BettingPool,
        player: address,
        bet_amount: u64,
        won: bool,
        ctx: &mut TxContext
    ) {
        if (won) {
            // Winner gets 2x their bet
            let reward_amount = bet_amount * WIN_MULTIPLIER;
            let reward = coin::from_balance(
                balance::split(&mut pool.pool_balance, reward_amount),
                ctx
            );
            transfer::public_transfer(reward, player);
        } else {
            // On loss: 50% burned, 50% to pool
            let burn_amount = (bet_amount * LOSS_BURN_PERCENTAGE) / 100;
            let pool_amount = bet_amount - burn_amount;
            
            // Burn tokens
            let burn_coins = coin::from_balance(
                balance::split(&mut pool.pool_balance, burn_amount),
                ctx
            );
            transfer::public_transfer(burn_coins, pool.burn_address);
            
            // Rest stays in pool automatically
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
