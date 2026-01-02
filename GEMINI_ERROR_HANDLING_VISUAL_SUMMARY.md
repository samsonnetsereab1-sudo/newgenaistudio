# Gemini Error Handling - Visual Summary

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Caller (Controller)                       │
│  generateAppSpecWithGemini() / repairAppSpec... / refine...  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Request Queue                              │
│  • Max 2 concurrent requests                                 │
│  • Min 1000ms delay between requests                         │
│  • Automatic queue processing                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Retry Loop (Max 3 attempts)                │
│                                                               │
│  Attempt 1 ──────────────────────────────────────────────┐   │
│      │                                                    │   │
│      ▼                                                    │   │
│  [Gemini API Call]                                       │   │
│      │                                                    │   │
│      ├─── Success? ──YES──→ Return Result               │   │
│      │                                                    │   │
│      NO                                                   │   │
│      │                                                    │   │
│      ▼                                                    │   │
│  [Error Analysis]                                        │   │
│      │                                                    │   │
│      ├─── 400 Bad Request? ──YES──→ Throw (No Retry)    │   │
│      │                                                    │   │
│      ├─── 429 Rate Limit? ──YES──→ Backoff + Retry ─────┤   │
│      │                                                    │   │
│      ├─── Network Error? ──YES──→ Backoff + Retry ───────┤   │
│      │                                                    │   │
│      └─── Unknown Error? ──YES──→ Throw                  │   │
│                                                           │   │
│  Attempt 2 (if retry) ────────────────────────────────────┤   │
│  Attempt 3 (if retry) ────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Exponential Backoff Timeline

```
Attempt 1: [API Call] ──X─→ 429 Error
                           │
                           ▼
           Wait: 1000ms + jitter (500-1500ms)
                           │
                           ▼
Attempt 2: [API Call] ──X─→ 429 Error
                           │
                           ▼
           Wait: 2000ms + jitter (1000-2000ms)
                           │
                           ▼
Attempt 3: [API Call] ──✓─→ Success!
```

## Request Queue Flow

```
Time: 0ms
┌─────────────────────────────────────────┐
│ Request 1 → EXECUTING                   │
│ Request 2 → EXECUTING                   │
│ Request 3 → QUEUED (waiting)            │
└─────────────────────────────────────────┘

Time: 1000ms (Request 1 completes)
┌─────────────────────────────────────────┐
│ Request 2 → EXECUTING                   │
│ Request 3 → EXECUTING (started)         │
│ Request 4 → QUEUED (new arrival)        │
└─────────────────────────────────────────┘

Time: 2000ms (Request 2 completes)
┌─────────────────────────────────────────┐
│ Request 3 → EXECUTING                   │
│ Request 4 → EXECUTING (started)         │
└─────────────────────────────────────────┘
```

## Error Detection Decision Tree

```
                    [Error Thrown]
                         │
                         ▼
             Check error.message & error.toString()
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Contains         Contains         Contains
    "429" or         "400" or      "timeout" or
   "RATE_LIMIT"     "invalid"      "ECONNRESET"
        │                │                │
        ▼                ▼                ▼
   isRateLimit=     isBadRequest=   isNetworkError=
      true              true             true
   shouldRetry=     shouldRetry=     shouldRetry=
      true             false             true
        │                │                │
        ▼                ▼                ▼
   [RETRY with      [FAIL FAST]      [RETRY with
    backoff]                          backoff]
```

## Before vs After

### Before Implementation
```
User Request
    │
    ▼
[Gemini API] ──X─→ 429 Error ──→ FAIL
                                  │
                                  ▼
                            User sees error
```

### After Implementation
```
User Request
    │
    ▼
[Request Queue] → Wait for slot
    │
    ▼
[Gemini API] ──X─→ 429 Error
    │                  │
    │                  ▼
    │            [Exponential Backoff]
    │                  │
    │                  ▼
    └──────→ [Retry] ──✓─→ SUCCESS
                          │
                          ▼
                    User gets result
```

## Key Metrics

### Retry Configuration
```
┌─────────────────────────────────┐
│ MAX_RETRIES         = 3         │
│ BASE_DELAY_MS       = 1000      │
│ MAX_DELAY_MS        = 32000     │
│                                 │
│ Backoff Formula:                │
│ delay = min(                    │
│   BASE_DELAY * 2^attempt,       │
│   MAX_DELAY                     │
│ ) + random_jitter               │
└─────────────────────────────────┘
```

### Queue Configuration
```
┌─────────────────────────────────┐
│ maxConcurrent       = 2         │
│ minDelayMs          = 1000      │
│                                 │
│ Effect:                         │
│ • Max 2 requests at once        │
│ • Min 1s between starts         │
│ • Automatic queueing            │
└─────────────────────────────────┘
```

## Log Output Examples

### Success Path
```
[Gemini] 🚀 Attempt 1/3 - Generating AppSpec for prompt: Create...
[Gemini] ✅ Raw response received, length: 2543
[Gemini] Generated AppSpec with:
  - 1 entities
  - 2 pages
  - 5 components
```

### Retry Path
```
[Gemini] 🚀 Attempt 1/3 - Generating AppSpec for prompt: Create...
[Gemini] ⚠️ Rate limit hit (attempt 1/3)
[Gemini] ⏳ Retrying in 1234ms...
[Gemini] 🚀 Attempt 2/3 - Generating AppSpec for prompt: Create...
[Gemini] ✅ Raw response received, length: 2543
```

### Fail Fast Path
```
[Gemini] 🚀 Attempt 1/3 - Generating AppSpec for prompt: Invalid...
[Gemini] ❌ Bad Request (400) - check payload
[Gemini] Bad Request details: 400 invalid API key format
Error: Gemini Bad Request: 400 invalid API key format
```

## Impact Summary

| Metric | Before | After |
|--------|--------|-------|
| 429 Errors (Dec 18) | 15 | **0** (expected) |
| 400 Error Debugging | Poor | **Excellent** |
| Retry Logic | None | **3 attempts** |
| Request Control | None | **Queue + Rate Limit** |
| Backoff Strategy | None | **Exponential** |
| Monitoring | Basic | **Enhanced Logging** |

## Files Modified

```
newgenaistudio/
├── backend/
│   └── services/
│       └── llm/
│           ├── geminiClient.js        [MODIFIED] +344 -137 lines
│           └── requestQueue.js        [NEW]      +52 lines
│
└── GEMINI_ERROR_HANDLING_IMPLEMENTATION.md  [NEW] +265 lines
```
