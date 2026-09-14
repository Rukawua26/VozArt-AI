import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';

const STORAGE_KEY = 'vozart_autosave_canvas';
const STORAGE_TIME_KEY = 'vozart_autosave_timestamp';
const AUTOSAVE_INTERVAL_MS = 30000; // 30 segundos

interface UseCanvasPersistenceProps {
  fabricCanvas: fabric.Canvas | null;
  onRestoreFeedback?: (message: string) => void;
}

export function useCanvasPersistence({
  fabricCanvas,
  onRestoreFeedback
}: UseCanvasPersistenceProps) {
  const [hasSavedWork, setHasSavedWork] = useState<boolean>(false);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState<boolean>(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);

  // Verificar si hay trabajo guardado en localStorage al montar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTime = localStorage.getItem(STORAGE_TIME_KEY);
      if (savedData && savedData.trim() !== '') {
        const parsed = JSON.parse(savedData);
        // Validar que tenga objetos o fondo modificado
        if (parsed && (parsed.objects?.length > 0 || (parsed.backgroundColor && parsed.backgroundColor !== '#0F172A'))) {
          setHasSavedWork(true);
          setSavedTimestamp(savedTime ? new Date(parseInt(savedTime, 10)).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null);
          setShowRestorePrompt(true);
        }
      }
    } catch (e) {
      console.warn("Error leyendo almacenamiento local:", e);
    }
  }, []);

  // Intervalo de guardado automático cada 30 segundos
  useEffect(() => {
    if (!fabricCanvas) return;

    const interval = setInterval(() => {
      try {
        const json = fabricCanvas.toJSON();
        // Guardar solo si hay algo relevante o canvas activo
        if (json) {
          const jsonStr = JSON.stringify(json);
          localStorage.setItem(STORAGE_KEY, jsonStr);
          const now = Date.now();
          localStorage.setItem(STORAGE_TIME_KEY, now.toString());
          setLastAutoSaveTime(new Date(now));
        }
      } catch (e) {
        console.warn("Error en autoguardado de canvas:", e);
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fabricCanvas]);

  // Guardado manual o puntual
  const forceSaveNow = useCallback(() => {
    if (!fabricCanvas) return;
    try {
      const json = fabricCanvas.toJSON();
      const jsonStr = JSON.stringify(json);
      localStorage.setItem(STORAGE_KEY, jsonStr);
      const now = Date.now();
      localStorage.setItem(STORAGE_TIME_KEY, now.toString());
      setLastAutoSaveTime(new Date(now));
      onRestoreFeedback?.("Progreso guardado localmente.");
    } catch (e) {
      console.warn("Error guardando manualmente:", e);
    }
  }, [fabricCanvas, onRestoreFeedback]);

  // Restaurar trabajo previo
  const restoreSavedCanvas = useCallback(async () => {
    if (!fabricCanvas) return;
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        await fabricCanvas.loadFromJSON(parsed);
        fabricCanvas.renderAll();
        setShowRestorePrompt(false);
        onRestoreFeedback?.("¡Tu último trabajo ha sido restaurado con éxito!");
      }
    } catch (e) {
      console.error("Error restaurando lienzo:", e);
      onRestoreFeedback?.("No se pudo restaurar el archivo guardado.");
      setShowRestorePrompt(false);
    }
  }, [fabricCanvas, onRestoreFeedback]);

  // Descartar trabajo previo
  const discardSavedCanvas = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIME_KEY);
    setShowRestorePrompt(false);
    setHasSavedWork(false);
    onRestoreFeedback?.("Iniciando lienzo en blanco.");
  }, [onRestoreFeedback]);

  return {
    showRestorePrompt,
    savedTimestamp,
    lastAutoSaveTime,
    restoreSavedCanvas,
    discardSavedCanvas,
    forceSaveNow
  };
}
