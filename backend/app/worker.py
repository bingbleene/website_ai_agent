import asyncio
from loguru import logger

# Import các service của bạn
from app.services.rabbitmq_service import rabbitmq_service
from app.services.news_fetcher import fetch_and_save_articles
from app.core.database import connect_to_mongo, close_mongo_connection

async def on_news_task_received(message: dict):
    """
    Callback được gọi khi nhận được task từ queue 'news_fetching'.
    """
    feed_url = message.get("feed_url")
    if not feed_url:
        logger.warning("Received task with no 'feed_url'. Skipping.")
        return
        
    try:
        logger.info(f"Worker processing task: Fetching {feed_url}")
        await fetch_and_save_articles(feed_url)
    except Exception as e:
        logger.error(f"Error processing task for {feed_url}: {e}")
        # (Không cần nack/ack vì `message.process()` đã xử lý)

async def main():
    """
    Hàm main của Worker: Kết nối CSDL, RabbitMQ và bắt đầu lắng nghe.
    """
    logger.info("🚀 Starting AI News Worker...")
    
    try:
        # 1. Kết nối CSDL
        await connect_to_mongo()
        logger.info("✅ Worker connected to MongoDB.")
        
        # 2. Kết nối RabbitMQ (dùng service của bạn)
        await rabbitmq_service.connect()
        if not rabbitmq_service.enabled:
            logger.error("RabbitMQ is not enabled, worker cannot start.")
            return

        logger.info("✅ Worker connected to RabbitMQ.")
        
        # 3. Bắt đầu lắng nghe
        logger.info("Waiting for 'news_fetching' tasks...")
        await rabbitmq_service.consume_queue(
            queue_type="news_fetching",
            callback=on_news_task_received
        )
        
    except Exception as e:
        logger.error(f"❌ Worker main loop failed: {e}")
    finally:
        # 4. Dọn dẹp khi tắt
        logger.info("👋 Shutting down worker...")
        await rabbitmq_service.close()
        await close_mongo_connection()
        logger.info("✅ Worker shut down gracefully.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker process terminated by user.")