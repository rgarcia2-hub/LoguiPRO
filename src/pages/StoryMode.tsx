import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Map as MapIcon, ChevronRight, Lock, Unlock, Play, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Level {
  id: number;
  title: string;
  description: string;
  type: 'math' | 'sudoku' | 'riddles';
  unlocked: boolean;
  completed: boolean;
  dialogue: string;
}

export const StoryMode = () => {
  const { profile } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showDialogue, setShowDialogue] = useState(true);

  const [levels, setLevels] = useState<Level[]>([
    {
      id: 1,
      title: 'Neural Initialization',
      description: 'The first step into the MindMaster OS. Baseline calibration.',
      type: 'math',
      unlocked: true,
      completed: false,
      dialogue: "Welcome, Operator. Your neural signature has been detected. System OS 1.0 is online. We need to verify your basic computation cycles before proceeding to deeper layers."
    },
    {
      id: 2,
      title: 'Logic Patterning',
      description: 'Stabilizing the grid clusters. Structural integrity check.',
      type: 'sudoku',
      unlocked: false,
      completed: false,
      dialogue: "Impressive. Your computational latency is within acceptable parameters. Now, we must analyze your ability to maintain structural logic in complex grids. The Archive expects perfection."
    },
    {
      id: 3,
      title: 'Semantic Decryption',
      description: 'Interpreting non-linear linguistic anomalies.',
      type: 'riddles',
      unlocked: false,
      completed: false,
      dialogue: "Final stage of Phase 1. You are nearing the core of the MindMaster hierarchy. Linguistic anomalies have been detected. Decrypt them to achieve full system synchronization."
    }
  ]);

  const activeLevel = levels.find(l => l.id === currentLevel);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest italic">Protocol: Narrative</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Story Mode</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Phase 1: The Initialization</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12">
        {/* Level List */}
        <aside className="space-y-4">
          {levels.map((level) => (
            <div 
              key={level.id}
              onClick={() => level.unlocked && setCurrentLevel(level.id)}
              className={cn(
                "geometric-card p-4 flex items-center gap-4 transition-all relative overflow-hidden group",
                !level.unlocked ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:bg-zinc-900",
                currentLevel === level.id ? "border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-500/10" : ""
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-sm rotate-45 flex items-center justify-center border-2 transition-transform",
                currentLevel === level.id ? "border-indigo-500 rotate-0" : "border-zinc-800"
              )}>
                {level.completed ? (
                  <Trophy className="w-6 h-6 text-indigo-400 -rotate-[30deg]" />
                ) : level.unlocked ? (
                  <span className="text-lg font-black italic -rotate-45 group-hover:rotate-0 transition-transform">{level.id}</span>
                ) : (
                  <Lock className="w-5 h-5 text-zinc-600 -rotate-45" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-tight">{level.title}</h3>
                <p className="text-[9px] text-zinc-500 font-mono italic">{level.type.toUpperCase()} PROTOCOL</p>
              </div>
              {level.unlocked && !level.completed && (
                <ChevronRight className="w-4 h-4 text-zinc-700" />
              )}
            </div>
          ))}
        </aside>

        {/* Level Detail */}
        <main className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="geometric-card p-12 min-h-[500px] flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] italic">Current Objective</span>
                  <h2 className="text-5xl font-black italic tracking-tighter uppercase">{activeLevel?.title}</h2>
                  <p className="text-zinc-500 text-sm italic max-w-xl">{activeLevel?.description}</p>
                </div>

                <div className="p-8 rounded bg-zinc-950 border border-zinc-800 relative group">
                  <div className="absolute -top-3 left-4 px-2 bg-zinc-950 text-[9px] font-black text-indigo-500 uppercase tracking-widest border border-zinc-800">System Message</div>
                  <p className="text-sm font-mono text-zinc-300 leading-relaxed italic">
                    "{activeLevel?.dialogue}"
                  </p>
                </div>
              </div>

              <div className="flex justify-end relative z-10">
                <Link
                  to={`/games/${activeLevel?.type}?mode=story&level=${activeLevel?.id}`}
                  className="geometric-btn px-12 py-4 flex items-center gap-3 text-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Initialize Transmission
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
