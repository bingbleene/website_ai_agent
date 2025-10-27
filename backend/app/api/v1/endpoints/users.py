"""
Users API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from loguru import logger

from app.models.schemas import UserResponse, UserUpdate
from app.core.database import get_database
from app.core.security import get_current_user, get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get all users (Admin only)"""
    try:
        query = {}
        if role:
            query['role'] = role
        if is_active is not None:
            query['is_active'] = is_active
        
        cursor = db.users.find(query).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        for user in users:
            user['_id'] = str(user['_id'])
            user.pop('password', None)  # Remove password from response
        
        return [UserResponse(**user) for user in users]
        
    except Exception as e:
        logger.error(f"❌ Get users error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get current user profile"""
    try:
        user = await db.users.find_one({"_id": ObjectId(current_user['sub'])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user['_id'] = str(user['_id'])
        user.pop('password', None)
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Get user by ID (Admin only)"""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user['_id'] = user_id
        user.pop('password', None)
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Update user (Admin only)"""
    try:
        # Check if user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user
        update_data = user_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        updated_user['_id'] = user_id
        updated_user.pop('password', None)
        
        return UserResponse(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Update user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin_user),
    db = Depends(get_database)
):
    """Delete user (Admin only)"""
    try:
        # Prevent self-deletion
        if user_id == current_user['sub']:
            raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "message": "User deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
