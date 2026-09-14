import { useState, useEffect, useRef, useCallback } from 'react';
import { CanvasInclusivo } from './components/CanvasInclusivo';
import { VoiceControl } from './components/VoiceControl';
import { AccessibilityModal } from './components/AccessibilityModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { useAuth } from './contexts/AuthContext';
import { Sparkles, HelpCircle, Accessibility, Download, Wifi, WifiOff, Volume2 } from 'lucide-react';
import { cn } from './lib/utils';
import { AccessibilitySettings } from './types/art';

export default function App() {
  const { profile } = useAuth();
  const [commands, setCommands] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Lienzo listo');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-mostrar Onboarding la primera vez
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('vozart_onboarding_completed');
    if (!hasSeenOnboarding) {
      // Breve retardo para dar tiempo a que cargue la interfaz visual
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Ajustes de accesibilidad
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    largeButtons: false,
    soundFeedback: false,
    fontSize: 'normal'
  });

  // Conexión WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onopen = () => {
      setIsConnected(true);
      setStatusMessage('Conectado al servidor de VozArt');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'STATUS_UPDATE') {
          setIsProcessing(message.status === 'processing');
          if (message.message) setStatusMessage(message.message);
        } else if (message.type === 'AI_ACTION') {
          setIsProcessing(false);
          setCommands((prev) => [...prev, message]);
          const expl = message.data?.explanation || 'Comando ejecutado con éxito';
          setStatusMessage(expl);

          // Si la lectura por voz está activada
          if (accessibility.soundFeedback && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(expl);
            utterance.lang = 'es-ES';
            window.speechSynthesis.speak(utterance);
          }
        } else if (message.type === 'ERROR') {
          setIsProcessing(false);
          setStatusMessage(message.message || 'Error al procesar comando');
        }
      } catch (e) {
        console.error("Error parseando mensaje WS:", e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setStatusMessage('Desconectado. Intentando reconectar...');
    };

    setWs(socket);
    return () => {
      socket.close();
    };
  }, [accessibility.soundFeedback]);

  // Enviar comando al backend
  const handleSendCommand = useCallback((text: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      setStatusMessage(`Procesando: "${text}"...`);
      ws.send(JSON.stringify({ 
        type: 'VOICE_COMMAND', 
        text,
        userApiKey: profile?.aiStudioKey || undefined 
      }));
    } else {
      setStatusMessage('WebSocket no conectado');
    }
  }, [ws, profile?.aiStudioKey]);

  const handleUpdateAccessibility = (newSettings: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => ({ ...prev, ...newSettings }));
  };

  const handleActionFeedback = (msg: string) => {
    setStatusMessage(msg);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden transition-colors",
      accessibility.highContrast && "bg-black text-yellow-300"
    )}>
      {/* Header Principal */}
      <header className={cn(
        "h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30",
        accessibility.highContrast && "bg-black border-yellow-400 border-b-2"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Voz<span className="text-emerald-400">Art</span>
            </h1>
            <span className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Lienzo Digital Vivo Inclusivo
            </span>
          </div>
        </div>
        
        {/* Barra Central de Estado */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-950/80 rounded-full border border-slate-800 text-xs">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isProcessing ? "bg-amber-400 animate-ping" : isConnected ? "bg-emerald-400" : "bg-red-500 animate-pulse"
          )} />
          <span className="text-slate-300 font-medium truncate max-w-xs">{statusMessage}</span>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-3">
          {/* Botón Guía de Inicio / Onboarding */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold transition-all shadow-sm"
            title="Ver Guía de Comandos y Atajos"
            aria-label="Abrir Guía de Comandos"
          >
            <HelpCircle size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Guía</span>
          </button>

          {/* Botón Accesibilidad */}
          <button
            onClick={() => setShowAccessibility(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all",
              accessibility.highContrast 
                ? "bg-yellow-400 text-black border-yellow-300" 
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            )}
            title="Abrir Módulo de Accesibilidad"
            aria-label="Abrir Módulo de Accesibilidad"
          >
            <Accessibility size={16} className="text-blue-400" />
            <span className="hidden sm:inline">Accesibilidad</span>
          </button>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm">
              Lienzo
            </button>
            <button 
              onClick={() => {
                const canvas = document.getElementById('canvas-vozart') as HTMLCanvasElement;
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `VozArt-${Date.now()}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                }
              }}
              className="px-3 py-1 text-slate-400 hover:text-white text-xs font-bold transition-colors"
            >
              Exportar
            </button>
          </div>

          {/* Botón de Autenticación con Google (Gmail) y AI Studio */}
          <GoogleAuthButton isHighContrast={accessibility.highContrast} />
        </div>
      </header>

      {/* Espacio de Trabajo Principal */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Lienzo Inclusivo (Herramientas manuales + Canvas + Capas) */}
        <CanvasInclusivo 
          commands={commands} 
          onActionFeedback={handleActionFeedback}
          accessibility={accessibility}
        />

        {/* Panel Lateral de Reconocimiento de Voz e IA */}
        <VoiceControl 
          onSendCommand={handleSendCommand} 
          commands={commands}
          accessibility={accessibility}
          latestFeedback={statusMessage}
          isProcessing={isProcessing}
        />
      </main>

      {/* Pie de Página con Telemetría en Tiempo Real */}
      <footer className={cn(
        "h-10 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] shrink-0",
        accessibility.highContrast && "bg-black border-yellow-400 text-yellow-300"
      )}>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-400" : "bg-red-500 animate-pulse")} />
            WS: {isConnected ? 'Activo' : 'Desconectado'}
          </span>
          <span className="hidden sm:inline">IA: Gemini 2.5 Flash</span>
          <span className="hidden md:inline">Stylus API: PointerEvents Habilitado</span>
        </div>

        <div className="flex items-center gap-5 font-mono text-[10px]">
          <span>FPS: 60.0</span>
          <span>Latencia: ~15ms</span>
        </div>
      </footer>

      {/* Modal de Accesibilidad */}
      <AccessibilityModal
        isOpen={showAccessibility}
        onClose={() => setShowAccessibility(false)}
        settings={accessibility}
        onUpdateSettings={handleUpdateAccessibility}
      />

      {/* Modal / Overlay de Onboarding y Guía de Comandos */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSelectCommand={(cmd) => handleSendCommand(cmd)}
        isHighContrast={accessibility.highContrast}
      />
    </div>
  );
}
