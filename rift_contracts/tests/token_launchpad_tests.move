#[test_only]
module rift_token::token_launchpad_tests {
    use std::string::{Self, String};
    use std::ascii::String as AsciiString;
    use sui::coin::{Self, Coin, CoinMetadata};
    use sui::sui::SUI;
    use sui::balance;
    use sui::test_scenario::{Self as test, next_tx, ctx};
    use sui::test_utils;
    use sui::clock::Clock;
    use rift_token::token_launchpad::{
        Self,
        TokenPool,
        TokenWitness,
        AIToken,
        TokenStakePool,
        TokenInfo,
        create_pool,
        get_tokens,
        INITIAL_SUPPLY,
        INITIAL_PRICE,
        CREATOR_ALLOCATION,
        DECIMALS,
        DAILY_REWARDS_RATE
    };
    use rift_token::rift_token::{Self, RIFT_TOKEN, LiquidityPool, TreasuryCap};

    const TEST_SYMBOL: vector<u8> = b"TST";
    const TEST_NAME: vector<u8> = b"TEST";

    #[test]
    fun test_create_token() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // First transaction to create the pool
        next_tx(&mut scenario, test_addr); {
            token_launchpad::init(ctx(&mut scenario));
        };

        // Second transaction to create a token
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        test::end(scenario);
    }

    #[test]
    fun test_buy_token_with_sui() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // Setup: Create pool and mint SUI
        next_tx(&mut scenario, test_addr); {
            token_launchpad::init(ctx(&mut scenario));
            // Mint some SUI for testing
            let sui_coin = coin::mint_for_testing<SUI>(1000000000, ctx(&mut scenario));
            transfer::public_transfer(sui_coin, test_addr);
        };

        // Create test token
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );
            test::return_shared(pool);
        };

        // Buy token with SUI
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            let mut sui_coin = test::take_from_sender<Coin<SUI>>(&scenario);
            
            token_launchpad::buy_token(
                &mut pool,
                TEST_SYMBOL,
                &mut sui_coin,
                1000000000, // amount to buy
                ctx(&mut scenario)
            );

            test::return_to_sender(&scenario, sui_coin);
            test::return_shared(pool);
        };

        test::end(scenario);
    }

    #[test]
    fun test_swap_tokens() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // Setup
        next_tx(&mut scenario, test_addr); {
            token_launchpad::init(ctx(&mut scenario));
            rift_token::init(ctx(&mut scenario));
        };

        // Create two test tokens
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            // Create first token
            token_launchpad::create_token(
                &mut pool,
                b"TOKEN1",
                b"TK1",
                b"Token 1",
                b"https://example.com",
                b"Agent 1",
                ctx(&mut scenario)
            );

            // Create second token
            token_launchpad::create_token(
                &mut pool,
                b"TOKEN2",
                b"TK2",
                b"Token 2",
                b"https://example.com",
                b"Agent 2",
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        // Test swap between tokens
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            token_launchpad::swap_tokens(
                &mut pool,
                b"TK1",
                b"TK2",
                1000000000,
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        test::end(scenario);
    }

    #[test]
    fun test_create_and_swap_with_rift() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // First transaction to create pools
        next_tx(&mut scenario, test_addr); {
            let token_pool = create_pool(ctx(&mut scenario));
            test::return_shared(token_pool);

            let (rift_pool, rift_treasury) = rift_token::create_pool(ctx(&mut scenario));
            test::return_shared(rift_pool);
            test::return_to_sender(&scenario, rift_treasury);
        };

        // Create AI token
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        // Mint RIFT tokens for testing
        next_tx(&mut scenario, test_addr); {
            let mut rift_pool = test::take_shared<LiquidityPool>(&scenario);
            let rift_treasury = test::take_from_sender<TreasuryCap>(&scenario);
            
            // Mint RIFT tokens
            let rift_coins = rift_token::mint(&mut rift_treasury, 1000000000, ctx(&mut scenario));
            test::return_to_sender(&scenario, rift_coins);
            
            test::return_to_sender(&scenario, rift_treasury);
            test::return_shared(rift_pool);
        };

        test::end(scenario);
    }

    #[test]
    fun test_battle_with_rift_tokens() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // Setup pools
        next_tx(&mut scenario, test_addr); {
            let token_pool = token_launchpad::create_pool(ctx(&mut scenario));
            transfer::public_share_object(token_pool);

            let (rift_pool, rift_treasury) = rift_token::create_pool(RIFT_TOKEN {}, ctx(&mut scenario));
            transfer::public_share_object(rift_pool);
            transfer::public_transfer(rift_treasury, test_addr);
        };

        // Create battle tokens and mint RIFT
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            let mut rift_pool = test::take_shared<LiquidityPool>(&scenario);
            let rift_treasury = test::take_from_sender<rift_token::TreasuryCap>(&scenario);
            
            // Create fighter tokens
            token_launchpad::create_token(
                &mut pool,
                b"FIGHTER1",
                b"FT1",
                b"Fighter 1",
                b"https://example.com",
                b"Strong Fighter",
                ctx(&mut scenario)
            );

            token_launchpad::create_token(
                &mut pool,
                b"FIGHTER2",
                b"FT2",
                b"Fighter 2",
                b"https://example.com",
                b"Quick Fighter",
                ctx(&mut scenario)
            );

            // Mint RIFT for betting
            let rift_coins = rift_token::mint(&mut rift_treasury, 1000000000, ctx(&mut scenario));
            transfer::public_transfer(rift_coins, test_addr);

            test::return_to_sender(&scenario, rift_treasury);
            test::return_shared(pool);
            test::return_shared(rift_pool);
        };

        // Battle using RIFT tokens
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            let mut rift_pool = test::take_shared<LiquidityPool>(&scenario);
            let rift_coins = test::take_from_sender<Coin<RIFT_TOKEN>>(&scenario);
            
            token_launchpad::battle(
                &mut pool,
                &mut rift_pool,
                b"FT1",
                b"FT2",
                b"RIFT",
                1000000000,
                b"FT1",
                ctx(&mut scenario)
            );

            test::return_to_sender(&scenario, rift_coins);
            test::return_shared(pool);
            test::return_shared(rift_pool);
        };

        test::end(scenario);
    }

    #[test]
    fun test_staking_with_rewards() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // Setup
        next_tx(&mut scenario, test_addr); {
            let token_pool = token_launchpad::create_pool(ctx(&mut scenario));
            transfer::public_share_object(token_pool);
            let clock = test_utils::create_one_time_clock(ctx(&mut scenario));
            transfer::public_share_object(clock);
        };

        // Create token and stake
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            let clock = test::take_shared<Clock>(&scenario);
            
            // Create token
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );

            // Get stake pool and tokens
            let mut stake_pool = test::take_shared<TokenStakePool<TokenWitness>>(&scenario);
            let token_coins = test::take_from_sender<Coin<AIToken<TokenWitness>>>(&scenario);

            // Stake tokens
            token_launchpad::stake_tokens(
                &mut stake_pool,
                token_coins,
                &clock,
                ctx(&mut scenario)
            );

            test::return_shared(pool);
            test::return_shared(stake_pool);
            test::return_shared(clock);
        };

        test::end(scenario);
    }

    #[test]
    fun test_complete_token_creation_flow() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // First transaction to create pool
        next_tx(&mut scenario, test_addr); {
            let token_pool = create_pool(ctx(&mut scenario));
            test::return_shared(token_pool);
        };

        // Create token with verification
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            // Create token
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token Description",
                b"https://example.com/image.png",
                b"Test Agent Prompt",
                ctx(&mut scenario)
            );

            // Verify token was created correctly
            let tokens = get_tokens(&pool);
            assert!(vector::length(tokens) == 1, 1); // Verify token count

            let token_info: &TokenInfo<TokenWitness> = vector::borrow(tokens, 0);
            assert!(token_info.name == string::utf8(TEST_NAME), 2);
            assert!(token_info.symbol == string::utf8(TEST_SYMBOL), 3);
            assert!(token_info.total_supply == INITIAL_SUPPLY, 4);
            assert!(token_info.last_price == INITIAL_PRICE, 5);

            test::return_shared(pool);
        };

        // Verify creator received their allocation
        next_tx(&mut scenario, test_addr); {
            let creator_coins = test::take_from_sender<Coin<AIToken<TokenWitness>>>(&scenario);
            assert!(coin::value(&creator_coins) == CREATOR_ALLOCATION, 6);
            test::return_to_sender(&scenario, creator_coins);
        };

        // Verify stake pool was created
        next_tx(&mut scenario, test_addr); {
            let stake_pool = test::take_shared<TokenStakePool<TokenWitness>>(&scenario);
            assert!(balance::value(&stake_pool.total_staked) == 0, 7); // Should start with 0 staked
            assert!(token_launchpad::get_rewards_per_hour(&stake_pool) == DAILY_REWARDS_RATE / 24, 8);
            test::return_shared(stake_pool);
        };

        // Try to buy the created token
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            let sui_coin = coin::mint_for_testing<SUI>(1000000000, ctx(&mut scenario));
            
            token_launchpad::buy_token(
                &mut pool,
                TEST_SYMBOL,
                &mut sui_coin,
                1000000, // Small test amount
                ctx(&mut scenario)
            );

            // Verify purchase
            let bought_coins = test::take_from_sender<Coin<AIToken<TokenWitness>>>(&scenario);
            assert!(coin::value(&bought_coins) == 1000000, 9);

            test::return_to_sender(&scenario, bought_coins);
            test::return_to_sender(&scenario, sui_coin);
            test::return_shared(pool);
        };

        // Test token metadata
        next_tx(&mut scenario, test_addr); {
            let metadata = test::take_immutable<CoinMetadata<AIToken<TokenWitness>>>(&scenario);
            
            assert!(coin::get_decimals(&metadata) == DECIMALS, 10);
            assert!(coin::get_name(&metadata) == string::utf8(TEST_NAME), 11);
            let symbol_ascii: AsciiString = coin::get_symbol(&metadata);
            assert!(ascii::into_bytes(symbol_ascii) == TEST_SYMBOL, 12);

            test::return_immutable(metadata);
        };

        test::end(scenario);
    }

    // Test failure cases
    #[test]
    fun test_token_creation() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        // First transaction to create pool
        next_tx(&mut scenario, test_addr); {
            let token_pool = create_pool(ctx(&mut scenario));
            test::return_shared(token_pool);
        };

        // Create token
        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            // Create token
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                TEST_SYMBOL,
                b"Test Token Description",
                b"https://example.com/image.png",
                b"Test Agent Prompt",
                ctx(&mut scenario)
            );

            // Verify token exists in pool
            let tokens = get_tokens(&pool);
            assert!(vector::length(tokens) == 1, 0); // Should have 1 token

            test::return_shared(pool);
        };

        // Verify creator received coins
        next_tx(&mut scenario, test_addr); {
            let creator_coins = test::take_from_sender<Coin<AIToken<TokenWitness>>>(&scenario);
            assert!(coin::value(&creator_coins) > 0, 1); // Creator should have coins
            test::return_to_sender(&scenario, creator_coins);
        };

        // Verify metadata was created
        next_tx(&mut scenario, test_addr); {
            let metadata = test::take_immutable<CoinMetadata<AIToken<TokenWitness>>>(&scenario);
            assert!(coin::get_name(&metadata) == string::utf8(TEST_NAME), 2);
            test::return_immutable(metadata);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = token_launchpad::ERR_SYMBOL_TOO_LONG)]
    fun test_token_creation_symbol_too_long() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        next_tx(&mut scenario, test_addr); {
            let token_pool = create_pool(ctx(&mut scenario));
            test::return_shared(token_pool);
        };

        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            token_launchpad::create_token(
                &mut pool,
                TEST_NAME,
                b"VERYLONGSYMBOL", // Should fail
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = token_launchpad::ERR_NAME_TOO_LONG)]
    fun test_token_creation_name_too_long() {
        let mut scenario = test::begin(@0x1);
        let test_addr = @0x1;
        
        next_tx(&mut scenario, test_addr); {
            let token_pool = create_pool(ctx(&mut scenario));
            test::return_shared(token_pool);
        };

        next_tx(&mut scenario, test_addr); {
            let mut pool = test::take_shared<TokenPool<TokenWitness>>(&scenario);
            
            token_launchpad::create_token(
                &mut pool,
                b"THIS_NAME_IS_WAY_TOO_LONG_AND_SHOULD_FAIL",
                TEST_SYMBOL,
                b"Test Token",
                b"https://example.com",
                b"Test Agent",
                ctx(&mut scenario)
            );

            test::return_shared(pool);
        };

        test::end(scenario);
    }
} 