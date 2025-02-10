import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  traits: string[];
  psycheScore: number;
  battles: number;
  wins: number;
}

const dummyNFTs = [
  {
    id: "0x123456789",
    name: "Pikachu Agent",
    description: "An electric mouse agent with shocking abilities.",
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    traits: ["Electric", "Mouse", "Cute"],
    psycheScore: 89,
    battles: 45,
    wins: 38
  },
  {
    id: "0x987654321",
    name: "Charizard Agent",
    description: "A fire-breathing agent ready to incinerate the competition.",
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    traits: ["Fire", "Flying", "Lethal"],
    psycheScore: 92,
    battles: 32,
    wins: 29
  },
  {
    id: "0xabcdef123",
    name: "Blastoise Agent",
    description: "A water-type agent with powerful hydro cannons.",
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
    traits: ["Water", "Shell", "Tank"],
    psycheScore: 95,
    battles: 28,
    wins: 25
  },
  {
    id: "0x456def789",
    name: "Venusaur Agent",
    description: "A grass-type agent with poisonous vines and solar power.",
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    traits: ["Grass", "Poison", "Nature"],
    psycheScore: 88,
    battles: 52,
    wins: 41
  },
  {
    id: "0x789abc456",
    name: "Gengar Agent",
    description: "A ghost-type agent with spooky tricks and shadow powers.",
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
    traits: ["Ghost", "Poison", "Shadow"],
    psycheScore: 91,
    battles: 37,
    wins: 33
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCreateNFT = () => {
    navigate('/launch');
  };

  const handleStartBattle = () => {
    navigate('/battle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black mt-[5%] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your NFT Collection</h1>
            <p className="text-zinc-400">Create, battle, and trade your AI agents</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleCreateNFT}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create NFT
            </Button>
            <Button
              onClick={handleStartBattle}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Battle
            </Button>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyNFTs.map((nft) => (
            <Card 
              key={nft.id}
              className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-purple-600/20">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 rounded-full bg-purple-900/80 backdrop-blur-sm text-purple-200 text-sm border border-purple-500/30">
                    #{nft.id.slice(0, 6)}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                <p className="text-zinc-400 text-sm mb-4">{nft.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                    <div className="text-2xl font-bold text-purple-400">{nft.psycheScore}</div>
                    <div className="text-xs text-zinc-500">Psyche</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                    <div className="text-2xl font-bold text-blue-400">{nft.battles}</div>
                    <div className="text-xs text-zinc-500">Battles</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                    <div className="text-2xl font-bold text-green-400">{nft.wins}</div>
                    <div className="text-xs text-zinc-500">Wins</div>
                  </div>
                </div>

                {/* Traits */}
                <div className="flex flex-wrap gap-2">
                  {nft.traits.map((trait, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/20"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate(`/battle?nft=${nft.id}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Battle
                  </Button>
                  <Button
                    onClick={() => navigate(`/trade?nft=${nft.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Trade
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;