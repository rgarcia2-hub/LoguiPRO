import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, Star, Brain, ArrowLeft, Hash, Zap, HelpCircle } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';

interface UserEntry {
  uid: string;
  username: string;
  photoURL: string | null;
  stats: {
    xp: number;
    wins: number;
  };
}

interface ScoreEntry {
  userId: string;
  username: string;
  gameType: string;
  score: number;
  difficulty: string;
  timeTaken: number;
  timestamp: any;
}

type Category = 'global' | 'sudoku' | 'math' | 'riddles';

export const Leaderboard = () => {
  const [category, setCategory] = useState<Category>('global');
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (category === 'global') {
          const q = query(collection(db, 'users'), orderBy('stats.xp', 'desc'), limit(20));
          const snapshot = await getDocs(q);
          setTopUsers(snapshot.docs.map(doc => doc.data()));
        } else {
          const q = query(
            collection(db, 'scores'), 
            where('gameType', '==', category),
            orderBy('score', 'desc'),
            orderBy('timeTaken', 'asc'),
            limit(20)
          );
          const snapshot = await getDocs(q);
          setTopUsers(snapshot.docs.map(doc => doc.data()));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users', auth);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category]);

  const topThree = topUsers.slice(0, 3);
  const others = topUsers.slice(3);

  const getRankData = (idx: number) => {
    const podiumOrder = [1, 0, 2];
    const displayIdx = podiumOrder[idx];
    const podiumUser = topThree[displayIdx];
    return { podiumUser, displayIdx };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Neural Hierarchy</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Latency: 24ms • Data Synchronized</p>
        </div>
        
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-sm overflow-x-auto max-w-full">
          {(['global', 'sudoku', 'math', 'riddles'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm whitespace-nowrap",
                category === cat 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Top 3 Podium */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12"
        >
          {[0, 1, 2].map((idx) => {
            const { podiumUser, displayIdx } = getRankData(idx);
            if (!podiumUser) return <div key={idx} className="h-40 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-sm" />;

            const heights = ['h-64', 'h-80', 'h-52'];
            const borderColors = ['border-zinc-400', 'border-amber-500', 'border-amber-700'];
            const rankColors = ['bg-zinc-400', 'bg-amber-500', 'bg-amber-700'];

            return (
              <motion.div
                key={podiumUser.uid || podiumUser.timestamp?.toMillis() + idx}
                className={`flex flex-col items-center ${idx === 1 ? 'order-first md:order-none' : ''}`}
              >
                <div className="mb-6 relative group">
                  <div className={`w-20 h-20 rounded-sm rotate-45 border-2 ${borderColors[displayIdx]} overflow-hidden group-hover:rotate-0 transition-transform bg-zinc-900 flex items-center justify-center`}>
                    {podiumUser.photoURL ? (
                      <img src={podiumUser.photoURL} alt="" className="w-full h-full object-cover -rotate-45 group-hover:rotate-0 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform font-bold text-xl text-zinc-600 uppercase">
                        {podiumUser.username?.[0]}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-sm rotate-45 border-2 border-zinc-950 flex items-center justify-center shadow-lg font-black text-xs text-zinc-950 ${rankColors[displayIdx]}`}>
                    <span className="-rotate-45">{displayIdx + 1}</span>
                  </div>
                </div>
                
                <div className={`w-full ${heights[displayIdx]} bg-zinc-900 border-x border-t border-zinc-800 rounded-t-xl p-6 flex flex-col items-center justify-start gap-2 shadow-2xl relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter truncate w-full text-center relative z-10">{podiumUser.username}</h3>
                  <div className="text-2xl font-black text-white italic tracking-tighter relative z-10">
                    {(category === 'global' ? podiumUser.stats.xp : podiumUser.score).toLocaleString()}
                  </div>
                  <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest relative z-10 text-center">
                    {category === 'global' ? 'Efficiency Points' : `${podiumUser.difficulty} • ${podiumUser.timeTaken}s`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>


      {/* List */}
      <div className="geometric-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Rank</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Operator</th>
              {category !== 'global' && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Tier</th>}
              {category !== 'global' && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Sync Time</th>}
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic text-right">Performance Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={category === 'global' ? 3 : 5} className="px-8 py-6 h-16 bg-zinc-900/20" />
                </tr>
              ))
            ) : others.length === 0 ? (
              <tr>
                <td colSpan={category === 'global' ? 3 : 5} className="px-8 py-20 text-center text-zinc-600 text-[10px] font-black italic uppercase tracking-widest">
                  No cognitive data recorded for this module yet.
                </td>
              </tr>
            ) : (
              others.map((user, idx) => (
                <tr key={user.uid || user.timestamp?.toMillis() + idx} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-zinc-600 group-hover:text-indigo-400">#{idx + 4}</span>
                  </td>
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-sm rotate-45 border border-zinc-800 overflow-hidden bg-zinc-800 flex items-center justify-center">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover -rotate-45" />
                      ) : (
                        <span className="text-xs text-zinc-600 -rotate-45 font-bold uppercase">{user.username?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{user.username}</p>
                      {category === 'global' && <p className="text-[9px] text-zinc-500 italic">Wins: {user.stats.wins}</p>}
                    </div>
                  </td>
                  {category !== 'global' && (
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{user.difficulty}</span>
                    </td>
                  )}
                  {category !== 'global' && (
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-mono text-indigo-400">{user.timeTaken}s</span>
                    </td>
                  )}
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black tabular-nums italic text-zinc-400 group-hover:text-white transition-colors">
                      {(category === 'global' ? user.stats.xp : user.score).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
