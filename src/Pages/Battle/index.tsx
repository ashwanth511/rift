import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [messages, setMessages] = useState<{sender: string, message: string}[]>([]);
  const [selectedAgent1, setSelectedAgent1] = useState<string>('');
  const [selectedAgent2, setSelectedAgent2] = useState<string>('');
  const [showAgentSelect1, setShowAgentSelect1] = useState(false);
  const [showAgentSelect2, setShowAgentSelect2] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const agents = [
    { id: '1', name: 'Shadow Walker', type: 'Stealth', psychScore: 85, image: '/agents/shadow.png' },
    { id: '2', name: 'Neural Knight', type: 'Combat', psychScore: 92, image: '/agents/knight.png' },
    { id: '3', name: 'Data Witch', type: 'Hacker', psychScore: 88, image: '/agents/witch.png' },
    { id: '4', name: 'Quantum Ghost', type: 'Infiltrator', psychScore: 95, image: '/agents/ghost.png' },
  ];

  const handleSendMessage = () => {
    setMessages([...messages, { sender: 'user', message: newMessage }]);
    setNewMessage('');
  };

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
                  <img 
                    src={selectedAgent1 ? agents.find(a => a.id === selectedAgent1)?.image : '/agents/default.png'} 
                    alt="Selected Agent 1" 
                    className="w-12 h-12 rounded-lg ring-2 ring-purple-500/50"
                  />
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
                    className="flex items-center gap-4 p-4 hover:bg-purple-600/20 cursor-pointer transition-all duration-200"
                  >
                    <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-lg ring-2 ring-purple-500/50" />
                    <div>
                      <h4 className="font-bold text-white">{agent.name}</h4>
                      <p className="text-sm text-purple-300">{agent.type}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${agent.psychScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-300">{agent.psychScore} PSI</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Left Agent Image */}
          {selectedAgent1 && (
            <div className="mt-8">
              <div className="relative group">
                <img 
                  src={agents.find(a => a.id === selectedAgent1)?.image} 
                  alt="Agent 1" 
                  className="w-full h-96 object-cover rounded-lg ring-2 ring-purple-500/50 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {agents.find(a => a.id === selectedAgent1)?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-zinc-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full animate-pulse"
                        style={{ width: `${agents.find(a => a.id === selectedAgent1)?.psychScore}%` }}
                      />
                    </div>
                    <span className="text-sm text-purple-300">
                      {agents.find(a => a.id === selectedAgent1)?.psychScore} PSI
                    </span>
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

          {/* Chat Interface */}
          <div className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-purple-600/40 ml-12'
                          : 'bg-zinc-700/40 mr-12'
                      } backdrop-blur-sm p-4 rounded-lg relative group transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-3">
                        {msg.sender !== 'user' && (
                          <img
                            src={agents.find(a => a.id === selectedAgent1)?.image || '/agents/default.png'}
                            alt="Agent"
                            className="w-8 h-8 rounded-lg ring-2 ring-purple-500/50"
                          />
                        )}
                        <div>
                          <div className="text-sm text-zinc-400 mb-1">
                            {msg.sender === 'user' ? 'You' : agents.find(a => a.id === selectedAgent1)?.name || 'Agent'}
                          </div>
                          <p className="text-white">{msg.message}</p>
                          <div className="text-xs text-zinc-500 mt-1">
                            {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`absolute top-0 ${
                          msg.sender === 'user' ? '-right-2' : '-left-2'
                        } h-full w-2 bg-gradient-to-b from-purple-500/50 to-transparent`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="w-full bg-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg py-3 px-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
                  <img 
                    src={selectedAgent2 ? agents.find(a => a.id === selectedAgent2)?.image : '/agents/default.png'} 
                    alt="Selected Agent 2" 
                    className="w-12 h-12 rounded-lg ring-2 ring-cyan-500/50"
                  />
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
                    className="flex items-center gap-4 p-4 hover:bg-cyan-600/20 cursor-pointer transition-all duration-200"
                  >
                    <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-lg ring-2 ring-cyan-500/50" />
                    <div>
                      <h4 className="font-bold text-white">{agent.name}</h4>
                      <p className="text-sm text-cyan-300">{agent.type}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${agent.psychScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-300">{agent.psychScore} PSI</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Agent Image */}
          {selectedAgent2 && (
            <div className="mt-8">
              <div className="relative group">
                <img 
                  src={agents.find(a => a.id === selectedAgent2)?.image} 
                  alt="Agent 2" 
                  className="w-full h-96 object-cover rounded-lg ring-2 ring-cyan-500/50 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1 text-right">
                    {agents.find(a => a.id === selectedAgent2)?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-cyan-300">
                      {agents.find(a => a.id === selectedAgent2)?.psychScore} PSI
                    </span>
                    <div className="h-2 flex-1 bg-zinc-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full animate-pulse"
                        style={{ width: `${agents.find(a => a.id === selectedAgent2)?.psychScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default BattlePage;