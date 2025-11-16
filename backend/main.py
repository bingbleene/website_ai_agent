"""
AI News Management System - Main FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import time
import sys
import threading
from loguru import logger

# Configure loguru to output to stdout
logger.remove()
logger.add(sys.stdout, level="INFO")

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.api.v1 import api_router
from apscheduler.schedulers.background import BackgroundScheduler  # Thay đổi: Dùng BackgroundScheduler
from app.services.rabbitmq_service import rabbitmq_service
from app.services.generative_newspaper import generative_newspaper
from datetime import datetime, timezone

# Khởi tạo scheduler - CHẠY TRONG THREAD RIÊNG
scheduler = BackgroundScheduler(daemon=True)  # daemon=True để tự động tắt khi app shutdown

# ===== KEYWORD QUEUES =====
# List A: Keywords đã có (để tránh trùng)
existing_keywords = set()
# Queue B: Keywords chờ tạo content
pending_keywords = []

# Khởi tạo generative newspaper
gen_news = None

def fetch_keywords_job():
    """Lịch 1: Mỗi 10 phút lấy keywords mới - CHẠY TRONG THREAD RIÊNG"""
    global existing_keywords, pending_keywords, gen_news
    try:
        logger.info("🔍 Fetching trending keywords...")
        
        # Lấy keywords từ API hoặc fallback
        keywords = gen_news.get_trending_keywords()
        logger.info(f"📊 Got {len(keywords)} keywords")
        
        # Kiểm tra và thêm keywords mới
        new_count = 0
        for keyword in keywords:
            if keyword not in existing_keywords:
                existing_keywords.add(keyword)
                pending_keywords.append(keyword)
                new_count += 1
                logger.info(f"➕ New keyword: {keyword}")
        
        logger.info(f"✅ Added {new_count} new keywords. Queue size: {len(pending_keywords)}")
        
    except Exception as e:
        logger.error(f"❌ Fetch keywords error: {e}")

def generate_article_job():
    """Lịch 2: Mỗi 30 giây tạo 1 article từ queue - CHẠY TRONG THREAD RIÊNG"""
    global pending_keywords, gen_news
    try:
        if not pending_keywords:
            logger.info("⏸️ No keywords in queue")
            return
        
        # Lấy keyword đầu tiên
        keyword = pending_keywords.pop(0)
        logger.info(f"📝 Generating article for: {keyword}")
        
        # Sinh nội dung article bằng AI (SYNC - không block main thread vì đang ở thread riêng)
        logger.info(f"🤖 Calling AI to generate content...")
        article_data = gen_news.generate_full_article(keyword)
        if article_data is None:
            logger.info(f"⏸️ Không tạo/lưu bài cho keyword '{keyword}' do lỗi Gemini API.")
            return
        # Tạo document hoàn chỉnh
        now = datetime.utcnow().isoformat() + "Z"
        # Import pymongo sync để insert từ background thread
        from pymongo import MongoClient
        import os
        client = MongoClient(os.getenv("MONGODB_URI"))
        db = client[os.getenv("MONGODB_DB_NAME")]
        # Normalize slug/title
        slug_val = article_data.get("slug", "").strip().lower()
        title_val = article_data.get("title", "").strip()

        # Duplicate checks: if slug or title already exists, skip insert
        dup_query = {"$or": [{"slug": slug_val}, {"title": title_val}]}
        existing = db.articles.find_one(dup_query)
        if existing:
            logger.info(f"⏸️ Bỏ qua tạo bài trùng lặp (slug/title tồn tại): {title_val}")
            return

        # Đếm articles hiện tại
        count = db.articles.count_documents({})
        new_id = count + 1
        article = {
            "_id": str(new_id),
            "title": article_data.get("title", ""),
            "slug": slug_val,
            "excerpt": article_data.get("excerpt", ""),
            "content": article_data.get("content", ""),
            "categoryId": new_id,
            "category": article_data.get("category", "Technology"),
            "authorId": 1,
            "author": "admin",
            "authorAvatar": "https://lh3.googleusercontent.com/a/ACg8ocKW3VsSBWwRkgu3VU4vz0AHItfbhGKlYbgqLXJAihtr-QYgMO1A3g9_eyrAbqOxANa7qc=w240-h480-rw",
            "status": "published",
            "featured": True,
            "views": 100,
            "likes": 100,
            "commentsCount": 100,
            "readTime": "1 min",
            "tags": article_data.get("tags", [keyword]),
            "thumbnail": article_data.get("thumbnail", ""),
            "publishedAt": now,
            "updatedAt": now,
            "createdAt": now
        }
        # Insert vào MongoDB
        result = db.articles.insert_one(article)

        # After creating, push generated alternative angles into queue (limit and dedupe)
        try:
            angles = article_data.get('angles', []) if isinstance(article_data, dict) else []
            if angles:
                added = 0
                # Avoid runaway queue: only add if pending < 50 and not in existing
                for ang in angles:
                    if len(pending_keywords) >= 50:
                        break
                    ang_str = ang.strip()
                    if ang_str and ang_str not in existing_keywords:
                        existing_keywords.add(ang_str)
                        pending_keywords.append(ang_str)
                        added += 1
                        logger.info(f"➕ Generated angle queued: {ang_str}")
                if added:
                    logger.info(f"✅ Added {added} generated angles to queue")
        except Exception as _:
            pass

        # === Auto-translate: try to produce an English version and save under translations.en ===
        try:
            from app.services.google_service import google_service, gemini_service
            import asyncio

            translated = None
            # Prefer Google Cloud Translation if configured
            if getattr(google_service, 'translate_client', None):
                try:
                    title_trans = asyncio.run(google_service.translate_text(article['title'], target_language='en'))
                    content_trans = asyncio.run(google_service.translate_text(article['content'], target_language='en'))
                    excerpt_trans = None
                    if article.get('excerpt'):
                        ex_tr = asyncio.run(google_service.translate_text(article.get('excerpt', ''), target_language='en'))
                        excerpt_trans = ex_tr.get('translated_text')

                    translations = {
                        'en': {
                            'title': title_trans.get('translated_text'),
                            'content': content_trans.get('translated_text'),
                            'excerpt': excerpt_trans,
                            'translated_at': datetime.utcnow().isoformat() + 'Z',
                            'translated_by': 'google'
                        }
                    }
                except Exception as e:
                    logger.warning(f"⚠️ Auto-translate (Google) failed: {e}")
                    translations = None
            else:
                # Fallback: use Gemini text generation to produce an English translation
                try:
                    prompt = f"Translate the following Vietnamese article to English.\n\nTitle: {article['title']}\n\nContent:\n{article['content']}"
                    translated_text = asyncio.run(gemini_service.generate_text(prompt, max_tokens=2000))
                    translations = {
                        'en': {
                            'title': article['title'],
                            'content': translated_text,
                            'excerpt': article.get('excerpt'),
                            'translated_at': datetime.utcnow().isoformat() + 'Z',
                            'translated_by': 'gemini'
                        }
                    }
                except Exception as e:
                    logger.warning(f"⚠️ Auto-translate (Gemini) failed: {e}")
                    translations = None

            if translations:
                try:
                    # Clean and normalize content before saving
                    try:
                        from app.services.translation_utils import clean_translated_text
                        translations['en']['content'] = clean_translated_text(translations['en'].get('content', ''))
                        # Ensure title/excerpt are simple strings
                        translations['en']['title'] = translations['en'].get('title', '').strip()
                        if translations['en'].get('excerpt'):
                            translations['en']['excerpt'] = translations['en']['excerpt'].strip()
                    except Exception as _:
                        # If cleaning fails, continue with raw text
                        pass

                    # Save English translation into a separate collection `english_trans`, linked by article_id
                    try:
                        article_id_str = str(result.inserted_id)
                        tr_doc = translations['en'].copy()
                        tr_doc['article_id'] = article_id_str
                        # Ensure translated_at exists
                        tr_doc.setdefault('translated_at', datetime.utcnow().isoformat() + 'Z')
                        db.english_trans.update_one({'article_id': article_id_str}, {'$set': tr_doc}, upsert=True)
                        logger.info(f"✅ Saved auto-translation into 'english_trans' collection for article ID: {new_id}")
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to save translation to english_trans collection: {e}")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to save translation to DB: {e}")
        except Exception as e:
            logger.warning(f"⚠️ Auto-translate flow failed: {e}")

        client.close()

        logger.info(f"✅ Created article: {article['title']} (ID: {new_id})")
        logger.info(f"📦 Queue remaining: {len(pending_keywords)}")
        
    except Exception as e:
        logger.error(f"❌ Generate article error: {e}")
        import traceback
        traceback.print_exc()

async def scheduled_fetch_job():
    """Hàm async riêng để APScheduler gọi"""
    try:
        if rabbitmq_service.enabled:
            logger.info("Scheduler: Publishing news fetch task...")
            await rabbitmq_service.publish_news_fetch_task("https://cointelegraph.com/rss")
        else:
            logger.info("Scheduler: RabbitMQ disabled, skipping task publish.")
    except Exception as e:
        logger.error(f"Scheduler failed to publish task: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Quản lý các sự kiện startup và shutdown của ứng dụng.
    """
    
    # === STARTUP (Khởi động) ===
    logger.info("🚀 Starting AI News Management System...")
    
    # 1. Kết nối MongoDB
    await connect_to_mongo()
    logger.info("✅ Connected to MongoDB Atlas")

    # 2. Khởi tạo generative newspaper
    global gen_news
    gen_news = generative_newspaper(
        api_key=settings.GEMINI_API_KEY,
        unsplash_api_key=settings.UNSPLASH_ACCESS_KEY
    )
    logger.info("✅ Initialized generative newspaper")

    # 3. Kết nối RabbitMQ
    await rabbitmq_service.connect()

    # 4. Khởi động Schedulers trong THREAD RIÊNG (hoàn toàn tách biệt với FastAPI main thread)
    logger.info("Starting task schedulers in SEPARATE THREAD...")
    
    # Scheduler 1: Fetch keywords mỗi 10 phút - CHẠY NGAY
    scheduler.add_job(
        fetch_keywords_job,
        'interval',
        minutes=3,
        id='fetch_keywords',
        next_run_time=datetime.now(timezone.utc)  # Chạy ngay lập tức
    )
    logger.info("✅ Scheduler 1: Fetch keywords every 10 mins (starts immediately)")
    
    # Scheduler 2: Generate article mỗi 30 giây
    scheduler.add_job(
        generate_article_job,
        'interval',
        seconds=10,
        id='generate_article'
    )
    logger.info("✅ Scheduler 2: Generate article every 30 secs")
    
    # Start scheduler - Chạy trong background thread riêng
    scheduler.start()
    logger.info("✅ All schedulers started in BACKGROUND THREAD!")
    logger.info("⏭️ Scheduler 1 will fetch keywords immediately, then every 10 mins")

    # === YIELD (Ứng dụng chạy ở đây) ===
    try:
        yield
    finally:
        # === SHUTDOWN (Tắt ứng dụng) ===
        logger.info("👋 Shutting down...")
        
        # 1. Tắt Scheduler
        try:
            if scheduler.running:
                scheduler.shutdown()
                logger.info("✅ Task scheduler shut down")
        except Exception as e:
            logger.error(f"❌ Error shutting down scheduler: {e}")
        
        # 2. Ngắt kết nối RabbitMQ
        await rabbitmq_service.close() # <-- DÒNG MỚI QUAN TRỌNG

        # 3. Ngắt kết nối MongoDB
        await close_mongo_connection()
        logger.info("✅ Disconnected from MongoDB")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered News Content Management & Distribution Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan  # <-- Sử dụng hàm lifespan đã gộp ở trên
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"completed in {process_time:.2f}s with status {response.status_code}"
    )
    
    return response


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Check if the service is running"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )