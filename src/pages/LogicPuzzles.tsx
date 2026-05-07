import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, HelpCircle as RiddleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Riddle {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const RIDDLES: Record<'easy' | 'medium' | 'hard', Riddle[]> = {
  easy: [
    {
      id: 'e1',
      question: "Si Juan tiene 5 manzanas y le da 2 a María, pero María le devuelve 1 después, ¿cuántas manzanas tiene Juan?",
      options: ["3", "4", "5", "6"],
      answer: 1,
      explanation: "5 - 2 = 3. Luego María le devuelve 1: 3 + 1 = 4."
    },
    {
      id: 'e2',
      question: "Un tren eléctrico va hacia el norte a 100 km/h. Si el viento sopla hacia el sur, ¿hacia dónde va el humo?",
      options: ["Norte", "Sur", "Ningún lado", "Este"],
      answer: 2,
      explanation: "Los trenes eléctricos no producen humo."
    }
  ],
  medium: [
    {
      id: 'm1',
      question: "Un hombre mira un retrato y dice: 'Hermanos y hermanas no tengo, pero el padre de este hombre es el hijo de mi padre'. ¿Quién es el del retrato?",
      options: ["Él mismo", "Su hijo", "Su padre", "Su sobrino"],
      answer: 1,
      explanation: "'El hijo de mi padre' soy YO (ya que no tiene hermanos). Entonces: 'El padre de este hombre soy YO'. Por lo tanto, el hombre del retrato es su hijo."
    },
    {
      id: 'm2',
      question: "En una caja hay 2 pares de calcetines rojos y 2 pares de calcetines azules. ¿Cuál es el número mínimo de calcetines que debes sacar sin mirar para asegurar que tienes un par del mismo color?",
      options: ["2", "3", "4", "5"],
      answer: 1,
      explanation: "Si sacas 2, pueden ser diferentes. Si sacas 3, por el principio del palomar, al menos 2 deben ser del mismo color."
    }
  ],
  hard: [
    {
      id: 'h1',
      question: "Estás frente a dos puertas. Una lleva a la libertad y la otra a la perdición. Hay dos guardianes: uno siempre dice la verdad y el otro siempre miente. No sabes cuál es cuál. Solo puedes hacer UNA pregunta a UNO de ellos. ¿Qué preguntas?",
      options: [
        "¿Cuál puerta es la de la libertad?",
        "¿Qué diría el otro guardián si le pregunto cuál es la puerta de la libertad?",
        "¿Eres el que dice la verdad?",
        "¿Es esta la puerta correcta?"
      ],
      answer: 1,
      explanation: "Independientemente de a quién preguntes, ambos te señalarán la puerta INCORRECTA (el mentiroso mentirá sobre la verdad, y el veraz dirá la verdad sobre una mentira). Así que solo tienes que elegir la contraria."
    },
    {
      id: 'h2',
      question: "Un asesino es condenado a muerte. Tiene que elegir entre tres habitaciones: la primera está llena de hogueras, la segunda está llena de asesinos con rifles cargados, y la tercera de leones que no han comido en tres años. ¿Cuál es la habitación más segura?",
      options: ["La primera", "La segunda", "La tercera", "Ninguna"],
      answer: 2,
      explanation: "Los leones que no han comido en tres años están muertos."
    }
  ]
};

export const LogicPuzzles = () => {
  const { profile } = useAuth();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const riddles = RIDDLES[difficulty];
  const currentRiddle = riddles[currentRiddleIdx];

  const startGame = (diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
    setGameState('PLAYING');
    setCurrentRiddleIdx(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setStartTime(Date.now());
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(idx);
    const correct = idx === currentRiddle.answer;
    setIsCorrect(correct);
    if (correct) setCorrectCount(prev => prev + 1);
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const nextRiddle = () => {
    if (currentRiddleIdx < riddles.length - 1) {
      setCurrentRiddleIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('FINISHED');
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const xpPerCorrect = { easy: 50, medium: 100, hard: 200 }[difficulty];
    const totalXP = correctCount * xpPerCorrect;

    if (profile) {
      await updateDoc(doc(db, 'users', profile.uid), {
        'stats.xp': increment(totalXP),
        'stats.gamesPlayed': increment(1)
      });

      // Record score for leaderboard
      await addDoc(collection(db, 'scores'), {
        userId: profile.uid,
        username: profile.username,
        gameType: 'riddles',
        score: totalXP,
        difficulty,
        timeTaken,
        timestamp: serverTimestamp()
      });
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
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Neural Enigmas</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Category: Abstract Logic • Semantic Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => startGame(d)}
              className={cn(
                "px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all border",
                difficulty === d && gameState === 'PLAYING' 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {gameState === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <div className="w-32 h-32 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8">
              <RiddleIcon className="w-16 h-16 text-white -rotate-45" />
            </div>
            <div className="text-center max-w-lg space-y-4">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">Initialize Logic Stream?</h2>
              <p className="text-sm text-zinc-500 leading-relaxed uppercase tracking-tighter">
                Semantic puzzles requiring non-linear processing. 
                Identify the logical pivot to resolve the enigma.
                Correct resolution yields high-tier synaptic XP.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => startGame('easy')}
                className="geometric-btn px-8 py-4"
              >
                Initialize Easy
              </button>
              <button 
                onClick={() => startGame('medium')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded text-sm font-bold uppercase"
              >
                Medium Mode
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            key={currentRiddle.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12"
          >
            <div className="geometric-card p-12 space-y-12 relative overflow-hidden group min-h-[400px]">
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              
              <div className="space-y-6 relative z-10">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] italic">Problem {currentRiddleIdx + 1} / {riddles.length}</span>
                <h2 className="text-2xl font-black italic tracking-tight leading-snug">
                  {currentRiddle.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {currentRiddle.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isAnswer = currentRiddle.answer === idx;
                  
                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleOptionClick(idx)}
                      className={cn(
                        "p-6 rounded-sm border text-left transition-all relative group/opt",
                        selectedOption === null 
                          ? "bg-zinc-950 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900" 
                          : isAnswer 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : isSelected 
                              ? "bg-rose-500/10 border-rose-500 text-rose-400"
                              : "bg-zinc-950 border-zinc-800 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono opacity-30">{String.fromCharCode(65 + idx)})</span>
                        <span className="font-bold">{opt}</span>
                      </div>
                      {selectedOption !== null && isAnswer && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      )}
                      {selectedOption !== null && isSelected && !isAnswer && (
                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-6">
              <AnimatePresence>
                {showExplanation ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="geometric-card p-6 border-indigo-500/30 bg-indigo-500/5 space-y-6"
                  >
                    <h3 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold italic">Logic Post-Processing</h3>
                    <p className="text-xs leading-relaxed text-zinc-300 italic">"{currentRiddle.explanation}"</p>
                    <button 
                      onClick={nextRiddle}
                      className="w-full geometric-btn py-3"
                    >
                      Continue Sequence
                    </button>
                  </motion.div>
                ) : (
                  <div className="geometric-card p-6 space-y-6 opacity-50">
                    <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold italic">Module Awaiting Input</h3>
                    <p className="text-xs leading-relaxed text-zinc-500">Select the most logically sound variant from the available matrix to proceed.</p>
                  </div>
                )}
              </AnimatePresence>

              <div className="geometric-card p-6">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Accuracy</span>
                   <span className="text-indigo-400 font-mono font-bold text-lg">{correctCount} / {riddles.length}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-500" 
                    style={{ width: `${(currentRiddleIdx / riddles.length) * 100}%` }}
                  />
                </div>
              </div>
            </aside>
          </motion.div>
        )}

        {gameState === 'FINISHED' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <div className="w-32 h-32 bg-indigo-500/20 border-4 border-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-2xl mb-8">
              <Trophy className="w-16 h-16 text-indigo-400 -rotate-45" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] italic">Analysis Complete</h2>
              <p className="text-5xl font-black italic tracking-tighter text-white uppercase">{correctCount} / {riddles.length} Correct</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Efficiency Points Awarded: {correctCount * (difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 200)} XP</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setGameState('IDLE')}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
