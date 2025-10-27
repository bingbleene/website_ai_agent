"""
Pydantic Models and Schemas
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ===================== Enums =====================

class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    EDITOR = "editor"
    WRITER = "writer"
    TRANSLATOR = "translator"
    VIEWER = "viewer"


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ArticleCategory(str, Enum):
    POLITICS = "politics"
    TECHNOLOGY = "technology"
    BUSINESS = "business"
    SPORTS = "sports"
    ENTERTAINMENT = "entertainment"
    HEALTH = "health"
    SCIENCE = "science"
    WORLD = "world"
    LOCAL = "local"


class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    SPAM = "spam"


# ===================== User Schemas =====================

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.VIEWER


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===================== Article Schemas =====================

class ArticleBase(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    content: str = Field(..., min_length=50)
    summary: Optional[str] = None
    category: ArticleCategory
    tags: List[str] = []
    featured_image: Optional[str] = None
    language: str = "vi"


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[ArticleCategory] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    status: Optional[ArticleStatus] = None


class ArticleAIEnhancement(BaseModel):
    """AI-generated enhancements for article"""
    summary: str
    hashtags: List[str]
    category_suggestion: ArticleCategory
    key_points: List[str]
    content_warnings: List[str] = []  # Flagged sensitive content


class ArticleResponse(ArticleBase):
    id: str = Field(alias="_id")
    slug: str
    status: ArticleStatus = ArticleStatus.DRAFT
    author_id: str
    author_name: str
    
    # AI-generated fields
    ai_summary: Optional[str] = None
    ai_hashtags: List[str] = []
    ai_category: Optional[ArticleCategory] = None
    content_warnings: List[str] = []
    
    # Vector for similarity search
    article_vector: Optional[List[float]] = None
    
    # Publishing
    publish_time: Optional[datetime] = None
    published_at: Optional[datetime] = None
    
    # Metrics
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


# ===================== Translation Schemas =====================

class TranslationRequest(BaseModel):
    article_id: str
    target_language: str = Field(..., pattern="^(en|vi|ja|ko|zh)$")


class TranslationResponse(BaseModel):
    article_id: str
    original_language: str
    target_language: str
    translated_title: str
    translated_content: str
    translated_summary: Optional[str] = None


# ===================== Comment Schemas =====================

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentCreate(CommentBase):
    article_id: str


class CommentResponse(CommentBase):
    id: str = Field(alias="_id")
    article_id: str
    user_id: str
    user_name: str
    
    # AI-analyzed sentiment
    sentiment: SentimentType = SentimentType.NEUTRAL
    sentiment_score: float = 0.0
    
    is_flagged: bool = False
    created_at: datetime
    
    class Config:
        populate_by_name = True


# ===================== Analytics Schemas =====================

class EventType(str, Enum):
    VIEW = "view"
    LIKE = "like"
    SHARE = "share"
    COMMENT = "comment"
    CLICK = "click"


class AnalyticsEvent(BaseModel):
    article_id: str
    user_id: Optional[str] = None
    event_type: EventType
    metadata: Dict[str, Any] = {}


class ArticleStats(BaseModel):
    article_id: str
    views: int
    likes: int
    comments: int
    shares: int
    avg_read_time: float  # seconds


class DashboardStats(BaseModel):
    total_articles: int
    published_articles: int
    draft_articles: int
    pending_review: int
    total_users: int
    total_comments: int
    total_views: int
    articles_by_category: Dict[str, int]
    sentiment_distribution: Dict[str, int]


# ===================== AI Service Schemas =====================

class AIGenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 500
    temperature: float = 0.7


class AIGenerateResponse(BaseModel):
    result: str
    model: str
    tokens_used: int


class SchedulePublishRequest(BaseModel):
    article_id: str
    use_ai_scheduling: bool = False
    manual_time: Optional[datetime] = None


class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 10


class RecommendationResponse(BaseModel):
    user_id: str
    recommended_articles: List[ArticleResponse]


# ===================== Chatbot Schemas =====================

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    conversation_history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    message: str
    related_articles: List[ArticleResponse] = []
    sources: List[str] = []
