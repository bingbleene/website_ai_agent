"""
Authentication Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.models.schemas import UserLogin, UserCreate, TokenResponse, UserResponse
from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from loguru import logger

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db=Depends(get_database)):
    """Register new user"""
    # Check if email exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict['password'] = hash_password(user_dict['password'])
    user_dict['created_at'] = datetime.utcnow()
    user_dict['is_active'] = True
    
    result = await db.users.insert_one(user_dict)
    user_dict['_id'] = str(result.inserted_id)
    
    return UserResponse(**user_dict)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db=Depends(get_database)):
    """Login user"""
    print(f"========== LOGIN ATTEMPT: {credentials.email} ==========")
    logger.info(f"Login attempt for email: {credentials.email}")
    user = await db.users.find_one({"email": credentials.email})
    print(f"========== USER FOUND: {user is not None} ==========")
    if not user:
        print(f"========== EMAIL NOT FOUND: {credentials.email} ==========")
        logger.warning(f"Email not found: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(credentials.password, user['password']):
        logger.warning(f"Password mismatch for email: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info(f"Login success for email: {credentials.email}")

    if not user.get('is_active', True):
        logger.warning(f"Account inactive for email: {credentials.email}")
        raise HTTPException(status_code=403, detail="Account is inactive")

    token_data = {
        "sub": str(user['_id']),
        "email": user['email'],
        "role": user['role']
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user['_id'] = str(user['_id'])

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(**user)
    )
