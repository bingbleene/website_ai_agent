"""
Comments API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger

from app.models.schemas import CommentCreate, CommentResponse
from app.core.database import get_database
from app.core.security import get_current_user, get_current_admin_user
from app.services.google_service import google_service

router = APIRouter()


@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create new comment"""
    try:
        # Check if article exists
        article = await db.articles.find_one({"_id": ObjectId(comment_data.article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Analyze sentiment
        sentiment_result = await google_service.analyze_sentiment(comment_data.content)
        
        # Create comment
        comment_dict = {
            "article_id": comment_data.article_id,
            "user_id": current_user['sub'],
            "user_name": current_user.get('email', 'Anonymous'),
            "content": comment_data.content,
            "sentiment": sentiment_result['sentiment'],
            "sentiment_score": sentiment_result['score'],
            "is_flagged": sentiment_result['sentiment'] == 'negative' and sentiment_result['score'] < -0.5,
            "created_at": datetime.utcnow()
        }
        
        result = await db.comments.insert_one(comment_dict)
        comment_id = str(result.inserted_id)
        
        # Update article comment count
        await db.articles.update_one(
            {"_id": ObjectId(comment_data.article_id)},
            {"$inc": {"comment_count": 1}}
        )
        
        comment_dict['_id'] = comment_id
        
        logger.info(f"✅ Comment created with sentiment: {sentiment_result['sentiment']}")
        
        return CommentResponse(**comment_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Create comment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[CommentResponse])
async def get_comments(
    article_id: Optional[str] = None,
    user_id: Optional[str] = None,
    sentiment: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db = Depends(get_database)
):
    """Get comments with filters"""
    try:
        # Build query
        query = {}
        if article_id:
            query['article_id'] = article_id
        if user_id:
            query['user_id'] = user_id
        if sentiment:
            query['sentiment'] = sentiment
        if is_flagged is not None:
            query['is_flagged'] = is_flagged
        
        # Get comments
        cursor = db.comments.find(query).sort('created_at', -1).skip(skip).limit(limit)
        comments = await cursor.to_list(length=limit)
        
        for comment in comments:
            comment['_id'] = str(comment['_id'])
        
        return [CommentResponse(**comment) for comment in comments]
        
    except Exception as e:
        logger.error(f"❌ Get comments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/article/{article_id}", response_model=List[CommentResponse])
async def get_article_comments(
    article_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db = Depends(get_database)
):
    """Get all comments for an article"""
    try:
        cursor = db.comments.find({"article_id": article_id}).sort('created_at', -1).skip(skip).limit(limit)
        comments = await cursor.to_list(length=limit)
        
        for comment in comments:
            comment['_id'] = str(comment['_id'])
        
        return [CommentResponse(**comment) for comment in comments]
        
    except Exception as e:
        logger.error(f"❌ Get article comments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete comment"""
    try:
        # Get comment
        comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # Check permissions (owner or admin)
        if comment['user_id'] != current_user['sub'] and current_user['role'] not in ['admin', 'moderator']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Delete comment
        await db.comments.delete_one({"_id": ObjectId(comment_id)})
        
        # Update article comment count
        await db.articles.update_one(
            {"_id": ObjectId(comment['article_id'])},
            {"$inc": {"comment_count": -1}}
        )
        
        return {"success": True, "message": "Comment deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete comment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/sentiment")
async def get_sentiment_stats(
    article_id: Optional[str] = None,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get sentiment statistics"""
    try:
        match_stage = {}
        if article_id:
            match_stage = {"article_id": article_id}
        
        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": "$sentiment",
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$sentiment_score"}
                }
            }
        ]
        
        results = await db.comments.aggregate(pipeline).to_list(length=10)
        
        sentiment_distribution = {
            item['_id']: {
                "count": item['count'],
                "avg_score": round(item['avg_score'], 2)
            }
            for item in results
        }
        
        return {
            "article_id": article_id,
            "sentiment_distribution": sentiment_distribution
        }
        
    except Exception as e:
        logger.error(f"❌ Sentiment stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
