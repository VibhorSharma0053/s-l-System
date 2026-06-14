from pydantic import BaseModel, EmailStr
from typing import Optional, Dict

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    level: int
    job: str
    title: str
    hp: int
    max_hp: int
    mp: int
    max_mp: int
    xp: int
    stats: Dict[str, int]
    remaining_points: int
    gold: int
    quest_points: int
    penalty_active: bool
    daily_quests: list
    inventory: list

    model_config = {
        "populate_by_name": True
    }

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
