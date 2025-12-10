# 🚀 Vercel Deployment Guide — NewGen Studio

**Status**: Ready for production deployment  
**Date**: December 10, 2025  
**Estimated Time**: 20 minutes

---

## Quick Start (4 Steps)

### Step 1: Prepare DNS (Waiting)
- [ ] Domain purchased (e.g., `newgen-studio.com`)
- [ ] DNS records configured to point to Vercel
- [ ] DNS propagation completed (typically 24-48 hours)
- **Status**: You mentioned waiting for DNS propagation ✏️

### Step 2: Frontend Deployment (5 min)

**Option A: Deploy via Vercel CLI**

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy from project root
cd c:\NewGenAPPs\newgen-studio
vercel
```

**Option B: Deploy via GitHub (Recommended)**

1. Push code to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial NewGen Studio deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/newgen-studio.git
   git push -u origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click Deploy

**Configuration**:
- `vercel.json` is already configured
- Build command: `npm run build`
- Output: `dist` folder (Vite output)

### Step 3: Backend Deployment (5 min)

**Important**: Vercel's serverless functions have limitations. For production backend, consider:

**Option A: Vercel Serverless (Free/Hobby tier)**
```powershell
cd c:\NewGenAPPs\newgen-studio\backend
vercel
```

Limitations:
- Max 10 second request timeout (free tier)
- Cold starts possible
- Good for development/MVP

**Option B: Render.com (Recommended for Production)**

1. Go to https://render.com
2. Sign up (free account)
3. Create new Web Service:
   - Name: `newgen-backend`
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Port: 4000
4. Deploy from GitHub

Benefits:
- 30-second timeout (free tier)
- Always-on instance option
- Better for production workloads

**Option C: Railway (Alternative)**

1. Go to https://railway.app
2. New Project → GitHub Repo
3. Set environment:
   - `PORT`: 4000
   - `NODE_ENV`: production
   - `FRONTEND_ORIGIN`: your-domain.com
4. Deploy

### Step 4: Connect Frontend to Backend

After backend deployment, update frontend configuration:

**File: `.env.production`**
```
VITE_API_URL=https://newgen-backend.your-deployment.com/api
```

**File: `src/main.jsx` or API client**
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://newgen-backend.your-deployment.com/api';
```

Then redeploy frontend:
```powershell
vercel --prod
```

---

## Detailed Deployment Steps by Service

### Frontend Deployment (Vercel Recommended)

**Prerequisites:**
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] GitHub repository created

**Step 1: Update vite.config.js (if needed)**

Already configured, but verify:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})
```

**Step 2: Update package.json scripts**

Verify build command:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 3: Create/Update vercel.json (Frontend)**

✅ Already created with:
- Build command: `npm run build`
- Output directory: `dist`
- Cache headers configured
- API rewrites configured

**Step 4: Deploy to Vercel**

```powershell
# Navigate to frontend root
cd c:\NewGenAPPs\newgen-studio

# Deploy
vercel
```

Follow prompts:
- Project name: `newgen-studio`
- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

**Expected Output:**
```
✓ Linked to your-project
✓ Build complete
✓ Deployed to https://newgen-studio.vercel.app
✓ Domain configured
```

---

### Backend Deployment (Render.com Recommended)

**Prerequisites:**
- [ ] Render.com account (free)
- [ ] Backend code pushed to GitHub

**Step 1: Prepare backend for serverless**

Already configured with `api/index.js` entry point.

**Step 2: Deploy to Render**

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository (backend folder)
4. Configure:
   - **Name**: `newgen-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `4000`
5. Add environment variables:
   ```
   PORT=4000
   NODE_ENV=production
   FRONTEND_ORIGIN=https://your-domain.com
   ```
6. Click "Create Web Service"

**Expected Output:**
```
✓ Build successful
✓ Deployed to https://newgen-backend.onrender.com
✓ Live at https://newgen-backend.onrender.com/api/health
```

---

## Environment Variables Configuration

### Frontend (.env.production)

```bash
VITE_API_URL=https://newgen-backend.onrender.com/api
VITE_APP_NAME=NewGen Studio
VITE_APP_VERSION=1.0.0
```

Set in Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add above variables for production

### Backend

Set in Render Dashboard or via vercel.json:
```
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN=https://newgen-studio.vercel.app
ENABLE_CORS=true
AUDIT_ENABLED=true
```

---

## Verify Deployments

