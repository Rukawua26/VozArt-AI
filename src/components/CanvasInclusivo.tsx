import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  Pencil, 
  Paintbrush, 
  Highlighter, 
  Eraser, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Trash2, 
  Undo2, 
  Redo2, 
  Download, 
  Layers, 
  Eye, 
  EyeOff, 
  Sparkles,
  Sliders,
  Maximize2,
  Save,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ToolType, LayerState, AccessibilitySettings } from '../types/art';
import { useCanvasPersistence } from '../hooks/useCanvasPersistence';
import { RestoreWorkBanner } from './RestoreWorkBanner';

interface CanvasProps {
  commands: any[];
  onActionFeedback?: (message: string) => void;
  accessibility: AccessibilitySettings;
}

export const CanvasInclusivo: React.FC<CanvasProps> = ({ 
  commands, 
  onActionFeedback,
  accessibility 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  // Hook de Persistencia Local (LocalStorage cada 30 segundos y restauración)
  const {
    showRestorePrompt,
    savedTimestamp,
    lastAutoSaveTime,
    restoreSavedCanvas,
    discardSavedCanvas,
    forceSaveNow
  } = useCanvasPersistence({
    fabricCanvas,
    onRestoreFeedback: onActionFeedback
  });
  
  // Estado de Herramientas
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [color, setColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [brushOpacity, setBrushOpacity] = useState<number>(100);
  const [stylusPressureEnabled, setStylusPressureEnabled] = useState<boolean>(true);
  const [lastPressure, setLastPressure] = useState<number>(0.5);

  // Sistema de Capas
  const [layers, setLayers] = useState<LayerState[]>([
    { id: 'layer-manual', name: 'Capa Artista (Manual)', type: 'manual_drawing', visible: true, opacity: 1, locked: false },
    { id: 'layer-ia', name: 'Capa Base (IA)', type: 'ia_base', visible: true, opacity: 0.95, locked: false },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-manual');

  // Historial Deshacer / Rehacer
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoAction = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Paleta de colores vibrantes predeterminados
  const colorPalette = [
    '#3B82F6', // Azul eléctrico
    '#10B981', // Verde esmeralda
    '#F59E0B', // Ámbar solar
    '#EF4444', // Rojo carmesí
    '#8B5CF6', // Violeta neón
    '#EC4899', // Rosa vibrante
    '#06B6D4', // Cian claro
    '#FFFFFF', // Blanco puro
    '#0F172A', // Tinta profunda
  ];

  // Guardar estado en historial
  const saveState = useCallback(() => {
    if (!fabricCanvas || isUndoRedoAction.current) return;
    try {
      const json = JSON.stringify(fabricCanvas.toJSON());
      const nextIndex = historyIndexRef.current + 1;
      const newHistory = historyRef.current.slice(0, nextIndex);
      newHistory.push(json);
      historyRef.current = newHistory;
      historyIndexRef.current = nextIndex;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch (e) {
      console.warn("Error guardando estado de historial", e);
    }
  }, [fabricCanvas]);

  // Inicialización de Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const c = new fabric.Canvas(canvasRef.current, {
      width: 820,
      height: 520,
      backgroundColor: '#0F172A',
      isDrawingMode: true,
      selection: true,
    });

    // Pincel por defecto
    const brush = new fabric.PencilBrush(c);
    brush.color = color;
    brush.width = brushSize;
    c.freeDrawingBrush = brush;

    c.on('object:added', () => {
      if (!isUndoRedoAction.current) saveState();
    });
    c.on('object:modified', () => {
      if (!isUndoRedoAction.current) saveState();
    });

    setFabricCanvas(c);

    // Guardar estado inicial vacío
    setTimeout(() => {
      const initialJson = JSON.stringify(c.toJSON());
      historyRef.current = [initialJson];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }, 100);

    return () => {
      c.dispose();
    };
  }, []);

  // Manejo de sensibilidad de presión para stylus / lápiz óptico
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !fabricCanvas || !stylusPressureEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Si el puntero es un lápiz o soporta presión
      if (e.pointerType === 'pen' && e.pressure > 0) {
        setLastPressure(e.pressure);
        if (fabricCanvas.freeDrawingBrush && fabricCanvas.isDrawingMode) {
          // Modular el grosor en base a la presión del stylus
          const dynamicWidth = Math.max(2, brushSize * (e.pressure * 1.8));
          fabricCanvas.freeDrawingBrush.width = dynamicWidth;
        }
      }
    };

    const handlePointerUp = () => {
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
    };
  }, [fabricCanvas, brushSize, stylusPressureEnabled]);

  // Actualizar configuración del pincel según la herramienta seleccionada
  const applyToolConfig = useCallback((tool: ToolType, selectedColor: string, size: number, opacity: number) => {
    if (!fabricCanvas) return;

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    };

    const currentColor = hexToRgba(selectedColor, opacity);

    if (tool === 'pencil' || tool === 'brush' || tool === 'marker' || tool === 'eraser') {
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);

      if (tool === 'eraser') {
        brush.color = '#0F172A'; // Borra con el color de fondo base
        brush.width = size * 2.5;
      } else if (tool === 'marker') {
        brush.color = hexToRgba(selectedColor, 40); // Trazado semitransparente
        brush.width = size * 2;
      } else if (tool === 'pencil') {
        brush.color = selectedColor;
        brush.width = Math.max(1, Math.floor(size / 2));
      } else {
        // Pincel estándar
        brush.color = currentColor;
        brush.width = size;
      }

      fabricCanvas.freeDrawingBrush = brush;
    } else {
      fabricCanvas.isDrawingMode = false;
    }
  }, [fabricCanvas]);

  // Reaccionar a cambios de herramienta, color, tamaño y opacidad
  useEffect(() => {
    applyToolConfig(activeTool, color, brushSize, brushOpacity);
  }, [activeTool, color, brushSize, brushOpacity, applyToolConfig]);

  // Deshacer acción
  const handleUndo = () => {
    if (!fabricCanvas || historyIndexRef.current <= 0) return;
    isUndoRedoAction.current = true;
    const prevIndex = historyIndexRef.current - 1;
    const jsonState = historyRef.current[prevIndex];
    fabricCanvas.loadFromJSON(JSON.parse(jsonState)).then(() => {
      fabricCanvas.renderAll();
      historyIndexRef.current = prevIndex;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isUndoRedoAction.current = false;
      onActionFeedback?.("Paso anterior restaurado (Deshacer)");
    });
  };

  // Rehacer acción
  const handleRedo = () => {
    if (!fabricCanvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoAction.current = true;
    const nextIndex = historyIndexRef.current + 1;
    const jsonState = historyRef.current[nextIndex];
    fabricCanvas.loadFromJSON(JSON.parse(jsonState)).then(() => {
      fabricCanvas.renderAll();
      historyIndexRef.current = nextIndex;
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isUndoRedoAction.current = false;
      onActionFeedback?.("Paso restaurado (Rehacer)");
    });
  };

  // Agregar formas vectoriales
  const addVectorShape = (shapeType: 'rect' | 'circle' | 'triangle' | 'star') => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = false;
    setActiveTool(shapeType);

    const baseConfig = {
      left: 250 + (Math.random() * 80 - 40),
      top: 180 + (Math.random() * 80 - 40),
      fill: color,
      opacity: brushOpacity / 100,
      stroke: '#FFFFFF',
      strokeWidth: 1.5,
    };

    let shapeObj: fabric.Object | null = null;
    if (shapeType === 'rect') {
      shapeObj = new fabric.Rect({ ...baseConfig, width: 140, height: 90, rx: 12, ry: 12 });
    } else if (shapeType === 'circle') {
      shapeObj = new fabric.Circle({ ...baseConfig, radius: 60 });
    } else if (shapeType === 'triangle') {
      shapeObj = new fabric.Triangle({ ...baseConfig, width: 120, height: 110 });
    } else if (shapeType === 'star') {
      // Polígono estrella
      const points = [
        { x: 50, y: 0 },
        { x: 65, y: 35 },
        { x: 100, y: 38 },
        { x: 72, y: 62 },
        { x: 82, y: 98 },
        { x: 50, y: 76 },
        { x: 18, y: 98 },
        { x: 28, y: 62 },
        { x: 0, y: 38 },
        { x: 35, y: 35 }
      ];
      shapeObj = new fabric.Polygon(points, { ...baseConfig, scaleX: 1.2, scaleY: 1.2 });
    }

    if (shapeObj) {
      // Etiquetar según capa activa
      (shapeObj as any).vozArtLayer = activeLayerId;
      fabricCanvas.add(shapeObj);
      fabricCanvas.setActiveObject(shapeObj);
      fabricCanvas.renderAll();
      saveState();
      onActionFeedback?.(`Forma ${shapeType} insertada en la capa.`);
    }
  };

  // Limpiar lienzo
  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.set({ backgroundColor: '#0F172A' });
    fabricCanvas.renderAll();
    saveState();
    onActionFeedback?.("Lienzo reiniciado por completo.");
  };

  // Exportar arte digital
  const handleExport = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `VozArt-creacion-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
    onActionFeedback?.("¡Obra descargada con éxito!");
  };

  // Procesar Comandos de Voz y de la IA
  useEffect(() => {
    if (!fabricCanvas || commands.length === 0) return;
    const lastCommand = commands[commands.length - 1];

    if (lastCommand.type === 'AI_ACTION' && lastCommand.data) {
      const { action, shape, color: aiColor, size, prompt, tool, artElements, explanation } = lastCommand.data;

      switch (action) {
        case 'GENERATE_ART':
          // Arte Generativo para la Capa Base
          if (aiColor) {
            fabricCanvas.set({ backgroundColor: aiColor });
          }

          // Generar elementos artísticos en la capa base
          if (artElements && Array.isArray(artElements)) {
            artElements.forEach((elem) => {
              let obj: fabric.Object | null = null;
              if (elem.type === 'circle') {
                obj = new fabric.Circle({
                  left: elem.x,
                  top: elem.y,
                  radius: elem.radius || 40,
                  fill: elem.fill,
                  opacity: elem.opacity || 0.6,
                });
              } else if (elem.type === 'rect') {
                obj = new fabric.Rect({
                  left: elem.x,
                  top: elem.y,
                  width: elem.width || 80,
                  height: elem.height || 80,
                  fill: elem.fill,
                  opacity: elem.opacity || 0.6,
                  rx: 8,
                  ry: 8,
                });
              }
              if (obj) {
                (obj as any).vozArtLayer = 'layer-ia';
                fabricCanvas.add(obj);
                // Enviar al fondo para que quede como capa base
                fabricCanvas.sendObjectToBack(obj);
              }
            });
          }

          // Añadir insignia conceptual
          const badgeText = new fabric.Text(`✨ ${prompt || 'Arte IA'}`, {
            left: 20,
            top: 20,
            fontSize: 16,
            fill: '#E2E8F0',
            fontFamily: 'Outfit',
            opacity: 0.8,
            selectable: false,
          });
          fabricCanvas.add(badgeText);
          fabricCanvas.renderAll();
          saveState();
          onActionFeedback?.(explanation || "Arte base generado por IA");
          break;

        case 'ADD_SHAPE':
          if (shape) {
            if (aiColor) setColor(aiColor);
            addVectorShape(shape);
          }
          break;

        case 'CHANGE_BG':
          if (aiColor) {
            fabricCanvas.set({ backgroundColor: aiColor });
            fabricCanvas.renderAll();
            saveState();
            onActionFeedback?.(explanation || `Fondo actualizado a ${aiColor}`);
          }
          break;

        case 'SET_TOOL':
          if (tool) {
            setActiveTool(tool);
            onActionFeedback?.(`Herramienta cambiada a ${tool}`);
          }
          break;

        case 'SET_COLOR':
          if (aiColor) {
            setColor(aiColor);
            onActionFeedback?.(`Color del trazo: ${aiColor}`);
          }
          break;

        case 'CLEAR_CANVAS':
          handleClearCanvas();
          break;

        case 'UNDO':
          handleUndo();
          break;
      }
    }
  }, [commands, fabricCanvas]);

  // Alternar visibilidad de capas
  const toggleLayerVisibility = (layerId: string) => {
    if (!fabricCanvas) return;
    setLayers(prev => prev.map(l => {
      if (l.id === layerId) {
        const nextVisible = !l.visible;
        // Filtrar objetos del canvas que pertenezcan a esta capa
        const objects = fabricCanvas.getObjects();
        objects.forEach((obj: any) => {
          if (obj.vozArtLayer === layerId) {
            obj.set({ visible: nextVisible });
          }
        });
        fabricCanvas.renderAll();
        return { ...l, visible: nextVisible };
      }
      return l;
    }));
  };

  const isHighContrast = accessibility.highContrast;
  const isLarge = accessibility.largeButtons;

  return (
    <div className="flex-1 flex overflow-hidden select-none">
      {/* Barra de Herramientas Lateral Izquierda */}
      <aside 
        className={cn(
          "bg-slate-900 border-r border-slate-800 flex flex-col items-center py-5 gap-4 shrink-0 z-20 transition-all",
          isLarge ? "w-24 px-2" : "w-20 px-1",
          isHighContrast && "bg-black border-yellow-400 border-r-2"
        )}
        aria-label="Panel de herramientas de dibujo manual"
      >
        {/* Herramientas de trazo */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setActiveTool('brush')}
            className={cn(
              "rounded-2xl flex items-center justify-center transition-all shadow-md group relative",
              isLarge ? "w-14 h-14" : "w-12 h-12",
              activeTool === 'brush' 
                ? "bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20 scale-105" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
              isHighContrast && activeTool === 'brush' && "bg-yellow-400 text-black ring-yellow-300"
            )}
            title="Pincel Artístico"
            aria-label="Pincel Artístico"
          >
            <Paintbrush size={isLarge ? 24 : 20} />
          </button>

          <button
            onClick={() => setActiveTool('pencil')}
            className={cn(
              "rounded-2xl flex items-center justify-center transition-all shadow-md group",
              isLarge ? "w-14 h-14" : "w-12 h-12",
              activeTool === 'pencil' 
                ? "bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20 scale-105" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
              isHighContrast && activeTool === 'pencil' && "bg-yellow-400 text-black ring-yellow-300"
            )}
            title="Lápiz Fino"
            aria-label="Lápiz Fino"
          >
            <Pencil size={isLarge ? 24 : 20} />
          </button>

          <button
            onClick={() => setActiveTool('marker')}
            className={cn(
              "rounded-2xl flex items-center justify-center transition-all shadow-md group",
              isLarge ? "w-14 h-14" : "w-12 h-12",
              activeTool === 'marker' 
                ? "bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20 scale-105" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
              isHighContrast && activeTool === 'marker' && "bg-yellow-400 text-black ring-yellow-300"
            )}
            title="Marcador / Resaltador Semitransparente"
            aria-label="Marcador"
          >
            <Highlighter size={isLarge ? 24 : 20} />
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={cn(
              "rounded-2xl flex items-center justify-center transition-all shadow-md group",
              isLarge ? "w-14 h-14" : "w-12 h-12",
              activeTool === 'eraser' 
                ? "bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-500/20 scale-105" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
              isHighContrast && activeTool === 'eraser' && "bg-yellow-400 text-black ring-yellow-300"
            )}
            title="Goma de Borrar"
            aria-label="Goma de Borrar"
          >
            <Eraser size={isLarge ? 24 : 20} />
          </button>
        </div>

        <div className="w-10 h-0.5 bg-slate-800 rounded-full my-1" />

        {/* Formas Geométricas */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => addVectorShape('rect')}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            title="Añadir Rectángulo"
            aria-label="Añadir Rectángulo"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => addVectorShape('circle')}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            title="Añadir Círculo"
            aria-label="Añadir Círculo"
          >
            <Circle size={16} />
          </button>
          <button
            onClick={() => addVectorShape('triangle')}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            title="Añadir Triángulo"
            aria-label="Añadir Triángulo"
          >
            <Triangle size={16} />
          </button>
          <button
            onClick={() => addVectorShape('star')}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            title="Añadir Estrella"
            aria-label="Añadir Estrella"
          >
            <Star size={16} />
          </button>
        </div>

        {/* Selector de color rápido */}
        <div className="flex flex-col items-center gap-2 mt-auto mb-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            {colorPalette.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-5 h-5 rounded-full transition-transform",
                  color === c ? "scale-125 ring-2 ring-white" : "opacity-80 hover:opacity-100"
                )}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>

          <label className="cursor-pointer relative group" title="Selector de Color Personalizado">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
            />
            <div 
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-bold group-hover:scale-110 transition-transform"
            >
              +
            </div>
          </label>
        </div>

        {/* Botón de limpiar lienzo */}
        <button
          onClick={handleClearCanvas}
          className="w-11 h-11 bg-slate-800/80 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-colors shadow-sm"
          title="Reiniciar Lienzo"
          aria-label="Reiniciar Lienzo"
        >
          <Trash2 size={18} />
        </button>
      </aside>

      {/* Área Central de Lienzo */}
      <section 
        ref={containerRef}
        className={cn(
          "flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-6 overflow-hidden",
          isHighContrast && "bg-black"
        )}
      >
        {/* Banner de Recuperación de Sesión Guardada */}
        <RestoreWorkBanner
          isOpen={showRestorePrompt}
          savedTimestamp={savedTimestamp}
          onRestore={restoreSavedCanvas}
          onDiscard={discardSavedCanvas}
          isHighContrast={isHighContrast}
        />

        {/* Barra superior del lienzo: Controles de Trazo, Grosor y Acciones */}
        <div className="w-full max-w-4xl mb-4 flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
          {/* Tamaño y Opacidad */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grosor</span>
              <input
                type="range"
                min="2"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-white w-6">{brushSize}px</span>
            </div>

            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opacidad</span>
              <input
                type="range"
                min="10"
                max="100"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                className="w-20 accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-white w-8">{brushOpacity}%</span>
            </div>

            {/* Sensibilidad Stylus */}
            <button
              onClick={() => setStylusPressureEnabled(!stylusPressureEnabled)}
              className={cn(
                "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors",
                stylusPressureEnabled 
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                  : "bg-slate-800 text-slate-500 border-slate-700"
              )}
              title="Sensibilidad de presión con Stylus / Lápiz óptico"
            >
              <span>Stylus</span>
              <span className={cn("w-1.5 h-1.5 rounded-full", stylusPressureEnabled ? "bg-blue-400 animate-pulse" : "bg-slate-600")} />
            </button>
          </div>

          {/* Deshacer, Rehacer, Guardar y Exportar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-xl transition-colors"
              title="Deshacer (Ctrl+Z)"
              aria-label="Deshacer"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-xl transition-colors"
              title="Rehacer (Ctrl+Y)"
              aria-label="Rehacer"
            >
              <Redo2 size={16} />
            </button>

            <button
              onClick={forceSaveNow}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
              title={lastAutoSaveTime ? `Autoguardado cada 30s. Último: ${lastAutoSaveTime.toLocaleTimeString()}` : "Guardar estado en LocalStorage"}
            >
              <Save size={14} className="text-emerald-400" />
              <span>Guardar</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-800 mx-1" />

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              title="Descargar Obra en PNG"
            >
              <Download size={14} />
              <span>Exportar PNG</span>
            </button>
          </div>
        </div>

        {/* Marco Principal del Canvas */}
        <div className={cn(
          "w-full max-w-4xl bg-slate-900 rounded-[2rem] p-3 border border-slate-800 shadow-2xl relative",
          isHighContrast && "border-2 border-yellow-400 bg-black"
        )}>
          {/* Etiquetas Superiores de Capas */}
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10 pointer-events-none">
            <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles size={10} /> Capa Base IA
            </span>
            <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Pencil size={10} /> Artista: Manual
            </span>
            {stylusPressureEnabled && lastPressure > 0 && (
              <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-800/80 rounded-full text-[9px] text-slate-400 font-mono">
                Presión: {Math.round(lastPressure * 100)}%
              </span>
            )}
          </div>

          <div className="canvas-outline rounded-[1.5rem] overflow-hidden bg-slate-950 flex items-center justify-center">
            <canvas ref={canvasRef} id="canvas-vozart" />
          </div>
        </div>

        {/* Gestor Flotante de Capas (Esquina inferior derecha) */}
        <div className="absolute bottom-6 left-10 hidden xl:flex flex-col gap-2 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl w-60 z-20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Layers size={14} className="text-blue-400" />
              <span>Panel de Capas</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">2 activas</span>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                className={cn(
                  "p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all",
                  activeLayerId === layer.id 
                    ? "bg-blue-600/15 border border-blue-500/40 text-white font-semibold" 
                    : "bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    layer.type === 'ia_base' ? "bg-emerald-400" : "bg-blue-500"
                  )} />
                  <span className="truncate max-w-[120px]">{layer.name}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="p-1 hover:text-white text-slate-500 transition-colors"
                  title={layer.visible ? "Ocultar Capa" : "Mostrar Capa"}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-red-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
