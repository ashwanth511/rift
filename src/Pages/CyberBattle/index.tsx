import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Character {
  name: string;
  health: number;
  energy: number;
  shield: number;
}

interface Move {
  name: string;
  damage: number;
  energyCost: number;
  type: 'attack' | 'defense' | 'special';
  description: string;
}

const MOVES: Move[] = [
  {
    name: '🗡️ Cyber Strike',
    damage: 20,
    energyCost: 15,
    type: 'attack',
    description: 'A quick attack with moderate damage'
  },
  {
    name: '🛡️ Digital Shield',
    damage: -15, // Negative damage means healing/shield
    energyCost: 20,
    type: 'defense',
    description: 'Boost your shield and recover some health'
  },
  {
    name: '⚡ Neural Surge',
    damage: 35,
    energyCost: 40,
    type: 'special',
    description: 'Powerful attack with high energy cost'
  },
  {
    name: '🔋 Recharge',
    damage: 0,
    energyCost: -30, // Negative cost means energy gain
    type: 'defense',
    description: 'Skip turn to restore energy'
  }
];

const CyberBattle = () => {
  const [player, setPlayer] = useState<Character>({
    name: 'Player',
    health: 100,
    energy: 100,
    shield: 0
  });

  const [ai, setAi] = useState<Character>({
    name: 'AI',
    health: 100,
    energy: 100,
    shield: 0
  });

  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [message, ...prev].slice(0, 5));
  };

  const calculateDamage = (move: Move, attacker: Character, defender: Character): number => {
    let finalDamage = move.damage;
    
    // If it's a healing/shield move
    if (move.damage < 0) {
      return finalDamage;
    }

    // Reduce damage based on defender's shield
    if (defender.shield > 0) {
      finalDamage = Math.max(0, finalDamage - defender.shield);
    }

    return finalDamage;
  };

  const applyMove = (move: Move, attacker: Character, defender: Character, isPlayer: boolean) => {
    const damage = calculateDamage(move, attacker, defender);
    
    if (isPlayer) {
      // Update AI state
      setAi(prev => ({
        ...prev,
        health: move.type === 'attack' ? Math.max(0, prev.health - damage) : prev.health,
        shield: move.type === 'defense' ? Math.max(0, prev.shield - damage) : prev.shield
      }));
      
      // Update player state
      setPlayer(prev => ({
        ...prev,
        energy: Math.min(100, prev.energy - move.energyCost),
        shield: move.type === 'defense' ? prev.shield + Math.abs(damage) : prev.shield
      }));

      addToBattleLog(`Player used ${move.name}${damage ? ` dealing ${damage} damage!` : ''}`);
    } else {
      // Update player state
      setPlayer(prev => ({
        ...prev,
        health: move.type === 'attack' ? Math.max(0, prev.health - damage) : prev.health,
        shield: move.type === 'defense' ? Math.max(0, prev.shield - damage) : prev.shield
      }));
      
      // Update AI state
      setAi(prev => ({
        ...prev,
        energy: Math.min(100, prev.energy - move.energyCost),
        shield: move.type === 'defense' ? prev.shield + Math.abs(damage) : prev.shield
      }));

      addToBattleLog(`AI used ${move.name}${damage ? ` dealing ${damage} damage!` : ''}`);
    }
  };

  const aiSelectMove = (): Move => {
    const availableMoves = MOVES.filter(move => move.energyCost <= ai.energy);
    
    if (availableMoves.length === 0) {
      return MOVES[3]; // Recharge if no moves available
    }

    // If health is low, prioritize defense
    if (ai.health < 30 && ai.energy >= 20) {
      const defenseMoves = availableMoves.filter(move => move.type === 'defense');
      if (defenseMoves.length > 0) {
        return defenseMoves[Math.floor(Math.random() * defenseMoves.length)];
      }
    }

    // If energy is low, consider recharging
    if (ai.energy < 30) {
      return MOVES[3];
    }

    // If player health is low, prioritize attacks
    if (player.health < 30 && ai.energy >= 40) {
      const attackMoves = availableMoves.filter(move => move.type === 'attack' || move.type === 'special');
      if (attackMoves.length > 0) {
        return attackMoves[Math.floor(Math.random() * attackMoves.length)];
      }
    }

    // Otherwise, choose randomly from available moves
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handlePlayerMove = (move: Move) => {
    if (!isPlayerTurn || gameStatus !== 'playing' || player.energy < move.energyCost) return;

    // Apply player's move
    applyMove(move, player, ai, true);
    setIsPlayerTurn(false);

    // Check if player won
    if (ai.health <= 0) {
      setGameStatus('won');
      setPlayerScore(prev => prev + 1);
      return;
    }

    // AI turn
    setTimeout(() => {
      const aiMove = aiSelectMove();
      applyMove(aiMove, ai, player, false);
      
      // Check if AI won
      if (player.health <= 0) {
        setGameStatus('lost');
        setAiScore(prev => prev + 1);
      } else {
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setPlayer({
      name: 'Player',
      health: 100,
      energy: 100,
      shield: 0
    });
    setAi({
      name: 'AI',
      health: 100,
      energy: 100,
      shield: 0
    });
    setGameStatus('playing');
    setBattleLog([]);
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-4">Cyber Battle</h1>
            <p className="text-xl text-zinc-400">Strategic combat in the digital realm</p>
          </div>
        </div>

        {/* Score Board */}
        <div className="flex justify-between mb-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="text-center">
            <p className="text-zinc-400">Player</p>
            <p className="text-2xl font-bold text-purple-400">{playerScore}</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-400">AI</p>
            <p className="text-2xl font-bold text-cyan-400">{aiScore}</p>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-800/50 border border-purple-500/30 backdrop-blur-sm rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Player</h2>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-400 mb-2">Health</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${player.health}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{player.health}/100</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-2">Energy</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${player.energy}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{player.energy}/100</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-2">Shield</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-300"
                    style={{ width: `${player.shield}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{player.shield}</p>
              </div>
            </div>
          </motion.div>

          {/* AI Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-800/50 border border-cyan-500/30 backdrop-blur-sm rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">AI</h2>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-400 mb-2">Health</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${ai.health}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{ai.health}/100</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-2">Energy</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${ai.energy}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{ai.energy}/100</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-2">Shield</p>
                <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-300"
                    style={{ width: `${ai.shield}%` }}
                  />
                </div>
                <p className="text-right text-zinc-400 mt-1">{ai.shield}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Battle Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Battle Log</h3>
          <div className="space-y-2">
            {battleLog.map((log, index) => (
              <p key={index} className="text-zinc-400">{log}</p>
            ))}
          </div>
        </motion.div>

        {/* Game Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {MOVES.map((move, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg backdrop-blur-sm font-bold text-white text-center
                ${isPlayerTurn && gameStatus === 'playing' && player.energy >= move.energyCost
                  ? 'bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300'
                  : 'bg-zinc-800/50 cursor-not-allowed'}`}
              onClick={() => handlePlayerMove(move)}
              disabled={!isPlayerTurn || gameStatus !== 'playing' || player.energy < move.energyCost}
            >
              <div className="text-2xl mb-2">{move.name.split(' ')[0]}</div>
              <div className="text-sm">{move.name.split(' ').slice(1).join(' ')}</div>
              <div className="text-xs mt-2 text-zinc-300">
                {move.energyCost > 0 ? `Energy: ${move.energyCost}` : 'Recharge'}
              </div>
              <div className="text-xs mt-1 text-zinc-300">
                {move.type.charAt(0).toUpperCase() + move.type.slice(1)}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Game Status and Reset */}
        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl font-bold mb-4">
              {gameStatus === 'won' ? (
                <span className="text-purple-400">🎉 Victory! 🎉</span>
              ) : (
                <span className="text-red-400">💔 Defeated!</span>
              )}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white"
              onClick={resetGame}
            >
              Play Again
            </motion.button>
          </motion.div>
        )}

        {/* Game Rules */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Battle Rules</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>• Take turns using different moves against the AI</li>
            <li>• Each move costs energy - manage it wisely</li>
            <li>• Use shields to reduce incoming damage</li>
            <li>• Recharge when low on energy</li>
            <li>• Reduce opponent's health to 0 to win</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CyberBattle;
