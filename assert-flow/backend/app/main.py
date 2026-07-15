from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import client, NVIDIA_MODEL
from .schemas import AnalyzeRequest, AnalyzeResponse, GenerateResponse

app = FastAPI(
    title="Assert Flow API",
    description="Backend con IA (NVIDIA NIM) para el Simulador de Conflictos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """
Eres un coach de comunicación especializado en asertividad y manejo de conflictos.
Analizas respuestas en escenarios difíciles y devuelves:
- score (0-10): qué tan asertiva es la respuesta.
- tone: "Asertivo" si score >= 7, "En camino" si 5-6, "Patrón a revisar" si < 5.
- feedback (1-2 oraciones en español explicando el estilo).
- suggestion (1-2 oraciones en español con una alternativa concreta más asertiva).
Devuelve solo JSON.
""".strip()


@app.get("/")
def root():
    return {"status": "ok", "message": "Assert Flow API running"}


GENERATE_SYSTEM_PROMPT = """
Eres un experto en comunicación y conflictos interpersonales.
Genera 3 escenarios de conflicto realistas en español (ámbitos: laboral, equipo, amistad/familia).
Cada escenario debe tener:
- title: nombre corto
- context: descripción de la situación (2-3 oraciones)
- interlocutor: nombre de la otra persona
- role: su rol
- dialogue: una frase que dice (entre comillas)
- options: array de 4 opciones de respuesta con:
  - text: la respuesta textual
  - score: 0-10 según qué tan asertiva es
  - feedback: explicación breve de por qué
Devuelve solo un JSON con un array "scenarios".
""".strip()


@app.post("/api/generate-scenarios", response_model=GenerateResponse)
def generate_scenarios():
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="NVIDIA API no configurada. Revisa la variable NVIDIA_API_KEY.",
        )

    try:
        resp = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": GENERATE_SYSTEM_PROMPT},
                {"role": "user", "content": "Genera 3 escenarios de conflicto variados (trabajo, equipo, amistad)."},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        raw = resp.choices[0].message.content.strip()
        import json, re

        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            raw = match.group()
        data = json.loads(raw)
        scenarios = data.get("scenarios", data if isinstance(data, list) else [])
        if isinstance(scenarios, list) and len(scenarios) >= 3:
            return GenerateResponse(scenarios=scenarios[:3])

        raise ValueError("No se generaron 3 escenarios válidos")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar escenarios con IA: {str(e)}",
        )


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="NVIDIA API no configurada. Revisa la variable NVIDIA_API_KEY.",
        )

    user_prompt = f"""
Escenario: {req.scenario_title}
Contexto: {req.scenario_context}
Interlocutor: {req.interlocutor_name} ({req.interlocutor_role})
Dice: "{req.interlocutor_dialogue}"

Respuesta del usuario: "{req.selected_option_text}"

Analiza y devuelve JSON con score, tone, feedback, suggestion.
""".strip()

    try:
        resp = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=300,
        )
        raw = resp.choices[0].message.content.strip()

        import json

        data = json.loads(raw)
        score = int(data.get("score", 5))
        score = max(0, min(10, score))

        tone = data.get("tone", "Patrón a revisar")
        feedback = data.get("feedback", "")
        suggestion = data.get("suggestion", "")

        return AnalyzeResponse(
            score=score, tone=tone, feedback=feedback, suggestion=suggestion
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al analizar con IA: {str(e)}",
        )
