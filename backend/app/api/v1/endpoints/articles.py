"""
Articles API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger

from app.models.schemas import (
    ArticleCreate, ArticleUpdate, ArticleResponse, 
    ArticleAIEnhancement, SchedulePublishRequest
)
from app.core.database import get_database
from app.core.security import get_current_user, get_current_admin_user
from app.services.google_service import gemini_service
from app.services.rabbitmq_service import rabbitmq_service
from slugify import slugify

router = APIRouter()


@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_data: ArticleCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create new article"""
    try:
        # Create article dict
        article_dict = article_data.model_dump()
        article_dict['author_id'] = current_user['sub']
        article_dict['author_name'] = current_user['email']
        article_dict['slug'] = slugify(article_data.title)
        article_dict['status'] = 'draft'
        article_dict['created_at'] = datetime.utcnow()
        article_dict['view_count'] = 0
        article_dict['like_count'] = 0
        article_dict['comment_count'] = 0
        
        # Insert to database
        result = await db.articles.insert_one(article_dict)
        article_id = str(result.inserted_id)
        
        # Queue AI processing task
        try:
            await rabbitmq_service.publish_article_processing_task(
                article_id=article_id,
                operations=['summarize', 'categorize', 'embed', 'hashtags']
            )
            logger.info(f"📤 Queued AI processing for article {article_id}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to queue AI task: {e}")
        
        # Get created article
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        article['_id'] = article_id
        
        return ArticleResponse(**article)
        
    except Exception as e:
        logger.error(f"❌ Create article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    status: Optional[str] = None,
    category: Optional[str] = None,
    author_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db = Depends(get_database)
):
    """Get all articles with filters"""
    try:
        # Build query
        query = {}
        if status:
            query['status'] = status
        if category:
            query['category'] = category
        if author_id:
            query['author_id'] = author_id
        
        # Get articles
        cursor = db.articles.find(query).sort('created_at', -1).skip(skip).limit(limit)
        articles = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for article in articles:
            article['_id'] = str(article['_id'])
        
        return [ArticleResponse(**article) for article in articles]
        
    except Exception as e:
        logger.error(f"❌ Get articles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db = Depends(get_database)
):
    """Get article by ID"""
    try:
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Increment view count
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$inc": {"view_count": 1}}
        )
        
        article['_id'] = article_id
        return ArticleResponse(**article)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update article"""
    try:
        # Check if article exists
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Check permissions (owner or admin)
        if article['author_id'] != current_user['sub'] and current_user['role'] not in ['admin', 'moderator']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update article
        update_data = article_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        # Update slug if title changed
        if 'title' in update_data:
            update_data['slug'] = slugify(update_data['title'])
        
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": update_data}
        )
        
        # Get updated article
        updated_article = await db.articles.find_one({"_id": ObjectId(article_id)})
        updated_article['_id'] = article_id
        
        return ArticleResponse(**updated_article)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Update article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Delete article (Admin only)"""
    try:
        result = await db.articles.delete_one({"_id": ObjectId(article_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
        
        return {"success": True, "message": "Article deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{article_id}/enhance", response_model=ArticleAIEnhancement)
async def enhance_article_with_ai(
    article_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """AI enhance article (summary, hashtags, category)"""
    try:
        # Get article
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Generate AI enhancements
        summary = await gemini_service.generate_summary(article['content'])
        hashtags = await gemini_service.generate_hashtags(article['title'], article['content'])
        category = await gemini_service.classify_category(article['title'], article['content'])
        key_points = await gemini_service.extract_key_points(article['content'])
        
        # Check content moderation
        moderation = await gemini_service.moderate_content(article['content'])
        warnings = []
        if moderation['flagged']:
            warnings = list(moderation['categories'].keys())
        
        # Update article with AI data
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {
                "$set": {
                    "ai_summary": summary,
                    "ai_hashtags": hashtags,
                    "ai_category": category,
                    "content_warnings": warnings,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        enhancement = ArticleAIEnhancement(
            summary=summary,
            hashtags=hashtags,
            category_suggestion=category,
            key_points=key_points,
            content_warnings=warnings
        )
        
        return enhancement
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ AI enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{article_id}/publish")
async def publish_article(
    article_id: str,
    schedule_request: SchedulePublishRequest,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Publish article (immediate or scheduled)"""
    try:
        # Get article
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        if article['status'] != 'approved':
            raise HTTPException(status_code=400, detail="Article must be approved first")
        
        # Determine publish time
        if schedule_request.manual_time:
            publish_time = schedule_request.manual_time
        elif schedule_request.use_ai_scheduling:
            # AI decides best time (simplified - analyze historical data)
            # For now, schedule for next peak hour (12pm or 8pm)
            now = datetime.utcnow()
            if now.hour < 12:
                publish_time = now.replace(hour=12, minute=0, second=0, microsecond=0)
            else:
                publish_time = now.replace(hour=20, minute=0, second=0, microsecond=0)
            logger.info(f"🤖 AI scheduled publish for {publish_time}")
        else:
            # Publish immediately
            publish_time = datetime.utcnow()
        
        # Update article
        update_data = {
            "publish_time": publish_time,
            "updated_at": datetime.utcnow()
        }
        
        # If publish time is now, mark as published
        if publish_time <= datetime.utcnow():
            update_data['status'] = 'published'
            update_data['published_at'] = datetime.utcnow()
        
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Article scheduled" if publish_time > datetime.utcnow() else "Article published",
            "publish_time": publish_time.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Publish article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{article_id}/approve")
async def approve_article(
    article_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Approve article (Moderator/Admin only)"""
    try:
        result = await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {
                "$set": {
                    "status": "approved",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Article not found")
        
        return {"success": True, "message": "Article approved"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Approve article error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/similar/{article_id}")
async def find_similar_articles(
    article_id: str,
    limit: int = Query(5, ge=1, le=20),
    db = Depends(get_database)
):
    """Find similar articles using vector search"""
    try:
        # Get article with vector
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article or not article.get('article_vector'):
            raise HTTPException(status_code=404, detail="Article or vector not found")
        
        # MongoDB Atlas Vector Search
        # Note: Requires Atlas Search index on article_vector field
        pipeline = [
            {
                "$search": {
                    "knnBeta": {
                        "vector": article['article_vector'],
                        "path": "article_vector",
                        "k": limit + 1  # +1 to exclude self
                    }
                }
            },
            {
                "$match": {
                    "_id": {"$ne": ObjectId(article_id)},  # Exclude self
                    "status": "published"
                }
            },
            {"$limit": limit}
        ]
        
        similar_articles = await db.articles.aggregate(pipeline).to_list(length=limit)
        
        for art in similar_articles:
            art['_id'] = str(art['_id'])
        
        return {
            "article_id": article_id,
            "similar_articles": [ArticleResponse(**art) for art in similar_articles]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Similar articles search error: {e}")
        # Fallback to simple category match if vector search fails
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        similar = await db.articles.find({
            "category": article.get('category'),
            "_id": {"$ne": ObjectId(article_id)},
            "status": "published"
        }).limit(limit).to_list(length=limit)
        
        for art in similar:
            art['_id'] = str(art['_id'])
        
        return {
            "article_id": article_id,
            "similar_articles": [ArticleResponse(**art) for art in similar],
            "note": "Using fallback category matching"
        }
