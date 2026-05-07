import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Play, Gamepad2, Timer, Lock } from 'lucide-react';

export const MultiplayerLobby = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createSession = async () => {
    if (!user || !profile) return;
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        type: 'math',
        status: 'waiting',
        players: [user.uid],
        playerNames: { [user.uid]: profile.username },
        scores: { [user.uid]: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate(`/session/${docRef.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user || !profile) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      players: arrayUnion(user.uid),
      [`playerNames.${user.uid}`]: profile.username,
      [`scores.${user.uid}`]: 0,
      status: 'playing', // Start immediately when 2nd player joins
      updatedAt: serverTimestamp()
    });
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-10 h-10 text-indigo-500" /> ARENA MULTIJUGADOR
          </h1>
          <p className="text-slate-400">Demuestra que eres el más rápido en duelos 1v1 en tiempo real.</p>
        </div>
        <button
          onClick={createSession}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Crear Sala
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sessions.length === 0 && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-500 font-medium">No hay salas activas ahora mismo. ¡Crea una!</p>
            </motion.div>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Matemáticas
                    </span>
                    <h3 className="text-xl font-bold text-white">Sala de {session.playerNames[session.players[0]]}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Timer className="w-4 h-4" /> 60 segundos de duelo
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">{session.players.length}/2 Jugadores</span>
                  <button
                    onClick={() => joinSession(session.id)}
                    className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Entrar <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
