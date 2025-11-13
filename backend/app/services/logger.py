# app/services/logger.py
"""
Ghi log hoạt động của các AI Agent vào MongoDB (collection: ai_logs).

- Dùng cùng Motor (async) với FastAPI.
- Nhận `db` từ DI (get_database) thay vì tự tạo client.
- Chuẩn hoá article_id: nếu là ObjectId hợp lệ -> lưu ObjectId, ngược lại lưu string.
"""

from datetime import datetime
from typing import Optional, Any, Dict
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


def _normalize_article_id(article_id: str) -> Any:
    """Trả về ObjectId nếu hợp lệ, ngược lại trả lại chính chuỗi."""
    return ObjectId(article_id) if ObjectId.is_valid(article_id) else article_id


async def log_activity(
    db: AsyncIOMotorDatabase,
    *,
    article_id: str,
    agent_name: str,
    duration: float,
    tokens_used: int,
    success: bool,
    model_used: Optional[str] = None,
    output_summary: Optional[str] = None,
    quality_score: Optional[float] = None,
    action: Optional[str] = None,
    error_message: Optional[str] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Ghi 1 bản log cho agent.
    """
    doc: Dict[str, Any] = {
        "article_id": _normalize_article_id(article_id),
        "agent_name": agent_name,
        "duration": float(duration),
        "tokens_used": int(tokens_used),
        "success": bool(success),
        "timestamp": datetime.utcnow(),
    }
    if model_used is not None:
        doc["model_used"] = model_used
    if output_summary is not None:
        doc["output_summary"] = output_summary
    if quality_score is not None:
        doc["quality_score"] = float(quality_score)
    if action is not None:
        doc["action"] = action
    if error_message is not None:
        doc["error_message"] = error_message
    if extra:
        doc.update({k: v for k, v in extra.items() if v is not None})

    res = await db["ai_logs"].insert_one(doc)
    return str(res.inserted_id)
