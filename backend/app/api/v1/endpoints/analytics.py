"""
Analytics API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from loguru import logger

from app.models.schemas import AnalyticsEvent, DashboardStats, ArticleStats
from app.core.database import get_database
from app.core.security import get_current_admin_user

router = APIRouter()


@router.post("/track")
async def track_event(
    event: AnalyticsEvent,
    db = Depends(get_database)
):
    """Track analytics event"""
    try:
        event_dict = event.model_dump()
        event_dict['timestamp'] = datetime.utcnow()
        
        await db.analytics.insert_one(event_dict)
        
        # Update article metrics if applicable
        if event.event_type == 'like':
            await db.articles.update_one(
                {"_id": ObjectId(event.article_id)},
                {"$inc": {"like_count": 1}}
            )
        
        return {"success": True, "message": "Event tracked"}
        
    except Exception as e:
        logger.error(f"❌ Track event error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get dashboard statistics"""
    try:
        # Total articles
        total_articles = await db.articles.count_documents({})
        published_articles = await db.articles.count_documents({"status": "published"})
        draft_articles = await db.articles.count_documents({"status": "draft"})
        pending_review = await db.articles.count_documents({"status": "pending_review"})
        
        # Total users
        total_users = await db.users.count_documents({})
        
        # Total comments
        total_comments = await db.comments.count_documents({})
        
        # Total views (sum of all article view_count)
        pipeline = [
            {"$group": {"_id": None, "total_views": {"$sum": "$view_count"}}}
        ]
        view_result = await db.articles.aggregate(pipeline).to_list(length=1)
        total_views = view_result[0]['total_views'] if view_result else 0
        
        # Articles by category
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_results = await db.articles.aggregate(category_pipeline).to_list(length=20)
        articles_by_category = {item['_id']: item['count'] for item in category_results}
        
        # Sentiment distribution
        sentiment_pipeline = [
            {"$group": {"_id": "$sentiment", "count": {"$sum": 1}}}
        ]
        sentiment_results = await db.comments.aggregate(sentiment_pipeline).to_list(length=10)
        sentiment_distribution = {item['_id']: item['count'] for item in sentiment_results}
        
        stats = DashboardStats(
            total_articles=total_articles,
            published_articles=published_articles,
            draft_articles=draft_articles,
            pending_review=pending_review,
            total_users=total_users,
            total_comments=total_comments,
            total_views=total_views,
            articles_by_category=articles_by_category,
            sentiment_distribution=sentiment_distribution
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/article/{article_id}", response_model=ArticleStats)
async def get_article_stats(
    article_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get statistics for specific article"""
    try:
        # Get article
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Get event counts
        views = article.get('view_count', 0)
        likes = article.get('like_count', 0)
        comments = article.get('comment_count', 0)
        
        shares_count = await db.analytics.count_documents({
            "article_id": article_id,
            "event_type": "share"
        })
        
        # Calculate average read time from view events
        read_time_pipeline = [
            {
                "$match": {
                    "article_id": article_id,
                    "event_type": "view"
                }
            },
            {
                "$group": {
                    "_id": None,
                    "avg_time": {"$avg": "$metadata.read_time"}
                }
            }
        ]
        
        read_time_result = await db.analytics.aggregate(read_time_pipeline).to_list(length=1)
        avg_read_time = read_time_result[0]['avg_time'] if read_time_result else 0.0
        
        stats = ArticleStats(
            article_id=article_id,
            views=views,
            likes=likes,
            comments=comments,
            shares=shares_count,
            avg_read_time=avg_read_time
        )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Article stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trending")
async def get_trending_articles(
    days: int = 7,
    limit: int = 10,
    db = Depends(get_database)
):
    """Get trending articles based on recent engagement"""
    try:
        # Calculate from date
        from_date = datetime.utcnow() - timedelta(days=days)
        
        # Aggregate recent engagement
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$gte": from_date},
                    "event_type": {"$in": ["view", "like", "share", "comment"]}
                }
            },
            {
                "$group": {
                    "_id": "$article_id",
                    "score": {
                        "$sum": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$eq": ["$event_type", "view"]}, "then": 1},
                                    {"case": {"$eq": ["$event_type", "like"]}, "then": 3},
                                    {"case": {"$eq": ["$event_type", "share"]}, "then": 5},
                                    {"case": {"$eq": ["$event_type", "comment"]}, "then": 4}
                                ],
                                "default": 1
                            }
                        }
                    }
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        
        trending = await db.analytics.aggregate(pipeline).to_list(length=limit)
        
        # Get article details
        article_ids = [ObjectId(item['_id']) for item in trending if item['_id']]
        articles = await db.articles.find({"_id": {"$in": article_ids}}).to_list(length=limit)
        
        # Create map for sorting
        score_map = {item['_id']: item['score'] for item in trending}
        
        result = []
        for article in articles:
            article_id = str(article['_id'])
            result.append({
                "article_id": article_id,
                "title": article['title'],
                "category": article.get('category'),
                "trending_score": score_map.get(article_id, 0),
                "published_at": article.get('published_at')
            })
        
        # Sort by score
        result.sort(key=lambda x: x['trending_score'], reverse=True)
        
        return {
            "period_days": days,
            "trending_articles": result
        }
        
    except Exception as e:
        logger.error(f"❌ Trending articles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
