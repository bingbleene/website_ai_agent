"""
Dummy Generative Newspaper service for local dev without Gemini API key.
Không gọi Google Gemini, chỉ log và trả về dữ liệu giả.
"""

from typing import List, Dict, Any
from loguru import logger


class GenerativeNewspaper:
    def __init__(self, *args, **kwargs):
        """
        Bản local: không dùng Gemini, chỉ log là đã khởi tạo.
        """
        self.enabled = False
        logger.warning(
            "📰 GenerativeNewspaper: Gemini API key không cấu hình – "
            "đang dùng bản dummy (không gọi AI)."
        )

    async def generate_daily_newspaper(
        self,
        articles: List[Dict[str, Any]] | None = None,
        language: str = "vi",
    ) -> Dict[str, Any]:
        """
        Hàm giả lập: trả về 1 bản 'newspaper' đơn giản để tránh lỗi.
        """
        logger.info("📄 generate_daily_newspaper (dummy) được gọi.")
        return {
            "title": "Bản tin AI (local)",
            "language": language,
            "summary": "Môi trường local không bật Gemini nên đây chỉ là bản tin giả lập.",
            "sections": [],
        }
    def get_trending_keywords(self, limit: int = 10, language: str = "vi"):
        """
        Dummy: hàm giả cho local. Trả về list rỗng để scheduler không lỗi.
        """
        logger.info("📎 Dummy get_trending_keywords được gọi – trả về danh sách rỗng.")
        return []

# Hàm factory để giữ nguyên cách import cũ: generative_newspaper(...)
def generative_newspaper(*args, **kwargs) -> GenerativeNewspaper:
    return GenerativeNewspaper(*args, **kwargs)
