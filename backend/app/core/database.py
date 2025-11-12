"""
MongoDB Database Connection and Operations
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
from loguru import logger
from typing import Optional

from app.core.config import settings


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None


db_instance = Database()


async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
        
        # Test connection
        await db_instance.client.admin.command('ping')
        
        # Create indexes
        await create_indexes()
        
        logger.info(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db_instance.client:
        db_instance.client.close()
        logger.info("✅ Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for optimal performance"""
    db = db_instance.db
    
    # Users collection indexes
    await db.users.create_indexes([
        IndexModel([("email", ASCENDING)], unique=True),
        IndexModel([("username", ASCENDING)], unique=True),
        IndexModel([("created_at", DESCENDING)]),
    ])
    
    # Articles collection indexes
    await db.articles.create_indexes([
        IndexModel([("slug", ASCENDING)], unique=True),
        IndexModel([("status", ASCENDING)]),
        IndexModel([("category", ASCENDING)]),
        IndexModel([("author_id", ASCENDING)]),
        IndexModel([("published_at", DESCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
        IndexModel([("title", TEXT), ("content", TEXT), ("summary", TEXT)]),  # Full-text search
        IndexModel([("tags", ASCENDING)]),
        # Vector search index will be created via Atlas UI
    ])
    
    # Comments collection indexes
    await db.comments.create_indexes([
        IndexModel([("article_id", ASCENDING)]),
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
        IndexModel([("sentiment", ASCENDING)]),
    ])
    
    # Analytics collection indexes
    await db.analytics.create_indexes([
        IndexModel([("article_id", ASCENDING)]),
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("event_type", ASCENDING)]),
        IndexModel([("timestamp", DESCENDING)]),
    ])
    
    logger.info("✅ Created MongoDB indexes")


def get_database():
    """Dependency to get database instance"""
    return db_instance.db
