# 📦 Render.com Backend Deployment — Complete Guide
## newgenaistudio.com API Backend

**Domain**: api.newgenaistudio.com  
**Service**: NewGen Studio Backend (Express.js)  
**Status**: Ready to deploy

---

## Why Render?

| Feature | Render | Vercel | Railway |
|---------|--------|--------|---------|
| Node.js Support | ✅ | ⚠️ (Limited) | ✅ |
| Always-on Instance | ✅ | ❌ | ✅ |
| Timeout | 30 sec | 10 sec | 30 sec |
| Custom Domain | ✅ | ✅ | ✅ |
| Free Tier | ✅ | ✅ | ✅ |
| Price | $7+/mo | $20+/mo | $5+/mo |

✅ **Best choice for Express backend**

---

## Quick Start (5 Minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (recommended)
4. Authorize Render to access your repos

### Step 2: Create Web Service
1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. **Connect repository**:
   - Search: `newgen-studio`
   - Select your repo
   - Click **Connect**

### Step 3: Configure Service
**Name**: `newgen-backend`  
**Environment**: Node  
**Region**: Choose closest to your users (default is fine)  
**Build Command**: `npm install`  
**Start Command**: `npm start`  
**Port**: `4000`

### Step 4: Add Environment Variables
Click **Advanced** and add these:

```
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN=https://newgenaistudio.com
ENABLE_CORS=true
AUDIT_ENABLED=true
REQUIRE_SIGNATURE=true
```

### Step 5: Deploy
Click **Create Web Service**

**Expected**: Deployment starts automatically  
**Time**: 3-5 minutes for first build

---

## Detailed Step-by-Step

### Step 1: Prepare Backend Repository

**Verify `backend/package.json` has:**
```json
{
  "name": "newgen-backend",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
```

✅ Already correct in your project

**Verify `backend/server.js` starts Express:**
```javascript
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});
```

✅ Already correct in your project

### Step 2: Create Render Account

1. Go to https://render.com
2. Click **Get Started Free**
3. Choose sign-up method:
   - **GitHub** (recommended - easier)
   - **Google**
   - **Email**

### Step 3: Connect GitHub Repository

1. Click **GitHub** sign-up button
2. You'll see GitHub authorization dialog
3. Click **Authorize Render**
4. Render now has access to your repos

### Step 4: Create New Web Service

1. Go to https://render.com/dashboard
2. Click **New +**
3. Select **Web Service**
4. You should see list of connected repos

**Find and select**: `newgen-studio` repository

**Click**: **Connect**

### Step 5: Configure Build Settings

You'll see a form with these fields:

**Name**: `newgen-backend` (service name)

**Environment**: `Node` (dropdown)

**Region**: `Oregon (US West)` (or your closest region)

**Build Command**: 
```
npm install
```

**Start Command**: 
```
npm start
```

**Instance Type**: `Free` (or upgrade later)

### Step 6: Configure Environment Variables

Click **Advanced** (or scroll down)

Find **Environment Variables** section

Add each variable:

| Key | Value |
|-----|-------|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `FRONTEND_ORIGIN` | `https://newgenaistudio.com` |
| `ENABLE_CORS` | `true` |
| `AUDIT_ENABLED` | `true` |
| `REQUIRE_SIGNATURE` | `true` |

**For each variable**:
1. Click **Add Variable**
2. Enter Key (e.g., `PORT`)
3. Enter Value (e.g., `4000`)
4. Click **Save** or **Add Another**

### Step 7: Review and Deploy

1. Scroll to bottom
2. Click **Create Web Service**
3. Render starts building immediately

**You'll see**:
- Build log scrolling
- Install dependencies
- Start service
- Get live URL

**Example URL**: `https://newgen-backend-xyz123.onrender.com`

---

## Monitoring Deployment

### Live Build Log

Once you click "Create Web Service", you'll see live logs:

```
=== Building ===
npm install
added 50 packages in 2s

=== Starting ===
npm start
✅ API running on http://localhost:4000
📋 Endpoints:
   GET  /api/health
   POST /api/generate
   ...
```

**Expected**: Takes 3-5 minutes for first build

### Deployment Status

**After build completes**:
- ✅ Green dot = Service is live
- 🔴 Red dot = Service failed
- 🟡 Yellow dot = Building/Starting

### Service URL

Once deployed, you'll get URL like:
```
https://newgen-backend-abc123.onrender.com
```

**Test it**:
```powershell
curl https://newgen-backend-abc123.onrender.com/api/health
# Expected: { "status": "ok" }
```

---

## Add Custom Domain

Once service is live:

1. Go to Render dashboard
2. Select `newgen-backend` service
3. Go to **Settings** tab
4. Scroll to **Custom Domain**
5. Click **Add Custom Domain**
6. Enter: `api.newgenaistudio.com`
7. Click **Add**

**Render will show**:
```
CNAME target: newgen-backend-abc123.onrender.com
```

**Copy this CNAME value and enter in Network Solutions DNS**:
- Host: `api`
- Type: `CNAME`
- Value: `newgen-backend-abc123.onrender.com` (or whatever Render shows)

---

## Environment Variables Explained

### `PORT=4000`
- What port Express listens on
- Render uses this to route traffic
- Don't change

### `NODE_ENV=production`
- Tells Express to run in production mode
- Disables verbose logging
- Improves performance

### `FRONTEND_ORIGIN=https://newgenaistudio.com`
- Tells backend to accept requests from this domain
- Used in CORS headers
- Critical for frontend-backend communication

### `ENABLE_CORS=true`
- Enables Cross-Origin Resource Sharing
- Allows browser requests from frontend domain
- Without this, browser blocks API calls

### `AUDIT_ENABLED=true`
- Enables audit trail logging
- Required for FDA 21 CFR Part 11 compliance
- Logs all requests

