import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1118] text-gray-200 relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[128px]" />

      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center">
        <div className="max-w-[1600px] mx-auto px-4 z-10">
          <div className="max-w-2xl relative">
            {/* Decorative element */}
            <div className="absolute -left-8 top-0 w-2 h-32 bg-gradient-to-b from-blue-500 to-purple-500" />
            
            <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
              Trade Pokemon Tokens
            </h1>
            <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
              The first decentralized platform for Pokemon-inspired token trading and battles. 
              Join the revolution in digital collectibles.
            </p>
            <div className="flex gap-6">
              <Button 
                onClick={() => navigate('/launch-token')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 text-lg rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                Launch Token
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-2 border-blue-400/20 text-blue-400 hover:bg-blue-400/10 px-10 py-7 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Explore Tokens
              </Button>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg">
                <h3 className="text-3xl font-bold text-blue-400">500+</h3>
                <p className="text-gray-400">Active Tokens</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg">
                <h3 className="text-3xl font-bold text-purple-400">10K+</h3>
                <p className="text-gray-400">Daily Trades</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg">
                <h3 className="text-3xl font-bold text-blue-400">$2M+</h3>
                <p className="text-gray-400">Total Volume</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;