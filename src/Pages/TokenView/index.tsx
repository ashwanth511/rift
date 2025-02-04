import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TokenView = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [evolutionProgress, setEvolutionProgress] = useState(65);
  const [amount, setAmount] = useState('');
  const { connected } = useWallet();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        width: '100%',
        height: 400,
        symbol: 'BINANCE:BTCUSDT',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#18181b',
        enable_publishing: false,
        hide_side_toolbar: false,
        container_id: 'tradingview_chart'
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuy = () => {
    if (!connected) {
      // Show connect wallet message
      return;
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSell = () => {
    if (!connected) {
      // Show connect wallet message
      return;
    }
  };

  const handleBet = () => {
    if (!connected) {
      // Show connect wallet message
      return;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mt-[5%] mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Pikachu Token</h1>
            <div className="flex items-center space-x-4">
              <span className="text-2xl text-white">$0.0045</span>
              <span className="text-green-500">+12.5%</span>
            </div>
          </div>
          
          {/* Evolution Progress */}
          <div className="w-[300px]">
            <div className="flex justify-between mb-2">
              <span>Evolution Progress</span>
              <span>{evolutionProgress}%</span>
            </div>
            <Progress value={evolutionProgress} className="h-2 bg-zinc-800">
              <div className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all" 
                   style={{ width: `${evolutionProgress}%` }} />
            </Progress>
            <div className="flex justify-between mt-1 text-sm text-zinc-400">
              <span>Evolve</span>
              <span>Evolving</span>
              <span>Evolved</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Trading Chart */}
          <div className="col-span-2">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">Price History</h2>
              <div id="tradingview_chart" className="h-[400px]" />
            </Card>

            {/* Chat Interface */}
            <Card className="bg-zinc-900 border-zinc-800 p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Chat with Token Agent</h2>
              <div className="h-[300px] bg-zinc-800 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="bg-zinc-700 rounded-lg p-3 max-w-[80%] mb-4">
                  Hello! I'm the Pikachu Token AI Agent. How can I assist you with trading today?
                </div>
              </div>
              <div className="flex gap-4">
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={connected ? "Ask about token metrics, trading strategies..." : "Connect wallet to chat"}
                  className="bg-zinc-800 border-zinc-700 text-white resize-none"
                  disabled={!connected}
                />
                <Button 
                  className="bg-zinc-800 hover:bg-zinc-700"
                  disabled={!connected}
                  onClick={() => !connected && navigate('/connect')}
                >
                  {connected ? 'Send' : 'Connect Wallet'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Trading Actions */}
          <div className="space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">Trade</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Amount</label>
                  <Input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleBuy}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {connected ? 'Buy' : 'Connect to Buy'}
                  </Button>
                  <Button 
                    onClick={handleSell}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {connected ? 'Sell' : 'Connect to Sell'}
                  </Button>
                </div>
                {!connected && (
                  <div className="text-center text-sm text-zinc-400 mt-2">
                    Connect your wallet to trade
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-4">Battle Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span className="text-green-500">68%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Battles</span>
                  <span>156</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Power</span>
                  <span className="text-yellow-500">2,450</span>
                </div>
                <Button 
                  onClick={handleBet}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  {connected ? 'Place Bet' : 'Connect to Bet'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenView;