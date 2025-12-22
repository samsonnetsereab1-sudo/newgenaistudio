# Staging Readiness Checklist — NewGen Studio v1.0

**Purpose**: Go/no-go runbook for first staging deployment  
**Owner**: DevOps / Release Engineering  
**Last Updated**: December 21, 2025

---

## 0) Define the Staging Target

- [ ] **Frontend staging URL** decided (e.g., `https://staging.newgenaistudio.com`)
- [ ] **Backend staging URL** decided (e.g., `https://staging-api.newgenaistudio.com` or `https://staging.newgenaistudio.com/api`)
- [ ] Environment name consistent (`staging` used everywhere)
- [ ] DNS / routing configured (or use provider default URL for first run)
- [ ] SSL certificates valid (if custom domain)

---

## 1) Secrets & Configuration

### Backend Environment

- [ ] **All secrets in hosting provider** (not in `.env` file committed to repo)
- [ ] `NODE_ENV=production` explicitly set (not `development`)
- [ ] `FRONTEND_ORIGIN` set to staging frontend URL (e.g., `https://staging.newgenaistudio.com`)
- [ ] `OPENAI_API_KEY` present and valid
- [ ] `GEMINI_API_KEY` present (fallback provider)
- [ ] **Separate OpenAI staging project/key from production** (allows independent monitoring + spend limits)
  - [ ] Staging project API key has lower rate limits than prod (optional but recommended)
- [ ] `DEMO_MODE` explicitly set to `false` (use real AI, not mocks)
- [ ] `UI_PROVIDER` set to `openai` (or `gemini` if testing fallback)
- [ ] `PORT=4000` (or environment-specific port if different)
- [ ] No local-only overrides enabled in staging code paths

### Frontend (Vercel)

- [ ] `VITE_API_BASE` set to staging backend URL (e.g., `https://staging-api.newgenaistudio.com`)
- [ ] No `localhost` fallback in staging builds
- [ ] **Staging domain protected** (either behind basic auth OR `noindex` meta tag to prevent SEO indexing)
  - [ ] If using basic auth: credentials shared only with QA team
  - [ ] If using `noindex`: verify it's in build HTML
- [ ] **Redeploy triggered after env var changes** (Vercel requires redeployment for env changes to take effect)
- [ ] Staging branch / deployment linked correctly in Vercel UI

---

## 2) Build & Deploy Sanity

### Backend

- [ ] **Fresh build succeeds** (clean clone, fresh `npm install`)
- [ ] **Server listens on `0.0.0.0`** (not `localhost` only)
- [ ] **Respects `PORT` from environment** (default 4000, overridable)
- [ ] **Startup logs appear** in hosting platform:
  ```
  Backend listening on http://0.0.0.0:4000
  ✓ API routes mounted successfully
  [List of endpoints]
  ```
- [ ] **No startup errors** (check logs for warnings about missing keys or bad config)

### Frontend (Vercel)

- [ ] **Build succeeds** locally: `npm run build` → `dist/` created
- [ ] **Vercel build settings correct**:
  - [ ] Framework: `Vite`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Root Directory: `.` (unless monorepo, then `./` appropriate path)
- [ ] **SPA routing configured** (Vercel rewrites for React Router if used)
  - [ ] Check `vercel.json` for rewrite rules
- [ ] **Build log has no errors** (warnings OK, errors → NO-GO)

---

## 3) CORS & Preflight (Most Common Staging Failure)

From staging **frontend**, in browser console or Postman, confirm:

- [ ] **Basic API call succeeds**:
  ```bash
  curl https://staging.newgenaistudio.com/api/health
  # Expected: HTTP 200, {"status":"ok"}
  ```

- [ ] **Preflight (OPTIONS) works**:
  ```bash
  curl -X OPTIONS https://staging-api.newgenaistudio.com/api/generate \
    -H "Origin: https://staging.newgenaistudio.com" \
    -H "Access-Control-Request-Method: POST" \
    -v
  # Expected: HTTP 200, Access-Control-Allow-Origin header matches staging frontend
  ```

