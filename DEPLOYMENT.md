# Solo Leveling System - Deployment Guide

This guide covers the end-to-end deployment of the Solo Leveling application using free-tier modern hosting platforms: **MongoDB Atlas** (Database), **Render** (FastAPI Backend), and **Vercel** (React Frontend).

## 1. Database Deployment (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a new cluster (Free Shared M0 tier).
3. Under **Security > Database Access**, create a new database user and save the password.
4. Under **Security > Network Access**, click "Add IP Address" and select "Allow Access From Anywhere" (`0.0.0.0/0`) so your backend host can connect.
5. Click **Connect** on your cluster, select "Connect your application", and copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
   - **Keep this string ready for the backend deployment.**

## 2. Backend Deployment (Render)
Render is an excellent platform for deploying FastAPI applications natively.

1. Go to [Render](https://render.com/) and create a free account.
2. Push your entire Solo Leveling project to a GitHub repository.
3. In Render, create a new **Web Service**.
4. Connect your GitHub account and select the Solo Leveling repository.
5. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Under **Advanced**, add the following **Environment Variables**:
   - `DATABASE_URL` = `<Paste your MongoDB Atlas Connection String here>`
   - `DATABASE_NAME` = `solo_leveling_db`
   - `SECRET_KEY` = `<Generate a long random string, e.g., using openssl rand -hex 32>`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440` (24 hours)
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app` *(You will update this later after Vercel deployment)*
7. Click **Create Web Service**. Wait for the build to finish. Once live, copy the Render API URL (e.g., `https://solo-leveling-api.onrender.com`).

## 3. Frontend Deployment (Vercel)
Vercel is the premier platform for deploying Vite/React applications.

1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Click **Add New > Project** and import your GitHub repository.
3. Configure the Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
4. Open the **Environment Variables** section and add:
   - `VITE_API_URL` = `<Paste your Render API URL here>` (e.g., `https://solo-leveling-api.onrender.com/api`)
5. Click **Deploy**.
6. Once deployed, copy your new Vercel URL (e.g., `https://solo-leveling-frontend.vercel.app`).

## 4. Final Configuration Sync
1. Go back to your **Render** dashboard.
2. Open your Backend Web Service -> **Environment**.
3. Update the `FRONTEND_URL` variable to exactly match your Vercel URL (e.g., `https://solo-leveling-frontend.vercel.app`).
   - *This ensures the FastAPI CORS configuration securely accepts requests from your live React app!*
4. Restart your Render Web Service.

---

### Congratulations!
Your Solo Leveling System is now live! Open your Vercel URL, create your Hunter account, and begin your daily quests. ARISE!
