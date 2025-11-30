"""Router for generating articles with Mistral (isolated)."""

from fastapi import APIRouter, Query
from app.llm_mistral.services.article_generator import mistral_article_generator

router = APIRouter(
    prefix="/mistral/articles", tags=["mistral-articles"]
)  # separate namespace


@router.get("/generate")
async def generate_article(
    keyword: str = Query("AI", description="Keyword to generate article for"),
):
    """Generate a single article using Mistral model."""
    article = mistral_article_generator.generate_article(keyword)
    return {"status": "ok", "keyword": keyword, "article": article}
