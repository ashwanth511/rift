import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CYBER_SYMBOLS = ['⚡', '🔮', '💠', '🎯', '🔋', '💫', '🌟', '🎮'];

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...CYBER_SYMBOLS, ...CYBER_SYMBOLS]
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(cardPairs);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
  };

  const handleCardClick = (clickedId: number) => {
    // Prevent clicking if two cards are already flipped or same card is clicked
    if (flippedCards.length === 2 || flippedCards.includes(clickedId)) return;

    // Prevent clicking matched cards
    if (cards[clickedId].isMatched) return;

    const newFlippedCards = [...flippedCards, clickedId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      // Check if cards match
      const [firstId, secondId] = newFlippedCards;
      if (cards[firstId].symbol === cards[secondId].symbol) {
        // Match found
        setCards(prev => prev.map((card, idx) =>
          idx === firstId || idx === secondId
            ? { ...card, isMatched: true }
            : card
        ));
        setMatches(prev => {
          const newMatches = prev + 1;
          if (newMatches === CYBER_SYMBOLS.length) {
            setGameComplete(true);
          }
          return newMatches;
        });
        setFlippedCards([]);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-4">Cyber Memory</h1>
            <p className="text-xl text-zinc-400">Test your memory in the digital realm</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <span className="text-zinc-400">Moves:</span>{' '}
            <span className="font-bold">{moves}</span>
          </div>
          <div className="text-white">
            <span className="text-zinc-400">Matches:</span>{' '}
            <span className="font-bold text-purple-400">{matches}/{CYBER_SYMBOLS.length}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white"
            onClick={initializeGame}
          >
            Reset Game
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4"
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square bg-zinc-800/50 border-2 ${
                card.isMatched
                  ? 'border-purple-500/50'
                  : 'border-zinc-700/50'
              } backdrop-blur-sm rounded-lg cursor-pointer flex items-center justify-center text-4xl
                ${card.isMatched || flippedCards.includes(card.id) ? 'flip' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              {(card.isMatched || flippedCards.includes(card.id)) && (
                <span className="transform transition-all duration-300">
                  {card.symbol}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-zinc-800/50 border border-purple-500/50 backdrop-blur-sm rounded-lg text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-2">🎉 Congratulations! 🎉</h2>
            <p className="text-zinc-400">
              You completed the game in {moves} moves!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white"
              onClick={initializeGame}
            >
              Play Again
            </motion.button>
          </motion.div>
        )}

        {/* Game Rules */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Game Rules</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>• Find matching pairs of cyber symbols</li>
            <li>• Click cards to reveal them</li>
            <li>• Match all pairs to win the game</li>
            <li>• Try to complete with minimum moves</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
