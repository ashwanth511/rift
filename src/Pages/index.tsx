import React, { useState, useEffect } from 'react';
import { SuiLendSDK, Market } from '@suilend/sdk';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js';

// Initialize SuiLend SDK
const suilendSDK = new SuiLendSDK({
  networkType: 'mainnet',
});

const LendingDashboard: React.FC = () => {
  const { connected, account } = useWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available lending markets
  useEffect(() => {
    const fetchMarkets = async () => {
      const availableMarkets = await suilendSDK.getMarkets();
      setMarkets(availableMarkets);
    };
    fetchMarkets();
  }, []);

  // Supply tokens to lending pool
  const handleSupply = async () => {
    if (!connected || !selectedToken || !amount) return;
    
    setLoading(true);
    try {
      const tx = new TransactionBlock();
      await suilendSDK.supply({
        transactionBlock: tx,
        market: selectedToken,
        amount: parseFloat(amount),
      });
      // Handle success
    } catch (error) {
      console.error('Supply error:', error);
    }
    setLoading(false);
  };

  // Borrow tokens from lending pool
  const handleBorrow = async () => {
    if (!connected || !selectedToken || !amount) return;
    
    setLoading(true);
    try {
      const tx = new TransactionBlock();
      await suilendSDK.borrow({
        transactionBlock: tx,
        market: selectedToken,
        amount: parseFloat(amount),
      });
      // Handle success
    } catch (error) {
      console.error('Borrow error:', error);
    }
    setLoading(false);
  };

  // Get user's lending positions
  const fetchUserPositions = async () => {
    if (!connected || !account) return;
    
    try {
      const positions = await suilendSDK.getUserPositions(account.address);
      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">RIFT Lending Platform</h1>
        
        {/* Wallet Connection */}
        <div className="mb-8">
          <ConnectButton />
        </div>

        {connected ? (
          <div className="space-y-8">
            {/* Market Selection */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Available Markets</h2>
              <select
                className="w-full bg-gray-700 p-2 rounded"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="">Select a token</option>
                {markets.map((market) => (
                  <option key={market.address} value={market.address}>
                    {market.name} - APY: {market.supplyApy}%
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Amount</h2>
              <input
                type="number"
                className="w-full bg-gray-700 p-2 rounded text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-4 rounded-lg font-semibold"
                onClick={handleSupply}
                disabled={loading}
              >
                Supply
              </button>
              <button
                className="flex-1 bg-purple-600 hover:bg-purple-700 p-4 rounded-lg font-semibold"
                onClick={handleBorrow}
                disabled={loading}
              >
                Borrow
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Please connect your wallet to use the lending platform
          </div>
        )}
      </div>
    </div>
  );
};

export default LendingDashboard;
