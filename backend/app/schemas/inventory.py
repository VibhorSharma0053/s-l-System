from pydantic import BaseModel, Field
from typing import Optional, Dict
import uuid

class ItemBase(BaseModel):
    name: str
    type: str # 'weapon', 'armor', 'consumable', 'book', 'tool'
    icon: str
    rarity: str # 'E', 'D', 'C', 'B', 'A', 'S'
    stats_bonus: Dict[str, int] = {}
    description: str = ""

class InventoryItem(ItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    equipped: bool = False
    qty: int = 1

class EquipRequest(BaseModel):
    item_id: str
    equip: bool
