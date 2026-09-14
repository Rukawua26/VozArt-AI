import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();

// Configuración de Gemini
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  // Middleware de Vite en desarrollo
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor VozArt corriendo en http://localhost:${PORT}`);
  });

  // Configuración de WebSockets
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Cliente conectado a VozArt");

    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        
        if (payload.type === "VOICE_COMMAND") {
          console.log("Procesando comando de voz:", payload.text);

          ws.send(JSON.stringify({
            type: "STATUS_UPDATE",
            status: "processing",
            message: "Interpretando comando con IA..."
          }));
          
          // Usar Gemini para interpretar el comando de forma creativa y técnica
          const prompt = `Actúa como el motor de IA de "VozArt", un lienzo digital inclusivo en tiempo real.
El usuario ha dictado el siguiente comando de voz en español: "${payload.text}".

Debes interpretar la intención del usuario y devolver un JSON estricto con la acción requerida.
Las acciones válidas son:
1. GENERATE_ART: cuando el usuario pide generar arte, un paisaje, fondo, concepto artístico (ej: "crea un atardecer", "haz un bosque psicodélico", "genera una galaxia").
   Debe incluir:
   - "action": "GENERATE_ART"
   - "prompt": el concepto resumido
   - "color": color de fondo sugerido (hexadecimal)
   - "explanation": breve frase en español explicando lo que generaste (máx 15 palabras)
   - "artElements": un arreglo de 3 a 8 elementos decorativos para la capa base (con campos: type ("circle" | "rect" | "gradient"), x (número 50 a 700), y (número 50 a 450), fill (hexadecimal o rgba vibrante), radius o width/height, opacity (0.2 a 0.9))

2. ADD_SHAPE: cuando pide agregar una forma geométrica específica (ej: "pon un círculo rojo", "dibuja un rectángulo azul").
   - "action": "ADD_SHAPE"
   - "shape": "rect" | "circle" | "triangle" | "star"
   - "color": color en hexadecimal
   - "size": número entre 40 y 250
   - "explanation": frase corta en español

3. CHANGE_BG: cuando pide cambiar el color de fondo del lienzo (ej: "fondo negro", "fondo amarillo pastel").
   - "action": "CHANGE_BG"
   - "color": color en hexadecimal
   - "explanation": frase corta en español

4. SET_TOOL: cuando pide cambiar de herramienta (ej: "pasa a lápiz", "quiero la goma", "cambia a marcador").
   - "action": "SET_TOOL"
   - "tool": "pencil" | "brush" | "marker" | "eraser"
   - "explanation": frase corta

5. SET_COLOR: cuando pide cambiar el color del pincel actual (ej: "usa color esmeralda").
   - "action": "SET_COLOR"
   - "color": hexadecimal
   - "explanation": frase corta

6. CLEAR_CANVAS: cuando pide borrar todo o reiniciar el lienzo.
   - "action": "CLEAR_CANVAS"
   - "explanation": "Lienzo reiniciado"

7. UNDO: cuando pide deshacer.
   - "action": "UNDO"
   - "explanation": "Acción deshecha"

Responde EXCLUSIVAMENTE con el objeto JSON válido, sin markdown ni comillas triples adicionales.`;

          // Usar la clave de Gemini del usuario (Google AI Studio) o la por defecto del servidor
          const effectiveApiKey = payload.userApiKey?.trim() || process.env.GEMINI_API_KEY || "";
          const activeClient = new GoogleGenAI({
            apiKey: effectiveApiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const result = await activeClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
            }
          });

          const responseText = result.text;
          console.log("Respuesta de Gemini:", responseText);
          
          if (responseText) {
            const parsedData = JSON.parse(responseText);
            ws.send(JSON.stringify({
              type: "AI_ACTION",
              data: parsedData,
              rawText: payload.text
            }));
          }
        }
      } catch (error) {
        console.error("Error procesando mensaje:", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Error al procesar el comando" }));
      }
    });

    ws.on("close", () => {
      console.log("Cliente desconectado");
    });
  });
}

startServer();
