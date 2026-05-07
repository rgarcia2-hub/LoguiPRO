import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Timer, Zap, Trophy, ArrowLeft, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export const GameSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'WAITING' | 'PLAYING' | 'FINISHED'>('WAITING');
  const [question, setQuestion] = useState({ text: '', answer: 0 });
  const [userInput, setUserInput] = useState('');
  const [localScore, setLocalScore] = useState(0);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'sessions', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSession(data);
        if (data.status === 'playing' && gameState === 'WAITING') {
          setGameState('PLAYING');
          generateQuestion();
        }
        if (data.status === 'finished') {
          setGameState('FINISHED');
        }
      } else {
        navigate('/multiplayer');
      }
    });

    return () => unsub();
  }, [id, gameState]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const generateQuestion = () => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * 2)];
    setQuestion({
      text: `${n1} ${op} ${n2}`,
      answer: op === '+' ? n1 + n2 : n1 - n2
    });
  };

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (parseInt(val) === question.answer) {
      setLocalScore(prev => prev + 1);
      setUserInput('');
      generateQuestion();
      // Update Firestore score
      if (id && user) {
        await updateDoc(doc(db, 'sessions', id), {
          [`scores.${user.uid}`]: increment(1)
        });
      }
    }
  };

  const handleFinish = async () => {
    if (!id || !session) return;
    setGameState('FINISHED');
    
    // Only one player needs to update the status to finished
    if (session.status !== 'finished') {
      await updateDoc(doc(db, 'sessions', id), {
        status: 'finished',
        updatedAt: serverTimestamp()
      });
    }

    // Update global user stats
    if (user) {
      const opponentId = session.players.find((p: string) => p !== user.uid);
      const myScore = session.scores[user.uid];
      const opScore = session.scores[opponentId] || 0;
      const isWinner = myScore > opScore;

      await updateDoc(doc(db, 'users', user.uid), {
        'stats.xp': increment(myScore * 10 + (isWinner ? 100 : 0)),
        'stats.wins': isWinner ? increment(1) : increment(0),
        'stats.gamesPlayed': increment(1)
      });
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/multiplayer')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Abandonar
        </button>
        {gameState === 'PLAYING' && (
          <div className="px-6 py-2 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center gap-2">
            <Timer className="w-5 h-5 text-rose-500" />
            <span className="font-mono font-bold text-white">{timeLeft}s</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Players Sidebar */}
        <div className="space-y-4">
          {session.players.map((pId: string) => (
            <div key={pId} className={cn(
              "p-6 rounded-3xl border transition-all",
              pId === user?.uid ? "bg-indigo-500/10 border-indigo-500/50" : "bg-slate-900 border-white/5"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs uppercase font-black tracking-widest text-slate-600 mb-1">
                    {pId === user?.uid ? 'Tú' : 'Oponente'}
                  </p>
                  <p className="text-lg font-bold text-white">{session.playerNames[pId]}</p>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <span className="text-4xl font-black text-white">{session.scores[pId] || 0}</span>
                <span className="text-xs font-bold text-indigo-400 mb-2">PUNTOS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 text-center min-h-[400px] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(timeLeft/60)*100}%` }} />
            </div>

            {gameState === 'WAITING' && (
              <div className="space-y-8 text-center">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Users className="w-12 h-12 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Esperando rival...</h2>
                  <p className="text-slate-500">Comparte el link para que alguien se una.</p>
                </div>
              </div>
            )}

            {gameState === 'PLAYING' && (
              <div className="w-full space-y-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={question.text}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-white tracking-tighter"
                  >
                    {question.text}
                  </motion.div>
                </AnimatePresence>

                <div className="max-w-xs mx-auto">
                  <input
                    autoFocus
                    type="number"
                    value={userInput}
                    onChange={handleInput}
                    className="w-full bg-white/5 border-b-8 border-indigo-500/20 text-6xl font-black focus:border-indigo-500 outline-hidden py-4 text-center rounded-t-3xl transition-all"
                    placeholder="?"
                  />
                </div>
              </div>
            )}

            {gameState === 'FINISHED' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <Trophy className="w-24 h-24 text-amber-500 mx-auto" />
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter">DUELO FINALIZADO</h2>
                  {(() => {
                    const myScore = session.scores[user!.uid];
                    const opId = session.players.find((p: any) => p !== user!.uid);
                    const opScore = session.scores[opId] || 0;
                    if (myScore > opScore) return <p className="text-2xl font-bold text-emerald-400 mt-2">¡HAS GANADO! +100 XP</p>;
                    if (myScore < opScore) return <p className="text-2xl font-bold text-rose-400 mt-2">HAS PERDIDO...</p>;
                    return <p className="text-2xl font-bold text-indigo-400 mt-2">¡EMPATE!</p>;
                  })()}
                </div>
                <button 
                  onClick={() => navigate('/multiplayer')}
                  className="px-12 py-4 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Volver al Lobby
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
