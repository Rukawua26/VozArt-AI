# Backend VozArt (Python + FastAPI)

Este directorio contiene la implementación del servidor de backend de **VozArt** desarrollado en Python con **FastAPI** y **WebSockets**, tal como fue especificado en la arquitectura original del proyecto.

## 📋 Requisitos Previos

- Python 3.10 o superior
- Administrador de paquetes `pip` o entorno virtual `venv`
- (Opcional) Clave de API de Google Gemini o instancia local de Ollama

## 🚀 Instalación y Configuración

1. **Crear y activar un entorno virtual**:
   ```bash
   cd backend_python
   python -m venv venv
   # En Linux / macOS:
   source venv/bin/activate
   # En Windows:
   venv\Scripts\activate
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Variables de entorno**:
   Crea un archivo `.env` en este directorio con:
   ```env
   PORT=8000
   GEMINI_API_KEY=tu_clave_de_gemini_aqui
   OLLAMA_HOST=http://localhost:11434
   ```

4. **Iniciar el servidor en desarrollo**:
   ```bash
   python main.py
   # O utilizando uvicorn directamente:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 📡 Endpoints Disponibles

- `GET /api/health`: Comprobación de estado del servicio y conexión a Gemini.
- `POST /api/command`: Endpoint REST para procesar comandos de voz mediante payload JSON.
- `WS /ws/lienzo`: Endpoint WebSocket bidireccional en tiempo real para sincronización instantánea con el lienzo de dibujo.
