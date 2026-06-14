import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

async def check_penalties(db: AsyncIOMotorClient):
    """
    Checks all users to see if they failed to complete their daily quests yesterday.
    If so, activates the Penalty Zone.
    """
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y-%m-%d")
    
    # Find users who haven't reset today yet, meaning we need to evaluate yesterday's quests
    cursor = db.users.find({
        "last_quest_reset": {"$ne": today_str},
        "penalty_active": False
    })
    
    users = await cursor.to_list(length=1000)
    for user in users:
        quests = user.get("daily_quests", [])
        
        # If they had quests but didn't finish all of them, penalty!
        if quests:
            all_completed = all(q.get("completed", False) for q in quests)
            if not all_completed:
                await db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {
                        "penalty_active": True,
                        "penalty_progress": 0
                    }}
                )
                print(f"[SYSTEM] Player {user.get('username')} transferred to Penalty Zone!")

async def quest_timer_loop(db: AsyncIOMotorClient):
    """
    Infinite background loop tracking the daily reset.
    Checks at the top of every minute.
    """
    print("[SYSTEM] Background Quest Timer Service initialized.")
    while True:
        now = datetime.now(timezone.utc)
        
        # If it is exactly midnight UTC (or within the first minute of the new day)
        if now.hour == 0 and now.minute == 0:
            print("[SYSTEM] Midnight reached. Evaluating Daily Quests...")
            await check_penalties(db)
            # Sleep for 61 seconds to ensure we don't trigger this again on the same minute
            await asyncio.sleep(61)
            continue
            
        # Sleep until the next minute starts to save CPU cycles
        seconds_until_next_minute = 60 - now.second
        await asyncio.sleep(seconds_until_next_minute)
