# 🔐 Key Rotation Checklist — 25 Minutes

**Status:** API keys exposed in chat session (Dec 19, 2025)  
**Action:** Rotate ALL keys before deploying to production  
**Time:** ~25 minutes total

---

## ✅ Step 1: OpenAI Key (8 mins)

### Delete Old Key
1. Go to: https://platform.openai.com/api-keys
2. Find key starting with: `sk-proj-dUaLXK5WUXAA...`
3. Click **"Revoke"** or trash icon
4. Confirm deletion ✓

### Create New Key
1. Click **"Create new secret key"**
2. Name: `newgen-studio-production`
3. Permissions: **All** (or restrict to: Models, Assistants)
4. Click **Create**
5. **COPY THE KEY** (you'll never see it again!)
6. Save temporarily in Notepad

### Update Local Environment
```powershell
# Open backend/.env in VS Code
# Replace line:
OPENAI_API_KEY=<old key before rotation>

# With your NEW key:
OPENAI_API_KEY=<new key after rotation


### Test
```powershell
cd c:\NewGenAPPs\newgen-studio\backend
node server.js
```

You should see:
```
🔑 OPENAI_API_KEY: ✓ Set
```

If you see ✓, **STEP 1 COMPLETE** ✅

---

## ✅ Step 2: Gemini Key (8 mins)

### Delete Old Key
1. Go to: https://makersuite.google.com/app/apikey
   - (Or: https://aistudio.google.com/app/apikey)
2. Find key starting with: `AIzaSyDSk0tKfpg5m8Xve8...`
3. Click **"Delete"** or trash icon
4. Confirm deletion ✓

### Create New Key
1. Click **"Create API key"**
2. Select your Google Cloud project (or create new)
3. **COPY THE KEY** immediately
4. Save temporarily in Notepad

### Update Local Environment
```powershell
# Open backend/.env
# Replace line:
GEMINI_API_KEY=AIzaSyDSk0tKfpg5m8Xve8...

# With your NEW key:
GEMINI_API_KEY=AIzaSyYOURNEWKEYHERE
```

### Test
```powershell
# Restart backend (Ctrl+C, then):
node server.js
```

You should see:
```
💎 GEMINI_API_KEY: ✓ Set
```

If you see ✓, **STEP 2 COMPLETE** ✅

---

## ✅ Step 3: MongoDB Password (9 mins)

### Rotate Password in Atlas
1. Go to: https://cloud.mongodb.com/
2. Select your cluster: `cluster0`
3. Click **"Database Access"** (left sidebar under Security)
4. Find user: `reabi_db_user`
5. Click **"Edit"** (pencil icon)
6. Click **"Edit Password"**
7. Choose:
   - **Option A:** Click "Autogenerate Secure Password" (recommended)
   - **Option B:** Enter custom password (16+ chars, mix of upper/lower/numbers/symbols)
8. **COPY THE PASSWORD** immediately
9. Click **"Update User"**

### Build New Connection String
Old format (from your .env):
```
MONGODB_URI=mongodb+srv://reabi_db_user:sam1973@cluster0.adgjxqu.mongodb.net/reabi_db?retryWrites=true&w=majority
```

New format (replace password only):
```
MONGODB_URI=mongodb+srv://reabi_db_user:YOURNEWPASSWORDHERE@cluster0.adgjxqu.mongodb.net/reabi_db?retryWrites=true&w=majority
```

### Update Local Environment
```powershell
# Open backend/.env
# Replace entire MONGODB_URI line with new password
MONGODB_URI=mongodb+srv://reabi_db_user:NEWPASSWORD@cluster0.adgjxqu.mongodb.net/reabi_db?retryWrites=true&w=majority
```

### Test Connection
```powershell
# Restart backend
node server.js

# In another terminal, test an endpoint that uses MongoDB:
$body = @{ prompt = 'test' } | ConvertTo-Json
iwr http://localhost:4000/api/generate -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing
```

If generation works, **STEP 3 COMPLETE** ✅

---

## ✅ Step 4: Secure Git (2 mins)

### Remove Old Keys from Git History
```powershell
cd c:\NewGenAPPs\newgen-studio

# Remove .env files from git tracking (keeps local copies)
git rm --cached backend/.env
git rm --cached .env

# Commit the security fix
git add .gitignore
git commit -m "security: Protect .env files, require key rotation"
```

**NEVER push old .env files to GitHub!**

If you see:
```
[main abc1234] security: Protect .env files, require key rotation
 2 files changed, 5 insertions(+)
```

**STEP 4 COMPLETE** ✅

---

## ✅ Step 5: Verify Everything (3 mins)

### Full Stack Test
```powershell
# Terminal 1: Backend
cd c:\NewGenAPPs\newgen-studio\backend
node server.js

# Terminal 2: Frontend
cd c:\NewGenAPPs\newgen-studio
npm run dev

# Terminal 3: Test compliance
$body = @{ prompt = 'GMP batch tracker with audit trail' } | ConvertTo-Json
iwr http://localhost:4000/api/generate -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 40 -UseBasicParsing
```

### Success Criteria
- ✅ Backend starts without errors
- ✅ Frontend loads on http://localhost:5174
- ✅ Generation completes successfully
- ✅ No "invalid API key" errors
- ✅ Git shows no .env files tracked

---

## 🎯 What You've Accomplished

✅ **Old keys deleted** — Can't be used by anyone  
✅ **New keys active** — Only you have them  
✅ **Local environment updated** — Backend works with new keys  
✅ **Git protected** — .env files never pushed  
✅ **Full stack tested** — Everything operational  

---

## 🚀 Next Step: Deploy to Production

Open: **`DEPLOYMENT_GUIDE.md`**

You're now ready to deploy to:
- **Railway** (backend) — 10 mins
- **Vercel** (frontend) — 5 mins

**Total time to live platform: 15 minutes**

---

## ❓ Troubleshooting

### "Invalid API key" error
- Double-check you copied the FULL key (no spaces, no line breaks)
- Ensure you saved the .env file
- Restart backend server (Ctrl+C, then `node server.js`)

### Backend won't start
- Check for typos in .env (no quotes around values)
- Verify MongoDB password has no special chars that need URL encoding
- See: `PRODUCTION_STARTUP_FIX.md`

### MongoDB connection timeout
- Check IP whitelist in Atlas (Security → Network Access)
- Add your current IP or use 0.0.0.0/0 for testing
- Verify password is correct

---

**Your keys are now secure. Ready to deploy? Let's go! 🚀**
