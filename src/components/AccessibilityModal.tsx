import React from 'react';
import { Accessibility, Eye, Volume2, Keyboard, X, Check, Sliders, Shield } from 'lucide-react';
import { AccessibilitySettings } from '../types/art';
import { cn } from '../lib/utils';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={cn(
          "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative text-slate-100",
          settings.highContrast && "bg-black border-2 border-yellow-400 text-yellow-300"
        )}
        role="dialog"
        aria-labelledby="acc-title"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Accessibility size={22} />
            </div>
            <div>
              <h2 id="acc-title" className="text-lg font-black tracking-tight">Módulo de Accesibilidad</h2>
              <p className="text-xs text-slate-400">Personaliza la experiencia para tu confort y necesidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Opciones */}
        <div className="space-y-4">
          {/* Alto Contraste */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
                <Eye size={18} />
              </div>
              <div>
                <span className="text-sm font-bold block">Modo Alto Contraste</span>
                <span className="text-xs text-slate-400">Bordes marcados y tonos de máximo contraste (WCAG AAA)</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
              className={cn(
                "w-12 h-7 rounded-full transition-colors p-1 flex items-center",
                settings.highContrast ? "bg-yellow-400 justify-end" : "bg-slate-800 justify-start"
              )}
              aria-label="Alternar alto contraste"
            >
              <div className={cn("w-5 h-5 rounded-full", settings.highContrast ? "bg-black" : "bg-slate-400")} />
            </button>
          </div>

          {/* Botones Grandes / Motricidad */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Sliders size={18} />
              </div>
              <div>
                <span className="text-sm font-bold block">Botones y Controles Grandes</span>
                <span className="text-xs text-slate-400">Áreas táctiles ampliadas de mínimo 48px para motricidad asistida</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ largeButtons: !settings.largeButtons })}
              className={cn(
                "w-12 h-7 rounded-full transition-colors p-1 flex items-center",
                settings.largeButtons ? "bg-blue-600 justify-end" : "bg-slate-800 justify-start"
              )}
              aria-label="Alternar botones grandes"
            >
              <div className="w-5 h-5 rounded-full bg-white" />
            </button>
          </div>

          {/* Retroalimentación Sonora */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="text-sm font-bold block">Lectura de Respuestas (Voz)</span>
                <span className="text-xs text-slate-400">Confirmación hablada de las acciones procesadas por la IA</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundFeedback: !settings.soundFeedback })}
              className={cn(
                "w-12 h-7 rounded-full transition-colors p-1 flex items-center",
                settings.soundFeedback ? "bg-emerald-500 justify-end" : "bg-slate-800 justify-start"
              )}
              aria-label="Alternar lectura por voz"
            >
              <div className="w-5 h-5 rounded-full bg-white" />
            </button>
          </div>
        </div>

        {/* Guía de Atajos de Teclado */}
        <div className="mt-6 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
            <Keyboard size={14} className="text-blue-400" />
            <span>Atajos de Teclado Inclusivos</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="text-slate-400">Pincel</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px]">B</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="text-slate-400">Goma</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px]">E</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="text-slate-400">Deshacer</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px]">Ctrl + Z</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="text-slate-400">Rehacer</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px]">Ctrl + Y</kbd>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Guardar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
