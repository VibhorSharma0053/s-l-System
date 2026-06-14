from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from datetime import datetime, timezone, timedelta

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.skill import SkillBase, SkillCastRequest

router = APIRouter()

# The Master Skill Dictionary for the Game
MASTER_SKILLS = [
    {
        "id": "sk_shadow_exchange",
        "name": "Shadow Exchange",
        "type": "active",
        "icon": "🌑",
        "description": "Swap position with a designated shadow instantly.",
        "unlock_level": 15,
        "cooldown_seconds": 60,
        "effect": "Teleport"
    },
    {
        "id": "sk_time_freeze",
        "name": "Time Freeze",
        "type": "active",
        "icon": "⏳",
        "description": "Halt time for 3 seconds for all entities except the system player.",
        "unlock_level": 30,
        "cooldown_seconds": 300,
        "effect": "Stun All"
    },
    {
        "id": "sk_tenacity",
        "name": "Tenacity",
        "type": "passive",
        "icon": "🛡️",
        "description": "Reduce all incoming damage by 10%.",
        "unlock_level": 1,
        "effect": "Always Active"
    },
    {
        "id": "sk_will_to_recover",
        "name": "Will To Recover",
        "type": "passive",
        "icon": "💚",
        "description": "Passively regenerate missing limbs and HP over time.",
        "unlock_level": 5,
        "effect": "HP +5/min"
    }
]

# In-memory cooldown tracking (In production, use Redis or MongoDB for persistence)
# dict of {user_id: {skill_id: timestamp_ready}}
COOLDOWNS = {}

@router.get("", response_model=List[dict])
async def get_skills(current_user: UserModel = Depends(get_current_user)):
    user_skills = []
    user_cooldowns = COOLDOWNS.get(str(current_user.id), {})
    now = datetime.now(timezone.utc)
    
    for skill in MASTER_SKILLS:
        skill_copy = skill.copy()
        skill_copy["unlocked"] = current_user.level >= skill["unlock_level"]
        
        # Check cooldown
        ready_time = user_cooldowns.get(skill["id"])
        if ready_time and ready_time > now:
            remaining = (ready_time - now).total_seconds()
            skill_copy["current_cooldown"] = int(remaining)
        else:
            skill_copy["current_cooldown"] = 0
            
        user_skills.append(skill_copy)
        
    return user_skills

@router.post("/cast")
async def cast_skill(
    req: SkillCastRequest,
    current_user: UserModel = Depends(get_current_user)
):
    skill = next((s for s in MASTER_SKILLS if s["id"] == req.skill_id), None)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    if current_user.level < skill["unlock_level"]:
        raise HTTPException(status_code=403, detail="Skill not unlocked yet")
        
    if skill["type"] != "active":
        raise HTTPException(status_code=400, detail="Can only cast active skills")
        
    user_id_str = str(current_user.id)
    if user_id_str not in COOLDOWNS:
        COOLDOWNS[user_id_str] = {}
        
    now = datetime.now(timezone.utc)
    ready_time = COOLDOWNS[user_id_str].get(skill["id"])
    
    if ready_time and ready_time > now:
        raise HTTPException(status_code=429, detail="Skill is on cooldown")
        
    # Execute skill
    # (In a real MMO, we would deduct MP and calculate damage against a target here)
    
    # Set Cooldown
    COOLDOWNS[user_id_str][skill["id"]] = now + timedelta(seconds=skill["cooldown_seconds"])
    
    return {
        "message": f"Cast {skill['name']}!",
        "effect": skill["effect"],
        "cooldown_seconds": skill["cooldown_seconds"]
    }
