import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { SudokuGame } from './pages/SudokuGame';
import { MathGame } from './pages/MathGame';
import { LogicPuzzles } from './pages/LogicPuzzles';
import { MultiplayerLobby } from './pages/MultiplayerLobby';
import { GameSession } from './pages/GameSession';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/games/sudoku" element={
            <ProtectedRoute>
              <Layout><SudokuGame /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/games/math" element={
            <ProtectedRoute>
              <Layout><MathGame /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/games/riddles" element={
            <ProtectedRoute>
              <Layout><LogicPuzzles /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/multiplayer" element={
            <ProtectedRoute>
              <Layout><MultiplayerLobby /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/session/:id" element={
            <ProtectedRoute>
              <Layout><GameSession /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
