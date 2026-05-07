import React from 'react';
import { motion } from 'motion/react';
import { Brain, Hash, Zap, Users, Trophy, Play, Star, Clock, Infinity, Skull, Map as MapIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const games = [
  {
    id: 'sudoku',
    title: 'Sudoku Static',
    description: 'Populate grid vectors with unique integers. Avoid collision in local clusters.',
    icon: Hash,
    color: 'from-blue-500 to-cyan-500',
    path: '/games/sudoku',
    difficulty: 'Tier 1-3'
  },
  {
    id: 'math',
    title: 'Arithmetic Duel',
    description: 'High-frequency computational challenges. Optimized for neural speed.',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    path: '/games/math',
    difficulty: 'Dynamic'
  },
  {
    id: 'riddles',
    title: 'Neural Enigmas',
    description: 'Semantic logic puzzles. Decipher non-linear linguistic structures.',
    icon: Brain,
    color: 'from-purple-500 to-indigo-600',
    path: '/games/riddles',
    difficulty: 'Tier 1-3'
  },
];

export const Home = () => {
  const [selectedMode, setSelectedMode] = React.useState('standard');

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter mb-2">NEURAL ARCHIVE</h1>
          <p className="text-zinc-500 text-sm">Select a logic module to initialize cognitive training.</p>
        </div>
        <div className="flex gap-2 hidden sm:flex">
          <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-xs font-bold flex flex-col items-center">
            <span className="text-[9px] opacity-50 uppercase tracking-widest">Active</span>
            <span className="text-emerald-400">Stable</span>
          </div>
          <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-xs font-bold flex flex-col items-center">
            <span className="text-[9px] opacity-50 uppercase tracking-widest">Users</span>
            <span>+1,2k</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="geometric-card flex flex-col group h-full"
          >
            <div className={`aspect-video bg-zinc-800 relative flex items-center justify-center p-4`}>
              <div className="absolute inset-0 bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
              <div className={cn(
                "w-16 h-16 rounded-sm rotate-45 flex items-center justify-center bg-gradient-to-br shadow-xl transition-all group-hover:rotate-0",
                game.color
              )}>
                <game.icon className="w-8 h-8 text-white -rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">{game.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 flex-1">{game.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{game.difficulty}</span>
                </div>
                <Link 
                  to={`${game.path}?mode=${selectedMode}`}
                  className="geometric-btn flex items-center gap-2"
                >
                  Initialize <Play className="w-3 h-3 fill-current" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold italic uppercase tracking-tighter border-l-4 border-indigo-500 pl-4">Operational Modes</h2>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">Current Filter: {selectedMode}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'standard', title: 'Standard Sync', desc: 'Baseline diagnostic protocol.', icon: Play, color: 'text-zinc-100', border: 'border-zinc-800' },
            { id: 'time', title: 'Time Attack', desc: 'Max efficiency under strict windows.', icon: Clock, color: 'text-amber-400', border: 'border-amber-500/20' },
            { id: 'infinite', title: 'Infinite Loop', desc: 'No terminal state. Pure persistence.', icon: Infinity, color: 'text-emerald-400', border: 'border-emerald-500/20' },
            { id: 'hardcore', title: 'Hardcore', desc: 'Zero tolerance for computation errors.', icon: Skull, color: 'text-rose-500', border: 'border-rose-500/20' },
            { id: 'story', title: 'Story Mode', desc: 'Neural narrative progression [SECURE].', icon: MapIcon, color: 'text-indigo-400', border: 'border-indigo-500/20', path: '/story' },
          ].map((mode) => (
            mode.id === 'story' ? (
              <Link
                key={mode.id}
                to="/story"
                className={cn(
                  "geometric-card p-6 group cursor-pointer transition-all text-left w-full border-indigo-500/20 hover:bg-zinc-900/80"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <mode.icon className={cn("w-6 h-6", mode.color)} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-indigo-500 transition-colors"></div>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1">{mode.title}</h3>
                <p className="text-[10px] text-zinc-500 italic leading-relaxed">{mode.desc}</p>
              </Link>
            ) : (
              <button 
                key={mode.id} 
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  "geometric-card p-6 group cursor-pointer transition-all text-left w-full", 
                  mode.border,
                  selectedMode === mode.id ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50" : "hover:bg-zinc-900/80"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <mode.icon className={cn("w-6 h-6", mode.color)} />
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    selectedMode === mode.id ? "bg-indigo-500 animate-ping" : "bg-zinc-800 group-hover:bg-indigo-500"
                  )}></div>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1">{mode.title}</h3>
                <p className="text-[10px] text-zinc-500 italic leading-relaxed">{mode.desc}</p>
              </button>
            )
          ))}
        </div>
      </section>

      <section className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-indigo-500/20 -translate-y-8 translate-x-8 rounded-tr-[40px] pointer-events-none"></div>
        <div className="space-y-4 max-w-xl">
          <h2 className="text-3xl font-bold italic tracking-tighter">GLOBAL MATCHMAKING</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Synchronize your cognitive patterns with other logicians across the neural net. 
            Ranked multiplayer sessions are active. No latency, pure logic.
          </p>
          <div className="flex gap-3">
            <Link to="/multiplayer" className="geometric-btn">Join Arena</Link>
            <Link to="/leaderboard" className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-6 py-2 rounded uppercase tracking-tighter transition-all">View Hierarchy</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/50 border border-white/5">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-indigo-500 flex items-center justify-center text-[8px] font-bold">U{i}</div>
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 italic">+128 active</span>
        </div>
      </section>
    </div>
  );
};
