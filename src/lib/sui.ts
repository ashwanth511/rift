import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import { WalletContextState } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui.js/transactions';
import { SuilendClient, LendingPool, UserPosition } from '@suilend/sdk';

const PACKAGE_ID = import.meta.env.VITE_RIFT_PACKAGE_ID;
const NETWORK = 'devnet';

export class SuiService {
  private provider: JsonRpcProvider;
  private wallet: WalletContextState | null = null;
  private suilend: SuilendClient;

  constructor() {
    this.provider = new JsonRpcProvider(new Connection({
      fullnode: `https://fullnode.${NETWORK}.sui.io`,
      faucet: `https://faucet.${NETWORK}.sui.io/gas`,
    }));
    
    this.suilend = new SuilendClient({
      network: NETWORK,
      packageId: PACKAGE_ID,
    });
  }

  setWallet(wallet: WalletContextState) {
    this.wallet = wallet;
  }

  // Balance functions
  async getBalance(address: string) {
    try {
      const balance = await this.provider.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      });
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async getRiftBalance(address: string) {
    try {
      const balance = await this.provider.getBalance({
        owner: address,
        coinType: `${PACKAGE_ID}::rift_token::RIFT_TOKEN`
      });
      return balance;
    } catch (error) {
      console.error('Error fetching RIFT balance:', error);
      throw error;
    }
  }

