import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from '@suiet/wallet-kit';

export const GAMES = {
    TIC_TAC_TOE: 'tic_tac_toe',
    MEMORY_GAME: 'memory_game',
    PUZZLE_GAME: 'puzzle_game'
};

export const MIN_BET = 1_000_000; // 1 RIFT
export const MAX_BET = 100_000_000; // 100 RIFT

export const useGameManager = () => {
    const { signAndExecuteTransaction } = useWallet();
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;

    const registerGame = async (
        adminCap: string,
        gameName: string,
        minBet: number = MIN_BET,
        maxBet: number = MAX_BET
    ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${packageId}::rift_token::register_game`,
            arguments: [
                tx.object(adminCap),
                tx.pure(gameName),
                tx.pure(minBet.toString()),
                tx.pure(maxBet.toString())
            ]
        });
        return await signAndExecuteTransaction({ transaction: tx });
    };

    const placeBet = async (
        gameId: string,
        betAmount: number,
        playerChoice: string,
        bettingPoolId: string
    ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${packageId}::rift_token::place_bet`,
            arguments: [
                tx.object(gameId),
                tx.object(bettingPoolId),
                tx.pure(betAmount.toString()),
                tx.pure(playerChoice)
            ]
        });
        return await signAndExecuteTransaction({ transaction: tx });
    };

    const processGameResult = async (
        gameId: string,
        bettingPoolId: string,
        betPositionId: string,
        result: string
    ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${packageId}::rift_token::process_game_result`,
            arguments: [
                tx.object(gameId),
                tx.object(bettingPoolId),
                tx.object(betPositionId),
                tx.pure(result)
            ]
        });
        return await signAndExecuteTransaction({ transaction: tx });
    };

    return {
        registerGame,
        placeBet,
        processGameResult
    };
};
