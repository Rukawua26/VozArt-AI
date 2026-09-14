# Arquitectura del Sistema - VozArt: Lienzo Digital Vivo Inclusivo

Este documento describe la arquitectura global, los patrones de diseño y la configuración técnica del proyecto **VozArt**, alineada fielmente con las especificaciones del diseño original.

---

## 🏛️ 1. Estructura de Directorios del Proyecto

```
vozart/
├── ARQUITECTURA.md              # Documentación técnica y mapa arquitectónico
├── index.html                  # Punto de entrada HTML con accesibilidad y metadatos
├── package.json                # Dependencias de frontend y servidor Node.js
├── server.ts                   # Servidor de ejecución Full-Stack (Express + WebSocket + Gemini 2.5 Flash)
├── backend_python/             # Implementación en Python (FastAPI + WebSockets)
│   ├── main.py                 # Servidor FastAPI y gestor de WebSockets en Python
│   ├── requirements.txt        # Dependencias de Python
│   └── README.md               # Instrucciones de despliegue y uso del backend
├── src/
│   ├── main.tsx                # Entrada React con ErrorBoundary
│   ├── App.tsx                 # Contenedor raíz con sincronización de estado y WebSockets
│   ├── index.css               # Estilos globales y utilidades de Tailwind CSS
│   ├── types/
│   │   └── art.ts              # Tipos TypeScript: Herramientas, Capas, IA y Accesibilidad
│   ├── components/
│   │   ├── CanvasInclusivo.tsx # Lienzo con capas (Base IA + Manual), Stylus con sensibilidad de presión
│   │   ├── VoiceControl.tsx    # Reconocimiento de voz en tiempo real con Web Speech API y visualizador de onda
│   │   └── AccessibilityModal.tsx # Modal de accesibilidad (Alto contraste WCAG AAA, botones grandes, atajos)
│   └── lib/
│       └── utils.ts            # Utilidades de clases y estilos (clsx + twMerge)
```

---

## 🎨 2. Módulos Principales y Especificaciones Técnicas

### 2.1. Lienzo Interactivo con Capas (CanvasInclusivo)
- **Capa Base (IA)**: Aloja composiciones artísticas, fondos generativos y elementos gráficos generados a partir de los comandos dictados por el usuario. Dispone de control de visibilidad y opacidad.
- **Capa Superior (Manual / Artista)**: Permite la interacción directa mediante pincel, lápiz fino, marcador y goma de borrar, sin sobreescribir destructivamente la capa base.
- **Soporte de Stylus / Lápiz Óptico**: Integra la API de `PointerEvents` y la propiedad `e.pressure`, modulando en tiempo real el grosor del trazo según la fuerza aplicada.
- **Historial Deshacer / Rehacer (Undo/Redo)**: Mantiene una pila de estados inmutables en memoria para revertir o recuperar acciones con `Ctrl+Z` y `Ctrl+Y`.
- **Exportación**: Descarga directa de la composición combinada en formato PNG de alta resolución.

### 2.2. Reconocimiento de Voz y Motor de IA (VoiceControl)
- **Web Speech API**: Captura continua o por pulsación con reconocimiento de voz en español (`es-ES` / `es-419`).
- **Visualizador de Audio Reactivo**: Animación de ondas de sonido con `motion/react` durante la escucha activa.
- **Procesamiento de Lenguaje Natural**:
  - Comandos de control directos: Cambio de herramientas, grosor, color, limpieza y deshacer.
  - Comandos generativos: Interpretación semántica con **Gemini 2.5 Flash** para generar paletas de colores y elementos compositivos para la capa base.

### 2.3. Módulo de Accesibilidad Inclusiva (AccessibilityModal)
- **Modo Alto Contraste**: Paleta con contraste superior a 7:1 (WCAG AAA) en negro profundo y amarillo de alta visibilidad.
- **Modo Botones Grandes**: Áreas táctiles ampliadas (mínimo 48px) para personas con motricidad reducida.
- **Atajos de Teclado**:
  - `B`: Pincel
  - `E`: Goma de borrar
  - `Ctrl + Z`: Deshacer
  - `Ctrl + Y`: Rehacer
- **Confirmación Sonora**: Integración con `SpeechSynthesis` para lectura audible de las respuestas de la IA.

### 2.4. Comunicación Bidireccional en Tiempo Real (WebSockets)
- Protocolo seguro adaptativo (`wss://` o `ws://`).
- Emisión inmediata de cambios de estado:
  - `STATUS_UPDATE`: Indicador visual de procesamiento en curso.
  - `AI_ACTION`: Acciones estructuradas recibidas e inyectadas al lienzo.
