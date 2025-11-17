import feedparser
import asyncio
import re
from loguru import logger
from datetime import datetime

# Thay thế bằng hàm lấy DB của bạn
from app.core.database import get_database
def clean_html(raw_html):
    """Xóa các tag HTML cơ bản khỏi nội dung."""
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

async def fetch_and_save_articles(feed_url: str):
    """
    (Async) Lấy tin tức từ một RSS feed, xử lý và lưu vào CSDL.
    """
   
    logger.info(f"Fetching news from: {feed_url}")
    db = get_database()
    if db is None:
        logger.error("Database client is not available for news fetcher.")
        return 0

    try:
        # Chạy feedparser (là I/O) trong một thread riêng
        # để không block vòng lặp asyncio
        loop = asyncio.get_event_loop()
        feed = await loop.run_in_executor(None, feedparser.parse, feed_url)
        
        new_articles_count = 0

        for entry in feed.entries[:10]: # Lấy 10 bài mới nhất
            try:
                # 1. Kiểm tra xem bài viết đã tồn tại chưa (dựa trên link)
                existing_article = await db.articles.find_one({"source_url": entry.link})
                
                if existing_article:
                    continue # Bỏ qua nếu đã có

                # 2. Làm sạch nội dung
                content = entry.get('summary', '')
                if hasattr(entry, 'content'):
                    # Ưu tiên 'content' nếu có
                    content = entry.content[0].value 
                
                cleaned_content = clean_html(content)
                cleaned_summary = clean_html(entry.get('summary', ''))

                # 3. Chuyển đổi thời gian
                published_time = datetime.now() # Mặc định
                if "published_parsed" in entry and entry.published_parsed:
                    published_time = datetime(*entry.published_parsed[:6])
                elif "updated_parsed" in entry and entry.updated_parsed:
                    published_time = datetime(*entry.updated_parsed[:6])

                # 4. Tạo document để lưu
                article_data = {
                    "title": entry.title,
                    "content": cleaned_content,
                    "summary": cleaned_summary[:500], # Tóm tắt ngắn
                    "source_url": entry.link,
                    "published_at": published_time,
                    "category": "Tin tức",
                    "tags": [tag.term for tag in entry.tags] if hasattr(entry, 'tags') else [],
                    "status": "published"
                    # TODO: Cần gọi 1 task khác để tạo 'article_vector'
                }

                # 5. Lưu vào MongoDB
                await db.articles.insert_one(article_data)
                new_articles_count += 1

            except Exception as e:
                logger.error(f"Failed to process entry {entry.get('link', 'N/A')}: {e}")
                
        logger.info(f"✅ Fetch complete. Added {new_articles_count} new articles from {feed_url}")
        return new_articles_count
        
    except Exception as e:
        logger.error(f"❌ Failed to fetch feed {feed_url}: {e}")
        return 0