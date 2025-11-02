"""
RabbitMQ Message Queue Service
"""
import aio_pika
import json
from typing import Callable, Dict
from loguru import logger
from datetime import datetime  # <-- HÃY CHẮC CHẮN BẠN ĐÃ IMPORT CÁI NÀY

from app.core.config import settings


class RabbitMQService:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange_name = "ai_news_exchange"
        self.enabled = bool(settings.RABBITMQ_HOST and settings.RABBITMQ_HOST.strip())
        
        # 👇 THÊM "news_fetching" VÀO ĐÂY 👇
        self.queues = {
            "article_processing": "article_processing_queue",
            "email_sending": "email_sending_queue",
            "analytics": "analytics_queue",
            "news_fetching": "news_fetching_queue"  # <-- DÒNG MỚI
        }
        
        if not self.enabled:
            logger.warning("⚠️ RabbitMQ disabled (no config) - tasks will run synchronously")
    
    # ... (Hàm connect và close giữ nguyên) ...
    async def connect(self):
        """Connect to RabbitMQ"""
        if not self.enabled:
            logger.info("⏭️ Skipping RabbitMQ connection (disabled)")
            return
            
        try:
            connection_url = (
                f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}"
                f"@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}{settings.RABBITMQ_VHOST}"
            )
            
            self.connection = await aio_pika.connect_robust(connection_url)
            self.channel = await self.connection.channel()
            
            self.exchange = await self.channel.declare_exchange(
                self.exchange_name,
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            # Tự động khai báo queue mới
            for queue_key, queue_name in self.queues.items():
                queue = await self.channel.declare_queue(queue_name, durable=True)
                
                # Sửa routing_key để linh hoạt hơn
                if queue_key == "news_fetching":
                    await queue.bind(self.exchange, routing_key=f"{queue_key}.*")
                else:
                    await queue.bind(self.exchange, routing_key=f"{queue_key}.*")
            
            logger.info("✅ Connected to RabbitMQ")
            
        except Exception as e:
            logger.error(f"❌ RabbitMQ connection error: {e}")
            raise
    
    async def close(self):
        """Close RabbitMQ connection"""
        if self.connection:
            await self.connection.close()
            logger.info("✅ Closed RabbitMQ connection")

    # ... (Hàm publish_message và consume_queue giữ nguyên) ...
    async def publish_message(
        self,
        queue_type: str,
        message: Dict,
        routing_key: str = "default"
    ):
        """Publish message to queue"""
        if not self.enabled:
            logger.info(f"⏭️ RabbitMQ disabled - skipping message publish to {queue_type}")
            return
            
        try:
            full_routing_key = f"{queue_type}.{routing_key}"
            
            await self.exchange.publish(
                aio_pika.Message(
                    body=json.dumps(message).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key=full_routing_key
            )
            
            logger.info(f"📤 Published message to {full_routing_key}")
            
        except Exception as e:
            logger.error(f"❌ Failed to publish message: {e}")
            raise
    
    async def consume_queue(
        self,
        queue_type: str,
        callback: Callable
    ):
        """Consume messages from queue"""
        try:
            queue_name = self.queues[queue_type]
            queue = await self.channel.declare_queue(queue_name, durable=True)
            
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    async with message.process():
                        body = json.loads(message.body.decode())
                        logger.info(f"📥 Received message from {queue_name}")
                        await callback(body)
            
        except Exception as e:
            logger.error(f"❌ Queue consumption error: {e}")
            raise

    # ... (Các hàm publish_article_processing_task, publish_email_task giữ nguyên) ...
    async def publish_article_processing_task(self, article_id: str, operations: list):
        """Publish article processing task"""
        await self.publish_message(
            queue_type="article_processing",
            message={
                "article_id": article_id,
                "operations": operations,
                "timestamp": datetime.utcnow().isoformat()
            },
            routing_key="process"
        )
    
    async def publish_email_task(self, user_ids: list, article_ids: list):
        """Publish email sending task"""
        await self.publish_message(
            queue_type="email_sending",
            message={
                "user_ids": user_ids,
                "article_ids": article_ids,
                "timestamp": datetime.utcnow().isoformat()
            },
            routing_key="send"
        )

    # 👇 DÁN HÀM MỚI NÀY VÀO CUỐI CLASS 👇
    async def publish_news_fetch_task(self, feed_url: str):
        """Publish news fetching task"""
        await self.publish_message(
            queue_type="news_fetching",
            message={
                "feed_url": feed_url,
                "timestamp": datetime.utcnow().isoformat()
            },
            routing_key="fetch"
        )

# Singleton instance
rabbitmq_service = RabbitMQService()