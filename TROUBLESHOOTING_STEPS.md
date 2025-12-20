# NewGen Studio Troubleshooting Guide

## Current Setup Status (Dec 14, 2025)

### ✅ Completed
- Ubuntu WSL installed
- Node.js v22.21.1 installed
- Dependencies installed
- Backend configured for port 4001
- Frontend configured for port 4001
- Gemini API key: AIzaSyDSk0tKfpg5m8Xve8LdHrRBpnLy0__xG-c
- UI_PROVIDER=gemini in backend/.env

### ❌ Issue
Generated UIs show only headers/labels, no interactive components (inputs, buttons, data tables)

## How to Start Everything

### Terminal 1 - Backend
```bash
# In WSL terminal
cd /mnt/c/NewGenAPPs/newgen-studio/backend
PORT=4001 node server.js
```

Expected output:
```
✅ API running on port 4001
📋 Endpoints:
   GET  /api/health
   POST /api/generate
   ...
```

### Terminal 2 - Frontend
```bash
# In WSL terminal or PowerShell
cd /mnt/c/NewGenAPPs/newgen-studio
npm run dev
```

Expected output:
```
VITE v7.2.7  ready in XXX ms
➜  Local:   http://localhost:5173/ (or 5174 if 5173 is in use)
```

### Browser
Open: http://localhost:5174 (or whichever port Vite shows)

## Verification Steps

### 1. Test Backend
```powershell
curl http://localhost:4001/api/health
```

Should return: `{"status":"healthy"}`

### 2. Check Frontend Connection
In browser console (F12), before generating:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

Should show: `http://localhost:4001`

### 3. Watch Backend Logs
When generating an app, backend should show:
```
POST /api/generate
[Apps] Using Gemini for UI generation...
[Gemini] Generating AppSpec for prompt: ...
[Gemini] Raw response length: XXXX
```

## Common Issues

### Issue: Port Already in Use
**Solution:** Change port or kill process
```bash
# Use different port
PORT=4002 node server.js

# Update frontend .env to match:
VITE_API_BASE_URL=http://localhost:4002
```

### Issue: Frontend Shows Old Data
**Solution:** Hard refresh browser (Ctrl+Shift+R) or clear browser cache

### Issue: No Backend Logs
**Cause:** Frontend not connecting to backend
**Solution:** 
1. Verify backend is on port 4001
2. Verify .env has `VITE_API_BASE_URL=http://localhost:4001`
3. Restart frontend after changing .env

### Issue: Generated UI Has Only Headers
**Possible causes:**
1. Gemini not being called (using fallback service)
2. Gemini generating incomplete specs
3. Frontend not rendering components properly

**Debug:**
- Check backend logs for "[Apps] Using Gemini..."
- Check browser console for errors
- Check network tab (F12) for API responses

## Files to Check

### Backend Configuration
- `backend/.env` - Should have:
  ```
  PORT=4000
  UI_PROVIDER=gemini
  GEMINI_API_KEY=AIzaSyDSk0tKfpg5m8Xve8LdHrRBpnLy0__xG-c
  ```

### Frontend Configuration  
- `.env` - Should have:
  ```
  VITE_API_BASE_URL=http://localhost:4001
  ```

## Contact Info
If issues persist, check:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [DEBUGGING_SUMMARY.md](DEBUGGING_SUMMARY.md) - Known issues and solutions
- Backend logs in terminal for error messages
- Browser console (F12) for frontend errors