### Frontend Health Check
```powershell
# Once DNS is live
curl https://your-domain.com
curl https://your-domain.com/api/health  # Should redirect to backend
```

### Backend Health Check
```powershell
curl https://newgen-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "newgen-backend",
  "timestamp": "2025-12-10T18:30:00Z"
}
```

---

## DNS Configuration

Once your domain is ready, update these records:

### For Vercel Frontend

**Type A Record:**
```
Name: @
Type: A
Value: 76.76.19.89
```

**Type CNAME Record:**
```
Name: www
Type: CNAME
Value: cname.vercel-dns.com
```

Or use Vercel's NS records:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

### For Backend (if using separate domain)

**CNAME Record:**
```
Name: api
Type: CNAME
Value: newgen-backend.onrender.com
```

Then your API URL becomes:
```
https://api.your-domain.com/v1/plugins
```

---

## Post-Deployment Checklist

### Security
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CORS properly
- [ ] Set secure headers
- [ ] Add rate limiting (recommended: npm `express-rate-limit`)
- [ ] Enable audit trails

### Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor error logs
- [ ] Track API response times
- [ ] Set up uptime monitoring

### Performance
- [ ] Test lighthouse score (target: 90+)
- [ ] Verify image optimization
- [ ] Check bundle size
- [ ] Monitor Core Web Vitals

### Testing
- [ ] [ ] Test all marketplace endpoints
- [ ] [ ] Test plugin installation flow
- [ ] [ ] Verify license validation
- [ ] [ ] Test API authentication

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom**: `Access-Control-Allow-Origin` errors in browser console

**Solution**:
```javascript
// backend/app.js
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5175',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then set environment variable:
```
FRONTEND_ORIGIN=https://your-domain.com
```

### Issue 2: API Not Found (404)
**Symptom**: API calls return 404

**Solution**: Verify backend deployment is live:
```powershell
curl https://newgen-backend.onrender.com/api/health
```

If failing, check backend logs in Render dashboard.

### Issue 3: Cold Starts
**Symptom**: First request takes 5-10 seconds

**Solution**: This is normal for serverless. Options:
- Upgrade to always-on instance (Render paid)
- Switch to traditional VPS (Railway, Heroku)
- Accept cold starts (15-30 seconds on free tier)

### Issue 4: Build Failures
**Symptom**: Deployment fails during build

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in package.json
3. Check for missing environment variables
4. Ensure Node version compatibility (use Node 20 LTS)

---

## Production Monitoring

### Set Up Error Tracking (Sentry)

1. Install Sentry:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. Update `src/main.jsx`:
   ```javascript
   import * as Sentry from '@sentry/react';

   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

3. Set `VITE_SENTRY_DSN` in Vercel environment variables

### Set Up Analytics

Vercel includes built-in Web Analytics. Enable:
1. Vercel Dashboard → Analytics
2. Install `web-vitals`:
   ```bash
   npm install web-vitals
   ```

---

## Estimated Costs (Monthly)

| Service | Free Tier | Pro Tier | Notes |
|---------|-----------|----------|-------|
| Vercel (Frontend) | $0 | $20+ | Included with domain |
| Render (Backend) | $0 | $7+ | Pay-as-you-go |
| Domain | $10-15/yr | - | Your cost |
| Total | ~$1/mo | ~$27+/mo | Scales with usage |

---

## Timeline

**Today (DNS Propagating)**
- [x] Prepare vercel.json (frontend)
- [x] Prepare vercel.json (backend)
- [x] Update environment variables
- [ ] Wait for DNS propagation (24-48 hours)

**Once DNS Ready (Day 2-3)**
- [ ] Deploy frontend to Vercel (5 min)
- [ ] Deploy backend to Render (5 min)
- [ ] Configure environment variables (5 min)
- [ ] Test endpoints (10 min)

**Post-Deployment (Day 3+)**
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Test marketplace features
- [ ] Gather user feedback

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Express/CORS**: https://expressjs.com/en/resources/middleware/cors.html
- **Vite Build**: https://vitejs.dev/guide/build.html

---

## Next Steps

1. **Confirm DNS is ready** ← You're here
2. **Deploy frontend to Vercel** (once DNS propagated)
3. **Deploy backend to Render** (once DNS propagated)
4. **Test all endpoints** (5 endpoints from marketplace)
5. **Launch Phase 2** (add Stripe billing)

---

**Status**: ✅ Configuration ready, waiting for DNS  
**Next Action**: Deploy frontend & backend once DNS propagation complete

Good luck! 🚀
