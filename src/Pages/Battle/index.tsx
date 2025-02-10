import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-hot-toast';
import axios from 'axios';

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

const BattlePage = () => {
  const [psychScore1, setPsychScore1] = useState(75);
  const [psychScore2, setPsychScore2] = useState(65);
  const [messages, setMessages] = useState<{sender: string, message: string, type?: 'system' | 'battle'}[]>([]);
  const [selectedAgent1, setSelectedAgent1] = useState<string>('');
  const [selectedAgent2, setSelectedAgent2] = useState<string>('');
  const [showAgentSelect1, setShowAgentSelect1] = useState(false);
  const [showAgentSelect2, setShowAgentSelect2] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [selectedWinner, setSelectedWinner] = useState<'1'|'2'|''>('');
  const [isBattling, setIsBattling] = useState(false);
  const [battleTimeLeft, setBattleTimeLeft] = useState(60);
  const [battleInterval, setBattleInterval] = useState<NodeJS.Timer | null>(null);
  const [isProcessingBet, setIsProcessingBet] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const BETTING_POOL_ID = "0x9735239a8d93d543a2fbe46c5c7641ce6f45dece1dce7d51d292a468457fb7aa";
  const LIQUIDITY_POOL_ID = "0x5c1ccd52c25d3bb378c5823dd38801f4ff8eef896c98571be7df6acc64ab2414";

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (battleInterval) {
        clearInterval(battleInterval);
      }
    };
  }, [battleInterval]);

  const handlePlaceBet = async () => {
    try {
      if (!selectedWinner || !betAmount || !selectedAgent1 || !selectedAgent2) {
        toast.error('Please select agents, winner, and bet amount');
        return;
      }

      setIsProcessingBet(true);

      // First approve RIFT token spending
      const approveTx = await window.suiWallet.signAndExecuteTransactionBlock({
        transactionBlock: {
          kind: "moveCall",
          target: `${import.meta.env.VITE_RIFT_PACKAGE_ID}::rift_token::approve`,
          arguments: [
            BETTING_POOL_ID,
            betAmount
          ],
        }
      });

      // Then place bet
      const betTx = await window.suiWallet.signAndExecuteTransactionBlock({
        transactionBlock: {
          kind: "moveCall",
          target: `${import.meta.env.VITE_RIFT_PACKAGE_ID}::rift_token::place_bet`,
          arguments: [
            BETTING_POOL_ID,
            LIQUIDITY_POOL_ID,
            selectedAgent1,
            selectedAgent2,
            selectedWinner,
            betAmount
          ],
        }
      });

      toast.success('Bet placed successfully!');
      setMessages(prev => [...prev, {
        sender: 'system',
        message: `Bet placed: ${betAmount} RIFT on Agent ${selectedWinner}`,
        type: 'system'
      }]);
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setIsProcessingBet(false);
    }
  };

  const startBattle = async () => {
    if (!selectedAgent1 || !selectedAgent2) {
      toast.error('Please select both agents');
      return;
    }

    setIsBattling(true);
    setBattleTimeLeft(60);

    const agent1 = agents.find(a => a.id === selectedAgent1);
    const agent2 = agents.find(a => a.id === selectedAgent2);

    setMessages(prev => [...prev, {
      sender: 'system',
      message: `⚔️ Battle Started: ${agent1?.name} vs ${agent2?.name}`,
      type: 'system'
    }]);

    // Initialize battle with Atoma API
    const response = await axios.post('https://api.atoma.network/v1/chat/completions', {
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'system',
          content: `You are simulating a battle between two AI agents:
            Agent 1: ${agent1?.name} (${agent1?.type})
            Agent 2: ${agent2?.name} (${agent2?.type})
            
            Generate exciting battle commentary. Each message should be a short action sequence.
            Include psyche score impacts in your responses.
            Format: [Action] (Score Impact)`
        },
        {
          role: 'user',
          content: 'Start the battle with an opening move.'
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_ATOMASDK_BEARER_AUTH}`,
        'Content-Type': 'application/json'
      }
    });

    // Update battle state every second
    const interval = setInterval(async () => {
      setBattleTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBattling(false);
          determineBattleWinner();
          return 0;
        }

        // Generate new battle action every 5 seconds
        if (prev % 5 === 0) {
          generateBattleAction(agent1!, agent2!);
        }
        
        // Update psyche scores based on latest action
        setPsychScore1(prev => Math.max(0, Math.min(100, prev + Math.random() * 10 - 5)));
        setPsychScore2(prev => Math.max(0, Math.min(100, prev + Math.random() * 10 - 5)));
        
        return prev - 1;
      });
    }, 1000);

    setBattleInterval(interval);
  };

  const generateBattleAction = async (agent1: any, agent2: any) => {
    try {
      const response = await axios.post('https://api.atoma.network/v1/chat/completions', {
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'Generate a single battle action between the agents. Keep it short and impactful.'
          },
          {
            role: 'user',
            content: `${agent1.name} (${psychScore1}%) vs ${agent2.name} (${psychScore2}%)`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_ATOMASDK_BEARER_AUTH}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages(prev => [...prev, {
        sender: 'battle',
        message: response.data.choices[0].message.content,
        type: 'battle'
      }]);
    } catch (error) {
      console.error('Error generating battle action:', error);
    }
  };

  const determineBattleWinner = async () => {
    const winner = psychScore1 > psychScore2 ? '1' : '2';
    const winnerAgent = agents.find(a => a.id === (winner === '1' ? selectedAgent1 : selectedAgent2));
    
    setMessages(prev => [...prev, {
      sender: 'system',
      message: `🏆 Battle Ended! ${winnerAgent?.name} is victorious!`,
      type: 'system'
    }]);

    // Call contract to resolve bets
    try {
      const resolveTx = await window.suiWallet.signAndExecuteTransactionBlock({
        transactionBlock: {
          kind: "moveCall",
          target: `${import.meta.env.VITE_RIFT_PACKAGE_ID}::rift_token::resolve_battle`,
          arguments: [
            BETTING_POOL_ID,
            LIQUIDITY_POOL_ID,
            selectedAgent1,
            selectedAgent2,
            winner
          ],
        }
      });

      toast.success(`Battle ended! ${winnerAgent?.name} wins!`);
    } catch (error) {
      console.error('Error resolving battle:', error);
      toast.error('Failed to resolve battle');
    }
  };

  const agents = [
    { id: '1', name: 'Shadow Walker', type: 'Stealth', psychScore: 85, traits: ['Stealth', 'Agility', 'Deception'] },
    { id: '2', name: 'Neural Knight', type: 'Combat', psychScore: 92, traits: ['Strength', 'Defense', 'Leadership'] },
    { id: '3', name: 'Data Witch', type: 'Hacker', psychScore: 88, traits: ['Intelligence', 'Magic', 'Technology'] },
    { id: '4', name: 'Quantum Ghost', type: 'Infiltrator', psychScore: 95, traits: ['Speed', 'Invisibility', 'Quantum'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black mt-[5%] p-6">
      {/* Top VS Section */}
      <div className="relative mb-12">
        <div className="flex justify-center items-center">
          {/* VS Trapezoid */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-[4%] -translate-y-1/2 z-20">
            <div className="bg-gradient-to-r from-red-600/80 to-purple-600/80 backdrop-blur-sm p-4 transform skew-x-12 border border-purple-500/30">
              <div className="transform -skew-x-12">
                <span className="text-4xl font-bold text-white px-8">VS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Progress */}
      {isBattling && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="h-2 bg-zinc-800 rounded-full">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${psychScore1}%` }}
                  />
                </div>
                <p className="text-sm text-purple-300 mt-1">Agent 1 Psyche: {Math.round(psychScore1)}%</p>
              </div>
              <div className="mx-8">
                <span className="text-2xl font-bold text-white">{battleTimeLeft}s</span>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-zinc-800 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${psychScore2}%` }}
                  />
                </div>
                <p className="text-sm text-blue-300 mt-1 text-right">Agent 2 Psyche: {Math.round(psychScore2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-6">
        {/* Left Agent Selection */}
        <div className="col-span-2">
          <div 
            onClick={() => setShowAgentSelect1(!showAgentSelect1)}
            className="relative cursor-pointer group"
          >
            {/* Left Trapezoid */}
            <div className="relative z-10 bg-gradient-to-r from-purple-900/80 to-purple-600/80 backdrop-blur-sm p-4 transform -skew-x-12 hover:from-purple-800/90 hover:to-purple-500/90 transition-all duration-300 border border-purple-500/30">
              <div className="transform skew-x-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg ring-2 ring-purple-500/50 bg-purple-800/50 flex items-center justify-center text-2xl font-bold">
                    {selectedAgent1 ? agents.find(a => a.id === selectedAgent1)?.name[0] : '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedAgent1 ? agents.find(a => a.id === selectedAgent1)?.name : 'Select Agent 1'}
                    </h3>
                    <p className="text-sm text-purple-300">
                      {selectedAgent1 ? agents.find(a => a.id === selectedAgent1)?.type : 'Choose your fighter'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent selection dropdown */}
            {showAgentSelect1 && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-800/90 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-xl z-20">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent1(agent.id);
                      setShowAgentSelect1(false);
                    }}
                    className="p-4 hover:bg-purple-600/20 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg ring-2 ring-purple-500/50 bg-purple-800/50 flex items-center justify-center text-2xl font-bold">
                        {agent.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{agent.name}</h4>
                        <p className="text-sm text-purple-300">{agent.type}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {agent.traits.map((trait, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/20"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Left Agent Stats */}
          {selectedAgent1 && (
            <div className="mt-8">
              <div className="relative group">
                <div className="w-full h-96 bg-gradient-to-br from-purple-900/20 to-purple-600/20 rounded-lg ring-2 ring-purple-500/50 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {agents.find(a => a.id === selectedAgent1)?.name}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-purple-300 mb-1">Psyche Score</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-zinc-900/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full animate-pulse"
                            style={{ width: `${agents.find(a => a.id === selectedAgent1)?.psychScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-purple-300">
                          {agents.find(a => a.id === selectedAgent1)?.psychScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 mb-2">Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {agents.find(a => a.id === selectedAgent1)?.traits.map((trait, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 text-sm rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/20"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Chat Section */}
        <div className="col-span-3 space-y-4">
          {/* Progress Bar */}
          <div className="mb-8 mt-[8%]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-400">Battle Progress</span>
             
            </div>
            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full w-2/3  bg-gradient-to-r from-purple-600 to-purple-400 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Battle Chat */}
          <div className="mt-8 max-w-4xl mx-auto">
            <Card className="bg-zinc-900 border-zinc-800">
              <div className="p-6">
                <div 
                  ref={chatContainerRef}
                  className="h-[400px] bg-zinc-800/50 rounded-lg p-4 overflow-y-auto space-y-4 mb-4"
                >
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg ${
                        msg.type === 'system' 
                          ? 'bg-purple-900/30 text-purple-200'
                          : msg.type === 'battle'
                          ? 'bg-red-900/30 text-red-200'
                          : 'bg-zinc-700'
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}
                  {isBattling && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <div className="animate-pulse">●</div>
                      <span>Battle in progress...</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Agent Selection */}
        <div className="col-span-2">
          <div 
            onClick={() => setShowAgentSelect2(!showAgentSelect2)}
            className="relative cursor-pointer group"
          >
            {/* Right Trapezoid */}
            <div className="relative z-10 bg-gradient-to-r from-cyan-900/80 to-cyan-600/80 backdrop-blur-sm p-4 transform skew-x-12 hover:from-cyan-800/90 hover:to-cyan-500/90 transition-all duration-300 border border-cyan-500/30">
              <div className="transform -skew-x-12">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white text-right">
                      {selectedAgent2 ? agents.find(a => a.id === selectedAgent2)?.name : 'Select Agent 2'}
                    </h3>
                    <p className="text-sm text-cyan-300 text-right">
                      {selectedAgent2 ? agents.find(a => a.id === selectedAgent2)?.type : 'Choose your opponent'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg ring-2 ring-cyan-500/50 bg-cyan-800/50 flex items-center justify-center text-2xl font-bold">
                    {selectedAgent2 ? agents.find(a => a.id === selectedAgent2)?.name[0] : '?'}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent selection dropdown */}
            {showAgentSelect2 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-800/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-xl z-20">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent2(agent.id);
                      setShowAgentSelect2(false);
                    }}
                    className="p-4 hover:bg-cyan-600/20 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg ring-2 ring-cyan-500/50 bg-cyan-800/50 flex items-center justify-center text-2xl font-bold">
                        {agent.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{agent.name}</h4>
                        <p className="text-sm text-cyan-300">{agent.type}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {agent.traits.map((trait, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 text-xs rounded-full bg-cyan-900/30 text-cyan-300 border border-cyan-500/20"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Agent Stats */}
          {selectedAgent2 && (
            <div className="mt-8">
              <div className="relative group">
                <div className="w-full h-96 bg-gradient-to-br from-cyan-900/20 to-cyan-600/20 rounded-lg ring-2 ring-cyan-500/50 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4 text-right">
                    {agents.find(a => a.id === selectedAgent2)?.name}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-cyan-300 mb-1">Psyche Score</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-cyan-300">
                          {agents.find(a => a.id === selectedAgent2)?.psychScore}%
                        </span>
                        <div className="h-2 flex-1 bg-zinc-900/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full animate-pulse"
                            style={{ width: `${agents.find(a => a.id === selectedAgent2)?.psychScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-cyan-300 mb-2">Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {agents.find(a => a.id === selectedAgent2)?.traits.map((trait, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 text-sm rounded-full bg-cyan-900/30 text-cyan-300 border border-cyan-500/20"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Betting Section */}
      <div className="mt-8 max-w-md mx-auto">
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Place Your Bet</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isBattling ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm text-zinc-400">
                  {isBattling ? 'Battle in Progress' : 'Ready for Battle'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Select Winner</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={selectedWinner === '1' ? 'default' : 'outline'}
                  onClick={() => setSelectedWinner('1')}
                  className={selectedWinner === '1' ? 'bg-purple-600' : ''}
                  disabled={!selectedAgent1 || isBattling}
                >
                  Agent 1
                </Button>
                <Button
                  variant={selectedWinner === '2' ? 'default' : 'outline'}
                  onClick={() => setSelectedWinner('2')}
                  className={selectedWinner === '2' ? 'bg-blue-600' : ''}
                  disabled={!selectedAgent2 || isBattling}
                >
                  Agent 2
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Bet Amount (RIFT)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-zinc-800 border-zinc-700"
                disabled={isBattling}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handlePlaceBet}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!selectedWinner || !betAmount || isBattling || isProcessingBet}
              >
                {isProcessingBet ? 'Processing...' : 'Place Bet'}
              </Button>
              <Button
                onClick={startBattle}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!selectedAgent1 || !selectedAgent2 || isBattling}
              >
                {isBattling ? `Battle in Progress (${battleTimeLeft}s)` : 'Start Battle'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BattlePage;