import React from 'react';
import { RotateCcw, Trash2, Clock, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface RestoreWorkBannerProps {
  isOpen: boolean;
  savedTimestamp: string | null;
  onRestore: () => void;
  onDiscard: () => void;
  isHighContrast?: boolean;
}

export const RestoreWorkBanner: React.FC<RestoreWorkBannerProps> = ({
  isOpen,
  savedTimestamp,
  onRestore,
  onDiscard,
  isHighContrast = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4"
      >
        <div 
          className={cn(
            "p-4 bg-slate-900/95 backdrop-blur-md border border-blue-500/40 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-100",
            isHighContrast && "bg-black border-2 border-yellow-400 text-yellow-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">Sesión anterior encontrada</h4>
                {savedTimestamp && (
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} /> {savedTimestamp}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ¿Deseas recuperar tu última obra guardada automáticamente?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={onDiscard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              <span>Descartar</span>
            </button>
            <button
              onClick={onRestore}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              <span>Restaurar</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
