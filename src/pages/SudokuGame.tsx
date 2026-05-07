import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, RotateCcw, CheckCircle2, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Basic Sudoku Generator/Validator logic
const isValid = (board: number[][], row: number, col: number, num: number) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

// Simple solver to generate valid boards
const solve = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard') => {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  // Randomly fill some cells
  for (let i = 0; i < 10; i++) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    const v = Math.floor(Math.random() * 9) + 1;
    if (isValid(board, r, c, v)) board[r][c] = v;
  }
  solve(board);
  const solution = board.map(row => [...row]);
  
  const clues = { easy: 45, medium: 35, hard: 25 }[difficulty];
  const puzzle = board.map(row => [...row]);
  let removed = 81 - clues;
  while (removed > 0) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed--;
    }
  }
  return { puzzle, solution };
};

export const SudokuGame = () => {
  const { profile } = useAuth();
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [startTime, setStartTime] = useState<number>(0);

  const startNewGame = (diff: 'easy' | 'medium' | 'hard' = difficulty) => {
    const { puzzle, solution } = generateSudoku(diff);
    setBoard(puzzle);
    setInitialBoard(puzzle.map(r => [...r]));
    setSolution(solution);
    setWon(false);
    setSelected(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (initialBoard[r][c] === 0) {
      setSelected([r, c]);
    }
  };

  const setNumber = (num: number) => {
    if (!selected || won) return;
    const [r, c] = selected;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Check if complete
    if (newBoard.flat().every(v => v !== 0)) {
      const isCorrect = newBoard.every((row, ri) => 
        row.every((val, ci) => val === solution[ri][ci])
      );
      if (isCorrect) handleWin();
    }
  };

  const handleWin = async () => {
    setWon(true);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    if (profile) {
      const xpGain = { easy: 50, medium: 100, hard: 200 }[difficulty];
      await updateDoc(doc(db, 'users', profile.uid), {
        'stats.xp': increment(xpGain),
        'stats.wins': increment(1),
        'stats.gamesPlayed': increment(1)
      });

      // Record score for leaderboard
      await addDoc(collection(db, 'scores'), {
        userId: profile.uid,
        username: profile.username,
        gameType: 'sudoku',
        score: xpGain,
        difficulty,
        timeTaken,
        timestamp: serverTimestamp()
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter">SUDOKU CLASSIC</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Category: Logic Grid • Daily Challenge</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); startNewGame(d); }}
              className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all border ${
                difficulty === d ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-8 flex flex-col items-center lg:items-start">
          <div className="relative group">
            <div className="grid grid-cols-9 bg-zinc-800 border-4 border-zinc-800 rounded shadow-2xl relative z-10 w-full max-w-[450px] aspect-square">
              {board.map((row, ri) => (
                row.map((val, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => handleCellClick(ri, ci)}
                    className={`
                      flex items-center justify-center text-xl font-mono transition-all border border-zinc-900
                      ${initialBoard[ri][ci] !== 0 ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-950 text-indigo-400 font-bold'}
                      ${selected?.[0] === ri && selected?.[1] === ci ? 'bg-indigo-500/20 ring-2 ring-inset ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}
                      ${ri % 3 === 2 && ri !== 8 ? 'border-b-4 border-b-zinc-800' : ''}
                      ${ci % 3 === 2 && ci !== 8 ? 'border-r-4 border-r-zinc-800' : ''}
                      hover:bg-zinc-800/50 cursor-pointer
                    `}
                  >
                    {val !== 0 ? val : ''}
                  </div>
                ))
              ))}
            </div>
            <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-9 gap-3 w-full max-w-[450px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                disabled={won}
                onClick={() => setNumber(n)}
                className="aspect-square rounded border border-zinc-800 bg-zinc-900 text-zinc-100 font-mono font-bold text-lg hover:border-indigo-500 hover:text-indigo-400 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="geometric-card p-6 space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold italic">Game Context</h3>
            <div className="space-y-4 text-xs leading-relaxed text-zinc-400">
              <p>Initialize your grid by populating empty sectors with unique integers [1-9]. Collision in any vector (X, Y) or local cluster (3x3) will invalidate the sequence.</p>
              <div className="flex justify-between items-center py-3 border-y border-zinc-800">
                <span className="uppercase tracking-widest">Rewards</span>
                <span className="text-indigo-400 font-mono">+{ {easy: 50, medium: 100, hard: 200}[difficulty] } XP</span>
              </div>
            </div>
            
            <div className="p-4 rounded bg-zinc-800/50 border border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm rotate-45 bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Trophy className="w-5 h-5 text-amber-500 -rotate-45" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black italic">Efficiency Score</p>
                  <p className="text-xl font-black text-white">{profile?.stats.xp} XP</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => startNewGame()}
              className="w-full geometric-btn flex items-center justify-center gap-2 py-3"
            >
              <RotateCcw className="w-4 h-4" /> Reset Grid
            </button>
          </section>

          <AnimatePresence>
            {won && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded p-6 text-center space-y-3"
              >
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm font-bold uppercase tracking-widest">Sequence Validated</span>
                </div>
                <p className="text-xs text-emerald-300 opacity-80">Cognitive pattern successfully mapped. XP awarded.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
};
