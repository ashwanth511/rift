import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BattleCard {
  id: string;
  name: string;
  power: number;
  stake: string;
  image: string;
  timeLeft: string;
}

const mockBattles: BattleCard[] = [
  {
    id: '1',
    name: 'Pikachu vs Charizard',
    power: 2500,
    stake: '1000 PKMN',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    timeLeft: '2h 15m'
  },
  {
    id: '2',
    name: 'Mewtwo vs Dragonite',
    power: 3200,
    stake: '2500 PKMN',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    timeLeft: '45m'
  }
];

const BattleCard = ({ battle }: { battle: BattleCard }) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-6">
          <img 
            src={battle.image}
            alt={battle.name}
            className="w-20 h-20 object-contain filter brightness-0 invert opacity-80"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{battle.name}</h3>
                <p className="text-zinc-400">Power Level: {battle.power}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">{battle.stake}</p>
                <p className="text-zinc-400">{battle.timeLeft} left</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Button 
                className="bg-zinc-800 hover:bg-zinc-700 text-white flex-1 py-6"
              >
                Join Battle
              </Button>
              <Button 
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800 flex-1 py-6"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Battle = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mt-[5%] mb-8">
          <h1 className="text-4xl font-bold text-white">Battle Arena</h1>
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-6 text-lg"
          >
            Create Battle
          </Button>
        </div>

        <div className="space-y-4">
          {mockBattles.map(battle => (
            <BattleCard key={battle.id} battle={battle} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-zinc-400 mb-2">Total Battles</h3>
            <p className="text-3xl font-bold text-white">1,234</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-zinc-400 mb-2">Total Staked</h3>
            <p className="text-3xl font-bold text-white">500,000 PKMN</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-zinc-400 mb-2">Active Battles</h3>
            <p className="text-3xl font-bold text-white">25</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Battle;