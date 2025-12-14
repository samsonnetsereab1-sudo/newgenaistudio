# Deploy NewGen Studio Backend to Render.com

## 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest) or email
3. Free tier includes 750 hours/month

## 2. Push Code to GitHub
```powershell
# Initialize git if not already done
cd C:\NewGenAPPs\newgen-studio
git init
git add .
git commit -m "Initial commit for Render deployment"

# Create GitHub repo and push
# Go to github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/newgen-studio.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Click **"Apply"**

## 4. Add Environment Variables
In Render Dashboard → Your Service → Environment:

**Required:**
- `OPENAI_API_KEY`: `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`
- `GEMINI_API_KEY`: `AIzaSyDSk0tKfpg5m8Xve8LdHrRBpnLy0__xG-c`
- `MONGODB_URI`: `reabi_db_user:sam1973@cluster0.adgjxqu.mongodb.net/?appName=Cluster0`

**Optional:**
- `UI_PROVIDER`: `openai` (or `gemini`)
- `DEMO_MODE`: `false`

## 5. Update Frontend
Once deployed, update your frontend `.env`:
```
VITE_API_URL=https://newgen-studio-backend.onrender.com
```

## Your Backend URL
After deployment completes (~5 min), your API will be at:
```
https://newgen-studio-backend.onrender.com/api/health
```

## Test Deployment
```powershell
Invoke-RestMethod https://newgen-studio-backend.onrender.com/api/health
```

## Important Notes
- ✅ Free tier: 750 hours/month
- ⚠️ Free tier sleeps after 15 min inactivity (takes ~30s to wake up)
- ✅ No Windows security restrictions
- ✅ HTTPS by default
- ✅ Automatic deploys on git push
