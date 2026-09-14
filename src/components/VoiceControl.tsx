import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, MessageSquare, History, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AccessibilitySettings } from '../types/art';
import { VoiceCommandTooltip } from './VoiceCommandTooltip';

interface VoiceControlProps {
  onSendCommand: (text: string) => void;
  commands: any[];
  accessibility: AccessibilitySettings;
  latestFeedback?: string;
  isProcessing?: boolean;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ 
  onSendCommand, 
  commands,
  accessibility,
  latestFeedback,
  isProcessing = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Reconocimiento de voz:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    if (!speechSupported) return;
    setTranscript('');
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Error iniciando micrófono:", e);
    }
  };

  const stopListeningAndSend = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }
    setIsListening(false);
    if (transcript.trim()) {
      onSendCommand(transcript.trim());
      setTranscript('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSend();
    } else {
      startListening();
    }
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendCommand(inputText.trim());
      setInputText('');
    }
  };

  // Filtrar las acciones procesadas
  const historyItems = commands
    .filter(c => c.type === 'AI_ACTION' || c.type === 'STATUS_UPDATE')
    .slice(-4)
    .reverse();

  const isHighContrast = accessibility.highContrast;
  const isLarge = accessibility.largeButtons;

  return (
    <aside 
      className={cn(
        "bg-slate-900 border-l border-slate-800 flex flex-col p-5 shrink-0 h-full overflow-y-auto transition-all z-20",
        isLarge ? "w-88" : "w-80",
        isHighContrast && "bg-black border-yellow-400 border-l-2"
      )}
      aria-label="Panel de dictado por voz y comandos de IA"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Motor de Voz e IA</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Dicta comandos para transformar tu lienzo</p>
        </div>
        <VoiceCommandTooltip 
          onSelectSample={(cmd) => onSendCommand(cmd)} 
          isHighContrast={isHighContrast} 
        />
      </div>

      {/* Micrófono Principal Interactivo */}
      <div className={cn(
        "flex flex-col items-center gap-3 py-6 px-4 bg-slate-950/60 rounded-3xl border border-slate-800/80 mb-5 relative overflow-hidden shadow-inner",
        isHighContrast && "border-yellow-400 bg-neutral-900"
      )}>
        {/* Onda de sonido reactiva cuando está escuchando */}
        {isListening && (
          <div className="flex items-center gap-1 absolute top-3">
            {[40, 70, 100, 60, 90, 45, 80].map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: [8, h / 3, 8] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.08 }}
                className="w-1 bg-red-400 rounded-full"
              />
            ))}
          </div>
        )}

        <div className="relative my-2">
          {isListening && (
            <motion.div 
              animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute inset-0 rounded-full bg-red-500"
            />
          )}

          <button
            onClick={toggleListening}
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-xl",
              isLarge ? "w-20 h-20" : "w-16 h-16",
              isListening 
                ? "bg-red-500 text-white shadow-red-500/50 scale-105" 
                : "bg-gradient-to-tr from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white shadow-blue-500/30 hover:scale-105",
              isHighContrast && "bg-yellow-400 text-black border-2 border-white"
            )}
            title={isListening ? "Detener y Enviar" : "Iniciar Dictado de Voz"}
            aria-label="Botón de dictado por voz"
          >
            {isListening ? <MicOff size={isLarge ? 30 : 24} /> : <Mic size={isLarge ? 30 : 24} />}
          </button>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-center">
          {isListening ? (
            <span className="text-red-400 animate-pulse">Escuchando... Toca para enviar</span>
          ) : isProcessing ? (
            <span className="text-emerald-400 animate-pulse">Generando arte con IA...</span>
          ) : (
            <span className="text-slate-400">Toca para dictar en español</span>
          )}
        </p>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 italic text-center"
          >
            "{transcript}"
          </motion.div>
        )}
      </div>

      {/* Entrada Manual de Texto */}
      <form onSubmit={handleManualSend} className="relative mb-5">
        <div className={cn(
          "flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-blue-500 transition-all",
          isHighContrast && "border-yellow-400 bg-neutral-900"
        )}>
          <MessageSquare size={14} className="ml-2.5 text-slate-500" />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O escribe una instrucción..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-1.5 px-1 placeholder:text-slate-600 text-slate-200 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-transform active:scale-95 shadow-sm"
            title="Enviar comando"
            aria-label="Enviar comando escrito"
          >
            <Send size={13} />
          </button>
        </div>
      </form>

      {/* Comandos rápidos sugeridos */}
      <div className="mb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
          Sugerencias Inclusivas
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { label: 'Crea una galaxia púrpura', desc: 'Arte IA Base' },
            { label: 'Añade un círculo dorado', desc: 'Forma' },
            { label: 'Pasa a pincel esmeralda', desc: 'Herramienta' },
            { label: 'Deshacer último trazo', desc: 'Atajo' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSendCommand(item.label)}
              className={cn(
                "p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800 text-left transition-all group flex items-center justify-between",
                isHighContrast && "border-yellow-400"
              )}
            >
              <span className="text-xs text-slate-300 group-hover:text-white truncate">"{item.label}"</span>
              <span className="text-[9px] font-mono uppercase text-slate-500 group-hover:text-emerald-400 shrink-0 ml-1">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Historial en Tiempo Real */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <History size={11} /> Historial Reciente
          </span>
          <span className="text-[9px] font-mono text-emerald-400">WebSocket Activo</span>
        </div>

        <div className="space-y-2">
          {historyItems.length > 0 ? (
            historyItems.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2.5 rounded-xl border text-xs transition-all",
                  item.type === 'AI_ACTION' 
                    ? "bg-slate-950 border-slate-800 text-slate-300" 
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={10} /> {item.data?.action || 'Procesado'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Ahora</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {item.data?.explanation || item.rawText || item.message || 'Acción completada con éxito'}
                </p>
              </div>
            ))
          ) : (
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
              <p className="text-xs text-slate-600 italic">Los comandos dictados aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
