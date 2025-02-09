import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  rewards: {
    xp: number;
    tokens: number;
    items?: string[];
  };
  type: 'battle' | 'quest' | 'tournament';
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
}

const GamePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'battle' | 'quest' | 'tournament'>('all');
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const navigate = useNavigate();

  const games: Game[] = [
    {
      id: '1',
      title: 'Cyber Arena Battle',
      description: 'Battle against other players using your cyber agents in real-time combat',
      image: '/games/battle.jpg',
      rewards: {
        xp: 500,
        tokens: 100,
        items: ['Rare Agent Skin', 'Power Core']
      },
      type: 'battle',
      difficulty: 'medium',
      timeEstimate: '10-15 min'
    },
    {
      id: '2',
      title: 'Neural Quest',
      description: 'Complete missions in the virtual world to earn rewards and level up your agents',
      image: '/games/quest.jpg',
      rewards: {
        xp: 300,
        tokens: 50,
        items: ['Agent Module', 'Energy Cell']
      },
      type: 'quest',
      difficulty: 'easy',
      timeEstimate: '5-10 min'
    },
    {
      id: '3',
      title: 'Grand Cyber Tournament',
      description: 'Join the weekly tournament to compete for massive rewards and glory',
      image: '/games/tournament.jpg',
      rewards: {
        xp: 1000,
        tokens: 500,
        items: ['Legendary Agent', 'Tournament Trophy']
      },
      type: 'tournament',
      difficulty: 'hard',
      timeEstimate: '30-45 min'
    },
    {
      id: '4',
      title: 'Cyber Tic-Tac-Toe',
      description: 'Classic game reinvented for the digital age. Challenge your strategic thinking!',
      image: '/games/tictactoe.jpg',
      rewards: {
        xp: 200,
        tokens: 50,
        items: ['Strategic Mind Badge']
      },
      type: 'battle',
      difficulty: 'easy',
      timeEstimate: '5-10 min'
    },
    {
      id: '5',
      title: 'Cyber Memory',
      description: 'Test your memory skills by matching cyber symbols in this engaging puzzle game',
      image: '/games/memory.jpg',
      rewards: {
        xp: 300,
        tokens: 75,
        items: ['Memory Master Badge', 'Focus Boost']
      },
      type: 'quest',
      difficulty: 'medium',
      timeEstimate: '10-15 min'
    }
  ];

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.type === selectedCategory);

  const getDifficultyColor = (difficulty: Game['difficulty']) => {
    switch(difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      {/* Header Section */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-4">Cyber Games Hub</h1>
          <p className="text-xl text-zinc-400">Battle, Quest, and Earn in the Digital Realm</p>
        </div>
      </div>

      {/* Game Categories */}
      <div className="flex gap-4 mb-8">
        {['all', 'battle', 'quest', 'tournament'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            className={`px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category
                ? 'bg-purple-600/50 text-white'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <motion.div
            key={game.id}
            className="relative group"
            onHoverStart={() => setHoveredGame(game.id)}
            onHoverEnd={() => setHoveredGame(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            
            <div className="relative bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg overflow-hidden">
              {/* Game Image */}
              <div className="relative h-48">
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Game Type Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    game.type === 'battle' ? 'bg-red-500/50' :
                    game.type === 'quest' ? 'bg-green-500/50' :
                    'bg-yellow-500/50'
                  }`}>
                    {game.type}
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-zinc-400 mb-4">{game.description}</p>

                {/* Game Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-zinc-500">Difficulty</span>
                    <p className={`font-bold ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Time</span>
                    <p className="font-bold text-white">{game.timeEstimate}</p>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-400">Rewards</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">🏆</span>
                      <span className="text-white">{game.rewards.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">💎</span>
                      <span className="text-white">{game.rewards.tokens} Tokens</span>
                    </div>
                  </div>
                  {game.rewards.items && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {game.rewards.items.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Play Button */}
                <button 
                  onClick={() => {
                    if (game.id === '4') navigate('/tictactoe');
                    else if (game.id === '5') navigate('/memory');
                  }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white transform transition-all duration-300 hover:scale-[1.02] hover:from-purple-500 hover:to-purple-300"
                >
                  Play Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-2">Your Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Games Played</span>
              <span className="text-white font-bold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Win Rate</span>
              <span className="text-green-400 font-bold">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Earnings</span>
              <span className="text-purple-400 font-bold">2,450 Tokens</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-2">Leaderboard</h3>
          <div className="space-y-2">
            {[
              { name: 'CyberKing', score: '12,450' },
              { name: 'NeuralNinja', score: '10,280' },
              { name: 'QuantumQueen', score: '9,870' }
            ].map((player, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{index + 1}.</span>
                  <span className="text-white">{player.name}</span>
                </div>
                <span className="text-purple-400 font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-2">Upcoming Events</h3>
          <div className="space-y-4">
            {[
              { name: 'Weekly Tournament', time: '2d 14h' },
              { name: 'Special Quest Event', time: '5d 8h' },
              { name: 'Battle Royale', time: '1w 2d' }
            ].map((event, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-zinc-400">{event.name}</span>
                <span className="text-yellow-400 font-bold">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;