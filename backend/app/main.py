from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import asyncio
from app.core.config import settings
from app.api.dependencies import db
from app.api.v1 import auth, user, quests, inventory, skills, shop, jobs
from app.services.timer_service import quest_timer_loop

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Ping the database to ensure connection is valid
    try:
        await db.client.admin.command('ping')
        print("Connected to MongoDB successfully!")
        
        # Start background timer service
        asyncio.create_task(quest_timer_loop(db.client[settings.DATABASE_NAME]))
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    if db.client:
        db.client.close()

# Include Routers
app.include_router(
    auth.router, 
    prefix=f"{settings.API_V1_STR}/auth", 
    tags=["Authentication"]
)

app.include_router(
    user.router, 
    prefix=f"{settings.API_V1_STR}/user", 
    tags=["Users"]
)

app.include_router(
    quests.router,
    prefix=f"{settings.API_V1_STR}/quests",
    tags=["Quests"]
)

app.include_router(
    inventory.router,
    prefix=f"{settings.API_V1_STR}/inventory",
    tags=["Inventory"]
)

app.include_router(
    skills.router,
    prefix=f"{settings.API_V1_STR}/skills",
    tags=["Skills"]
)

app.include_router(
    shop.router,
    prefix=f"{settings.API_V1_STR}/shop",
    tags=["Shop"]
)

app.include_router(
    jobs.router,
    prefix=f"{settings.API_V1_STR}/jobs",
    tags=["Jobs"]
)

@app.get("/")
async def root():
    return {"message": "Solo Leveling System API is Online"}
