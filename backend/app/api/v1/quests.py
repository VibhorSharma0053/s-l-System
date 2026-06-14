from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.quest import QuestProgress, PenaltyProgress
from app.services.leveling import check_level_up

router = APIRouter()

DEFAULT_QUESTS = [
    { "name": "Push-ups", "progress": 0, "total": 100, "difficulty": "E", "xpReward": 50, "completed": False },
    { "name": "Sit-ups", "progress": 0, "total": 100, "difficulty": "E", "xpReward": 50, "completed": False },
    { "name": "Squats", "progress": 0, "total": 100, "difficulty": "E", "xpReward": 50, "completed": False },
    { "name": "Running", "progress": 0, "total": 10, "difficulty": "D", "xpReward": 100, "completed": False, "unit": "km" },
]

@router.get("/daily")
async def get_daily_quests(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if reset is needed
    if not current_user.last_quest_reset or current_user.last_quest_reset != today_str:
        # Reset quests
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {
                "daily_quests": DEFAULT_QUESTS,
                "last_quest_reset": today_str
            }}
        )
        return DEFAULT_QUESTS
        
    if not current_user.daily_quests:
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"daily_quests": DEFAULT_QUESTS}}
        )
        return DEFAULT_QUESTS
        
    return current_user.daily_quests

@router.post("/complete")
async def update_quest_progress(
    payload: QuestProgress,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    user_dict = current_user.model_dump(by_alias=True)
    quests = user_dict.get("daily_quests", [])
    
    if not quests or payload.index >= len(quests):
        raise HTTPException(status_code=400, detail="Invalid quest index")
        
    quest = quests[payload.index]
    
    if quest.get("completed"):
        return {"message": "Quest already completed", "leveled_up": False}
        
    # Apply progress
    quest["progress"] = min(quest["progress"] + payload.amount, quest["total"])
    
    leveled_up = False
    added_xp = 0
    added_qp = 0
    
    if quest["progress"] >= quest["total"] and not quest.get("completed"):
        quest["completed"] = True
        quest["completedAt"] = datetime.now(timezone.utc).isoformat()
        
        # Award XP and QP
        added_xp = quest.get("xpReward", 50)
        added_qp = 10
        
        user_dict["xp"] += added_xp
        user_dict["quest_points"] = user_dict.get("quest_points", 0) + added_qp
        
        leveled_up = check_level_up(user_dict)
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {
            "daily_quests": quests,
            "xp": user_dict["xp"],
            "level": user_dict["level"],
            "remaining_points": user_dict["remaining_points"],
            "hp": user_dict["hp"],
            "mp": user_dict["mp"],
            "max_hp": user_dict["max_hp"],
            "max_mp": user_dict["max_mp"],
            "quest_points": user_dict["quest_points"]
        }}
    )
    
    return {
        "message": "Progress updated", 
        "quest": quest,
        "leveled_up": leveled_up,
        "added_xp": added_xp
    }

@router.post("/penalty")
async def process_penalty(
    payload: PenaltyProgress,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    if not current_user.penalty_active:
        raise HTTPException(status_code=400, detail="User is not in the Penalty Zone")
        
    PENALTY_TOTAL = 14400 # E.g., Survive for 4 hours (14400 seconds) or do 14400 reps
    
    new_progress = min(current_user.penalty_progress + payload.amount, PENALTY_TOTAL)
    
    user_updates = {
        "penalty_progress": new_progress
    }
    
    cleared = False
    
    if new_progress >= PENALTY_TOTAL:
        # Status Restoration
        cleared = True
        user_updates["penalty_active"] = False
        user_updates["penalty_progress"] = 0
        
        # Reset the quests so they can start fresh
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        user_updates["daily_quests"] = DEFAULT_QUESTS
        user_updates["last_quest_reset"] = today_str
        
        # Re-heal player to full as a reward for surviving
        user_dict = current_user.model_dump(by_alias=True)
        user_updates["hp"] = user_dict["max_hp"]
        user_updates["mp"] = user_dict["max_mp"]
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": user_updates}
    )
    
    return {
        "message": "Penalty progress updated",
        "progress": new_progress,
        "total": PENALTY_TOTAL,
        "cleared": cleared
    }
