import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ArrowLeft } from 'lucide-react';

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
  marketCap: string;
  volume: string;
}

// Mock data for development
const mockTokenData: TokenData = {
  id: '1',
  name: 'Pikachu Token',
  symbol: 'PIKA',
  price: 0.05,
  change24h: 12.5,
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  marketCap: '$1.2M',
  volume: '$250K'
};

// Mock data for the chart
const generateMockPriceData = () => {
  const data = [];
  let basePrice = 100000;
  let volume = 1000000;
  const timeNow = new Date();

  for (let i = 0; i < 50; i++) {
    const time = new Date(timeNow.getTime() - (50 - i) * 3600000); // hourly data
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * 2000;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    volume = volume + (Math.random() - 0.5) * 500000;

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      open,
      close,
      high,
      low,
      volume: Math.max(100000, volume),
      ma7: basePrice, // We'll calculate this after
      ma25: basePrice // We'll calculate this after
    });

    basePrice = close;
  }

  // Calculate moving averages
  for (let i = 0; i < data.length; i++) {
    if (i >= 6) {
      const slice = data.slice(i - 6, i + 1);
      data[i].ma7 = slice.reduce((sum, item) => sum + item.close, 0) / 7;
    }
    if (i >= 24) {
      const slice = data.slice(i - 24, i + 1);
      data[i].ma25 = slice.reduce((sum, item) => sum + item.close, 0) / 25;
    }
  }

  return data;
};

const mockChartData = generateMockPriceData();

