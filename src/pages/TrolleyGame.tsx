import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Users, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const dilemmas = [
  {
    id: 1,
    title: "El Dilema Clásico",
    scenario: "Un tranvía descontrolado se dirige hacia cinco personas atadas a la vía. Tú estás junto a una palanca que puede desviar el tranvía a otra vía donde solo hay una persona atada.",
    options: [
      { id: 'a', text: "No hacer nada y dejar que mueran las cinco personas.", label: "Inacción" },
      { id: 'b', text: "Accionar la palanca y sacrificar a una persona para salvar a cinco.", label: "Intervención" }
    ],
    stats: { a: 15, b: 85 }
  },
  {
    id: 2,
    title: "El Espectador Gordo",
    scenario: "Estás en un puente sobre la vía. El tranvía va hacia cinco personas. La única forma de pararlo es empujando a un hombre muy corpulento que está a tu lado a la vía.",
    options: [
      { id: 'a', text: "Empujar al hombre para salvar a los cinco.", label: "Utilitarismo extremo" },
      { id: 'b', text: "No empujar al hombre.", label: "Deontología" }
    ],
    stats: { a: 25, b: 75 }
  },
  {
    id: 3,
    title: "Inteligencia Artificial",
    scenario: "Un coche autónomo debe elegir entre atropellar a un grupo de ancianos que cruzan indebidamente o chocar contra un muro matando a su único pasajero, un joven científico.",
    options: [
      { id: 'a', text: "Proteger al pasajero.", label: "Egoísmo algorítmico" },
      { id: 'b', text: "Salvar al grupo mayor.", label: "Utilitarismo social" }
    ],
    stats: { a: 40, b: 60 }
  },
  {
    id: 4,
    title: "El Transplante",
    scenario: "Un cirujano tiene cinco pacientes que necesitan órganos para sobrevivir. Un viajero sano entra para un chequeo. El cirujano puede sacrificarlo para salvar a los cinco.",
    options: [
      { id: 'a', text: "Sacrificar al viajero.", label: "Consecuencialismo" },
      { id: 'b', text: "Dejar morir a los cinco pacientes.", label: "Ética Médica" }
    ],
    stats: { a: 5, b: 95 }
  },
  {
    id: 5,
    title: "El Bucle del Tranvía",
    scenario: "Si desvías el tranvía hacia una persona, la vía hace un bucle y vuelve a la principal donde están los cinco. Pero el cuerpo de esa persona detendría el tranvía.",
    options: [
      { id: 'a', text: "Usar a la persona como obstáculo.", label: "Instrumentalización" },
      { id: 'b', text: "No desviar el tranvía.", label: "Dignidad Humana" }
    ],
    stats: { a: 30, b: 70 }
  }
];

export const TrolleyGame = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const current = dilemmas[currentIdx];

  const handleVote = () => {
    if (!selectedOption) return;
    setShowStats(true);
  };

  const nextDilemma = () => {
    setSelectedOption(null);
    setShowStats(false);
    setCurrentIdx((prev) => (prev + 1) % dilemmas.length);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Caso {currentIdx + 1} de {dilemmas.length}
        </div>
      </div>

      <div className="space-y-12">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-12 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Brain className="w-32 h-32 text-indigo-500" />
          </div>

          <div className="space-y-6 relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">{current.title}</h1>
            <p className="text-xl text-slate-300 leading-relaxed font-medium italic">
              "{current.scenario}"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {current.options.map((opt) => (
            <button
              key={opt.id}
              disabled={showStats}
              onClick={() => setSelectedOption(opt.id)}
              className={cn(
                "p-8 rounded-3xl border-2 text-left transition-all relative group",
                selectedOption === opt.id 
                  ? "bg-indigo-500/10 border-indigo-500 ring-4 ring-indigo-500/10" 
                  : "bg-slate-900 border-white/5 hover:border-white/20",
                showStats && "opacity-50 grayscale cursor-default"
              )}
            >
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Opción {opt.id.toUpperCase()}</span>
                <p className="text-lg font-bold text-white leading-tight">{opt.text}</p>
                <div className="text-xs text-slate-500 font-medium">Concepto: {opt.label}</div>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showStats ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center"
            >
              <button
                disabled={!selectedOption}
                onClick={handleVote}
                className="px-12 py-4 bg-indigo-600 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
              >
                Confirmar Decisión <Send className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 space-y-6"
            >
              <div className="flex items-center gap-3 text-indigo-400">
                <Users className="w-6 h-6" />
                <h3 className="text-xl font-bold">Estadísticas de la Comunidad</h3>
              </div>
              
              <div className="space-y-4">
                {current.options.map((opt) => {
                  const percentage = current.stats[opt.id as keyof typeof current.stats];
                  const isSelected = selectedOption === opt.id;
                  return (
                    <div key={opt.id} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-white flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />} {opt.label}
                        </span>
                        <span className="text-indigo-300">{percentage}%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={cn("h-full", isSelected ? "bg-indigo-500" : "bg-slate-700")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-between items-center">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No hay respuestas correctas, solo perspectivas lógicas.
                </p>
                <button 
                  onClick={nextDilemma}
                  className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Siguiente Caso
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
