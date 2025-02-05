import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface TokenCard {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  image: string;
}

const generateMiniChartData = () => {
  const data = [];
  let price = 100;
  
  for (let i = 0; i < 20; i++) {
    price = price + (Math.random() - 0.5) * 10;
    data.push({ value: price });
  }
  
  return data;
};

const mockTokens: TokenCard[] = [
  {
    id: '1',
    name: 'Pikachu Token',
    symbol: 'PIKA',
    price: 0.05,
    change24h: 12.5,
    marketCap: '$1.2M',
    volume: '$250K',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  },
  {
    id: '2',
    name: 'Charizard Token',
    symbol: 'CHAR',
    price: 2.45,
    change24h: -3.2,
    marketCap: '$5.6M',
    volume: '$890K',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
  },
  // Add more mock tokens as needed
];

const TokenCard = ({ token }: { token: TokenCard }) => {
  const navigate = useNavigate();
  const chartData = generateMiniChartData();
  const isPositiveChange = token.change24h >= 0;

  const handleTokenClick = () => {
    navigate(`/token-view/${token.id}`);
  };

  return (
    <Card 
      className="relative overflow-hidden  group hover:scale-[1.02] transition-all duration-300 bg-zinc-900 border-[#00B4FF] cursor-pointer flex flex-row"
      onClick={handleTokenClick}
    >
      <div className="p-6 relative  z-10 flex-1">
        <div className="flex items-start gap-6">
          <img 
            src={token.image} 
            alt={token.name}
            className="w-16 h-16 object-contain filter brightness-0 invert opacity-80"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{token.name}</h3>
                <p className="text-zinc-400 text-sm">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">${token.price.toLocaleString()}</p>
                <p className={`text-sm font-medium ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositiveChange ? '+' : ''}{token.change24h}%
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-white">Market Cap</span>
                <span className="text-white font-medium">{token.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-white">Volume (24h)</span>
                <span className="text-white font-medium">{token.volume}</span>
              </div>
 
            </div>
          
          </div>
        </div>
      </div>
      <div className="flex-none h-full w-40 mt-4 flex items-center justify-center">
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${token.id}`} x1="100" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositiveChange ? '#22c55e' : '#ef4444'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositiveChange ? '#22c55e' : '#ef4444'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositiveChange ? '#22c55e' : '#ef4444'}
                fill={`url(#gradient-${token.id})`}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold mt-[5%] mb-8 text-blue-500">
          Dashboard
        </h1>

        <Tabs defaultValue="pool" className="w-full">
          <TabsList className="w-full bg-zinc-900 p-1 rounded-xl mb-8 border border-zinc-800">
            <TabsTrigger 
              value="pool" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-500 rounded-lg transition-all"
            >
              Tokens in Pool
            </TabsTrigger>
            <TabsTrigger 
              value="listed" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-500 rounded-lg transition-all"
            >
              Listed Tokens
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-500 rounded-lg transition-all"
            >
              Newly Launched
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pool" className="mt-0 space-y-4">
            {mockTokens.map(token => (
              <TokenCard key={token.id} token={token} />
            ))}
          </TabsContent>

          <TabsContent value="listed" className="mt-0 space-y-4">
            {mockTokens.map(token => (
              <TokenCard key={token.id} token={token} />
            ))}
          </TabsContent>

          <TabsContent value="new" className="mt-0 space-y-4">
            {mockTokens.map(token => (
              <TokenCard key={token.id} token={token} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;