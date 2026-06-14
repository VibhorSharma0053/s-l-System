from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from bson import ObjectId
from typing import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str
    email: str
    password_hash: str
    
    # RPG Stats
    level: int = 1
    job: str = "None"
    title: str = "E-Rank Hunter"
    hp: int = 100
    max_hp: int = 100
    mp: int = 50
    max_mp: int = 50
    xp: int = 0
    
    stats: Dict[str, int] = {
        "strength": 10,
        "agility": 10,
        "stamina": 10,
        "intelligence": 10,
        "perception": 10
    }
    remaining_points: int = 0
    gold: int = 0
    quest_points: int = 0
    
    inventory: List[Dict[str, Any]] = []
    
    daily_quests: List[Dict[str, Any]] = []
    last_quest_reset: Optional[str] = None
    
    penalty_active: bool = False
    penalty_progress: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
