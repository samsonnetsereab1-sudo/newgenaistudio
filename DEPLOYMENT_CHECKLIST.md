# 🚀 NewGen Studio — Vercel Deployment Checklist

**Status**: Ready for deployment  
**Date**: December 10, 2025  
**Waiting On**: DNS propagation (24-48 hours)

---

## Pre-Deployment ✅

- [x] Frontend code prepared (Vite)
- [x] Backend API prepared (Express)
- [x] `vercel.json` configured (frontend)
- [x] `backend/vercel.json` configured
- [x] `backend/api/index.js` entry point created
- [x] `.env.production` configured
- [x] `.env.local` configured for development

---

## DNS Status 📡

**Current**: Waiting for propagation  
**Action**: Monitor DNS propagation at:
- https://www.whatsmydns.net
- https://dnschecker.org

**Propagation typically takes**: 24-48 hours

**Once propagated, proceed to next section ↓**

---

## Deployment Workflow (When DNS Ready)

### Step 1: Frontend Deployment (Vercel) — 5 minutes

**Via CLI:**
```powershell
cd c:\NewGenAPPs\newgen-studio
npm install -g vercel
vercel --prod
```

**Via GitHub (Recommended):**
1. Push code to GitHub
2. Connect repo at https://vercel.com/new
3. Vercel auto-detects Vite configuration
4. Click Deploy

**Expected**:
```
✓ Deployed to https://newgen-studio.vercel.app
✓ Live site available
```

### Step 2: Backend Deployment (Render) — 5 minutes

**Option A (Recommended): Render.com**
```
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Build: npm install
4. Start: npm start
5. Port: 4000
6. Set environment variables
7. Deploy
```

**Option B: Vercel Serverless**
```powershell
cd c:\NewGenAPPs\newgen-studio\backend
vercel --prod
```

**Expected**:
```
✓ Backend running at https://newgen-backend.onrender.com
✓ Health check: https://newgen-backend.onrender.com/api/health → 200 OK
```

### Step 3: Connect Frontend to Backend — 2 minutes

**Update**: `src/apis/client.js` or API configuration

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://newgen-backend.onrender.com/api'
    : 'http://localhost:4000/api');
```

**Redeploy frontend**:
```powershell
vercel --prod
```

---

## Post-Deployment Verification ✅

### Test 1: Frontend Health
```powershell
curl https://newgen-studio.vercel.app
# Expected: HTML response (your React app)
```

### Test 2: Backend Health
```powershell
curl https://newgen-backend.onrender.com/api/health
# Expected: { "status": "ok" }
```

### Test 3: Marketplace API
```powershell
curl https://newgen-backend.onrender.com/api/v1/plugins
# Expected: Array of 5 plugins (AlphaFold, MaxQuant, Galaxy, OpenMS, Nextflow)
```

### Test 4: CORS Headers
```powershell
curl -i https://newgen-backend.onrender.com/api/v1/plugins
# Expected: Access-Control-Allow-Origin: https://newgen-studio.vercel.app
```

---

## Environment Variables Checklist

### Vercel (Frontend) Dashboard
```
VITE_API_URL = https://newgen-backend.onrender.com/api
VITE_APP_NAME = NewGen Studio
NODE_ENV = production
```

### Render (Backend) Dashboard
```
PORT = 4000
NODE_ENV = production
FRONTEND_ORIGIN = https://newgen-studio.vercel.app
ENABLE_CORS = true
AUDIT_ENABLED = true
```

---

## Deployment Timeline

### Today (DNS Propagating)
- [x] Created `vercel.json`
- [x] Created `backend/vercel.json`
- [x] Created `.env.production`
- [ ] **Wait for DNS**: 24-48 hours

### Day 2-3 (DNS Ready)
- [ ] Deploy frontend (5 min)
- [ ] Deploy backend (5 min)
- [ ] Configure environment (5 min)
- [ ] **Total: ~15 minutes**

### Day 3-4 (Post-Launch)
- [ ] Monitor logs
- [ ] Test marketplace
- [ ] Gather user feedback
- [ ] Plan Phase 2

---

## Quick Commands

### Check DNS Status
```powershell
nslookup your-domain.com
# Expected: Returns IP address (DNS propagated)
```

### Verify Frontend Build
```powershell
npm run build
# Expected: dist/ folder created with index.html, js, css files
```

### Verify Backend Startup
```powershell
cd backend
npm start
# Expected: ✅ API running on http://localhost:4000
```

### Test Marketplace Endpoint Locally
```powershell
curl http://localhost:4000/api/v1/plugins
# Expected: 5 plugins returned
```

---

## Common Issues & Quick Fixes

### "Cannot GET /api/v1/plugins"
**Cause**: Frontend trying to reach old localhost  
**Fix**: Update `VITE_API_URL` environment variable in Vercel

### "CORS error in console"
**Cause**: Backend CORS not configured for production domain  
**Fix**: Set `FRONTEND_ORIGIN` environment variable on backend

### "Build failed on Vercel"
**Cause**: Missing dependencies or build script error  
**Fix**: Check build logs, run `npm run build` locally to debug

### "502 Bad Gateway on Render"
**Cause**: Backend not starting  
**Fix**: Check Render logs, verify `npm start` works locally

---

## Monitoring (Post-Deployment)

### Vercel Dashboard
- Real-time logs
- Performance metrics
- Deployment history
- Analytics

### Render Dashboard
- Application logs
- Resource usage
- Deployments
- Alerts

### Error Tracking (Optional)
- Install Sentry: `npm install @sentry/react`
- Configure in `src/main.jsx`
- Monitor errors in real-time

---

## Support Resources

📚 **Documentation**
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Vite: https://vitejs.dev

🆘 **Troubleshooting**
- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/docs/support

---

## Next Steps (After Deployment)

1. ✅ Deploy frontend & backend
2. 📊 Monitor performance for 24 hours
3. 🧪 Run full testing suite
4. 📈 Set up analytics
5. 🔧 Plan Phase 2 (Stripe billing)

---

**Ready to deploy? Check DNS status, then execute this deployment checklist!**

**Expected Time**: 20 minutes (once DNS ready)  
**Result**: Production-ready NewGen Studio live at your domain 🎉
