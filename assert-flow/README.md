# 🔥 Assert Flow — Simulador de Conflictos con IA

> **Proyecto 3** — Vibe Coders League 2.0 (Platzi)
> React 19 + TanStack Start + Tailwind CSS 4 + shadcn/ui | Python FastAPI | NVIDIA NIM (Llama 3.1)

Simulador interactivo donde **cada partida es única**. La IA de NVIDIA genera 3 escenarios de conflicto aleatorios (trabajo, equipo, amistad) con 4 opciones cada uno, analiza tus respuestas y te da feedback personalizado.

```
Frontend ──POST /api/generate-scenarios──▶ FastAPI ──▶ NVIDIA Llama 3.1
         ──POST /api/analyze───────────────▶ FastAPI ──▶ NVIDIA Llama 3.1
```

## 🚀 Inicio rápido

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu NVIDIA_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🧠 Endpoints

### `POST /api/generate-scenarios`

Genera 3 escenarios de conflicto con opciones usando IA. Sin parámetros.

**Respuesta:**
```json
{
  "scenarios": [
    {
      "title": "Pidiendo un aumento",
      "context": "...",
      "interlocutor": "Tu jefe",
      "role": "Director de área",
      "dialogue": "...",
      "options": [
        { "text": "...", "score": 2, "feedback": "..." },
        { "text": "...", "score": 9, "feedback": "..." },
        { "text": "...", "score": 4, "feedback": "..." },
        { "text": "...", "score": 1, "feedback": "..." }
      ]
    }
  ]
}
```

### `POST /api/analyze`

Analiza la respuesta del usuario con IA.

| Campo | Descripción |
|---|---|
| `scenario_title` | Título del escenario |
| `scenario_context` | Contexto de la situación |
| `interlocutor_name` | Nombre |
| `interlocutor_role` | Rol |
| `interlocutor_dialogue` | Frase del interlocutor |
| `selected_option_text` | Respuesta del usuario |

**Respuesta:** `{ score, tone, feedback, suggestion }`

## 🗂️ Estructura

```
assert-flow/
├── frontend/          # TanStack Start + shadcn/ui
│   └── src/routes/index.tsx
├── backend/           # FastAPI + NVIDIA NIM
│   └── app/
│       ├── main.py    # POST /api/generate-scenarios y /api/analyze
│       ├── config.py  # Cliente OpenAI para NVIDIA
│       └── schemas.py # Pydantic models
└── README.md
```

> ⚡ **Sin API key:** el simulador usa escenarios fijos como fallback.
