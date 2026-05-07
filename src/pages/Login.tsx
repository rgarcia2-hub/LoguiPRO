import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Brain, Mail, Lock, Chrome, ArrowRight, UserPlus, LogIn, Zap } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="geometric-card p-12 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/20">
              <Brain className="w-8 h-8 text-white -rotate-45" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Initialize Session</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Neural Link Required to Access Logic Modules</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 italic tracking-widest pl-1">Neural Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@NETWORK.LOGIC"
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 italic tracking-widest pl-1">Access Cipher</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-sm text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm text-rose-400 text-[10px] font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full geometric-btn py-4 flex items-center justify-center gap-2 group mb-6"
            >
              {isLogin ? 'Establish Link' : 'Register Operator'} 
              <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Or Sync via</span>
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full mt-6 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black p-4 rounded-sm transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-tighter"
          >
            <Chrome className="w-4 h-4" />
            Google Cloud Sync
          </button>

          <p className="mt-10 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">
            {isLogin ? "Node not found? " : "Authorized entity? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              {isLogin ? "Generate Signature" : "Access Console"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
