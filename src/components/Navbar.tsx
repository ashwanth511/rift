import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import './wallet-button.css';
import { useWallet } from '@suiet/wallet-kit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { connected, disconnect } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold text-white">Pikamoon</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/battle')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Battle
              </button>
              <button 
                onClick={() => navigate('/launch-token')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Launch Token
              </button>
            </div>
          </div>

          {/* Wallet and Profile */}
          <div className="flex items-center space-x-4">
            <ConnectButton className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-sm" />
            
            {connected && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-white hover:text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border border-zinc-800">
                  <DropdownMenuItem 
                    className="text-white hover:bg-zinc-800 cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white hover:bg-zinc-800 cursor-pointer"
                    onClick={() => navigate('/settings')}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white hover:bg-zinc-800 cursor-pointer"
                    onClick={() => {
                      disconnect?.();
                    }}
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;