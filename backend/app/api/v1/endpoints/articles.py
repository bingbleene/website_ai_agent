"""
Articles API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger

from app.models.schemas import (
    ArticleCreate, ArticleUpdate, ArticleResponse, 
    ArticleAIEnhancement, SchedulePublishRequest
)
from app.models.schemas import TranslationResponse
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
    background_tasks: BackgroundTasks = None,
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

        # Enqueue background translation to English (non-blocking)
        try:
            if background_tasks is not None:
                background_tasks.add_task(_translate_and_save, article_id, db)
                logger.info(f"📥 Enqueued background translation for article {article_id}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to enqueue background translation: {e}")

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


async def _translate_and_save(article_id: str, db):
    """Background task: translate article to English and upsert into english_trans collection."""
    try:
        if db is None:
            logger.warning("⚠️ DB instance is None; cannot perform background translation")
            return

        # Fetch article by id (try int, string, ObjectId)
        article = None
        try:
            query_id = int(article_id)
            article = await db.articles.find_one({"_id": query_id})
        except Exception:
            pass
        if not article:
            article = await db.articles.find_one({"_id": article_id})
        if not article:
            try:
                article = await db.articles.find_one({"_id": ObjectId(article_id)})
            except Exception:
                pass
        if not article:
            logger.warning(f"⚠️ Background translate: Article not found: {article_id}")
            return

        # If english_trans already exists in collection, skip
        try:
            existing = await db.english_trans.find_one({"article_id": str(article.get('_id'))})
            if existing:
                logger.info(f"ℹ️ english_trans already exists for {article_id}, skipping background translate")
                return
        except Exception:
            # If collection doesn't exist or query fails, continue and attempt to write
            pass

        # Perform translation
        try:
            from app.services.google_service import google_service, gemini_service
            from app.services.translation_utils import clean_translated_text

            source_lang = article.get('language', 'vi') or 'vi'
            translated_title = None
            translated_content = None
            translated_summary = None

            if getattr(google_service, 'translate_client', None):
                try:
                    title_tr = await google_service.translate_text(article.get('title', ''), target_language='en', source_language=source_lang)
                    content_tr = await google_service.translate_text(article.get('content', ''), target_language='en', source_language=source_lang)
                    translated_title = title_tr.get('translated_text')
                    translated_content = content_tr.get('translated_text')
                    if article.get('excerpt'):
                        ex_tr = await google_service.translate_text(article.get('excerpt', ''), target_language='en', source_language=source_lang)
                        translated_summary = ex_tr.get('translated_text')
                except Exception as e:
                    logger.warning(f"⚠️ Background translate Google failed: {e}")
                    translated_title = article.get('title')
                    translated_content = None
            else:
                # Fallback to Gemini prompt
                try:
                    prompt = f"Translate the following Vietnamese article to English.\n\nTitle: {article.get('title','')}\n\nContent:\n{article.get('content','')}"
                    translated_text = await gemini_service.generate_text(prompt, max_tokens=2000)
                    translated_title = article.get('title')
                    translated_content = translated_text
                    translated_summary = article.get('excerpt')
                except Exception as e:
                    logger.warning(f"⚠️ Background translate Gemini failed: {e}")

            if not translated_content:
                logger.warning(f"⚠️ No translated content produced for article {article_id}")
                return

            tr_doc = {
                'article_id': str(article.get('_id')),
                'title': translated_title or '',
                'content': translated_content,
                'excerpt': translated_summary,
                'translated_at': datetime.utcnow().isoformat() + 'Z',
                'translated_by': 'google' if getattr(google_service, 'translate_client', None) else 'gemini'
            }

            # Clean content to HTML when possible
            try:
                tr_doc['content'] = clean_translated_text(tr_doc.get('content', ''))
            except Exception:
                pass

            await db.english_trans.update_one({'article_id': tr_doc['article_id']}, {'$set': tr_doc}, upsert=True)
            logger.info(f"✅ Background translated and saved english_trans for article {article_id}")

        except Exception as e:
            logger.error(f"❌ Background translation error for {article_id}: {e}")
    except Exception as e:
        logger.error(f"❌ Unexpected error in background translate: {e}")


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


# ==================== PUBLIC ENDPOINTS (NO AUTH REQUIRED) ====================

@router.get("/public/articles", response_model=List[ArticleResponse])
async def get_public_articles(
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db = Depends(get_database)
):
    """
    Get published articles (PUBLIC - no authentication required)
    Used by frontend to display articles
    """
    try:
        # Build query - only published articles
        query = {"status": "published"}
        if category and category != "All":
            query['category'] = category
        
        # Get articles sorted by _id (newest first - MongoDB ObjectId contains timestamp)
        cursor = db.articles.find(query).sort('_id', -1).skip(skip).limit(limit)
        articles = await cursor.to_list(length=limit)
        
        # Map MongoDB fields to API schema
        mapped_articles = []
        for article in articles:
            # Map category to valid enum (fallback to technology)
            category_map = {
                "AI Models": "technology",
                "Tech Innovations": "technology",
                "Blockchain": "technology",
                "Software": "technology",
                "Healthcare": "health",
                "Finance": "business",
                "Economy": "business",
                "Politics": "politics",
                "Sports": "sports",
                "Entertainment": "entertainment",
                "Science": "science",
                "World News": "world",
                "Local News": "local"
            }
            mongo_category = article.get('category', 'Technology')
            api_category = category_map.get(mongo_category, 'technology')
            
            mapped = {
                "_id": str(article['_id']),
                "title": article.get('title', ''),
                "slug": article.get('slug', ''),
                "excerpt": article.get('excerpt', ''),
                "content": article.get('content', ''),
                "summary": article.get('excerpt', ''),
                "category": api_category,
                "tags": article.get('tags', []),
                "featured_image": article.get('thumbnail', ''),
                "language": article.get('language', 'vi'),
                "status": article.get('status', 'draft'),
                "author_id": str(article.get('authorId', article.get('author_id', 1))),
                "author_name": article.get('author', article.get('author_name', 'Unknown')),
                "view_count": article.get('views', article.get('view_count', 0)),
                "like_count": article.get('likes', article.get('like_count', 0)),
                "comment_count": article.get('commentsCount', article.get('comment_count', 0)),
                "published_at": article.get('publishedAt', article.get('published_at')),
                "created_at": article.get('createdAt', article.get('created_at')),
                "updated_at": article.get('updatedAt', article.get('updated_at'))
            }
            mapped_articles.append(mapped)
        
        logger.info(f"✅ Public articles: Found {len(mapped_articles)} published articles")
        return [ArticleResponse(**art) for art in mapped_articles]
        
    except Exception as e:
        logger.error(f"❌ Get public articles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/public/trending", response_model=List[ArticleResponse])
async def get_trending_articles(
    limit: int = Query(5, ge=1, le=20),
    db = Depends(get_database)
):
    """
    Get trending articles (PUBLIC - sorted by views and engagement)
    """
    try:
        # Get top articles by view_count + like_count
        cursor = db.articles.find({"status": "published"}).sort([
            ('view_count', -1),
            ('like_count', -1)
        ]).limit(limit)
        
        articles = await cursor.to_list(length=limit)
        
        # Map MongoDB fields to API schema
        mapped_articles = []
        for article in articles:
            # Map category to valid enum
            category_map = {
                "AI Models": "technology",
                "Tech Innovations": "technology",
                "Blockchain": "technology",
                "Software": "technology",
                "Healthcare": "health",
                "Finance": "business",
                "Economy": "business",
                "Politics": "politics",
                "Sports": "sports",
                "Entertainment": "entertainment",
                "Science": "science",
                "World News": "world",
                "Local News": "local"
            }
            mongo_category = article.get('category', 'Technology')
            api_category = category_map.get(mongo_category, 'technology')
            
            mapped = {
                "_id": str(article['_id']),
                "title": article.get('title', ''),
                "slug": article.get('slug', ''),
                "excerpt": article.get('excerpt', ''),
                "content": article.get('content', ''),
                "summary": article.get('excerpt', ''),
                "category": api_category,
                "tags": article.get('tags', []),
                "featured_image": article.get('thumbnail', ''),
                "language": article.get('language', 'vi'),
                "status": article.get('status', 'draft'),
                "author_id": str(article.get('authorId', article.get('author_id', 1))),
                "author_name": article.get('author', article.get('author_name', 'Unknown')),
                "view_count": article.get('views', article.get('view_count', 0)),
                "like_count": article.get('likes', article.get('like_count', 0)),
                "comment_count": article.get('commentsCount', article.get('comment_count', 0)),
                "published_at": article.get('publishedAt', article.get('published_at')),
                "created_at": article.get('createdAt', article.get('created_at')),
                "updated_at": article.get('updatedAt', article.get('updated_at'))
            }
            mapped_articles.append(mapped)
        
        logger.info(f"✅ Trending articles: Found {len(mapped_articles)} articles")
        return [ArticleResponse(**art) for art in mapped_articles]
        
    except Exception as e:
        logger.error(f"❌ Get trending articles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/public/categories")
async def get_public_categories(db = Depends(get_database)):
    """
    Get all available categories with article count (PUBLIC)
    """
    try:
        # Aggregate articles by category
        pipeline = [
            {"$match": {"status": "published"}},
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        
        result = await db.articles.aggregate(pipeline).to_list(length=None)
        
        categories = [
            {"name": cat["_id"], "count": cat["count"]}
            for cat in result
        ]
        
        logger.info(f"✅ Public categories: Found {len(categories)} categories")
        return {"categories": categories}
        
    except Exception as e:
        logger.error(f"❌ Get public categories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/public/articles/{article_id}", response_model=ArticleResponse)
async def get_public_article_by_id(article_id: str, db = Depends(get_database)):
    try:
        # Try all possible _id types: int, string, ObjectId
        article = None
        # Try int
        try:
            query_id = int(article_id)
            article = await db.articles.find_one({"_id": query_id, "status": "published"})
        except Exception:
            pass
        # Try string
        if not article:
            article = await db.articles.find_one({"_id": article_id, "status": "published"})
        # Try ObjectId
        if not article:
            try:
                article = await db.articles.find_one({"_id": ObjectId(article_id), "status": "published"})
            except Exception:
                pass
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Increment view count
        await db.articles.update_one(
            {"_id": article['_id']},
            {"$inc": {"view_count": 1}}
        )
        article['view_count'] = article.get('view_count', 0) + 1

        # Map category
        category_map = {
            "AI Models": "technology",
            "Tech Innovations": "technology",
            "Blockchain": "technology",
            "Software": "technology",
            "Healthcare": "health",
            "Finance": "business",
            "Economy": "business",
            "Politics": "politics",
            "Sports": "sports",
            "Entertainment": "entertainment",
            "Science": "science",
            "World News": "world",
            "Local News": "local"
        }
        mongo_category = article.get('category', 'Technology')
        api_category = category_map.get(mongo_category, 'technology')

        # Parse datetime fields
        from datetime import datetime
        def parse_dt(val):
            if isinstance(val, datetime):
                return val
            if isinstance(val, str):
                try:
                    # Handle ISO8601 with Z (UTC)
                    if val.endswith('Z'):
                        val = val.replace('Z', '+00:00')
                    return datetime.fromisoformat(val)
                except Exception:
                    return None
            return None

        mapped = {
            "_id": str(article['_id']),
            "title": article.get('title', ''),
            "slug": article.get('slug', ''),
            "excerpt": article.get('excerpt', ''),
            "content": article.get('content', ''),
            "summary": article.get('excerpt', ''),
            "category": api_category,
            "tags": article.get('tags', []),
            "featured_image": article.get('thumbnail', ''),
            "language": article.get('language', 'vi'),
            "status": article.get('status', 'draft'),
            "author_id": str(article.get('authorId', article.get('author_id', 1))),
            "author_name": article.get('author', article.get('author_name', 'Unknown')),
            "view_count": article.get('view_count', 0),
            "like_count": article.get('like_count', 0),
            "comment_count": article.get('comment_count', 0),
            "published_at": parse_dt(article.get('published_at') or article.get('publishedAt')), 
            "created_at": parse_dt(article.get('created_at') or article.get('createdAt')), 
            "updated_at": parse_dt(article.get('updated_at') or article.get('updatedAt'))
        }
        logger.info(f"✅ Public article: {article_id} - {mapped['title'][:50]} - Views: {mapped['view_count']}")
        return ArticleResponse(**mapped)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get public article by ID error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/public/articles/{article_id}/translate/{lang}", response_model=TranslationResponse)
async def public_translate_article(article_id: str, lang: str, db = Depends(get_database)):
    """Public endpoint: return (and create if needed) a translated version of an article."""
    try:
        # Fetch article (try int/string/ObjectId as earlier)
        article = None
        try:
            query_id = int(article_id)
            article = await db.articles.find_one({"_id": query_id, "status": "published"})
        except Exception:
            pass
        if not article:
            article = await db.articles.find_one({"_id": article_id, "status": "published"})
        if not article:
            try:
                article = await db.articles.find_one({"_id": ObjectId(article_id), "status": "published"})
            except Exception:
                pass
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # If translation exists, return it (English stored in separate `english_trans` collection)
        if lang == 'en':
            try:
                article_id_str = str(article['_id'])
                tr = await db.english_trans.find_one({"article_id": article_id_str})
                if tr:
                    return TranslationResponse(
                        article_id=article_id_str,
                        original_language=article.get('language', 'vi'),
                        target_language=lang,
                        translated_title=tr.get('title', ''),
                        translated_content=tr.get('content', ''),
                        translated_summary=tr.get('excerpt'),
                        translated_at=tr.get('translated_at'),
                        translated_by=tr.get('translated_by')
                    )
            except Exception:
                # If english_trans collection is missing or query fails, fall back to checking embedded field
                tr = article.get('english_trans')
                if tr:
                    return TranslationResponse(
                        article_id=str(article['_id']),
                        original_language=article.get('language', 'vi'),
                        target_language=lang,
                        translated_title=tr.get('title', ''),
                        translated_content=tr.get('content', ''),
                        translated_summary=tr.get('excerpt'),
                        translated_at=tr.get('translated_at'),
                        translated_by=tr.get('translated_by')
                    )
        else:
            translations = article.get('translations', {}) or {}
            if lang in translations:
                tr = translations[lang]
                return TranslationResponse(
                    article_id=str(article['_id']),
                    original_language=article.get('language', 'vi'),
                    target_language=lang,
                    translated_title=tr.get('title', ''),
                    translated_content=tr.get('content', ''),
                    translated_summary=tr.get('excerpt'),
                    translated_at=tr.get('translated_at'),
                    translated_by=tr.get('translated_by')
                )

        # Otherwise, perform translation (prefer Google Cloud, fallback to Gemini)
        from app.services.google_service import google_service, gemini_service

        # Detect source language (best-effort)
        try:
            source_lang = await google_service.detect_language(article.get('title', '')) if getattr(google_service, 'translate_client', None) else 'vi'
        except Exception:
            source_lang = article.get('language', 'vi') or 'vi'

        translated_title = None
        translated_content = None
        translated_summary = None

        try:
            if getattr(google_service, 'translate_client', None):
                title_tr = await google_service.translate_text(article.get('title', ''), target_language=lang, source_language=source_lang)
                content_tr = await google_service.translate_text(article.get('content', ''), target_language=lang, source_language=source_lang)
                translated_title = title_tr.get('translated_text')
                translated_content = content_tr.get('translated_text')
                if article.get('excerpt'):
                    ex_tr = await google_service.translate_text(article.get('excerpt', ''), target_language=lang, source_language=source_lang)
                    translated_summary = ex_tr.get('translated_text')
            else:
                # Fallback: use Gemini to perform translation via prompt
                prompt = f"Translate the following Vietnamese article to {lang}.\n\nTitle: {article.get('title','')}\n\nContent:\n{article.get('content','')}"
                translated_text = await gemini_service.generate_text(prompt, max_tokens=2000)
                translated_title = article.get('title')
                translated_content = translated_text
                translated_summary = article.get('excerpt')

            # Persist translation into english_trans collection (for 'en') or into article.translations for others
            tr_doc = {
                'title': translated_title,
                'content': translated_content,
                'excerpt': translated_summary,
                'translated_at': datetime.utcnow().isoformat() + 'Z',
                'translated_by': 'google' if getattr(google_service, 'translate_client', None) else 'gemini'
            }
            # Clean English content to HTML for better frontend rendering
            if lang == 'en':
                try:
                    from app.services.translation_utils import clean_translated_text
                    tr_doc['content'] = clean_translated_text(tr_doc.get('content', ''))
                except Exception:
                    pass
            # Persist English translations to top-level `english_trans`, others to `translations.{lang}`
            # For English, save to english_trans collection linked by article_id; for other languages keep translations.{lang}
            if lang == 'en':
                try:
                    article_id_str = str(article['_id'])
                    tr_doc['article_id'] = article_id_str
                    # Clean English content to HTML for better frontend rendering
                    try:
                        from app.services.translation_utils import clean_translated_text
                        tr_doc['content'] = clean_translated_text(tr_doc.get('content', ''))
                    except Exception:
                        pass
                    await db.english_trans.update_one({"article_id": article_id_str}, {"$set": tr_doc}, upsert=True)
                except Exception as e:
                    logger.warning(f"⚠️ Failed to persist english_trans document: {e}")
            else:
                await db.articles.update_one({"_id": article['_id']}, {"$set": {f"translations.{lang}": tr_doc}})

            return TranslationResponse(
                article_id=str(article['_id']),
                original_language=article.get('language', 'vi'),
                target_language=lang,
                translated_title=translated_title,
                translated_content=translated_content,
                translated_summary=translated_summary
            )

        except Exception as e:
            logger.error(f"❌ Public translate error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Public translate top-level error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

