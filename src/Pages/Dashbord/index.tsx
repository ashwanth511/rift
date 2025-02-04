import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

interface TokenCard {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
  marketCap: string;
  volume: string;
}

const mockTokens: TokenCard[] = [
  {
    id: '1',
    name: 'Pikachu Token',
    symbol: 'PIKA',
    price: 0.05,
    change24h: 12.5,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    marketCap: '$1.2M',
    volume: '$250K'
  },
  {
    id: '2',
    name: 'Charizard Token',
    symbol: 'CHAR',
    price: 2.45,
    change24h: -3.2,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
    marketCap: '$5.6M',
    volume: '$890K'
  },
  // Add more mock tokens as needed
];

const TokenCard = ({ token }: { token: TokenCard }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 bg-zinc-900 border-zinc-800 cursor-pointer"
      onClick={() => navigate(`/token/${token.id}`)}
    >
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-6">
          <img 
            src={token.image} 
            alt={token.name}
            className="w-20 h-20 object-contain filter brightness-0 invert opacity-80"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{token.name}</h3>
                <p className="text-zinc-400">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">${token.price}</p>
                <p className={`text-sm font-medium ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Market Cap</span>
                <span className="text-white font-medium">{token.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Volume (24h)</span>
                <span className="text-white font-medium">{token.volume}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold mt-[5%] mb-8 text-white">
          Dashboard
        </h1>

        <Tabs defaultValue="pool" className="w-full">
          <TabsList className="w-full bg-zinc-900 p-1 rounded-xl mb-8 border border-zinc-800">
            <TabsTrigger 
              value="pool" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"
            >
              Tokens in Pool
            </TabsTrigger>
            <TabsTrigger 
              value="listed" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"
            >
              Listed Tokens
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="w-1/3 py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"
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