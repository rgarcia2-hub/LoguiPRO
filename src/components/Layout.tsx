import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { LogOut, User as UserIcon, Trophy, Gamepad2, Brain, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Games', icon: Brain, path: '/' },
    { name: 'Multiplayer', icon: Gamepad2, path: '/multiplayer' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <nav className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
            <span className="text-xl font-bold tracking-tighter">LOGICAE <span className="text-indigo-400">PRO</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  location.pathname === item.path ? "text-indigo-400" : "text-zinc-500"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="h-8 w-[1px] bg-zinc-800"></div>

          {user ? (
            <div className="flex items-center gap-3 bg-zinc-800/50 py-1 pl-1 pr-4 rounded-full border border-zinc-700">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="LM" className="w-7 h-7 rounded-full border border-zinc-600" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {profile?.username.slice(0, 2) || 'LM'}
                </div>
              )}
              <Link to="/profile" className="flex flex-col group">
                <span className="text-xs font-bold group-hover:text-indigo-400 transition-colors">{profile?.username}</span>
                <span className="text-[10px] text-indigo-400 font-mono italic">Lv. {Math.floor((profile?.stats.xp || 0) / 1000) + 1} • {profile?.stats.xp} XP</span>
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="ml-2 p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2 rounded shadow-lg shadow-indigo-900/20 uppercase tracking-widest"
            >
              Connect
            </Link>
          )}
        </div>

        <button 
          className="md:hidden p-2 text-zinc-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-zinc-900 border-b border-zinc-800 p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium p-3 rounded hover:bg-white/5"
                >
                  <item.icon className="w-4 h-4 text-indigo-400" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>

      <footer className="h-8 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between px-8 text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold italic">
        <div className="flex items-center gap-4">
          <span>Session: Active</span>
          <span>Latency: Low</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Version 2.0.4 - Geometric Logic Engine</span>
          <span className="text-indigo-400">Online Multiplayer Stabilized</span>
        </div>
      </footer>
    </div>
  );
};
