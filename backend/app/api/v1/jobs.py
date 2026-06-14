from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from pydantic import BaseModel

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserModel

router = APIRouter()

AVAILABLE_JOBS = [
    {
        "id": "job_warrior",
        "name": "Warrior",
        "icon": "⚔️",
        "description": "A close-combat specialist utilizing immense physical strength.",
        "primary_stat": "strength",
        "abilities": ["Heavy Strike", "Iron Skin"],
        "color": "#f59e0b" # amber
    },
    {
        "id": "job_necromancer",
        "name": "Necromancer",
        "icon": "💀",
        "description": "A mage who commands the dead to fight on their behalf.",
        "primary_stat": "intelligence",
        "abilities": ["Arise", "Save"],
        "color": "#a855f7" # purple
    },
    {
        "id": "job_shadow_monarch",
        "name": "Shadow Monarch",
        "icon": "👑",
        "description": "The absolute ruler of the dead. An existence that transcends the system.",
        "primary_stat": "intelligence", # usually all stats, but primarily INT for shadows
        "abilities": ["Shadow Extraction", "Domain of the Monarch", "Shadow Exchange"],
        "color": "#00a8ff" # blue
    }
]

class JobSelectRequest(BaseModel):
    job_id: str

@router.get("")
async def get_jobs(current_user: UserModel = Depends(get_current_user)):
    user_dict = current_user.model_dump(by_alias=True)
    stats = user_dict.get("stats", {})
    
    # Calculate recommendations
    highest_stat = max(stats, key=stats.get) if stats else "strength"
    
    response_jobs = []
    for job in AVAILABLE_JOBS:
        j = job.copy()
        
        # Recommendations
        if job["primary_stat"] == highest_stat:
            j["recommended"] = True
        else:
            j["recommended"] = False
            
        # Shadow Monarch special condition (example: must have been a Necromancer first or very high level)
        if job["id"] == "job_shadow_monarch":
            j["locked_reason"] = "Requires Level 40 and Necromancer class." if current_user.level < 40 else None
            if current_user.level >= 40:
                j["locked_reason"] = None
        else:
            j["locked_reason"] = None
            
        response_jobs.append(j)
        
    return {
        "is_unlocked": current_user.level >= 10,
        "current_job": current_user.job,
        "jobs": response_jobs
    }

@router.post("/select")
async def select_job(
    req: JobSelectRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    if current_user.level < 10:
        raise HTTPException(status_code=403, detail="Level 10 required for Job Change.")
        
    job = next((j for j in AVAILABLE_JOBS if j["id"] == req.job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    if job["id"] == "job_shadow_monarch" and current_user.level < 40:
        raise HTTPException(status_code=403, detail="You lack the qualifications for this class.")
        
    # Update job
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"job": job["name"]}}
    )
    
    return {
        "message": f"Job Class advanced to {job['name']}!",
        "new_job": job["name"]
    }
