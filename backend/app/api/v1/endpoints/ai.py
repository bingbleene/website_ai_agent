"""
AI Services API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from bson import ObjectId
from loguru import logger

from app.models.schemas import (
    AIGenerateRequest, AIGenerateResponse,
    TranslationRequest, TranslationResponse,
    RecommendationRequest, RecommendationResponse,
    ArticleResponse
)
from app.core.database import get_database
from app.core.security import get_current_user
from app.services.google_service import gemini_service
from app.services.google_service import google_service
from app.services.aws_service import aws_service

router = APIRouter()


@router.post("/generate", response_model=AIGenerateResponse)
async def generate_ai_content(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI content"""
    try:
        result = await gemini_service.generate_text(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        response = AIGenerateResponse(
            result=result,
            model=gemini_service.model,
            tokens_used=len(result.split())  # Approximation
        )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ AI generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate", response_model=TranslationResponse)
async def translate_article(
    request: TranslationRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Translate article to another language"""
    try:
        # Get article
        article = await db.articles.find_one({"_id": ObjectId(request.article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Detect source language
        source_lang = await google_service.detect_language(article['title'])
        
        # Translate title
        title_translation = await google_service.translate_text(
            text=article['title'],
            target_language=request.target_language,
            source_language=source_lang
        )
        
        # Translate content
        content_translation = await google_service.translate_text(
            text=article['content'],
            target_language=request.target_language,
            source_language=source_lang
        )
        
        # Translate summary if exists
        summary_translation = None
        if article.get('summary'):
            summary_trans = await google_service.translate_text(
                text=article['summary'],
                target_language=request.target_language,
                source_language=source_lang
            )
            summary_translation = summary_trans['translated_text']
        
        response = TranslationResponse(
            article_id=request.article_id,
            original_language=source_lang,
            target_language=request.target_language,
            translated_title=title_translation['translated_text'],
            translated_content=content_translation['translated_text'],
            translated_summary=summary_translation
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str = Query(...),
    limit: int = Query(10, ge=1, le=50),
    db = Depends(get_database)
):
    """Get personalized article recommendations"""
    try:
        # Try Amazon Personalize
        try:
            recommended_ids = await aws_service.get_recommendations(
                user_id=user_id,
                limit=limit
            )
            
            if recommended_ids:
                # Get article details
                article_ids = [ObjectId(aid) for aid in recommended_ids]
                articles = await db.articles.find({
                    "_id": {"$in": article_ids},
                    "status": "published"
                }).to_list(length=limit)
                
                for article in articles:
                    article['_id'] = str(article['_id'])
                
                return RecommendationResponse(
                    user_id=user_id,
                    recommended_articles=[ArticleResponse(**art) for art in articles]
                )
        except Exception as personalize_error:
            logger.warning(f"⚠️ Personalize failed: {personalize_error}")
        
        # Fallback: Popular articles
        articles = await db.articles.find({
            "status": "published"
        }).sort("view_count", -1).limit(limit).to_list(length=limit)
        
        for article in articles:
            article['_id'] = str(article['_id'])
        
        return RecommendationResponse(
            user_id=user_id,
            recommended_articles=[ArticleResponse(**art) for art in articles]
        )
        
    except Exception as e:
        logger.error(f"❌ Recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/moderate-content")
async def moderate_content(
    content: str,
    current_user: dict = Depends(get_current_user)
):
    """Check content for policy violations"""
    try:
        moderation_result = await gemini_service.moderate_content(content)
        
        return {
            "flagged": moderation_result['flagged'],
            "categories": moderation_result['categories'],
            "warning": "Content contains sensitive material" if moderation_result['flagged'] else None
        }
        
    except Exception as e:
        logger.error(f"❌ Content moderation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-optimal-time")
async def analyze_optimal_publish_time(
    category: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Analyze historical data to find optimal publish time"""
    try:
        # Aggregate view events by hour for this category
        pipeline = [
            {
                "$lookup": {
                    "from": "articles",
                    "localField": "article_id",
                    "foreignField": "_id",
                    "as": "article"
                }
            },
            {"$unwind": "$article"},
            {
                "$match": {
                    "event_type": "view",
                    "article.category": category
                }
            },
            {
                "$group": {
                    "_id": {"$hour": "$timestamp"},
                    "view_count": {"$sum": 1}
                }
            },
            {"$sort": {"view_count": -1}},
            {"$limit": 5}
        ]
        
        results = await db.analytics.aggregate(pipeline).to_list(length=5)
        
        peak_hours = [
            {"hour": item['_id'], "views": item['view_count']}
            for item in results
        ]
        
        optimal_hour = peak_hours[0]['hour'] if peak_hours else 12
        
        return {
            "category": category,
            "optimal_hour": optimal_hour,
            "peak_hours": peak_hours,
            "recommendation": f"Best time to publish: {optimal_hour}:00"
        }
        
    except Exception as e:
        logger.error(f"❌ Optimal time analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
