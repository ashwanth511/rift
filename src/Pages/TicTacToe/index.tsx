import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Square = 'X' | 'O' | null;

const TicTacToe = () => {
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const calculateWinner = (squares: Square[]): Square => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (squares[i] || calculateWinner(squares) || gameOver) return;

    const newSquares = squares.slice();
    newSquares[i] = isXNext ? 'X' : 'O';
    setSquares(newSquares);
    setIsXNext(!isXNext);

    if (calculateWinner(newSquares) || newSquares.every(square => square !== null)) {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
  };

  const winner = calculateWinner(squares);
  const status = winner
    ? `Winner: ${winner}`
    : gameOver
    ? 'Game Over - Draw!'
    : `Next player: ${isXNext ? 'X' : 'O'}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      <div className="max-w-lg mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-4">Cyber Tic-Tac-Toe</h1>
            <p className="text-xl text-zinc-400">Battle for supremacy in the digital grid</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="text-2xl text-white mb-6 text-center">{status}</div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {squares.map((square, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-24 bg-zinc-700/50 rounded-lg text-4xl font-bold text-white hover:bg-purple-600/30 transition-colors"
                onClick={() => handleClick(i)}
              >
                {square}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg font-bold text-white"
            onClick={resetGame}
          >
            Reset Game
          </motion.button>
        </motion.div>

        {/* Game Stats */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Game Rules</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>• Players take turns placing X or O on the grid</li>
            <li>• First to get 3 in a row (horizontal, vertical, or diagonal) wins</li>
            <li>• If all squares are filled with no winner, it's a draw</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
