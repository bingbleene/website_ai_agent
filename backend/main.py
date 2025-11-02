"""
AI News Management System - Main FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from loguru import logger

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1 import api_router
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.rabbitmq_service import rabbitmq_service# Đảm bảo file này tồn tại

# Khởi tạo scheduler
scheduler = AsyncIOScheduler()

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

    # 2. Kết nối RabbitMQ (Dùng service của bạn)
    await rabbitmq_service.connect() # <-- DÒNG MỚI QUAN TRỌNG

    # 3. Khởi động Scheduler
    try:
        logger.info("Starting task scheduler...")
        scheduler.add_job(
            scheduled_fetch_job, # Gọi hàm async wrapper
            'interval', 
            minutes=30,
        )
        scheduler.start()
        logger.info("✅ Task scheduler started (fetch news every 30 mins)")
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {e}")

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