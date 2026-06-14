from bson import ObjectId
from fastapi import APIRouter, Depends, Body
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import UserModel
from app.schemas.user import UserResponse
from app.api.dependencies import get_current_user, get_db
from app.services.leveling import check_level_up

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get current logged in user profile.
    """
    user_dict = current_user.model_dump(exclude={"password_hash"})
    user_dict["id"] = str(current_user.id)
    return user_dict

@router.post("/add_xp")
async def add_xp(
    amount: int = Body(..., embed=True),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """
    Standalone endpoint to grant XP for external events (e.g., Hidden Quests, Monsters).
    """
    user_dict = current_user.model_dump(by_alias=True)
    user_dict["xp"] += amount
    
    leveled_up = check_level_up(user_dict)
    
    # Update MongoDB
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {
            "xp": user_dict["xp"],
            "level": user_dict["level"],
            "remaining_points": user_dict["remaining_points"],
            "hp": user_dict["hp"],
            "mp": user_dict["mp"],
            "max_hp": user_dict["max_hp"],
            "max_mp": user_dict["max_mp"]
        }}
    )
    
    return {
        "message": f"Added {amount} XP",
        "leveled_up": leveled_up,
        "new_level": user_dict["level"],
        "current_xp": user_dict["xp"]
    }
