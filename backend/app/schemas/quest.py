from pydantic import BaseModel
from typing import Optional

class QuestProgress(BaseModel):
    index: int
    amount: int

class PenaltyProgress(BaseModel):
    amount: int

class QuestComplete(BaseModel):
    index: int

class LevelUpResponse(BaseModel):
    leveled_up: bool
    new_level: int
    new_hp: int
    new_mp: int
    new_remaining_points: int
    current_xp: int
