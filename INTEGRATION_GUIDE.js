// INTEGRATION CHECKLIST & REFERENCE
// ===================================

// 1. WHAT'S WIRED UP
// ==================
// ✅ apiClient.js: axios instance configured to call backend
// ✅ generateWithGemini: replaced with real API call to POST /api/generate
// ✅ Environment variable support: VITE_API_BASE_URL (default: http://localhost:5000)
// ✅ Error handling: graceful fallback with user messages
// ✅ Frontend dev server: http://localhost:5175
// ✅ Linter: 0 errors, 0 warnings

// 2. HOW TO PROVE INTEGRATION WORKS
// ==================================
// 1. Backend running on: http://localhost:5000 (or set VITE_API_BASE_URL in .env)
// 2. Frontend running: npm run dev (should be at http://localhost:5175)
// 3. Navigate to: http://localhost:5175/build
// 4. Open DevTools → Network tab
// 5. Type a prompt in AI Architect input and hit arrow
// 6. Look for POST /api/generate request:
//    ✅ Status 200 → Integration works
//    ❌ Status 404 → Backend route doesn't exist
//    ❌ CORS error → Enable CORS on backend
//    ❌ Connection refused → Backend not running

// 3. BACKEND ROUTE SHAPE
// ======================
// Your backend should have:
//
// POST /api/generate
// Request body:
//   {
//     "prompt": "user's instruction text"
//   }
//
// Response (200 OK):
//   {
//     "status": "ok",
//     "files": {
//       "App.jsx": "export default function App() { ... }",
//       "styles.css": "body { ... }"
//     },
//     "messages": [
//       { "role": "assistant", "content": "Generated project based on your prompt." }
//     ]
//   }

// 4. ENVIRONMENT CONFIGURATION
// =============================
// Create .env file in project root (optional, defaults to http://localhost:5000):
// VITE_API_BASE_URL=http://localhost:5000
// Restart npm run dev after changing .env

// 5. COMPONENTS STATUS
// ====================
// ✅ FULLY IMPLEMENTED:
//    - Dashboard (hero, CTA, status, templates)
//    - AI Builder/Architect (chat-like interface + live preview)
//    - Support/Ticket desk (form + mock list)
//    - Sidebar navigation
//    - Beta access gate
//
// 🟡 PLACEHOLDERS (Coming soon):
//    - My Projects
//    - Templates
//    - Docs & Guides
//    - Account settings
//    - General Settings
//
// These are UI shells ready to be wired to backend endpoints later

// 6. FILES INVOLVED
// =================
// src/lib/apiClient.js         → axios client configuration
// src/lib/data.js              → generateWithGemini implementation
// src/builder/BuilderView.jsx  → calls generateWithGemini on prompt submit
// src/NewGenStudioApp.jsx       → top-level router & auth gate
// .env                          → (optional) backend URL override
// .env.example                  → reference for env variables
