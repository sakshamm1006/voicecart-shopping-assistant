import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-120b"

SYSTEM_PROMPT = """You are the intent parser for a voice shopping list app.
Convert the user's spoken sentence into JSON with exactly these keys:
- "intent": one of "add", "remove", "modify", "search", "unknown"
- "item": the product name, singular and lowercase, or null
- "quantity": a number, or null if not stated
- "unit": e.g. "bottles", "kg", or null
- "category": one of "Dairy", "Produce", "Bakery", "Meat & Fish", "Snacks", "Beverages", "Household", "Personal Care", "Pantry", "Other"

Rules:
- "I need apples", "Add apples", "I want to buy apples" all mean intent "add".
- "Remove milk from my list" means "remove".
- "Change milk to 3" means "modify" with quantity 3.
- "Find organic apples" means "search".
- If the sentence is unclear or unrelated to shopping, intent is "unknown".
Return only valid JSON, nothing else."""


def _extract_json(raw: str) -> dict:
    """Parse JSON even if the model wraps it in code fences."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def parse_intent(text: str) -> dict:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )
    return _extract_json(completion.choices[0].message.content)