import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Square = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

const TicTacToe = () => {
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  const calculateWinner = (board: Square[]): Square | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const isBoardFull = (board: Square[]): boolean => {
    return board.every(square => square !== null);
  };

  // Minimax algorithm for AI moves
  const minimax = (board: Square[], depth: number, isMaximizing: boolean): number => {
    const winner = calculateWinner(board);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = (board: Square[]): number => {
    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const makeAIMove = async (currentBoard: Square[]) => {
    setIsThinking(true);
    
    // Add a small delay to make AI move feel more natural
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Find and make the best move
    const bestMove = findBestMove(currentBoard);
    const newSquares = currentBoard.map((square, index) => 
      index === bestMove ? 'O' : square
    );
    
    // Update the board with AI's move
    setSquares(newSquares);
    setIsThinking(false);

    // Check if AI won
    const winner = calculateWinner(newSquares);
    if (winner) {
      setGameStatus('lost');
      setAiScore(prev => prev + 1);
      return;
    }

    // Check for draw
    if (isBoardFull(newSquares)) {
      setGameStatus('draw');
    }
  };

  const handleClick = async (i: number) => {
    // Don't allow moves if square is filled, game is over, or AI is thinking
    if (squares[i] || gameStatus !== 'playing' || isThinking) return;

    // Create a new array with the player's move
    const newSquares = squares.map((square, index) => 
      index === i ? 'X' : square
    );
    
    // Update the board with player's move
    setSquares(newSquares);

    // Check if player won
    const winner = calculateWinner(newSquares);
    if (winner) {
      setGameStatus('won');
      setPlayerScore(prev => prev + 1);
      return;
    }

    // Check for draw
    if (isBoardFull(newSquares)) {
      setGameStatus('draw');
      return;
    }

    // AI's turn
    await makeAIMove(newSquares);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setGameStatus('playing');
    setIsThinking(false);
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'won':
        return '🎉 You Won! 🎉';
      case 'lost':
        return '💔 AI Won!';
      case 'draw':
        return '🤝 It\'s a Draw!';
      default:
        return isThinking ? 'AI is thinking...' : 'Your Turn (X)';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-6">
      <div className="max-w-lg mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-4">Cyber Tic-Tac-Toe</h1>
            <p className="text-xl text-zinc-400">Challenge the AI in this classic game</p>
          </div>
        </div>

        {/* Score Board */}
        <div className="flex justify-between mb-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-4">
          <div className="text-center">
            <p className="text-zinc-400">You (X)</p>
            <p className="text-2xl font-bold text-purple-400">{playerScore}</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-400">AI (O)</p>
            <p className="text-2xl font-bold text-cyan-400">{aiScore}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="text-2xl text-white mb-6 text-center">{getStatusMessage()}</div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {squares.map((square, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-24 bg-zinc-700/50 rounded-lg text-4xl font-bold transition-colors
                  ${square === 'X' ? 'text-purple-400' : 'text-cyan-400'}
                  ${!square && gameStatus === 'playing' && !isThinking ? 'hover:bg-purple-600/30' : ''}
                  ${isThinking ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleClick(i)}
                disabled={isThinking}
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
            New Game
          </motion.button>
        </motion.div>

        {/* Game Rules */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Game Rules</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>• You play as X, AI plays as O</li>
            <li>• Get three in a row to win</li>
            <li>• AI uses advanced strategy</li>
            <li>• First to move has advantage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
