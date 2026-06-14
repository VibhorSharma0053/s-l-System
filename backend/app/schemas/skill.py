from pydantic import BaseModel
from typing import Optional

class SkillBase(BaseModel):
    id: str
    name: str
    type: str # 'active' or 'passive'
    icon: str
    description: str
    unlock_level: int
    cooldown_seconds: Optional[int] = None
    effect: Optional[str] = None

class SkillCastRequest(BaseModel):
    skill_id: str
