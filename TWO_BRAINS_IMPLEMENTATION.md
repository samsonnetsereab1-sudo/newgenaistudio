# Two Brains Implementation: Crash Guard + Domain Enforcement

## ✅ Completed Changes

### 1. Crash Guards (Already in place)
**File**: `backend/server.js`
- Global `uncaughtException` handler
- Global `unhandledRejection` handler
- Process stays alive and logs full stack traces

### 2. Isolated Domain Parser Test Route
**File**: `backend/routes/dev.routes.js` (NEW)
- `POST /api/dev/test-domain` - Tests domain parsing without AI calls
- Returns parsed agents, workflows, states from prompt
- Zero crash risk - pure parsing logic

**File**: `backend/controllers/generate.controller.js`
- Exported `parseDomainConstructs` function for testing
- Can now be called independently

**File**: `backend/routes/index.js`
- Mounted `/api/dev/*` routes

### 3. Enhanced AI Error Handling
**File**: `backend/controllers/generate.controller.js` → `callAIWithTimeout()`
- Added try-catch wrapper around AI calls
- Validates AI response type before returning
- Better error messages with attempt numbers
- Throws errors properly for retry logic

### 4. Domain Enforcement Logic (Already implemented)
**File**: `backend/controllers/generate.controller.js` → Lines 103-113
- Checks if prompt contains "agents" keyword
- Calls `parseDomainConstructs()` to extract domain structures
- Injects agents and workflows if missing from AI response
- Silent error handling (won't crash generation)

---

## 🧪 Testing Strategy

### Phase 1: Test Parser in Isolation
```powershell
# Start backend outside VSCode
cd c:\NewGenAPPs\newgen-studio
.\run-backend.ps1

# In another terminal, test parser
$body = @{ prompt = 'app with agents (Bot1, Bot2)' } | ConvertTo-Json
iwr http://localhost:4000/api/dev/test-domain -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
```

**Expected**: JSON response with `agentCount: 2`

**If this fails**: Parser has a bug - fix regex or parsing logic before proceeding

### Phase 2: Test Full Generation Flow
```powershell
.\test-domain-enforcement.ps1
```

**Test 0** (Isolated): Parser should extract 2 agents, 1 workflow, 2 states
**Test 1** (Baseline): Normal generation without domain constructs
**Test 2** (Agents): Should have 2 agents injected
**Test 3** (Full): Should have 2 agents, 1 workflow, 4 states

---

## 🔍 Debugging Guide

### If Test 0 Fails (Parser Crashes)
1. Check regex patterns in `parseDomainConstructs()`
2. Look for null/undefined access in parsing logic
3. Add more console.log in parser to trace execution

### If Test 1-3 Fail (Backend Crashes)
1. Check backend terminal for uncaught exception logs
2. Look for `🔥 UNCAUGHT EXCEPTION` or `🔥 UNHANDLED REJECTION`
3. Stack trace will show exact file/line causing crash
4. Common culprits:
   - `generateAppSpecWithGemini()` throwing unexpected error
   - `normalizeAppSpec()` accessing undefined properties
   - `validateAppSpecStrict()` schema mismatch

### If Enforcement Doesn't Inject (agents still = 0)
1. Check condition: `spec.agents === undefined` (line 104)
   - May need to change to `!spec.agents || spec.agents.length === 0`
2. Check prompt contains "agents" keyword
3. Add console.log before/after injection to verify execution
4. Verify `spec` object structure before enforcement runs

---

## 🚀 Next: Option B (OpenAI Routing)

If Gemini keeps failing for domain prompts, implement smart routing:

### Detection Logic
```javascript
function shouldUseOpenAI(prompt) {
  const domainKeywords = ['agents', 'workflows', 'states', 'modal'];
  const hasDomainConstructs = domainKeywords.some(kw => prompt.toLowerCase().includes(kw));
  return hasDomainConstructs && process.env.OPENAI_API_KEY;
}
```

### In `callAIWithTimeout()`:
```javascript
if (shouldUseOpenAI(prompt)) {
  // Route to OpenAI with JSON schema
  return callOpenAIStructured(prompt);
} else {
  // Use Gemini for normal UI generation
  return generateAppSpecWithGemini(prompt);
}
```

### OpenAI JSON Mode Setup
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_schema", json_schema: APPSPEC_SCHEMA }
});
```

---

## 📋 Files Modified

1. ✅ `backend/routes/dev.routes.js` - NEW dev/test endpoints
2. ✅ `backend/routes/index.js` - Mount dev routes
3. ✅ `backend/controllers/generate.controller.js` - Export parser, better error handling
4. ✅ `test-domain-enforcement.ps1` - Updated test suite with Test 0
5. ✅ `run-backend.ps1` - NEW backend starter script

## 🎯 Success Criteria

- [ ] Test 0 passes (parser works in isolation)
- [ ] Backend doesn't crash on Test 1-3
- [ ] Test 2 returns `agents.Count: 2`
- [ ] Test 3 returns `agents: 2, workflows: 1, states: 4`

Once these pass, domain enforcement is **proven working**!
