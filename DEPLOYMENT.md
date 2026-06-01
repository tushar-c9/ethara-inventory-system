# Deployment Guide – Ethara Inventory & Order Management System

Follow these steps in order to get all 4 required public links.

---

## Prerequisites

- GitHub account
- Docker Hub account → https://hub.docker.com
- Neon account (free) → https://neon.tech
- Render account (free) → https://render.com
- Vercel account (free) → https://vercel.com

---

## STEP 1 – Push to GitHub

```bash
# 1. Create a NEW repo on github.com (name: ethara-inventory-system)
# 2. Then run from inventory-system/ directory:

git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ethara-inventory-system.git
git push -u origin main
```

✅ **GitHub Link:** `https://github.com/<YOUR_GITHUB_USERNAME>/ethara-inventory-system`

---

## STEP 2 – Push Backend Image to Docker Hub (Phase 17)

```bash
# From inventory-system/backend/

# Login to Docker Hub
docker login

# Re-tag with your Docker Hub username
docker tag inventory-backend:latest <YOUR_DOCKERHUB_USERNAME>/inventory-backend:latest
docker tag inventory-backend:1.0.0 <YOUR_DOCKERHUB_USERNAME>/inventory-backend:1.0.0

# Push both tags
docker push <YOUR_DOCKERHUB_USERNAME>/inventory-backend:latest
docker push <YOUR_DOCKERHUB_USERNAME>/inventory-backend:1.0.0
```

✅ **Docker Hub Link:** `https://hub.docker.com/r/<YOUR_DOCKERHUB_USERNAME>/inventory-backend`

---

## STEP 3 – Create Neon PostgreSQL Database

1. Go to https://neon.tech → **Sign Up / Login**
2. Click **New Project** → name it `inventory-db`
3. Select region closest to you → Click **Create Project**
4. Copy the **Connection String** (looks like):
   ```
   postgresql://neondb_owner:<password>@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this — you'll need it for Render.

---

## STEP 4 – Deploy Backend on Render (Phase 16)

1. Go to https://render.com → **New → Web Service**
2. Connect your GitHub repo: `ethara-inventory-system`
3. Configure:
   - **Name:** `inventory-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** Free

4. Add **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(paste your Neon connection string)* |
   | `APP_ENV` | `production` |
   | `CORS_ORIGINS` | *(leave blank for now, update after Vercel deploy)* |

5. Click **Create Web Service** → wait ~3 min for first deploy.

✅ **Backend URL:** `https://inventory-backend-xxxx.onrender.com`

---

## STEP 5 – Deploy Frontend on Vercel (Phase 16)

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo: `ethara-inventory-system`
3. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add **Environment Variable:**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://inventory-backend-xxxx.onrender.com/api` |

5. Click **Deploy** → wait ~2 min.

✅ **Frontend URL:** `https://ethara-inventory-system.vercel.app`

---

## STEP 6 – Update CORS on Render

After Vercel gives you the frontend URL, go back to Render → your backend service → **Environment** and update:

```
CORS_ORIGINS = https://ethara-inventory-system.vercel.app
```

Then click **Save Changes** (Render will auto-redeploy).

---

## STEP 7 – Add GitHub Secrets for CI/CD

In your GitHub repo → **Settings → Secrets → Actions**, add:

| Secret Name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (from hub.docker.com/settings/security) |
| `VERCEL_TOKEN` | Vercel token (from vercel.com/account/tokens) |

After this, every push to `main` will auto-deploy!

---

## Final Required Links

| # | Link | Description |
|---|------|-------------|
| 1 | `https://github.com/<YOU>/ethara-inventory-system` | GitHub Repo |
| 2 | `https://hub.docker.com/r/<YOU>/inventory-backend` | Docker Hub Image |
| 3 | `https://ethara-inventory-system.vercel.app` | Frontend (Vercel) |
| 4 | `https://inventory-backend-xxxx.onrender.com` | Backend API (Render) |
