# 🚀 NewGen Studio - Complete Setup Guide

## 🎯 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```powershell
# Frontend
npm install

# Backend
cd backend
npm install
npm install -g nodemon
cd ..
```

### 2️⃣ Start Backend Server

```powershell
cd backend
npm run dev
```

**Expected Output:**
```
✅ API running on http://localhost:4000
📋 Endpoints:
   GET  /api/health
   POST /api/generate
   ...
```

### 3️⃣ Start Frontend (New Terminal)

```powershell
npm run dev
```

**Expected Output:**
```
  VITE v7.2.7  ready in 823 ms
  ➜  Local:   http://localhost:5173/
```

**🎉 Open browser: `http://localhost:5173`**

---

## 🔧 Troubleshooting

### ❌ Frontend shows "Error generating code"

**Cause:** Backend not running or wrong port

**Fix:**
```powershell
# Check backend is on port 4000
cd backend
npm run dev
```

### ❌ Changes not reflecting

**Cause:** Vite cache or backend not auto-reloading

**Fix:**
```powershell
# Frontend: Force reload
npm run dev -- --force

# Backend: Use nodemon (auto-installed)
cd backend
npm run dev  # Uses nodemon automatically
```

### ❌ Port 4000 already in use

**Fix:**
```powershell
# Kill process on port 4000
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

# Or change port in backend/.env
# PORT=4001
```

---

## 📁 Project Structure

```
newgen-studio/
├── src/                          # Frontend React app
│   ├── builder/
│   │   └── BuilderView.jsx      # AI-powered app builder
│   ├── lib/
│   │   └── apiClient.js         # Backend API wrapper
│   ├── pages/
│   ├── components/
│   └── layout/
│
├── backend/                      # Express.js API
│   ├── server.js                # Entry point
│   ├── app.js                   # Express app config
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   └── generate.routes.js   # /api/generate
│   ├── controllers/
│   │   └── generate.controller.js
│   ├── services/
│   │   ├── ai.service.js        # Original mock
│   │   └── ai.service.enhanced.js  # ✨ Biologics-aware AI
│   └── middleware/
│
├── .env                          # Frontend env vars
├── backend/.env                  # Backend env vars
└── package.json
```

---

## 🧬 Biologics/Pharma Mode

The enhanced AI service automatically detects biologics keywords:

**Triggers:**
- `protein`, `antibody`, `drug`, `molecule`, `pharmaceutical`
- `assay`, `chromatography`, `mass spec`, `sequencing`
- `clinical`, `trial`, `pipeline`, `formulation`
- `alphafold`, `maxquant`, `galaxy`, `openms`, `nextflow`

**Example Prompts:**

```
"Build a protein purification dashboard"
→ Generates biologics-specific UI with pipeline tracking

"Create an antibody screening app"
→ Generates pharma dashboard with assay metrics

"Build a todo app"
→ Generates general-purpose interactive app
```

---

## 🔌 API Endpoints

### `POST /api/generate`
Generate app code from natural language prompt

**Request:**
```json
{
  "prompt": "Build a protein analysis dashboard"
}
```

**Response:**
```json
{
  "status": "ok",
  "files": {
    "App.jsx": "import React...",
    "styles.css": "body { ... }"
  },
  "messages": [
    {
      "role": "assistant",
      "content": "✅ Generated biologics-specific dashboard..."
    }
  ]
}
```

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T..."
}
```

---

## 🎨 Frontend Architecture

### How BuilderView Works

```jsx
// 1. User types prompt
const prompt = "Build a protein dashboard";

// 2. Call backend API
const response = await generate(prompt);

// 3. Update preview with generated code
setFiles(response.files);

// 4. Iframe compiles and displays
<iframe srcDoc={compileFiles()} />
```

### apiClient.js

```javascript
// Configured to hit backend on port 4000
baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"

// Main function
export async function generate(prompt) {
  const res = await apiClient.post("/generate", { prompt });
  return res.data;
}
```

---

## 🔐 Environment Variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:4000
```

### Backend (`backend/.env`)
```env
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
ENABLE_CORS=true
```

---

## 🚀 Production Deployment

### Build Frontend
```powershell
npm run build
# Creates dist/ folder (293KB gzipped)
```

