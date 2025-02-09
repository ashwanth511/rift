import React, { useState } from 'react';
import { motion } from 'framer-motion';

type TradeType = 'buy' | 'swap';
type Token = {
  symbol: string;
  name: string;
  price: number;
  icon: string;
};

const AVAILABLE_TOKENS: Token[] = [
  { symbol: 'RIFT', name: 'Rift Token', price: 2.5, icon: '🌀' },
  { symbol: 'ETH', name: 'Ethereum', price: 2500, icon: '⧫' },
  { symbol: 'BTC', name: 'Bitcoin', price: 42000, icon: '₿' },
  { symbol: 'USDT', name: 'Tether', price: 1, icon: '💵' },
];

const Trading = () => {
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<Token>(AVAILABLE_TOKENS[0]);
  const [swapToken, setSwapToken] = useState<Token>(AVAILABLE_TOKENS[1]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Allow only numbers and decimal point
      setAmount(value);
    }
  };

  const calculateTotal = () => {
    const numAmount = parseFloat(amount) || 0;
    if (tradeType === 'buy') {
      return (numAmount * selectedToken.price).toFixed(2);
    } else {
      return ((numAmount * selectedToken.price) / swapToken.price).toFixed(6);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the actual transaction
    alert(`Transaction submitted!\n${amount} ${selectedToken.symbol} ${tradeType === 'buy' ? 'purchased' : `swapped for ${calculateTotal()} ${swapToken.symbol}`}`);
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-4">Trade Tokens</h1>
            <p className="text-xl text-zinc-400">Buy and swap tokens in the digital realm</p>
          </div>
        </div>

        {/* Trade Type Selector */}
        <div className="flex gap-4 mb-8">
          {(['buy', 'swap'] as TradeType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTradeType(type)}
              className={`px-8 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 font-bold
                ${tradeType === type
                  ? 'bg-purple-600/50 text-white'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Trading Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-zinc-400 mb-2">Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Token Selection */}
            <div>
              <label className="block text-zinc-400 mb-2">
                {tradeType === 'buy' ? 'Token to Buy' : 'Token to Swap From'}
              </label>
              <div className="relative">
                <select
                  value={selectedToken.symbol}
                  onChange={(e) => setSelectedToken(AVAILABLE_TOKENS.find(t => t.symbol === e.target.value)!)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                >
                  {AVAILABLE_TOKENS.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.icon} {token.name} ({token.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap To Token (only for swap) */}
            {tradeType === 'swap' && (
              <div>
                <label className="block text-zinc-400 mb-2">Token to Swap To</label>
                <div className="relative">
                  <select
                    value={swapToken.symbol}
                    onChange={(e) => setSwapToken(AVAILABLE_TOKENS.find(t => t.symbol === e.target.value)!)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    {AVAILABLE_TOKENS.filter(t => t.symbol !== selectedToken.symbol).map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-zinc-900/30 rounded-lg p-4">
              <div className="flex justify-between text-zinc-400">
                <span>Total {tradeType === 'buy' ? 'Cost' : `${swapToken.symbol}`}</span>
                <span className="text-white font-bold">
                  {tradeType === 'buy' ? '$' : ''}{calculateTotal()}
                  {tradeType === 'swap' ? ` ${swapToken.symbol}` : ''}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 text-sm mt-2">
                <span>Rate</span>
                <span>
                  1 {selectedToken.symbol} = {tradeType === 'buy' 
                    ? `$${selectedToken.price}`
                    : `${(selectedToken.price / swapToken.price).toFixed(6)} ${swapToken.symbol}`}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white hover:from-purple-500 hover:to-purple-300 transition-all duration-300"
            >
              {tradeType === 'buy' ? 'Buy Tokens' : 'Swap Tokens'}
            </motion.button>
          </form>
        </motion.div>

        {/* Market Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Market Prices</h3>
            <div className="space-y-4">
              {AVAILABLE_TOKENS.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{token.icon}</span>
                    <span className="text-zinc-400">{token.symbol}</span>
                  </div>
                  <span className="text-white font-bold">${token.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trading Guide</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>• Choose between buying or swapping tokens</li>
              <li>• Enter the amount you want to trade</li>
              <li>• Select your desired tokens</li>
              <li>• Review the total and rate</li>
              <li>• Confirm your transaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
