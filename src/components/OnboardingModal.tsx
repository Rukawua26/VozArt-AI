import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Paintbrush, 
  Layers, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Lightbulb, 
  HelpCircle,
  Accessibility
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ONBOARDING_SEEN_KEY = 'vozart_onboarding_completed';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand?: (command: string) => void;
  isHighContrast?: boolean;
}

interface CommandExample {
  category: string;
  command: string;
  description: string;
  badge: string;
}

const COMMAND_EXAMPLES: CommandExample[] = [
  {
    category: 'Composición IA',
    command: 'Crea una noche estrellada con luna brillante',
    description: 'Genera una base artística atmosférica en la capa de IA.',
    badge: 'Arte Base'
  },
  {
    category: 'Composición IA',
    command: 'Genera una puesta de sol en la playa',
    description: 'Genera tonalidades cálidas y elementos costeros.',
    badge: 'Paisaje'
  },
  {
    category: 'Formas Vectoriales',
    command: 'Añade un círculo dorado',
    description: 'Inserta una forma geométrica con color personalizado.',
    badge: 'Formas'
  },
  {
    category: 'Formas Vectoriales',
    command: 'Dibuja una estrella violeta',
    description: 'Coloca una estrella vectorial centrada en el lienzo.',
    badge: 'Estrella'
  },
  {
    category: 'Herramientas de Dibujo',
    command: 'Cambia a marcador esmeralda',
    description: 'Activa el marcador con tinta semitransparente.',
    badge: 'Trazos'
  },
  {
    category: 'Herramientas de Dibujo',
    command: 'Usa la goma de borrar',
    description: 'Selecciona la goma para borrar trazos manuales.',
    badge: 'Goma'
  },
  {
    category: 'Lienzo y Fondo',
    command: 'Cambia el fondo a negro profundo',
    description: 'Ajusta el color base de la escena sin perder tus dibujos.',
    badge: 'Fondo'
  },
  {
    category: 'Control y Edición',
    command: 'Deshacer último cambio',
    description: 'Regresa al estado previo inmediatamente.',
    badge: 'Atajo'
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectCommand,
  isHighContrast = false
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      title: '¡Bienvenido a VozArt!',
      subtitle: 'El lienzo digital inclusivo guiado por voz e inteligencia artificial.',
      content: (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
                <Mic size={20} />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Comandos por Voz</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dicta en español natural usando tu micrófono o teclado.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <Layers size={20} />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">2 Capas Vivas</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Capa Base IA + Capa Manual del Artista con sensibilidad Stylus.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <Accessibility size={20} />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Inclusión Total</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Alto contraste WCAG AAA, botones ampliados y autoguardado.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Comandos de Voz Habituales',
      subtitle: 'Haz clic en cualquier comando para probarlo al instante en tu lienzo.',
      content: (
        <div className="space-y-2 py-1 max-h-72 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMAND_EXAMPLES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectCommand?.(item.command);
                  onClose();
                }}
                className={cn(
                  "p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/60 hover:bg-blue-600/10 text-left transition-all group flex flex-col justify-between",
                  isHighContrast && "border-yellow-400 bg-neutral-900 hover:bg-neutral-800"
                )}
              >
                <div className="flex items-center justify-between mb-1.5 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400 font-mono flex items-center gap-0.5">
                    Probar <ChevronRight size={12} />
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-blue-200">
                  "{item.command}"
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Autoguardado y Seguridad',
      subtitle: 'Tu lienzo se almacena localmente cada 30 segundos de forma ininterrumpida.',
      content: (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 mt-0.5">
              <Lightbulb size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Recuperación inteligente de sesión</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Si cierras tu navegador por accidente o se interrumpe la conexión, al reingresar se te preguntará si deseas restaurar tu última sesión intacta.
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center justify-between">
            <span>Intervalo de respaldo:</span>
            <span className="text-emerald-400 font-bold">Cada 30 segundos (Automático)</span>
          </div>
        </div>
      )
    },
    {
      title: 'Conectar Gmail y Google AI Studio',
      subtitle: 'Inicia sesión con tu cuenta de Google y vincula tu API Key propia.',
      content: (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-emerald-400 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Tu propia cuenta de Google AI Studio</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pulsa en <strong>"Acceder con Google"</strong> en la esquina superior derecha para autenticarte con tu cuenta de Gmail. Podrás vincular tu API Key personal de Google AI Studio para disfrutar de tus propias cuotas y límites dedicados.
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">Seguridad:</span>
            <span className="text-emerald-400 font-bold">Autenticación OAuth Google + Firebase</span>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={cn(
          "w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden relative text-slate-100",
          isHighContrast && "bg-black border-2 border-yellow-400 text-yellow-300"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Barra superior con indicadores de paso */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Guía de Inicio Rápido ({currentStep + 1} de {steps.length})
              </span>
              <h3 id="onboarding-title" className="text-base font-black text-white">
                {steps[currentStep].title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Puntos de navegación */}
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentStep === index 
                      ? "w-6 bg-blue-500" 
                      : "bg-slate-700"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Cerrar guía"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {steps[currentStep].subtitle}
        </p>

        {/* Contenido Dinámico del Paso */}
        <div className="min-h-[220px]">
          {steps[currentStep].content}
        </div>

        {/* Controles de Navegación Inferiores */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
          >
            <span>{isLastStep ? '¡Empezar a Crear!' : 'Siguiente'}</span>
            {isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