### Deploy to Vercel
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel --prod
```

### Deploy Backend to Render
1. Push to GitHub
2. Go to [render.com/dashboard](https://render.com/dashboard)
3. Click "New +" → "Web Service"
4. Connect repository
5. Set environment variables
6. Deploy

**See:** `DEPLOYMENT_DOCUMENTATION_INDEX.md` for full guide

---

## 🔄 Development Workflow

### Making Backend Changes

```powershell
# Backend auto-reloads with nodemon
cd backend
npm run dev

# Edit any file in:
# - routes/
# - controllers/
# - services/
# Server restarts automatically ✅
```

### Making Frontend Changes

```powershell
# Vite auto-reloads
npm run dev

# Edit any .jsx or .css file
# Browser updates instantly ✅
```

### Testing the Integration

```powershell
# 1. Start backend
cd backend; npm run dev

# 2. Start frontend (new terminal)
npm run dev

# 3. Open http://localhost:5173
# 4. Click "Build" tab
# 5. Type: "Build a protein dashboard"
# 6. Watch AI generate code in real-time ✨
```

---

## 🧪 Testing API Directly

```powershell
# Test health endpoint
curl http://localhost:4000/api/health

# Test generate endpoint
curl -X POST http://localhost:4000/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"Build a protein dashboard"}'
```

---

## 🎁 Advanced Features

### Adding Real AI Integration

Replace mock in `backend/services/ai.service.enhanced.js`:

#### OpenAI GPT-4
```javascript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runAI = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'Generate React code...' },
      { role: 'user', content: prompt }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
};
```

#### Google Gemini
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runAI = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  // Format response...
};
```

### Adding Custom Templates

Edit `backend/services/ai.service.enhanced.js`:

```javascript
function generateCustomTemplate(prompt) {
  return {
    'App.jsx': `// Your custom template`,
    'styles.css': `/* Your styles */`
  };
}
```

---

## 📊 Performance

### Frontend Bundle Size
- **Uncompressed:** 293.46 KB
- **Gzipped:** 96.51 KB
- **Build time:** 2.34s
- **Modules:** 1,765

### Backend Response Times
- `/api/health`: ~5ms
- `/api/generate`: ~1.5s (mock delay)
- With real AI: Varies by provider

---

## 🐛 Common Issues

### Issue: "Cannot connect to backend"
**Solution:** Verify backend is running on port 4000
```powershell
cd backend
npm run dev
```

### Issue: "Import error in BuilderView"
**Solution:** Clear Vite cache
```powershell
rm -rf node_modules/.vite
npm run dev
```

### Issue: "Git not tracking files"
**Solution:** Check .gitignore
```powershell
git status
git add .
```

---

## 📚 Additional Documentation

- **Deployment:** `DEPLOYMENT_DOCUMENTATION_INDEX.md`
- **DNS Setup:** `NETWORK_SOLUTIONS_DNS_SETUP.md`
- **Vercel Guide:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Render Guide:** `RENDER_BACKEND_DEPLOYMENT.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

## 🎯 Next Steps

### Option 1: Polish UI
Enhance the builder interface with:
- Syntax highlighting
- File tree navigation
- Real-time collaboration
- Export to GitHub

### Option 2: Add AI Providers
Integrate real AI:
- OpenAI GPT-4
- Google Gemini
- Anthropic Claude
- Custom models

### Option 3: Base44 Migration
Create import tool:
- Parse Base44 JSON
- Convert to NewGen format
- Migrate apps automatically

### Option 4: Instrument Adapters
Add biologics integrations:
- AlphaFold API
- MaxQuant connector
- Galaxy workflows
- OpenMS pipelines

---

## 💬 Support

**Issues?** Check:
1. Backend logs in terminal
2. Browser console (F12)
3. Network tab for API calls
4. `TROUBLESHOOTING.md` (if available)

**Ready to deploy?** See `QUICK_REFERENCE.md` for DNS + deployment steps.

---

## ✅ You're All Set!

```powershell
# Start developing
cd backend; npm run dev
# (New terminal)
npm run dev
# Open http://localhost:5173 🎉
```

**Everything is connected and working!** 🚀
