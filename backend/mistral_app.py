"""Standalone FastAPI app only for Mistral article generation.
Run: `python backend/mistral_app.py`
Does not modify the original main application.
"""

import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from app.api.v1.endpoints.mistral_articles import router as mistral_router

load_dotenv()  # load .env for tokens
app = FastAPI(title="Mistral Article Generator", version="1.0.0")
app.include_router(mistral_router)


@app.get("/")
async def root():
    return {
        "service": "mistral-generator",
        "routes": ["GET /mistral/articles/generate"],
    }


if __name__ == "__main__":
    uvicorn.run("mistral_app:app", host="0.0.0.0", port=8010, reload=False)
