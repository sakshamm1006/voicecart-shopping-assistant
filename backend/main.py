from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import parse_intent

app = FastAPI(title="VoiceCart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IntentRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse-intent")
def parse(req: IntentRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")
    try:
        return parse_intent(req.text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")