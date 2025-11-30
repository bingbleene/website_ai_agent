"""
Image Models and Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ImageBase(BaseModel):
    """Base model cho Image"""
    url: str  # URL ảnh (regular từ Unsplash)
    thumbnail_url: Optional[str] = None  # URL ảnh nhỏ (thumb)
    full_url: Optional[str] = None  # URL ảnh full size
    source: str = "unsplash"  # Nguồn: unsplash, upload, etc.
    description: Optional[str] = None  # Mô tả ảnh
    photographer_name: Optional[str] = None  # Tên photographer
    photographer_link: Optional[str] = None  # Link profile photographer
    width: Optional[int] = None
    height: Optional[int] = None
    is_primary: bool = False  # Ảnh chính của bài viết


class ImageCreate(ImageBase):
    """Schema tạo image mới"""
    article_id: str  # ID của article liên kết


class ImageUpdate(BaseModel):
    """Schema cập nhật image"""
    description: Optional[str] = None
    is_primary: Optional[bool] = None


class ImageResponse(ImageBase):
    """Schema response cho image"""
    id: str = Field(alias="_id")
    article_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
