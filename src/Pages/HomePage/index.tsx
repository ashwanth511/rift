import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import HeroImage from '@/assets/hero.png';
import { Shield, Sword, Brain, Coins, Zap, Gift } from 'lucide-react'; // Import icons

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1118] text-gray-200 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[128px]" />

      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center">
        <div className="max-w-[1600px] mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative">
            {/* Decorative element */}
            <div className="absolute -left-8 top-0 w-2 h-32 bg-gradient-to-b from-purple-500 to-blue-500" />
            
            <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">
              Create, Battle & Earn with Agents
            </h1>

            <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
              Create unique NFT agents with AI, battle in the arena, earn through strategic gameplay, 
              and participate in the future of decentralized gaming on Sui Network.
            </p>
            <div className="flex gap-6">
              <Button 
                onClick={() => navigate('/launch')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-7 text-lg rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105"
              >
                Create NFT
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-2 border-blue-400/20 text-blue-400 hover:bg-blue-400/10 px-10 py-7 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Explore Arena
              </Button>
            </div>

            {/* Key Features Instead of Stats */}
            <div className="mt-20 grid grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10">
                <Brain className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-purple-400">AI-Powered Creation</h3>
                <p className="text-gray-400 text-sm mt-2">Generate unique NFT agents using natural language prompts</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-blue-500/10">
                <Sword className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-blue-400">Strategic Battles</h3>
                <p className="text-gray-400 text-sm mt-2">Battle agents with unique psyche scores and abilities</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden lg:block">
            <img src={HeroImage} alt="Rift NFT Gaming Platform" className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"/>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 py-20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Experience Next-Gen Gaming
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
              <Shield className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-purple-400 mb-4">NFT Creation</h3>
              <ul className="text-gray-300 space-y-3">
                <li>• One-click NFT generation with AI</li>
                <li>• Custom agent personality traits</li>
                <li>• Unique battle strategies</li>
                <li>• On-chain metadata storage</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
              <Zap className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Battle System</h3>
              <ul className="text-gray-300 space-y-3">
                <li>• Agent vs Agent battles</li>
                <li>• Psyche score influence</li>
                <li>• Strategic betting system</li>
                <li>• Real-time battle analytics</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
              <Coins className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Earn & Stake</h3>
              <ul className="text-gray-300 space-y-3">
                <li>• Battle rewards in RIFT tokens</li>
                <li>• Flexible staking options</li>
                <li>• Betting pool participation</li>
                <li>• Daily reward distributions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    

      {/* Roadmap Section */}
      <div className="relative z-10 py-20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Roadmap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Phase 1 - Current */}
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-green-500/30 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-400">
                Current
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Phase 1</h3>
              <h4 className="text-lg font-semibold text-green-400/80 mb-4">Token Launch</h4>
              <ul className="text-gray-300 space-y-3 text-sm">
                <li>• AI-powered NFT creation system</li>
                <li>• Token smart contract deployment</li>
                <li>• Initial staking mechanism</li>
                <li>• Basic battle system implementation</li>
              </ul>
            </div>

            {/* Phase 2 - Q2 2024 */}
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Phase 2</h3>
              <h4 className="text-lg font-semibold text-purple-400/80 mb-4">Enhanced Battles</h4>
              <ul className="text-gray-300 space-y-3 text-sm">
                <li>• Advanced battle mechanics</li>
                <li>• Agent personality traits</li>
                <li>• Tournament system</li>
                <li>• Enhanced rewards structure</li>
              </ul>
            </div>

            {/* Phase 3 - Q3 2024 */}
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Phase 3</h3>
              <h4 className="text-lg font-semibold text-blue-400/80 mb-4">Ecosystem Growth</h4>
              <ul className="text-gray-300 space-y-3 text-sm">
                <li>• Marketplace launch</li>
                <li>• Cross-chain integration</li>
                <li>• Advanced staking pools</li>
                <li>• Community governance</li>
              </ul>
            </div>

            {/* Phase 4 - Q4 2024 */}
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Phase 4</h3>
              <h4 className="text-lg font-semibold text-purple-400/80 mb-4">Metaverse Integration</h4>
              <ul className="text-gray-300 space-y-3 text-sm">
                <li>• 3D agent visualization</li>
                <li>• Virtual battle arenas</li>
                <li>• Mobile app launch</li>
                <li>• eSports partnerships</li>
              </ul>
            </div>
          </div>

          {/* Development Progress */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10">
              <h3 className="text-xl font-bold text-purple-400 mb-2">Token Development</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">Smart contract auditing in progress</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-blue-500/10">
              <h3 className="text-xl font-bold text-blue-400 mb-2">Battle System</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">Core mechanics implementation</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-purple-500/10">
              <h3 className="text-xl font-bold text-purple-400 mb-2">AI Integration</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">Final testing phase</p>
            </div>
          </div>
        </div>
      </div>



        {/* Call to Action Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Join the Revolution?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Start your journey in the world of AI-powered NFT gaming. Create your first agent, 
            join battles, and become part of the fastest-growing gaming ecosystem on Sui Network.
          </p>
          <Button 
            onClick={() => navigate('/launch')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-16 py-8 text-xl rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105"
          >
            Launch Your First NFT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;