### `REQUIRE_SIGNATURE=true`
- Requires e-signatures on certain operations
- Part of HIL (Human-in-the-Loop)
- Compliance requirement

---

## Testing After Deployment

### Test 1: Service is Live
```powershell
curl https://newgen-backend-abc123.onrender.com/api/health
```

**Expected response**:
```json
{
  "status": "ok"
}
```

### Test 2: CORS Headers Present
```powershell
curl -i https://newgen-backend-abc123.onrender.com/api/v1/plugins
```

**Expected response includes**:
```
Access-Control-Allow-Origin: *
(or specific domain once custom domain set)
```

### Test 3: Marketplace Endpoint Works
```powershell
curl https://newgen-backend-abc123.onrender.com/api/v1/plugins
```

**Expected response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "alphafold2",
      "name": "AlphaFold 2",
      ...
    },
    ...
  ]
}
```

### Test 4: Install Plugin
```powershell
$body = @{
  tenantId = "tenant-123"
  pluginId = "alphafold2"
} | ConvertTo-Json

curl -X POST `
  -H "Content-Type: application/json" `
  -d $body `
  https://newgen-backend-abc123.onrender.com/api/v1/plugins/alphafold2/install
```

**Expected response**:
```json
{
  "status": "success",
  "data": {
    "licenseKey": "newgen_tenant-123_alphafold2_..."
  }
}
```

---

## Monitoring & Logs

### View Logs
1. Go to Render dashboard
2. Select `newgen-backend`
3. Click **Logs** tab
4. See real-time service logs

### Common Log Messages
```
✅ API running on http://localhost:4000  ← Good
Connection established               ← Good
Error: Cannot find module            ← Bad - dependency missing
Error: listen EADDRINUSE              ← Bad - port in use
```

### Search Logs
Use browser Ctrl+F to search for:
- "ERROR" — error messages
- "failed" — failed requests
- "CORS" — CORS-related issues

---

## Auto-Restarts

**Render automatically restarts if**:
- Service crashes
- Environment variable changes
- You manually trigger restart

**To manually restart**:
1. Render dashboard → `newgen-backend`
2. Click **Manual Deploy**
3. Choose **Clear build cache and redeploy**
4. Service restarts (takes 1-2 minutes)

---

## Pricing & Limits

### Free Tier
- RAM: 0.5 GB
- vCPU: 0.5 (shared)
- Timeout: 30 seconds
- Hours/month: 750 (15 days continuous)
- Auto-spins down after 15 minutes idle
- **Cost**: $0/month

### Starter Tier ($7/month)
- RAM: 2 GB
- vCPU: 1
- Timeout: 30 seconds
- Always on (no spin-down)
- **Cost**: $7/month
- Good for small production apps

### Important
- Free tier has 15-day limit, then service stops
- Starter tier ($7/month) keeps service always on
- For production, upgrade to Starter or Pro

**Recommendation for Phase 1**:
- Start with Free tier (good for testing)
- Upgrade to Starter ($7/month) once users sign up

---

## Troubleshooting

### Issue 1: Build Fails
**Error**: `npm ERR! code E404`

**Cause**: Missing dependency in package.json

**Solution**:
1. Check `backend/package.json`
2. Verify all dependencies listed
3. Run `npm install` locally to verify
4. Push changes to GitHub
5. Trigger redeploy in Render

### Issue 2: Service Won't Start
**Error**: `Error: listen EADDRINUSE`

**Cause**: Port 4000 already in use

**Solution**:
1. Verify no other service on 4000
2. Check environment variable `PORT=4000` is set
3. Restart service in Render

### Issue 3: CORS Errors in Browser
**Error**: `Access-Control-Allow-Origin` missing

**Cause**: CORS not configured

**Solution**:
1. Verify `backend/app.js` imports cors
2. Verify environment variables set:
   - `ENABLE_CORS=true`
   - `FRONTEND_ORIGIN=https://newgenaistudio.com`
3. Restart service

### Issue 4: Custom Domain Not Working
**Error**: Domain shows Render default instead of custom domain

**Cause**: DNS not propagated yet

**Solution**:
1. Verify CNAME in Network Solutions matches Render
2. Check https://whatsmydns.net
3. Wait 24-48 hours for propagation
4. Render usually shows ✅ "Active" once DNS live

---

## Logs for Common Endpoints

### Health Check Log
```
GET /api/health
200 OK
Response time: 2ms
```

### Marketplace List Log
```
GET /api/v1/plugins?category=biologics
200 OK
Response time: 15ms
Returned 3 plugins
```

### Install Plugin Log
```
POST /api/v1/plugins/alphafold2/install
200 OK
Response time: 25ms
Generated license key: newgen_tenant-123_alphafold2_...
```

---

## Next Steps

1. **Deploy Now** (15 minutes)
   - [ ] Create Render account
   - [ ] Connect GitHub repo
   - [ ] Deploy service
   - [ ] Get live URL

2. **Add Custom Domain** (5 minutes)
   - [ ] Copy CNAME from Render
   - [ ] Enter in Network Solutions DNS
   - [ ] Wait for DNS propagation

3. **Monitor** (Ongoing)
   - [ ] Check logs daily
   - [ ] Monitor response times
   - [ ] Set up alerts (optional)

---

## Support

**Render Help**:
- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: https://render.com/docs/support

**Common Render Issues**:
- Build failing: https://render.com/docs/deploy-node
- Custom domains: https://render.com/docs/custom-domains
- Environment variables: https://render.com/docs/environment-variables

---

**Status**: ✅ Ready for deployment  
**ETA**: 15 minutes to live API  
**Cost**: Free (initially), $7/month (production)

**Let's deploy! 🚀**
