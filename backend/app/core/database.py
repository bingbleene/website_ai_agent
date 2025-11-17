"""
MongoDB Database Connection and Operations
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
from pymongo.errors import OperationFailure
from loguru import logger
from typing import Optional

from app.core.config import settings


class Database:
    # Keep client without type annotation to avoid runtime typing issues
    client = None
    db = None


db_instance = Database()


async def connect_to_mongo():
    """Connect to MongoDB Atlas.

    If authentication fails, log a detailed guidance message and continue without raising
    so the application can start in a degraded mode (db will be None). This prevents
    the whole FastAPI app from crashing during development when credentials are missing.
    """
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]

        # Test connection
        await db_instance.client.admin.command('ping')

        # Create indexes
        await create_indexes()

        logger.info(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except OperationFailure as e:
        # Authentication-specific error from MongoDB
        logger.error(f"❌ Failed to authenticate to MongoDB: {e}.\n"
                     "Please check:\n"
                     "  - MONGODB_URI in backend/.env is correct (username/password)\n"
                     "  - The database user exists in MongoDB Atlas (Project → Security → Database Access)\n"
                     "  - Your IP is whitelisted in Network Access (or use 0.0.0.0/0 to test)\n"
                     "  - If your password contains special characters, URL-encode it when placed in the URI\n"
                     "After fixing, restart the app.\n")
        # Keep db_instance.client set (so close_mongo_connection can handle it), but leave db as None
        db_instance.db = None
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        # For unexpected errors, also set db to None but don't raise to avoid crash in dev
        db_instance.db = None


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db_instance.client:
        db_instance.client.close()
        logger.info("✅ Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for optimal performance"""
    db = db_instance.db
    if db is None:
        logger.warning("⚠️ Skipping index creation because DB is not connected")
        return

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

    # English translations collection (separate collection linked by article_id)
    try:
        await db.english_trans.create_indexes([
            IndexModel([("article_id", ASCENDING)], unique=True),
            IndexModel([("translated_at", DESCENDING)])
        ])
    except Exception:
        # If the collection doesn't exist yet or create_indexes not supported, ignore
        pass

    logger.info("✅ Created MongoDB indexes")


def get_database():
    """Dependency to get database instance

    Returns None if DB is not connected. Callers should handle None accordingly.
    """
    return db_instance.db
