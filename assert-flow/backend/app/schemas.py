from pydantic import BaseModel, field_validator


class AnalyzeRequest(BaseModel):
    scenario_title: str
    scenario_context: str
    interlocutor_name: str
    interlocutor_role: str
    interlocutor_dialogue: str
    selected_option_text: str

    @field_validator("scenario_title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El título del escenario no puede estar vacío")
        return v.strip()

    @field_validator("selected_option_text")
    @classmethod
    def option_not_empty(cls, v):
        if not v.strip():
            raise ValueError("La respuesta seleccionada no puede estar vacía")
        return v.strip()


class AnalyzeResponse(BaseModel):
    score: int
    tone: str
    feedback: str
    suggestion: str


class OptionData(BaseModel):
    text: str
    score: int
    feedback: str


class ScenarioData(BaseModel):
    title: str
    context: str
    interlocutor: str
    role: str
    dialogue: str
    options: list[OptionData]


class GenerateResponse(BaseModel):
    scenarios: list[ScenarioData]