  // Trading functions
  async buyRiftWithSui(amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::buy_with_sui`,
        arguments: [txb.pure(amount)],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error buying RIFT:', error);
      throw error;
    }
  }

  async sellRiftForSui(amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::sell_for_sui`,
        arguments: [txb.pure(amount)],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error selling RIFT:', error);
      throw error;
    }
  }

  // Staking functions
  async stakeRift(amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::stake`,
        arguments: [txb.pure(amount)],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error staking RIFT:', error);
      throw error;
    }
  }

  async unstakeRift(amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::unstake`,
        arguments: [txb.pure(amount)],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error unstaking RIFT:', error);
      throw error;
    }
  }

  async claimStakingRewards() {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::claim_rewards`,
        arguments: [],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  // Battle functions
  async placeBet(amount: number, gameType: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_token::place_bet`,
        arguments: [txb.pure(amount), txb.pure(gameType)],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  // NFT functions
  async mintNFT(name: string, description: string, url: string) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new transaction();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rift_nft::mint`,
        arguments: [
          txb.pure(name),
          txb.pure(description),
          txb.pure(url)
        ],
      });

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Suilend Integration
  async getLendingPools() {
    try {
      const pools = await this.suilend.getLendingPools();
      return pools;
    } catch (error) {
      console.error('Error fetching lending pools:', error);
      throw error;
    }
  }

  async getLendingPoolData(poolId: string) {
    try {
      const poolData = await this.suilend.getLendingPoolData(poolId);
      return poolData;
    } catch (error) {
      console.error('Error fetching pool data:', error);
      throw error;
    }
  }

  async supply(poolId: string, amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const supplyTx = await this.suilend.buildSupplyTransaction({
        poolId,
        amount,
        sender: this.wallet.address!,
      });

      txb.moveCall(supplyTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error supplying to pool:', error);
      throw error;
    }
  }

  async borrow(poolId: string, amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const borrowTx = await this.suilend.buildBorrowTransaction({
        poolId,
        amount,
        sender: this.wallet.address!,
      });

      txb.moveCall(borrowTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error borrowing from pool:', error);
      throw error;
    }
  }

  async repay(poolId: string, amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const repayTx = await this.suilend.buildRepayTransaction({
        poolId,
        amount,
        sender: this.wallet.address!,
      });

      txb.moveCall(repayTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw error;
    }
  }

  async withdraw(poolId: string, amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const withdrawTx = await this.suilend.buildWithdrawTransaction({
        poolId,
        amount,
        sender: this.wallet.address!,
      });

      txb.moveCall(withdrawTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb,
      });
      return tx;
    } catch (error) {
      console.error('Error withdrawing from pool:', error);
      throw error;
    }
  }

  async getUserLendingData(address: string) {
    try {
      const userData = await this.suilend.getUserLendingData(address);
      return userData;
    } catch (error) {
      console.error('Error fetching user lending data:', error);
      throw error;
    }
  }

  // Enhanced Suilend Functions
  async getAllLendingPools() {
    try {
      const pools = await this.suilend.getLendingPools();
      return pools.map(pool => ({
        ...pool,
        apy: this.calculatePoolAPY(pool),
        utilizationRate: this.calculateUtilizationRate(pool),
        totalValueLocked: this.calculateTVL(pool)
      }));
    } catch (error) {
      console.error('Error fetching lending pools:', error);
      throw error;
    }
  }

  async getDetailedPoolData(poolId: string) {
    try {
      const poolData = await this.suilend.getLendingPoolData(poolId);
      return {
        ...poolData,
        metrics: {
          apy: this.calculatePoolAPY(poolData),
          borrowAPY: this.calculateBorrowAPY(poolData),
          utilizationRate: this.calculateUtilizationRate(poolData),
          totalValueLocked: this.calculateTVL(poolData),
          availableLiquidity: this.calculateAvailableLiquidity(poolData)
        },
        riskParams: {
          optimalUtilization: poolData.optimalUtilization,
          liquidationThreshold: poolData.liquidationThreshold,
          liquidationPenalty: poolData.liquidationPenalty,
          interestRateBase: poolData.interestRateBase
        }
      };
    } catch (error) {
      console.error('Error fetching detailed pool data:', error);
      throw error;
    }
  }

  async getUserPositions(address: string) {
    try {
      const positions = await this.suilend.getUserPositions(address);
      return positions.map(position => ({
        ...position,
        metrics: {
          healthFactor: this.calculateHealthFactor(position),
          totalCollateralUSD: this.calculateCollateralValue(position),
          totalBorrowedUSD: this.calculateBorrowValue(position),
          availableToBorrow: this.calculateAvailableToBorrow(position)
        }
      }));
    } catch (error) {
      console.error('Error fetching user positions:', error);
      throw error;
    }
  }

  async liquidate(poolId: string, userAddress: string, amount: number) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const liquidateTx = await this.suilend.buildLiquidateTransaction({
        poolId,
        userAddress,
        amount,
        liquidator: this.wallet.address!
      });

      txb.moveCall(liquidateTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb
      });
      return tx;
    } catch (error) {
      console.error('Error liquidating position:', error);
      throw error;
    }
  }

  async enableCollateral(poolId: string) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const enableTx = await this.suilend.buildEnableCollateralTransaction({
        poolId,
        userAddress: this.wallet.address!
      });

      txb.moveCall(enableTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb
      });
      return tx;
    } catch (error) {
      console.error('Error enabling collateral:', error);
      throw error;
    }
  }

  async disableCollateral(poolId: string) {
    if (!this.wallet) throw new Error('Wallet not connected');

    try {
      const txb = new Transaction();
      
      const disableTx = await this.suilend.buildDisableCollateralTransaction({
        poolId,
        userAddress: this.wallet.address!
      });

      txb.moveCall(disableTx);

      const tx = await this.wallet.signandexecutetransaction({
        transaction: txb
      });
      return tx;
    } catch (error) {
      console.error('Error disabling collateral:', error);
      throw error;
    }
  }

  // Helper functions for calculations
  private calculatePoolAPY(pool: LendingPool): number {
    const utilization = this.calculateUtilizationRate(pool);
    return pool.interestRateBase * utilization * 100;
  }

  private calculateBorrowAPY(pool: LendingPool): number {
    const utilization = this.calculateUtilizationRate(pool);
    return pool.interestRateBase * utilization * 1.5 * 100; // 50% premium on borrow rate
  }

  private calculateUtilizationRate(pool: LendingPool): number {
    const totalBorrowed = Number(pool.totalBorrowed);
    const totalSupplied = Number(pool.totalSupplied);
    return totalSupplied > 0 ? totalBorrowed / totalSupplied : 0;
  }

  private calculateTVL(pool: LendingPool): number {
    return Number(pool.totalSupplied) / 1e9;
  }

  private calculateAvailableLiquidity(pool: LendingPool): number {
    return (Number(pool.totalSupplied) - Number(pool.totalBorrowed)) / 1e9;
  }

  private calculateHealthFactor(position: UserPosition): number {
    const collateralValue = this.calculateCollateralValue(position);
    const borrowValue = this.calculateBorrowValue(position);
    return borrowValue > 0 ? (collateralValue * position.liquidationThreshold) / borrowValue : Infinity;
  }

  private calculateCollateralValue(position: UserPosition): number {
    return Number(position.collateralAmount) * position.collateralPrice / 1e9;
  }

  private calculateBorrowValue(position: UserPosition): number {
    return Number(position.borrowAmount) * position.borrowPrice / 1e9;
  }

  private calculateAvailableToBorrow(position: UserPosition): number {
    const collateralValue = this.calculateCollateralValue(position);
    const borrowValue = this.calculateBorrowValue(position);
    const maxBorrow = collateralValue * position.liquidationThreshold;
    return Math.max(0, maxBorrow - borrowValue);
  }

  // Market Data
  async getMarketData() {
    try {
      const marketData = await this.suilend.getMarketData();
      return {
        totalValueLocked: marketData.totalValueLocked,
        totalBorrowed: marketData.totalBorrowed,
        totalSupplied: marketData.totalSupplied,
        numberOfPools: marketData.pools.length,
        topPools: marketData.pools.slice(0, 5).map(pool => ({
          name: pool.name,
          tvl: this.calculateTVL(pool),
          apy: this.calculatePoolAPY(pool)
        }))
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }
}

export const suiService = new SuiService(); 