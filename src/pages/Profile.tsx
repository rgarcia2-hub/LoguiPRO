import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { User as UserIcon, Trophy, Brain, Gamepad2, Zap, Settings, Star, History, ArrowLeft, LogOut, Play } from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export const Profile = () => {
  const { user, profile } = useAuth();

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-sm rotate-45 h-8 w-8 border-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-sm rotate-45 border-4 border-indigo-500 overflow-hidden bg-zinc-900 group">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-full h-full object-cover -rotate-45 group-hover:rotate-0 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform bg-zinc-800">
                <UserIcon className="w-8 h-8 text-zinc-600" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">{profile.username}</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Operator ID: {user?.uid.slice(0, 8)} • Verified</p>
          </div>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="geometric-btn flex items-center gap-2"
        >
          Disconnect <LogOut className="w-3 h-3" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="geometric-card p-6 flex flex-col items-center justify-center text-center space-y-2 group">
          <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Efficiency XP</p>
          <p className="text-4xl font-black italic tracking-tighter text-white">{profile.stats.xp.toLocaleString()}</p>
          <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-2/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>
          <p className="text-[9px] text-zinc-500 mt-2 uppercase tracking-tight">Level {Math.floor(profile.stats.xp / 1000) + 1} Architect</p>
        </div>

        <div className="geometric-card p-6 flex flex-col items-center justify-center text-center space-y-2 group">
          <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Global Wins</p>
          <p className="text-4xl font-black italic tracking-tighter text-white">{profile.stats.wins}</p>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-2 h-2 rotate-45 border ${i <= 3 ? 'bg-amber-500 border-amber-400' : 'bg-zinc-800 border-zinc-700'}`}></div>
            ))}
          </div>
        </div>

        <div className="geometric-card p-6 flex flex-col items-center justify-center text-center space-y-2 group">
          <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Modules Initialized</p>
          <p className="text-4xl font-black italic tracking-tighter text-white">{profile.stats.gamesPlayed}</p>
          <p className="text-[9px] text-zinc-500 mt-4 uppercase tracking-tight">Last synchronization: Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
        <section className="space-y-6">
          <h2 className="text-xl font-bold italic uppercase tracking-tighter border-l-4 border-indigo-500 pl-4">Operational Status</h2>
          <div className="geometric-card h-64 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-sm rotate-45 border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-sm rotate-45 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Brain className="w-8 h-8 text-indigo-500/50" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold italic uppercase tracking-tighter border-l-4 border-indigo-500 pl-4">Neural Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-sm rotate-45 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Play className="w-3 h-3 text-zinc-500 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-200">Module Optimization</p>
                    <p className="text-[9px] text-zinc-500 italic">Sequence Validated</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-indigo-400 font-bold">+100 XP</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