const TokenView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token as TokenData || mockTokenData;
  
  const [message, setMessage] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const { connected, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{sender: string; content: string; timestamp: number}>>([
    { sender: 'agent', content: 'Hello! I\'m your token assistant. How can I help you today?', timestamp: Date.now() },
  ]);

  const [currentStage, setCurrentStage] = useState(2);
  const [betAmount, setBetAmount] = useState('');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState(mockChartData);

  const [stakingAmount, setStakingAmount] = useState('');
  const [stakingPeriod, setStakingPeriod] = useState('30');
  const [showStakeModal, setShowStakeModal] = useState(false);

  const [activeTab, setActiveTab] = useState('trade');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Update chart data every 30 seconds with some random movement
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastPrice = prevData[prevData.length - 1].close;
        const time = new Date();
        
        newData.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          open: lastPrice,
          close: lastPrice + (Math.random() - 0.5) * 2000,
          high: Math.max(lastPrice, lastPrice + (Math.random() - 0.5) * 2000) + Math.random() * 500,
          low: Math.min(lastPrice, lastPrice + (Math.random() - 0.5) * 2000) - Math.random() * 500,
          volume: Math.max(100000, newData[newData.length - 1].volume + (Math.random() - 0.5) * 500000),
          ma7: lastPrice, // We'll calculate this after
          ma25: lastPrice // We'll calculate this after
        });
        
        // Calculate moving averages
        for (let i = 0; i < newData.length; i++) {
          if (i >= 6) {
            const slice = newData.slice(i - 6, i + 1);
            newData[i].ma7 = slice.reduce((sum, item) => sum + item.close, 0) / 7;
          }
          if (i >= 24) {
            const slice = newData.slice(i - 24, i + 1);
            newData[i].ma25 = slice.reduce((sum, item) => sum + item.close, 0) / 25;
          }
        }

        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        // In production, you would fetch real token data here
        // For now, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (err) {
        setError('Failed to load token data. Please try again.');
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [id]);

  const calculateToAmount = (from: string) => {
    if (!from || isNaN(Number(from))) return '';
    // Mock exchange rate: 1 SUI = token.price tokens
    const rate = tradeType === 'buy' ? 1 / token.price : token.price;
    return (Number(from) * rate).toFixed(6);
  };

  useEffect(() => {
    setToAmount(calculateToAmount(fromAmount));
  }, [fromAmount, tradeType]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      sender: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    // Simulate agent response
    const agentResponses = [
      `Based on the current market trends for ${token.symbol}, this could be a good opportunity.`,
      `The trading volume for ${token.symbol} has been increasing lately.`,
      `I notice you're interested in ${token.symbol}. Would you like to know more about its recent performance?`,
      `The price action for ${token.symbol} shows interesting patterns. Let me analyze that for you.`
    ];
    
    const agentMessage = {
      sender: 'agent',
      content: agentResponses[Math.floor(Math.random() * agentResponses.length)],
      timestamp: Date.now() + 1000
    };

    setMessages(prev => [...prev, userMessage, agentMessage]);
    setMessage('');
  };

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <Card className="p-6 bg-zinc-800/50 border-zinc-700/50">
          <p className="text-red-400">{error}</p>
          <Button 
            className="mt-4 bg-purple-500 hover:bg-purple-600"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6 space-y-6 mt-[5%]">
      
      <Button onClick={() => navigate('/dashboard')}>
        
        <ArrowLeft/>
        
        Back TO Dashboard</Button>
      
      {/* Token Info Header */}
      <div className="p-6 rounded-lg bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <img 
            src={token.image} 
            alt={token.name}
            className="w-24 h-24 rounded-lg ring-2 ring-purple-500/50"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{token.name}</h1>
                <p className="text-zinc-400">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${token.price.toFixed(2)}</p>
                <p className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Token Address:</span>
                <code className="text-sm bg-zinc-700/50 px-2 py-1 rounded">{token.id.slice(0, 8)}...{token.id.slice(-6)}</code>
                <button onClick={() => handleCopyAddress(token.id)} className="text-purple-400 hover:text-purple-300">
                  <FiCopy size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Market Cap:</span>
                <span className="text-white">{token.marketCap}</span>
              </div>
            </div>
            
            {/* Stage Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">Evolution Progress</span>
                <span className="text-sm text-purple-400">Stage {currentStage} / 3</span>
              </div>
              <div className="relative h-3 bg-zinc-700/50 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400" 
                     style={{ width: `${(currentStage / 3) * 100}%` }}>
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                {/* Stage Markers */}
                <div className="absolute inset-0 flex justify-between items-center px-2">
                  {[1, 2, 3].map((stage) => (
                    <div 
                      key={stage}
                      className={`w-4 h-4 rounded-full ${
                        stage <= currentStage 
                          ? 'bg-purple-400 ring-2 ring-purple-300 ring-opacity-50' 
                          : 'bg-zinc-600'
                      } ${stage <= currentStage ? 'animate-pulse' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-[500px] rounded-lg bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm overflow-hidden relative p-4"
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs bg-zinc-800/80 hover:bg-zinc-700/80"
              >
                1H
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs bg-zinc-800/80 hover:bg-zinc-700/80"
              >
                1D
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs bg-zinc-800/80 hover:bg-zinc-700/80"
              >
                1W
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs bg-zinc-800/80 hover:bg-zinc-700/80"
              >
                1M
              </Button>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="#666" 
                  tick={{ fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                />
                <YAxis 
                  yAxisId="price"
                  stroke="#666" 
                  tick={{ fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  stroke="#666"
                  tick={{ fill: '#666' }}
                  tickLine={{ stroke: '#666' }}
                  axisLine={{ stroke: '#666' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#666' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'volume') return [`$${value.toLocaleString()}`, 'Volume'];
                    if (['open', 'close', 'high', 'low'].includes(name)) {
                      return [`$${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)];
                    }
                    if (name === 'ma7') return [`$${value.toLocaleString()}`, '7 MA'];
                    if (name === 'ma25') return [`$${value.toLocaleString()}`, '25 MA'];
                    return [value, name];
                  }}
                />

                {/* Volume bars */}
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  fill="rgba(255,255,255,0.1)"
                  opacity={0.3}
                />

                {/* Candlesticks */}
                <Scatter
                  yAxisId="price"
                  data={chartData}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const color = payload.close >= payload.open ? '#22c55e' : '#ef4444';
                    const height = Math.abs(
                      (payload.close - payload.open) * props.yAxis.scale.range()[0] / props.yAxis.scale.domain()[1]
                    );
                    
                    return (
                      <g>
                        {/* Wick */}
                        <line
                          x1={cx}
                          y1={(payload.high - payload.low) * props.yAxis.scale.range()[0] / props.yAxis.scale.domain()[1]}
                          x2={cx}
                          y2={cy + height/2}
                          stroke={color}
                          strokeWidth={1}
                        />
                        {/* Body */}
                        <rect
                          x={cx - 3}
                          y={cy - height/2}
                          width={6}
                          height={height}
                          fill={color}
                        />
                      </g>
                    );
                  }}
                />

                {/* Moving Averages */}
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma7"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={1}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma25"
                  stroke="#8b5cf6"
                  dot={false}
                  strokeWidth={1}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Tabs for Trade and Stake */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1">
              <TabsTrigger 
                value="trade"
                className={`rounded-md transition-all duration-300 ${
                  activeTab === 'trade' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Trade
              </TabsTrigger>
              <TabsTrigger 
                value="stake"
                className={`rounded-md transition-all duration-300 ${
                  activeTab === 'stake' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Stake
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trade" className="mt-4">
              {/* Trading Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-lg bg-gradient-to-br from-blue-900/50 to-blue-600/50 border border-blue-500/30 backdrop-blur-sm"
              >
                <div className="flex gap-2 mb-6">
                  <Button 
                    className={`flex-1 transform transition-all duration-300 hover:scale-[1.02] ${
                      tradeType === 'buy' 
                        ? 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300' 
                        : 'bg-zinc-800/50 border border-green-500/30'
                    }`}
                    onClick={() => setTradeType('buy')}
                  >
                    Buy
                  </Button>
                  <Button 
                    className={`flex-1 transform transition-all duration-300 hover:scale-[1.02] ${
                      tradeType === 'sell' 
                        ? 'bg-gradient-to-r from-red-600 to-red-400 hover:from-red-500 hover:to-red-300' 
                        : 'bg-zinc-800/50 border border-red-500/30'
                    }`}
                    onClick={() => setTradeType('sell')}
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-blue-500/20">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-blue-200">From</label>
                      <span className="text-sm text-blue-200">Balance: 0.00</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="flex-1 bg-zinc-800/50 border-blue-500/30 focus:border-blue-400 text-white placeholder-zinc-500"
                        placeholder="0.00"
                      />
                      <div className="flex items-center gap-2 bg-zinc-800/80 px-4 rounded-lg border border-blue-500/20">
                        <img 
                          src={tradeType === 'buy' ? '/sui-logo.png' : token.image} 
                          alt="token" 
                          className="w-5 h-5"
                        />
                        <span className="text-white font-medium">
                          {tradeType === 'buy' ? 'SUI' : token.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div className="flex justify-center">
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-400/30 border border-blue-400/30"
                      onClick={() => setTradeType(prev => prev === 'buy' ? 'sell' : 'buy')}
                    >
                      <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-blue-500/20">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-blue-200">To</label>
                      <span className="text-sm text-blue-200">Balance: 0.00</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        value={toAmount}
                        readOnly
                        className="flex-1 bg-zinc-800/50 border-blue-500/30 text-white placeholder-zinc-500"
                        placeholder="0.00"
                      />
                      <div className="flex items-center gap-2 bg-zinc-800/80 px-4 rounded-lg border border-blue-500/20">
                        <img 
                          src={tradeType === 'buy' ? token.image : '/sui-logo.png'} 
                          alt="token" 
                          className="w-5 h-5"
                        />
                        <span className="text-white font-medium">
                          {tradeType === 'buy' ? token.symbol : 'SUI'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full transform transition-all duration-300 hover:scale-[1.02] ${
                      !connected || !fromAmount
                        ? 'bg-zinc-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300'
                    }`}
                    disabled={!connected || !fromAmount}
                  >
                    {!connected ? 'Connect Wallet' : 'Swap'}
                  </Button>

                  {/* Exchange Rate */}
                  <div className="flex justify-between text-sm text-blue-200/80 px-1">
                    <span>Exchange Rate</span>
                    <span>1 {tradeType === 'buy' ? 'SUI' : token.symbol} = {token.price.toFixed(4)} {tradeType === 'buy' ? token.symbol : 'SUI'}</span>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="stake" className="mt-4">
              {/* Staking Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-lg bg-gradient-to-br from-purple-900/50 to-purple-600/50 border border-purple-500/30 backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">Amount to Stake</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        placeholder="Enter amount..."
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400">SUI</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">Staking Period</label>
                    <select
                      value={stakingPeriod}
                      onChange={(e) => setStakingPeriod(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="30">30 Days (25% APY)</option>
                      <option value="60">60 Days (35% APY)</option>
                      <option value="90">90 Days (45% APY)</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Estimated Rewards</span>
                      <span className="text-purple-400 font-bold">
                        {stakingAmount && !isNaN(Number(stakingAmount))
                          ? (Number(stakingAmount) * (Number(stakingPeriod) === 30 ? 0.25 : Number(stakingPeriod) === 60 ? 0.35 : 0.45) / 365 * Number(stakingPeriod)).toFixed(2)
                          : '0'} SUI
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-zinc-400">Unlock Date</span>
                      <span className="text-purple-400">
                        {new Date(Date.now() + Number(stakingPeriod) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowStakeModal(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white hover:from-purple-500 hover:to-purple-300 transition-all"
                    >
                      Stake Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Stake Confirmation Modal */}
      <AnimatePresence>
        {showStakeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Staking</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-white font-bold">{stakingAmount} SUI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Period</span>
                  <span className="text-white font-bold">{stakingPeriod} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">APY</span>
                  <span className="text-purple-400 font-bold">
                    {stakingPeriod === '30' ? '25%' : stakingPeriod === '60' ? '35%' : '45%'}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 px-6 py-3 bg-zinc-700 rounded-lg font-bold text-white hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle staking logic here
                    setShowStakeModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white hover:from-purple-500 hover:to-purple-300 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
 
   
       

        {/* Chat Interface */}
           <div className="space-y-6">
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-white mb-4">Token Assistant</h3>
          <div className="h-[300px] overflow-y-auto mb-4 space-y-4 bg-zinc-900/50 p-4 rounded-lg">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-purple-500/20 rounded-tr-none'
                      : 'bg-zinc-800/50 rounded-tl-none'
                  }`}
                >
                  <p className="text-white text-sm">{msg.content}</p>
                  <span className="text-xs text-zinc-500 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-zinc-700/50 border-zinc-600"
              placeholder="Ask about this token..."
            />
            <Button 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={handleSendMessage}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TokenView;