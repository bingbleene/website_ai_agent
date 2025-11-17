# app/api/v1/endpoints/logs.py
"""
Đọc & tổng hợp log cho Dashboard.

GET /api/v1/logs/{article_id}
"""

from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from app.core.database import get_database
from app.services.logger import log_activity  # có thể dùng cho điểm test-insert nếu cần


router = APIRouter(prefix="/logs", tags=["Logs"])


# --------- Pydantic models ---------
class AgentLog(BaseModel):
    agent_name: str = Field(..., description="Tên agent")
    duration: float = Field(..., description="Thời gian thực thi (giây)")
    tokens_used: int = Field(..., description="Token đã dùng")
    model_used: Optional[str] = Field(None, description="Model dùng")
    success: bool = Field(..., description="Thành công hay không")
    output_summary: Optional[str] = Field(None, description="Tóm tắt đầu ra")
    timestamp: datetime = Field(..., description="Thời điểm ghi log")


class LogSummaryResponse(BaseModel):
    article_id: str = Field(..., description="ID bài viết (string)")
    total_agents: int = Field(..., description="Số log/agents")
    total_time: float = Field(..., description="Tổng thời gian (giây)")
    total_tokens: int = Field(..., description="Tổng tokens")
    success_rate: float = Field(..., description="Tỉ lệ thành công (0-100)")
    agent_logs: List[AgentLog] = Field(..., description="Chi tiết log các agent")


# --------- Helpers ---------
def _article_match(article_id: str):
    """Tạo điều kiện truy vấn chấp nhận cả string và ObjectId."""
    conds = [{"article_id": article_id}]
    if ObjectId.is_valid(article_id):
        conds.append({"article_id": ObjectId(article_id)})
    return {"$or": conds}


# --------- Endpoints ---------
@router.get("/{article_id}", response_model=LogSummaryResponse)
async def get_logs_for_article(
    article_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Trả về tổng hợp log cho 1 article.
    """
    cursor = db["ai_logs"].find(_article_match(article_id))
    docs = await cursor.to_list(length=None)

    if not docs:
        raise HTTPException(
            status_code=404, detail="Không tìm thấy log cho article_id này"
        )

    total_agents = len(docs)
    total_time = sum(float(d.get("duration", 0.0)) for d in docs)
    total_tokens = sum(int(d.get("tokens_used", 0)) for d in docs)
    success_count = sum(1 for d in docs if d.get("success") is True)
    success_rate = (success_count / total_agents * 100.0) if total_agents else 0.0

    agent_logs: List[AgentLog] = [
        AgentLog(
            agent_name=d.get("agent_name", ""),
            duration=float(d.get("duration", 0.0)),
            tokens_used=int(d.get("tokens_used", 0)),
            model_used=d.get("model_used"),
            success=bool(d.get("success", False)),
            output_summary=d.get("output_summary"),
            timestamp=d.get("timestamp", datetime.utcnow()),
        )
        for d in docs
    ]

    return LogSummaryResponse(
        article_id=article_id,
        total_agents=total_agents,
        total_time=total_time,
        total_tokens=total_tokens,
        success_rate=success_rate,
        agent_logs=agent_logs,
    )