- [ ] **CORS headers correct**:
  - [ ] `Access-Control-Allow-Origin: https://staging.newgenaistudio.com` (not `*`)
  - [ ] `Access-Control-Allow-Credentials: true`
  - [ ] `Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS`

- [ ] **Authorization header allowed** (if you add auth later):
  - [ ] `Access-Control-Allow-Headers: Content-Type, Authorization`

- [ ] **No CORS errors in browser DevTools** (Network tab, check for `Access to XMLHttpRequest blocked` warnings)

---

## 4) API Smoke Tests (Minimum Set)

Run in order. Pass = green, Fail = red → escalate.

### 4.1 Core Health

```bash
curl https://staging-api.newgenaistudio.com/api/health -v
# Expected: HTTP 200
# Body: {"status":"ok"}
```

- [ ] Health check passes

### 4.2 Projects

```bash
curl https://staging-api.newgenaistudio.com/api/v1/projects -v
# Expected: HTTP 200
# Body: array of projects (empty OK)
```

- [ ] Projects list returns 200
- [ ] Response is valid JSON (not HTML error page)

### 4.3 Generation (Core Workflow)

```bash
curl -X POST https://staging-api.newgenaistudio.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "simple todo app"}' \
  -v
# Expected: HTTP 200
```

- [ ] Generate endpoint returns 200 (not 500)
- [ ] Response includes:
  - [ ] `status: "ok"` (or `status: "error"` if AI fails, must fallback gracefully)
  - [ ] `schema.layout` or `schema` object present (AppSpec)
  - [ ] `files` object (generated code, even if template)
  - [ ] `messages` array (AI conversation log)
- [ ] **Timing**: completes in < 25 seconds (leaving 5s buffer before 30s Vercel limit)
- [ ] Check logs for:
  - [ ] Provider used (OpenAI, Gemini, or template)
  - [ ] Validation result (pass / repair / fallback)
  - [ ] No stack traces in response body (errors sanitized)

### 4.4 Agents Orchestration

```bash
curl -X POST https://staging-api.newgenaistudio.com/api/v1/agents/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"goal": "Create a batch tracking app"}' \
  -v
# Expected: HTTP 200
```

- [ ] Orchestrate endpoint returns 200
- [ ] Response includes `orchestration` object with phases
- [ ] **Note**: This endpoint may be slow (~30s); monitor for timeout

### 4.5 BASE44 Export

```bash
curl -X POST https://staging-api.newgenaistudio.com/api/platform/export \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-export", "target": "base44"}' \
  -v
# Expected: HTTP 200
```

- [ ] Export endpoint returns 200
- [ ] Response includes `manifest` object
- [ ] Manifest contains domain + regulatory metadata (if applicable)

### 4.6 Biologics Domain Endpoints (Optional)

```bash
curl https://staging-api.newgenaistudio.com/api/v1/biologics/summary -v
# Expected: HTTP 200
```

- [ ] Biologics endpoints return 200 (mock data OK)

---

## 5) Observability & Logging

- [ ] **Logs visible in hosting platform**:
  - [ ] Render: check Logs tab
  - [ ] Fly.io: `fly logs`
  - [ ] Vercel: see in Deployments → Function Logs
- [ ] **Each request has a timestamp + route**:
  - [ ] Example: `[2025-12-21T14:30:45Z] POST /api/generate`
- [ ] **Generation logs include clarity**:
  - [ ] Provider used (OpenAI / Gemini)
  - [ ] Timeout or fallback reason (if triggered)
  - [ ] Validator result (pass / repair / failed + used template)
  - [ ] Stage timings (e.g., "Orchestration: 523ms, AI call: 15234ms")
- [ ] **Errors show stack traces in logs** (but sanitized in HTTP response)
  - [ ] Don't expose file paths or secrets to client
- [ ] **No silent failures** (every error logged with context)

---

## 6) Performance & Timeouts

- [ ] **Confirm total request timeout of platform**:
  - [ ] Vercel serverless: 30s hard limit
  - [ ] Render: check platform timeout
- [ ] **`/api/generate` completes in < 25s** (80% of 30s cap):
  - [ ] Test 5 different prompts
  - [ ] Record max latency
  - [ ] If any exceed 25s consistently: investigate (AI provider slow, prompt too complex, etc.)
