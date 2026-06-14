from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient

from app.api.dependencies import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.models.user import UserModel
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncIOMotorClient = Depends(get_db)
):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"email": user_in.email}, {"username": user_in.username}]})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists"
        )
    
    # Create new user
    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password)
    )
    
    # Save to MongoDB
    user_dict = user.model_dump(by_alias=True, exclude={"id"})
    result = await db.users.insert_one(user_dict)
    
    # Generate tokens
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    # Retrieve complete user for response
    user.id = result.inserted_id
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            **user.model_dump(exclude={"password_hash"}),
            "id": user_id
        }
    }

@router.post("/login")
async def login(
    user_in: UserLogin,
    db: AsyncIOMotorClient = Depends(get_db)
):
    user_dict = await db.users.find_one({"username": user_in.username})
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    user = UserModel(**user_dict)
    
    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    user_id = str(user.id)
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            **user.model_dump(exclude={"password_hash"}),
            "id": user_id
        }
    }
