from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError
from bson import ObjectId

from app.core.config import settings
from app.models.user import UserModel
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

# MongoDB Connection Dependency
class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

def get_db() -> AsyncIOMotorClient:
    return db.client[settings.DATABASE_NAME]

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    database = Depends(get_db)
) -> UserModel:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        if token_data.type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = await database.users.find_one({"_id": ObjectId(token_data.sub)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserModel(**user)
