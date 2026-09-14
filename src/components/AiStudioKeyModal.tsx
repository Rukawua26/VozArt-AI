import React, { useState } from 'react';
import { 
  Key, 
  ExternalLink, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface AiStudioKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHighContrast?: boolean;
}

export const AiStudioKeyModal: React.FC<AiStudioKeyModalProps> = ({
  isOpen,
  onClose,
  isHighContrast = false
}) => {
  const { user, profile, saveAiStudioKey } = useAuth();
  const [keyInput, setKeyInput] = useState(profile?.aiStudioKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await saveAiStudioKey(keyInput);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1200);
    } catch (e: any) {
      setErrorMsg("Error al guardar la clave. Revisa tu conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={cn(
          "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100",
          isHighContrast && "bg-black border-2 border-yellow-400 text-yellow-300"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aistudio-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 id="aistudio-modal-title" className="text-base font-black text-white">
              Conectar Google AI Studio
            </h3>
            <p className="text-xs text-slate-400">
              Vincula tu propia API Key de Google AI Studio con tu cuenta
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Al conectar tu cuenta de Google, tu clave se sincronizará de forma segura en tu perfil personal y se utilizará para tus solicitudes de IA.
            </p>
          </div>

          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline"
          >
            <span>Obtener mi API Key en Google AI Studio</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              API Key de Google AI Studio
            </label>
            <div className="relative flex items-center">
              <Key size={16} className="absolute left-3.5 text-slate-500" />
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-500 hover:text-slate-300"
                aria-label={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
              <Check size={14} className="shrink-0" />
              <span>¡API Key de Google AI Studio guardada correctamente!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>Guardar Clave</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
