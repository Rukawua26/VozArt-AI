import React, { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  Key, 
  Sparkles, 
  User as UserIcon, 
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { AiStudioKeyModal } from './AiStudioKeyModal';

interface GoogleAuthButtonProps {
  isHighContrast?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  isHighContrast = false
}) => {
  const { user, profile, signInWithGoogle, signOut, loading, authError, clearAuthError } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-xs animate-pulse">
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <span className="hidden sm:inline">Conectando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={signInWithGoogle}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95",
            isHighContrast && "bg-yellow-400 text-black border-2 border-white"
          )}
          title="Iniciar sesión con Google (Gmail) y conectar AI Studio"
        >
          {/* Logo SVG de Google */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Acceder con Google</span>
        </button>

        {authError && (
          <div 
            onClick={clearAuthError}
            className="absolute right-0 top-10 mt-1 px-3 py-1.5 bg-red-950 border border-red-800 text-red-200 text-[11px] rounded-lg shadow-xl cursor-pointer whitespace-nowrap z-50"
          >
            {authError} (clic para cerrar)
          </div>
        )}
      </div>
    );
  }

  const hasKey = Boolean(profile?.aiStudioKey);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          "flex items-center gap-2 p-1 pl-2 pr-2.5 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-all text-xs text-white",
          isHighContrast && "border-yellow-400 bg-neutral-900 text-yellow-300"
        )}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || "Usuario"} 
            className="w-6 h-6 rounded-full ring-1 ring-emerald-400/60 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="font-bold text-[11px] truncate max-w-[100px]">
            {user.displayName || user.email?.split('@')[0]}
          </span>
          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
            {hasKey ? 'AI Studio OK' : 'Conectado'}
          </span>
        </div>

        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Menú desplegable */}
      {dropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setDropdownOpen(false)} 
          />
          <div className="absolute right-0 top-11 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-40 text-slate-200">
            <div className="px-2.5 py-2 border-b border-slate-800 mb-1.5">
              <p className="text-xs font-bold text-white truncate">
                {user.displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setKeyModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-400" />
                <span>Google AI Studio Key</span>
              </div>
              {hasKey && (
                <CheckCircle2 size={13} className="text-emerald-400" />
              )}
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-colors text-left mt-1"
            >
              <LogOut size={14} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </>
      )}

      {/* Modal para ingresar o editar la clave de Google AI Studio */}
      <AiStudioKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        isHighContrast={isHighContrast}
      />
    </div>
  );
};
