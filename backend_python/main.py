"""
VozArt - Servidor Backend en Python con FastAPI y WebSockets
Punto de entrada para el procesamiento en tiempo real de comandos de voz,
gestión del lienzo digital inclusivo y comunicación con modelos de IA.
"""

import os
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("VozArtBackend")

app = FastAPI(
    title="VozArt API & WebSocket Server",
    description="Servidor de arte digital interactivo por voz y lienzo inclusivo",
    version="1.0.0"
)

# Habilitar CORS para permitir conexión desde el frontend (Next.js / Vite / React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# Modelos de Pydantic
class VoiceCommandRequest(BaseModel):
    text: string = ""
    client_id: Optional[str] = None

class CanvasActionResponse(BaseModel):
    action: str
    shape: Optional[str] = None
    color: Optional[str] = None
    size: Optional[int] = None
    prompt: Optional[str] = None
    explanation: Optional[str] = None
    artElements: Optional[List[dict]] = None

# Gestor de Conexiones WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Cliente conectado. Total activos: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Cliente desconectado. Total activos: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error enviando mensaje a cliente: {e}")

manager = ConnectionManager()

async def process_with_ai(prompt_text: str) -> dict:
    """
    Interpreta el comando de voz del usuario usando Gemini u Ollama.
    Devuelve las directivas exactas para transformar el lienzo.
    """
    system_prompt = f"""
    Eres el núcleo de inteligencia artística de "VozArt", un lienzo inclusivo.
    El usuario dictó: "{prompt_text}".
    
    Genera un JSON con una de las siguientes acciones:
    - GENERATE_ART: crea composición artística para la capa base (incluye 'color', 'explanation', y 'artElements')
    - ADD_SHAPE: inserta forma ('shape': 'rect' | 'circle' | 'triangle' | 'star', 'color', 'size')
    - CHANGE_BG: altera fondo ('color')
    - SET_TOOL: cambia herramienta ('tool': 'pencil' | 'brush' | 'marker' | 'eraser')
    - SET_COLOR: fija color ('color')
    - CLEAR_CANVAS: reinicia el lienzo
    - UNDO: revierte el último cambio
    
    Responde solo con el JSON estrictamente válido.
    """

    # Opción 1: Gemini API si la clave está configurada
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": system_prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text_content)
        except Exception as e:
            logger.error(f"Error llamando a Gemini: {e}")

    # Opción 2: Fallback determinista local o regla directa
    lower = prompt_text.lower()
    if "borra" in lower or "limpia" in lower:
        return {"action": "CLEAR_CANVAS", "explanation": "Lienzo reiniciado"}
    elif "círculo" in lower or "circulo" in lower:
        return {"action": "ADD_SHAPE", "shape": "circle", "color": "#10B981", "size": 100, "explanation": "Círculo esmeralda añadido"}
    elif "rectángulo" in lower or "cuadrado" in lower:
        return {"action": "ADD_SHAPE", "shape": "rect", "color": "#3B82F6", "size": 120, "explanation": "Rectángulo azul añadido"}
    elif "triángulo" in lower or "triangulo" in lower:
        return {"action": "ADD_SHAPE", "shape": "triangle", "color": "#F59E0B", "size": 110, "explanation": "Triángulo dorado añadido"}
    elif "estrella" in lower:
        return {"action": "ADD_SHAPE", "shape": "star", "color": "#EC4899", "size": 100, "explanation": "Estrella rosada añadida"}
    elif "deshaz" in lower or "deshacer" in lower:
        return {"action": "UNDO", "explanation": "Acción deshecha"}
    else:
        # Generación artística base
        return {
            "action": "GENERATE_ART",
            "prompt": prompt_text,
            "color": "#0F172A",
            "explanation": f"Generado arte para: {prompt_text}",
            "artElements": [
                {"type": "circle", "x": 200, "y": 150, "radius": 70, "fill": "#3B82F6", "opacity": 0.5},
                {"type": "circle", "x": 400, "y": 250, "radius": 110, "fill": "#10B981", "opacity": 0.4},
                {"type": "rect", "x": 500, "y": 100, "width": 120, "height": 120, "fill": "#8B5CF6", "opacity": 0.6}
            ]
        }

@app.get("/")
def read_root():
    return {"status": "VozArt Backend en ejecución", "endpoints": ["/api/health", "/ws/lienzo"]}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "VozArt FastAPI Engine", "gemini_enabled": bool(GEMINI_API_KEY)}

@app.post("/api/command")
async def execute_command(req: VoiceCommandRequest):
    """Endpoint REST para procesar comandos manualmente"""
    result = await process_with_ai(req.text)
    return {"status": "success", "result": result}

@app.websocket("/ws/lienzo")
async def websocket_endpoint(websocket: WebSocket):
    """
    Canal de comunicación en tiempo real para el lienzo digital.
    Envía y recibe comandos de voz, cambios de herramientas y estado del arte.
    """
    await manager.connect(websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            
            if data.get("type") == "VOICE_COMMAND":
                user_text = data.get("text", "")
                logger.info(f"Comando de voz recibido: {user_text}")

                # Enviar actualización de estado
                await websocket.send_json({
                    "type": "STATUS_UPDATE",
                    "status": "processing",
                    "message": "Interpretando comando con IA..."
                })

                # Procesar comando con el motor de IA
                ai_action = await process_with_ai(user_text)

                # Notificar acción generada al cliente
                await websocket.send_json({
                    "type": "AI_ACTION",
                    "data": ai_action,
                    "rawText": user_text
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
