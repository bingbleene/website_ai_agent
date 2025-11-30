"""
Images API Endpoints - Quản lý ảnh của bài viết
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger

from app.models.image_schemas import ImageCreate, ImageUpdate, ImageResponse
from app.core.database import get_database
from app.core.security import get_current_user

router = APIRouter()


@router.get("/article/{article_id}", response_model=List[ImageResponse])
async def get_images_by_article(
    article_id: str,
    db = Depends(get_database)
):
    """Lấy tất cả ảnh của một bài viết"""
    try:
        images = await db.images.find({"article_id": article_id}).to_list(length=100)
        
        for img in images:
            img['_id'] = str(img['_id'])
        
        return images
    except Exception as e:
        logger.error(f"❌ Lỗi khi lấy ảnh: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: str,
    db = Depends(get_database)
):
    """Lấy thông tin một ảnh"""
    try:
        image = await db.images.find_one({"_id": ObjectId(image_id)})
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image['_id'] = str(image['_id'])
        return image
    except Exception as e:
        logger.error(f"❌ Lỗi khi lấy ảnh: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ImageResponse)
async def create_image(
    image_data: ImageCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Tạo image mới"""
    try:
        # Kiểm tra article có tồn tại không
        article = await db.articles.find_one({"_id": ObjectId(image_data.article_id)})
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        image_dict = image_data.model_dump()
        image_dict['created_at'] = datetime.utcnow()
        
        result = await db.images.insert_one(image_dict)
        image_id = str(result.inserted_id)
        
        image = await db.images.find_one({"_id": ObjectId(image_id)})
        image['_id'] = image_id
        
        return image
    except Exception as e:
        logger.error(f"❌ Lỗi khi tạo ảnh: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{image_id}", response_model=ImageResponse)
async def update_image(
    image_id: str,
    image_data: ImageUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Cập nhật thông tin ảnh"""
    try:
        update_data = {k: v for k, v in image_data.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        result = await db.images.update_one(
            {"_id": ObjectId(image_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        image = await db.images.find_one({"_id": ObjectId(image_id)})
        image['_id'] = str(image['_id'])
        
        return image
    except Exception as e:
        logger.error(f"❌ Lỗi khi cập nhật ảnh: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Xóa ảnh"""
    try:
        result = await db.images.delete_one({"_id": ObjectId(image_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return {"message": "Image deleted successfully"}
    except Exception as e:
        logger.error(f"❌ Lỗi khi xóa ảnh: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/article/{article_id}/set-primary/{image_id}")
async def set_primary_image(
    article_id: str,
    image_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Đặt ảnh làm ảnh chính (primary) của bài viết"""
    try:
        # Bỏ is_primary của tất cả ảnh trong article
        await db.images.update_many(
            {"article_id": article_id},
            {"$set": {"is_primary": False}}
        )
        
        # Set ảnh được chọn làm primary
        result = await db.images.update_one(
            {"_id": ObjectId(image_id), "article_id": article_id},
            {"$set": {"is_primary": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Cập nhật thumbnail_url của article
        image = await db.images.find_one({"_id": ObjectId(image_id)})
        await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": {"thumbnail_url": image['url']}}
        )
        
        return {"message": "Primary image updated successfully"}
    except Exception as e:
        logger.error(f"❌ Lỗi khi set primary image: {e}")
        raise HTTPException(status_code=500, detail=str(e))
