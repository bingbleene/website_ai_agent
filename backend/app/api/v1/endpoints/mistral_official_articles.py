"""Router for Official Mistral API article generation."""

from fastapi import APIRouter, Query
from app.llm_mistral.services.article_generator_official import (
    mistral_official_article_generator,
)

router = APIRouter(prefix="/mistral-official/articles", tags=["mistral-official"])


@router.get("/generate")
async def generate_article(
    keyword: str = Query("AI", description="Keyword để tạo bài"),
):
    article = mistral_official_article_generator.generate_article(keyword)
    return {"status": "ok", "article": article, "keyword": keyword}
