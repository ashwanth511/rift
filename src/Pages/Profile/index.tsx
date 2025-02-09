import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useWallet } from '@suiet/wallet-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuiClient } from '@mysten/sui.js/client';
import { formatAddress } from '@mysten/sui.js/utils';
import { CopyIcon, CheckIcon } from 'lucide-react';

const NetworkIndicator = ({ network }: { network: string }) => {
  const getNetworkColor = () => {
    switch (network) {
      case 'devnet':
        return 'bg-red-500';
      case 'mainnet':
        return 'bg-green-500';
      case 'testnet':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getNetworkColor()} animate-pulse`} />
      <span className="capitalize">{network}</span>
    </div>
  );
};

interface BalanceInfo {
  totalBalance: string;
  stakedBalance: string;
  coinSymbol: string;
}

const Profile = () => {
  const { account, connected, chain } = useWallet();
  const [balance, setBalance] = useState<BalanceInfo>({
    totalBalance: '0',
    stakedBalance: '0',
    coinSymbol: 'SUI'
  });
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Mock battle stats data
  const battleStats = {
    totalBattles: 45,
    wins: 32,
    powerLevel: 1500,
    rank: 1,
    units: 12,
    powerItems: 3
  };

  const leaderboardData = [
    { rank: 1, address: '0x123...abc', points: 1500, battles: 45, wins: 32 },
    { rank: 2, address: '0x456...def', points: 1350, battles: 40, wins: 28 },
    { rank: 3, address: '0x789...ghi', points: 1200, battles: 38, wins: 25 },
    { rank: 4, address: '0xabc...jkl', points: 1100, battles: 35, wins: 22 },
    { rank: 5, address: '0xdef...mno', points: 1000, battles: 30, wins: 20 },
  ];

  // Initialize Sui client
  const suiClient = new SuiClient({
    url: chain?.rpcUrl || 'https://fullnode.devnet.sui.io:443'
  });

  // Fetch balance and transactions
  useEffect(() => {
    const fetchBalanceAndTxs = async () => {
      if (connected && account?.address) {
        try {
          // Get all coin balances
          const coins = await suiClient.getCoins({
            owner: account.address,
            coinType: '0x2::sui::SUI'
          });

          // Calculate total balance
          const totalBalance = coins.data.reduce((acc, coin) => {
            return acc + BigInt(coin.balance);
          }, BigInt(0));

          // Format balance to SUI units (9 decimals)
          const formattedBalance = (Number(totalBalance) / 1e9).toFixed(4);
          
          setBalance(prev => ({
            ...prev,
            totalBalance: formattedBalance
          }));

          // Get recent transactions with more details
          const txs = await suiClient.queryTransactionBlocks({
            filter: {
              FromAddress: account.address
            },
            limit: 10,
            options: {
              showEffects: true,
              showInput: true,
              showEvents: true
            }
          });

          const processedTxs = txs.data.map(tx => ({
            digest: tx.digest,
            timestamp: tx.timestampMs,
            status: tx.effects?.status?.status || 'unknown',
            type: tx.effects?.status?.status === 'success' ? 'Success' : 'Failed',
            gasFee: tx.effects?.gasUsed ? 
              ((Number(tx.effects.gasUsed.computationCost) + 
                Number(tx.effects.gasUsed.storageCost) - 
                Number(tx.effects.gasUsed.storageRebate)) / 1e9).toFixed(6) : '0'
          }));

          setTransactions(processedTxs);
        } catch (error) {
          console.error('Error fetching wallet data:', error);
        }
      }
    };

    // Initial fetch
    fetchBalanceAndTxs();
    
    // Set up polling interval for real-time updates
    const interval = setInterval(fetchBalanceAndTxs, 2000); // Poll every 2 seconds for more real-time updates
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [connected, account?.address, chain?.rpcUrl]);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Battle Profile</h1>
          <NetworkIndicator network={chain?.name || 'unknown'} />
        </div>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1">
            <TabsTrigger value="wallet" className="battle-button">Wallet & Resources</TabsTrigger>
            <TabsTrigger value="battles" className="battle-button">Battle Stats</TabsTrigger>
            <TabsTrigger value="leaderboard" className="battle-button">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-4 space-y-6">
            {/* Wallet Info Card */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Address:</span>
                  <span className="font-mono">{formatAddress(account?.address || '')}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <div className="text-sm text-zinc-400">Total Balance</div>
                    <div className="text-xl font-bold mt-1">
                      {balance.totalBalance} {balance.coinSymbol}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Network: {chain?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <div className="text-sm text-zinc-400">Battle Units</div>
                    <div className="text-xl font-bold mt-1">{battleStats.units}</div>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <div className="text-sm text-zinc-400">Power Items</div>
                    <div className="text-xl font-bold mt-1">{battleStats.powerItems}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Transactions */}
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <div className="space-y-2">
                {transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <div key={tx.digest} className="bg-zinc-800 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm">{formatAddress(tx.digest)}</div>
                        <div className="text-sm text-zinc-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`text-xs ${tx.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Gas: {tx.gasFee} SUI
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://explorer.sui.io/txblock/${tx.digest}?network=${chain?.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 py-4">
                    No transactions found
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="battles" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400">Total Battles</div>
                  <div className="text-xl font-bold mt-1">{battleStats.totalBattles}</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400">Victories</div>
                  <div className="text-xl font-bold mt-1">{battleStats.wins}</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400">Win Rate</div>
                  <div className="text-xl font-bold mt-1">
                    {((battleStats.wins / battleStats.totalBattles) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400">Power Level</div>
                  <div className="text-xl font-bold mt-1">{battleStats.powerLevel}</div>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <div className="text-sm text-zinc-400">Current Rank</div>
                  <div className="text-xl font-bold mt-1">#{battleStats.rank}</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-400 border-b border-zinc-800">
                      <th className="pb-4">Rank</th>
                      <th className="pb-4">Commander</th>
                      <th className="pb-4">Power</th>
                      <th className="pb-4">Battles</th>
                      <th className="pb-4">Victories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player) => (
                      <tr key={player.address} className="border-b border-zinc-800/50">
                        <td className="py-4 text-white">#{player.rank}</td>
                        <td className="py-4 text-white font-mono">{player.address}</td>
                        <td className="py-4 text-white">{player.points}</td>
                        <td className="py-4 text-white">{player.battles}</td>
                        <td className="py-4 text-white">{player.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;