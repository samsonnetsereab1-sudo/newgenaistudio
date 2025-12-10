# 🚀 Quick Start Guide — NewGen Studio

## Running the Full Stack

### 1. Start Backend (Terminal 1)
```bash
cd backend
node server.js
```
**Backend runs on:** `http://localhost:4000`

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
```
**Frontend runs on:** `http://localhost:5175`

---

## Testing Backend Connection

### Option 1: Browser
Open: `http://localhost:4000/api/health`

Expected response:
```json
{
  "status": "ok"
}
```

### Option 2: PowerShell
```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/health
```

### Option 3: cURL
```bash
curl http://localhost:4000/api/health
```

---

## Testing Biologics Endpoints

### Get Pipeline Summary
```bash
curl http://localhost:4000/api/v1/biologics/summary
```

### Get Detailed Pipelines
```bash
curl http://localhost:4000/api/v1/biologics/pipelines
```

### Get Compliance Dashboard
```bash
curl http://localhost:4000/api/v1/biologics/compliance
```

### Get Connected Instruments
```bash
curl http://localhost:4000/api/v1/biologics/instruments
```

---

## Frontend Integration

The Dashboard now includes a **Backend Status Card** that:
- ✅ Tests connection to backend
- ✅ Displays active biologics pipelines
- ✅ Shows risk levels (low/medium/high)
- ✅ Provides expandable raw JSON response

### Location
`src/components/BackendStatusCard.jsx`

### Usage
```jsx
import BackendStatusCard from '../components/BackendStatusCard';

<BackendStatusCard />
```

---

## API Client Reference

All API calls go through `src/api/client.js`:

```javascript
import { 
  fetchBackendHealth,
  fetchBiologicsSummary,
  fetchProjects,
  generateCode,
  orchestrateAgents 
} from './api/client';

// Example: Check backend health
const health = await fetchBackendHealth();

// Example: Get biologics data
const bio = await fetchBiologicsSummary();
```

---

## Troubleshooting

### Backend Won't Start

**Issue**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**: Change port in `backend/.env` or kill existing process:
```powershell
# Find process on port 4000
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess

# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

### Frontend Can't Connect to Backend

**Issue**: `Backend not reachable` error in Dashboard

**Solutions**:
1. Check backend is running on port 4000
2. Verify CORS settings in `backend/app.js`
3. Check `.env` file has `VITE_API_BASE=http://localhost:4000`
4. Restart frontend after changing .env: `npm run dev`

### Changes Not Showing Up

**Issue**: Made changes but not reflected in browser

**Solutions**:
1. **Backend changes**: Restart `node server.js`
2. **Frontend changes**: Should hot-reload automatically (Vite HMR)
3. **Environment variables**: Must restart both servers
4. **Hard refresh**: Ctrl+Shift+R (clears browser cache)

---

## Port Configuration

| Service | Default Port | Config File |
|---------|--------------|-------------|
| Frontend | 5175 | Auto-assigned by Vite |
| Backend | 4000 | `backend/.env` PORT |
| OPC-UA Simulator | 4334 | `simulator/opcua-sim.ts` |

---

## Key Files Created

### Backend Integration
- ✅ `backend/routes/biologics.routes.js` - Pharma domain endpoints
- ✅ `backend/routes/index.js` - Updated to include biologics routes
- ✅ `backend/server.js` - Updated to port 4000
- ✅ `backend/app.js` - Updated CORS for development

### Frontend Integration
- ✅ `src/api/client.js` - Centralized API wrapper
- ✅ `src/components/BackendStatusCard.jsx` - Connection status UI
- ✅ `src/pages/Dashboard.jsx` - Integrated status card
- ✅ `.env` - Frontend environment variables

### Documentation
- ✅ `.copilot-instructions.md` - ONE SHOT for automation
- ✅ `QUICK_START.md` - This file
- ✅ `NEWGEN_STUDIO_STRATEGIC_PLAN_2026.md` - Strategic document

---

## Next Steps

1. ✅ Backend running on port 4000
2. ✅ Frontend connected and displaying backend status
3. ✅ Biologics endpoints operational
4. ⏳ Test AI agent orchestration
5. ⏳ Integrate with instrument adapters
6. ⏳ Add authentication (OAuth 2.0)
7. ⏳ Connect to PostgreSQL/TimescaleDB

---

## Available Endpoints

### Core
- `GET /api/health` - Health check
- `POST /api/generate` - AI code generation

### Projects & Templates
- `GET /api/v1/projects` - List projects
- `GET /api/v1/templates` - Template library

### Biologics Domain
- `GET /api/v1/biologics/summary` - Pipeline overview
- `GET /api/v1/biologics/pipelines` - Detailed pipelines
- `GET /api/v1/biologics/compliance` - FDA compliance dashboard
- `GET /api/v1/biologics/instruments` - Connected instruments

### AI Orchestration
- `POST /api/v1/agents/orchestrate` - Multi-agent workflow

### Simulations
- `POST /api/v1/simulations/run` - Run digital twin simulation

### Graphs
- `POST /api/v1/graphs/protocol-dag` - Protocol dependency graph
- `POST /api/v1/graphs/instrument-network` - Instrument network topology

---

**Last Updated**: December 10, 2025  
**Backend**: Running ✅  
**Frontend**: Running ✅  
**Integration**: Active ✅
