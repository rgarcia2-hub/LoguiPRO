import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Timer, Brain, Trophy, ArrowLeft, RefreshCcw, Clock, Infinity as InfinityIcon, Skull, Map as MapIcon, Play } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Question {
  text: string;
  answer: number;
}

export const MathGame = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get('mode') || 'standard';

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [question, setQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [maxTime, setMaxTime] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);
  const [correctFlash, setCorrectFlash] = useState(false);

  const getModeData = () => {
    switch (gameMode) {
      case 'time': return { title: 'Time Attack', icon: Clock, color: 'text-amber-400' };
      case 'infinite': return { title: 'Infinite Loop', icon: InfinityIcon, color: 'text-emerald-400' };
      case 'hardcore': return { title: 'Hardcore', icon: Skull, color: 'text-rose-500' };
      case 'story': return { title: 'Story Mode', icon: MapIcon, color: 'text-indigo-400' };
      default: return { title: 'Standard Sync', icon: Play, color: 'text-zinc-100' };
    }
  };

  const modeData = getModeData();

  const generateQuestion = useCallback(() => {
    const level = score + 1;
    let n1 = 0, n2 = 0, op = '+';
    const ops = difficulty === 'easy' ? ['+', '-'] : difficulty === 'medium' ? ['+', '-', '*'] : ['+', '-', '*', '/'];
    op = ops[Math.floor(Math.random() * ops.length)];

    if (difficulty === 'easy') {
      n1 = Math.floor(Math.random() * 20) + 1;
      n2 = Math.floor(Math.random() * 20) + 1;
    } else if (difficulty === 'medium') {
      n1 = Math.floor(Math.random() * 50) + 1;
      n2 = Math.floor(Math.random() * 50) + 1;
    } else {
      n1 = Math.floor(Math.random() * 100) + 1;
      n2 = Math.floor(Math.random() * 100) + 1;
    }

    if (op === '/') {
      // Ensure integer division
      n2 = Math.floor(Math.random() * 12) + 2;
      n1 = n2 * (Math.floor(Math.random() * 12) + 1);
    }

    if (op === '*') {
      if (difficulty === 'medium') {
        n1 = Math.floor(Math.random() * 12) + 2;
        n2 = Math.floor(Math.random() * 10) + 2;
      } else {
        n1 = Math.floor(Math.random() * 20) + 2;
        n2 = Math.floor(Math.random() * 15) + 2;
      }
    }

    let ans = 0;
    if (op === '+') ans = n1 + n2;
    if (op === '-') {
      if (n1 < n2) [n1, n2] = [n2, n1];
      ans = n1 - n2;
    }
    if (op === '*') ans = n1 * n2;
    if (op === '/') ans = n1 / n2;
    
    setQuestion({ text: `${n1} ${op.replace('*', '×').replace('/', '÷')} ${n2}`, answer: ans });
  }, [score, difficulty]);

  const startGame = (diff: 'easy' | 'medium' | 'hard' = difficulty) => {
    setDifficulty(diff);
    setScore(0);
    
    let initialTime = 30;
    if (gameMode === 'time') initialTime = 15;
    if (gameMode === 'hardcore') initialTime = 10;
    if (gameMode === 'infinite') initialTime = 9999;
    
    setTimeLeft(initialTime);
    setMaxTime(initialTime);
    setGameState('PLAYING');
    setUserInput('');
    setStartTime(Date.now());
    generateQuestion();
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0 && gameMode !== 'infinite') {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING' && gameMode !== 'infinite') {
      finishGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, gameMode]);

  const finishGame = async () => {
    setGameState('FINISHED');
    const xpPerCorrect = { easy: 10, medium: 20, hard: 40 }[difficulty];
    const totalXP = score * xpPerCorrect;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    if (profile) {
      await updateDoc(doc(db, 'users', profile.uid), {
        'stats.xp': increment(totalXP),
        'stats.gamesPlayed': increment(1)
      });

      await addDoc(collection(db, 'scores'), {
        userId: profile.uid,
        username: profile.username,
        gameType: 'math',
        score: totalXP,
        difficulty,
        timeTaken,
        timestamp: serverTimestamp()
      });
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (question && parseInt(val) === question.answer) {
      setScore(prev => prev + 1);
      setUserInput('');
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 200);
      generateQuestion();
      
      // Mode based rewards
      if (gameMode === 'standard') {
        setTimeLeft(prev => Math.min(prev + 2, 30));
      } else if (gameMode === 'hardcore') {
        setTimeLeft(10); // Reset in hardcore
      }
    } else if (val.length >= String(question?.answer || '').length && gameMode === 'hardcore') {
      if (parseInt(val) !== question?.answer) {
        finishGame();
      }
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
            <div className="flex items-center gap-2 mb-1">
              <modeData.icon className={cn("w-4 h-4", modeData.color)} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest italic", modeData.color)}>{modeData.title}</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Arithmetic Duel</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Category: Computational Speed • Neural Sync</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); if (gameState === 'PLAYING') startGame(d); }}
              className={cn(
                "px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all border",
                difficulty === d 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      {gameState === 'IDLE' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="w-32 h-32 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8">
            <Zap className="w-16 h-16 text-white -rotate-45" />
          </div>
          <div className="text-center max-w-lg space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Initialize Processor?</h2>
            <p className="text-sm text-zinc-500 leading-relaxed uppercase tracking-tighter">
              A continuous stream of arithmetic problems will be projected. 
              Each valid computation extends your operational window. 
              Efficiency is mandatory.
            </p>
          </div>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button 
                key={d}
                onClick={() => startGame(d)}
                className={cn(
                  "px-8 py-3 rounded text-sm font-bold uppercase transition-all tracking-tighter",
                  d === 'easy' ? "geometric-btn" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                )}
              >
                {d === 'easy' ? 'Start Easy' : d === 'medium' ? 'Medium Mode' : 'Hard Protocol'}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <div className="geometric-card p-12 flex flex-col items-center justify-center space-y-12 relative overflow-hidden group min-h-[400px]">
            <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <div className="flex flex-col items-center group relative z-10">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] italic mb-4">ACTIVE COMPUTATION</span>
              <div className={cn(
                "text-7xl font-black italic tracking-tighter transition-colors tabular-nums text-white",
                correctFlash && "text-emerald-400"
              )}>
                {question?.text} = ?
              </div>
            </div>

            <div className="w-full max-w-xs space-y-4 relative z-10">
              <input
                autoFocus
                type="number"
                value={userInput}
                onChange={handleInput}
                className="w-full bg-zinc-950 border-4 border-zinc-800 p-6 rounded-sm text-4xl font-black italic tracking-tighter focus:border-indigo-500 transition-all outline-none text-center"
                placeholder="..."
              />
              <p className="text-center text-[10px] font-black uppercase text-zinc-500 italic">Valid input expected</p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="geometric-card p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-zinc-500 italic tracking-widest leading-none">Thermal Buffer</span>
                  <span className={`font-mono text-lg font-black italic leading-none ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                    {timeLeft}s
                  </span>
                </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / maxTime) * 100}%` }}
                      className={cn(
                        "h-full transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                        timeLeft < maxTime * 0.3 ? 'bg-rose-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="p-4 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase font-black italic mb-1">Score</p>
                  <p className="text-2xl font-black italic tracking-tighter text-white">{score}</p>
                </div>
                <div className="p-4 rounded bg-zinc-900 border border-zinc-800 text-center">
                  <p className="text-[9px] text-zinc-500 uppercase font-black italic mb-1">Multiplier</p>
                  <p className="text-2xl font-black italic tracking-tighter text-indigo-400">x{Math.floor(score/5) + 1}</p>
                </div>
              </div>

              <button 
                onClick={() => setGameState('IDLE')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-black py-3 rounded uppercase tracking-widest transition-all"
              >
                Abort Session
              </button>
            </div>
          </aside>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="w-32 h-32 bg-indigo-500/20 border-4 border-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-2xl mb-8">
            <Trophy className="w-16 h-16 text-indigo-400 -rotate-45" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] italic">Session Terminated</h2>
            <p className="text-5xl font-black italic tracking-tighter text-white uppercase">{score} Aciertos</p>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Efficiency Points Awarded: {score * 10} XP</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => startGame(difficulty)}
              className="geometric-btn px-8"
            >
              Re-Initialize
            </button>
            <Link 
              to="/leaderboard"
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-8 py-4 rounded uppercase tracking-tighter transition-all"
            >
              Hierarchy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
