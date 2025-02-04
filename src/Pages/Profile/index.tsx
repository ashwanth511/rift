import React from 'react';
import { Card } from "@/components/ui/card";
import { useWallet } from '@suiet/wallet-kit';

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
    { hash: '0x456...def', type: 'Receive', amount: '50 SUI', status: 'Pending' },
    { hash: '0x789...ghi', type: 'Swap', amount: '200 SUI', status: 'Completed' },
  ];

  if (!connected) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-[800px] mx-auto mt-[5%]">
          <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-zinc-400 mb-6">Please connect your wallet to view your profile</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[800px] mx-auto mt-[5%]">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>

        <div className="space-y-8">
          {/* Wallet Info */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Wallet Details</h2>
                <NetworkIndicator network={chain?.name || 'unknown'} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Address</span>
                  <span className="font-mono">{account?.address}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Balance</span>
                  <span>{account?.balance || '0'} SUI</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Network</span>
                  <span className="capitalize">{chain?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{tx.hash}</div>
                    <div className="text-sm text-zinc-400">{tx.type}</div>
                  </div>
                  <div className="text-right">
                    <div>{tx.amount}</div>
                    <div className={`text-sm ${
                      tx.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;