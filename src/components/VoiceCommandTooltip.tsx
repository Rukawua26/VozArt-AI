import React from 'react';
import { HelpCircle, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceCommandTooltipProps {
  onSelectSample: (command: string) => void;
  isHighContrast?: boolean;
}

const QUICK_EXAMPLES = [
  'Dibuja un sol brillante',
  'Cambia el color a azul',
  'Crea una galaxia púrpura',
  'Añade un círculo dorado',
  'Pasa a pincel verde',
  'Deshacer último trazo'
];

export const VoiceCommandTooltip: React.FC<VoiceCommandTooltipProps> = ({
  onSelectSample,
  isHighContrast = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
          isOpen && "text-blue-400 bg-blue-500/10",
          isHighContrast && "text-yellow-400 hover:bg-neutral-800"
        )}
        title="Ver ejemplos de comandos de voz"
        aria-label="Ver ejemplos de comandos de voz"
        aria-expanded={isOpen}
      >
        <HelpCircle size={14} className="text-blue-400" />
        <span className="hidden sm:inline">Ejemplos</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop invisible para cerrar al hacer clic afuera */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute right-0 top-7 mt-1 w-64 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl z-40 text-slate-100",
                isHighContrast && "bg-black border-2 border-yellow-400 text-yellow-300"
              )}
            >
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 mb-2">
                <Sparkles size={12} className="text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Comandos de voz sugeridos
                </span>
              </div>

              <div className="space-y-1">
                {QUICK_EXAMPLES.map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectSample(cmd);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-1.5 rounded-xl hover:bg-blue-600/15 hover:border-blue-500/30 border border-transparent transition-all flex items-center justify-between text-xs text-slate-300 hover:text-white group",
                      isHighContrast && "hover:bg-neutral-800 hover:text-yellow-300"
                    )}
                  >
                    <span className="truncate">"{cmd}"</span>
                    <ChevronRight size={12} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
