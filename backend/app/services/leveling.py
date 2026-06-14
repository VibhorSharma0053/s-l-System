def check_level_up(user: dict) -> bool:
    """
    Evaluates if a user should level up based on their XP.
    Formula: Required XP = Level * 100
    Level Up Rewards: +5 Stat Points, +20 Max HP, +10 Max MP, Full Heal.
    """
    level_up_occurred = False
    
    while user["xp"] >= user["level"] * 100:
        user["xp"] -= user["level"] * 100
        user["level"] += 1
        user["remaining_points"] += 5
        user["max_hp"] += 20
        user["max_mp"] += 10
        user["hp"] = user["max_hp"] # Full heal
        user["mp"] = user["max_mp"]
        level_up_occurred = True
        
    return level_up_occurred
