"""
API v1 Router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    articles,
    images,
    comments,
    analytics,
    ai,
    chatbot,
    logs,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(articles.router, prefix="/articles", tags=["Articles"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Services"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(logs.router, prefix="/ai", tags=["AI Services"])
