"""Standalone FastAPI app for Official Mistral article generation.
Run: `python backend/mistral_official_app.py`
"""

import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from app.api.v1.endpoints.mistral_official_articles import router as official_router

load_dotenv()
app = FastAPI(title="Mistral Official Article Generator", version="1.0.0")
app.include_router(official_router)


@app.get("/")
async def root():
    return {
        "service": "mistral-official",
        "routes": ["GET /mistral-official/articles/generate"],
    }


if __name__ == "__main__":
    uvicorn.run("mistral_official_app:app", host="0.0.0.0", port=8011, reload=False)
