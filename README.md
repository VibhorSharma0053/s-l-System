# Solo Leveling System ⚔️

A fully-functional, production-ready Full-Stack RPG gamification platform built with React, FastAPI, and MongoDB.

## Features
- **Holographic UI**: A complete recreation of the System interface with scanning lines, micro-animations, and glassmorphism.
- **Quest System**: Daily regenerating quests tied to a 24-hour UTC timer.
- **Dynamic Penalties**: Fail your daily quests, and you are transported to the Penalty Zone. Survive to escape.
- **RPG Progression**: True Leveling logic, Status points allocation, HP/MP management.
- **Inventory & Shop**: Purchase items using Quest Points, equip weapons, and consume potions.
- **Skill Tree**: Unlock powerful active and passive skills based on level progression.
- **Job Selection**: Unlock exclusive Jobs (e.g., Shadow Monarch) upon reaching milestones.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Python, FastAPI, Motor (Async MongoDB), JWT Authentication
- **Database**: MongoDB Atlas

## Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB running locally or Atlas

### 1. Start the Backend
```bash
cd backend
python -m venv env
source env/Scripts/activate  # Or env/bin/activate on Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 2. Start the Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Production Deployment
Please see [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions on deploying to Render, Vercel, and MongoDB Atlas.
