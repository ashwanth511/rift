import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@suiet/wallet-kit';
import { useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import './wallet-button.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaHome, FaGamepad, FaCoins, FaExchangeAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const { connected, disconnect, account } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold text-white">Rift</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/battle')}
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Battle Arena
              </button>
              <button 
                onClick={() => navigate('/launch')}
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Launch Token
              </button>
              <button 
                onClick={() => navigate('/game')}
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Game
              </button>
              <button 
                onClick={() => navigate('/trading')}
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Trading
              </button>

            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {connected ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity">
                  {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-900 border border-zinc-800">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-zinc-800">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={disconnect} className="text-red-400 hover:bg-zinc-800">
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="wallet-adapter-dropdown">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;