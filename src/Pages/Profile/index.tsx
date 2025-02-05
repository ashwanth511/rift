import React from 'react';
import { Card } from "@/components/ui/card";
import { useWallet } from '@suiet/wallet-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const Profile = () => {
  const { account, connected, chain } = useWallet();

  const transactions = [
    { hash: '0x123...abc', type: 'Send', amount: '100 SUI', status: 'Completed' },
    { hash: '0x456...def', type: 'Receive', amount: '50 SUI', status: 'Completed' },
    { hash: '0x789...ghi', type: 'Stake', amount: '200 SUI', status: 'Pending' },
  ];

  const leaderboardData = [
    { rank: 1, address: '0x123...abc', points: 1500, battles: 45, wins: 32 },
    { rank: 2, address: '0x456...def', points: 1350, battles: 40, wins: 28 },
    { rank: 3, address: '0x789...ghi', points: 1200, battles: 38, wins: 25 },
    { rank: 4, address: '0xabc...jkl', points: 1100, battles: 35, wins: 22 },
    { rank: 5, address: '0xdef...mno', points: 1000, battles: 30, wins: 20 },
  ];

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card className="glass-effect p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Battle Profile</h2>
            <NetworkIndicator network={chain?.name || 'unknown'} />
          </div>
          <p className="text-zinc-400 break-all">{account?.address}</p>
        </div>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1">
            <TabsTrigger value="wallet" className="battle-button">Armory & Resources</TabsTrigger>
            <TabsTrigger value="leaderboard" className="battle-button">Battle Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-4">
            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="game-card stat-card p-4">
                <p className="text-sm text-zinc-400">War Chest</p>
                <p className="stat-value">1,234.56 SUI</p>
              </Card>
              <Card className="game-card stat-card p-4">
                <p className="text-sm text-zinc-400">Battle Units</p>
                <p className="stat-value">12</p>
              </Card>
              <Card className="game-card stat-card p-4">
                <p className="text-sm text-zinc-400">Power Items</p>
                <p className="stat-value">3</p>
              </Card>
            </div>

            {/* Recent Transactions */}
            <h3 className="text-lg font-semibold text-white mb-4">Battle Log</h3>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={index} className="game-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{tx.hash}</p>
                      <p className="text-white font-medium">{tx.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{tx.amount}</p>
                      <p className={`text-sm ${tx.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="pb-2">Rank</th>
                    <th className="pb-2">Commander</th>
                    <th className="pb-2">Power</th>
                    <th className="pb-2">Battles</th>
                    <th className="pb-2">Victories</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player) => (
                    <tr key={player.address} className="leaderboard-row">
                      <td className="py-3 text-white">#{player.rank}</td>
                      <td className="py-3 text-white">{player.address}</td>
                      <td className="py-3 stat-value">{player.points}</td>
                      <td className="py-3 text-white">{player.battles}</td>
                      <td className="py-3 stat-value">{player.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;