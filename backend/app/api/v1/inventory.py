from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import uuid

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.inventory import EquipRequest

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_inventory(current_user: UserModel = Depends(get_current_user)):
    return current_user.inventory

@router.post("/add")
async def add_item(
    item_data: dict,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    inventory = current_user.inventory
    
    # Check if stackable consumable
    if item_data.get("type") == "consumable":
        for item in inventory:
            if item["name"] == item_data["name"]:
                item["qty"] = item.get("qty", 1) + item_data.get("qty", 1)
                await db.users.update_one(
                    {"_id": ObjectId(current_user.id)},
                    {"$set": {"inventory": inventory}}
                )
                return inventory
                
    # Add new item
    item_data["id"] = str(uuid.uuid4())
    item_data["equipped"] = False
    if "qty" not in item_data:
        item_data["qty"] = 1
        
    inventory.append(item_data)
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"inventory": inventory}}
    )
    return inventory

@router.post("/equip")
async def toggle_equip(
    req: EquipRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    inventory = current_user.inventory
    found = False
    
    for item in inventory:
        if item.get("id") == req.item_id:
            if item.get("type") in ["consumable", "book", "tool"]:
                raise HTTPException(status_code=400, detail="Item type cannot be equipped")
                
            # If equipping a weapon/armor, unequip others of same type
            if req.equip:
                for other in inventory:
                    if other.get("type") == item.get("type"):
                        other["equipped"] = False
                        
            item["equipped"] = req.equip
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Item not found in inventory")
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"inventory": inventory}}
    )
    return inventory

@router.post("/use")
async def use_item(
    item_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    inventory = current_user.inventory
    user_dict = current_user.model_dump(by_alias=True)
    
    found = False
    for item in inventory:
        if item.get("id") == item_id:
            if item.get("type") != "consumable":
                raise HTTPException(status_code=400, detail="Item cannot be used directly")
                
            found = True
            item["qty"] = item.get("qty", 1) - 1
            
            # Apply effects (e.g., heal HP/MP)
            stats = item.get("stats_bonus", {})
            user_dict["hp"] = min(user_dict["hp"] + stats.get("hp", 0), user_dict["max_hp"])
            user_dict["mp"] = min(user_dict["mp"] + stats.get("mp", 0), user_dict["max_mp"])
            
            if item["qty"] <= 0:
                inventory.remove(item)
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Item not found")
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {
            "inventory": inventory,
            "hp": user_dict["hp"],
            "mp": user_dict["mp"]
        }}
    )
    return {"inventory": inventory, "hp": user_dict["hp"], "mp": user_dict["mp"]}