- [ ] **If `/api/v1/agents/orchestrate` can exceed 30s**:
  - [ ] Document that this endpoint requires async polling (not synchronous)
  - [ ] Mark in API docs as "may take >30s, use polling pattern"
  - [ ] Or implement async queue for Phase 2

---

## 7) Security Quick Checks (Staging-Level)

- [ ] **Rate limiting status documented**:
  - [ ] Currently: not implemented (flagged for Phase 2)
  - [ ] If implemented in staging: verify `/api/generate` has limit (e.g., 10 req/min per IP)
- [ ] **No secrets returned in API responses**:
  - [ ] Grep logs/responses for: `OPENAI`, `GEMINI`, `api_key`, `secret`, `token`
  - [ ] Should not appear in response bodies
- [ ] **CORS is not `*` in staging**:
  - [ ] Should be exact frontend domain, not wildcard
- [ ] **Export endpoints not leaking sensitive data**:
  - [ ] BASE44 export includes only metadata, not raw prompts or internal state
  - [ ] No user PII or system internals in manifest

---

## 8) Frontend-to-Backend Integration (From Browser)

Open staging frontend in browser, open DevTools Network tab:

- [ ] **Navigate to app generation page**
- [ ] **Click "Generate" button** with prompt "todo app"
  - [ ] Network tab shows `POST /api/generate` to correct backend URL
  - [ ] Request includes `Content-Type: application/json`
  - [ ] Response status 200
  - [ ] Response body is valid JSON (not HTML error)
- [ ] **Rendered UI appears** (doesn't hang or show error)
- [ ] **No console errors** (JavaScript errors → investigate)
- [ ] **Test export flow** (if applicable)
  - [ ] Click "Export" → BASE44 download or manifest displayed
  - [ ] No CORS errors

---

## 9) Go / No-Go Criteria

### ✅ GO if:

- [ ] All health + projects + generate + export smoke tests pass
- [ ] No CORS / preflight issues from staging frontend
- [ ] Logs show clear request/response flow (no silent errors)
- [ ] `/api/generate` completes in < 25 seconds consistently
- [ ] No secrets leaked in logs or responses
- [ ] Frontend can reach backend without errors

### ❌ NO-GO if:

- [ ] `/api/generate` is flaky (timeout, 500 errors, or unreliable)
- [ ] Frontend cannot consistently reach backend (CORS, DNS, or network issue)
- [ ] Any secrets in logs or responses
- [ ] Build fails or startup errors in backend
- [ ] Health endpoint unreachable or returns error
- [ ] Staging frontend is publicly indexable (without `noindex` or auth protection)

---

## 10) Staging Success Criteria

Once all checks pass:

- [ ] Staging is **ready for internal QA testing**
- [ ] Staging is **ready to share with stakeholders** (if protected)
- [ ] Logs are **monitored for errors during QA**
- [ ] **Document any issues found** (even minor ones) for post-staging fixes
- [ ] **Run this checklist again before promoting to production**

---

## Troubleshooting Quick Links

| Issue | Check First |
|-------|------------|
| `GET /api/health` returns 404 | Backend not running, wrong URL, or routes not mounted |
| CORS errors in browser | Check `FRONTEND_ORIGIN` env var matches staging frontend URL |
| `/api/generate` times out | AI provider slow, network issue, or timeout too aggressive |
| Frontend shows blank page | Check `VITE_API_BASE` env var, Vercel build logs, or SPA routing |
| "Connection refused" | Backend firewall, network isolation, or DNS not resolving |
| Secrets in logs | Audit env vars, ensure no hardcoded keys in code |

---

## Next Steps After Go

1. **Enable monitoring** (Datadog, Sentry, or similar if available)
2. **Share staging URL with QA team** (with password if needed)
3. **Collect feedback** on API behavior, performance, UI
4. **Document any issues** in GitHub Issues (tag as `staging-blocker` if critical)
5. **Update this checklist** if new tests are needed for your specific setup

---

**Checklist Version**: 1.0  
**Created**: December 21, 2025  
**Next Review**: After first staging deploy
