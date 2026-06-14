from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from pydantic import BaseModel
import uuid

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserModel

router = APIRouter()

# Master Shop Inventory
SHOP_ITEMS = [
    {
        "id": "item_hp_potion_s",
        "name": "Minor HP Potion",
        "type": "consumable",
        "icon": "🧪",
        "rarity": "E",
        "price": 10,
        "description": "Restores 50 HP.",
        "stats_bonus": {"hp": 50},
        "level_req": 1
    },
    {
        "id": "item_mp_potion_s",
        "name": "Minor MP Potion",
        "type": "consumable",
        "icon": "💎",
        "rarity": "E",
        "price": 10,
        "description": "Restores 30 MP.",
        "stats_bonus": {"mp": 30},
        "level_req": 1
    },
    {
        "id": "item_knights_sword",
        "name": "Knight's Shortsword",
        "type": "weapon",
        "icon": "⚔️",
        "rarity": "D",
        "price": 150,
        "description": "A standard blade used by low-ranking knights.",
        "stats_bonus": {"strength": 5},
        "level_req": 5
    },
    {
        "id": "item_assassins_dagger",
        "name": "Kasaka's Venom Fang",
        "type": "weapon",
        "icon": "🗡️",
        "rarity": "C",
        "price": 500,
        "description": "A dagger dripping with paralyzing venom.",
        "stats_bonus": {"strength": 15, "agility": 10},
        "level_req": 10
    },
    {
        "id": "item_teleport_scroll",
        "name": "Dungeon Escape Scroll",
        "type": "scroll",
        "icon": "📜",
        "rarity": "B",
        "price": 300,
        "description": "Instantly teleports the user out of an active dungeon.",
        "stats_bonus": {},
        "level_req": 15
    }
]

class PurchaseRequest(BaseModel):
    item_id: str
    quantity: int = 1

@router.get("", response_model=List[dict])
async def get_shop_items():
    return SHOP_ITEMS

@router.post("/purchase")
async def purchase_item(
    req: PurchaseRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    item = next((i for i in SHOP_ITEMS if i["id"] == req.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in shop")
        
    if current_user.level < item["level_req"]:
        raise HTTPException(status_code=403, detail=f"Level {item['level_req']} required to purchase")
        
    total_cost = item["price"] * req.quantity
    user_dict = current_user.model_dump(by_alias=True)
    
    if user_dict.get("quest_points", 0) < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient Quest Points")
        
    # Deduct currency
    user_dict["quest_points"] -= total_cost
    inventory = user_dict.get("inventory", [])
    
    # Add to inventory
    # Remove 'price' and 'level_req' from the inventory copy
    inv_item = item.copy()
    inv_item.pop("price", None)
    inv_item.pop("level_req", None)
    
    if inv_item["type"] in ["consumable", "scroll"]:
        # Stackable
        found = False
        for i in inventory:
            if i["name"] == inv_item["name"]:
                i["qty"] = i.get("qty", 1) + req.quantity
                found = True
                break
        if not found:
            inv_item["id"] = str(uuid.uuid4()) # Unique inventory ID
            inv_item["qty"] = req.quantity
            inv_item["equipped"] = False
            inventory.append(inv_item)
    else:
        # Non-stackable (weapons/armor)
        for _ in range(req.quantity):
            new_item = inv_item.copy()
            new_item["id"] = str(uuid.uuid4())
            new_item["qty"] = 1
            new_item["equipped"] = False
            inventory.append(new_item)
            
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {
            "quest_points": user_dict["quest_points"],
            "inventory": inventory
        }}
    )
    
    return {
        "message": f"Successfully purchased {req.quantity}x {item['name']}",
        "quest_points": user_dict["quest_points"],
        "inventory": inventory
    }
