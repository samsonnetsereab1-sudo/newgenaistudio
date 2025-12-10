# 🚀 NewGen Studio — Domain Launch Checklist
## newgenaistudio.com | Network Solutions

**Status**: Ready to Launch  
**Date**: December 10, 2025  
**Domain**: newgenaistudio.com  
**Registrar**: Network Solutions

---

## 📋 Pre-Launch Checklist

### Configuration (✅ DONE)
- [x] Updated `.env.production` with newgenaistudio.com
- [x] Updated Vercel config with newgenaistudio.com
- [x] Updated Render config with newgenaistudio.com
- [x] Created NETWORK_SOLUTIONS_DNS_SETUP.md guide

### DNS Records Ready (⏳ ACTION NEEDED)
- [ ] Log into Network Solutions
- [ ] Add **A Record**: `@` → `76.76.19.89`
- [ ] Add **CNAME Record**: `www` → `cname.vercel-dns.com`
- [ ] Add **CNAME Record**: `api` → `newgen-backend.onrender.com`
- [ ] Save all DNS records
- [ ] Wait 24-48 hours for propagation

### Vercel Setup (⏳ ACTION NEEDED)
- [ ] Go to https://vercel.com/dashboard
- [ ] Select `newgen-studio` project
- [ ] Settings → Domains
- [ ] Add domain: `newgenaistudio.com`
- [ ] Verify configuration (should be pending DNS)

### Render Setup (⏳ ACTION NEEDED)
- [ ] Go to https://render.com/dashboard
- [ ] Select `newgen-backend` service
- [ ] Settings → Custom Domain
- [ ] Add domain: `api.newgenaistudio.com`
- [ ] Copy CNAME target to Network Solutions

---

## 🎯 Deployment Timeline

### Phase 1: DNS Configuration (Today — 30 min)
```
1. Open Network Solutions dashboard
2. Navigate to DNS management for newgenaistudio.com
3. Add 3 records (A + 2 CNAME):
   A:     @   → 76.76.19.89
   CNAME: www → cname.vercel-dns.com
   CNAME: api → newgen-backend.onrender.com
4. Click Save
5. Verify records were saved
```

**Expected Time**: 30 minutes

---

### Phase 2: Vercel & Render Setup (While DNS Propagates — 15 min)

**In Vercel**:
```
1. Dashboard → newgen-studio project
2. Settings → Domains
3. Add domain: newgenaistudio.com
4. Status will be "Pending" (waiting for DNS)
5. Don't close this tab, check status periodically
```

**In Render**:
```
1. Dashboard → newgen-backend service
2. Settings → Custom Domain
3. Add domain: api.newgenaistudio.com
4. Copy CNAME value shown
5. Verify it matches what you entered in Network Solutions
```

**Expected Time**: 15 minutes

---

### Phase 3: DNS Propagation (Waiting — 24-48 hours)

**Monitor Progress**:
```
1. Open https://whatsmydns.net
2. Search for: newgenaistudio.com
3. Check A record: Should resolve to 76.76.19.89
4. When all regions green ✅ → Propagation complete
```

**Timeline**:
- 15 min - Some regions resolving
- 2-4 hours - Most regions resolving
- 24 hours - Usually fully propagated
- 48 hours - Definitely fully propagated

---

### Phase 4: Verification (After DNS Propagates — 15 min)

**Test 1: Check DNS**
```powershell
nslookup newgenaistudio.com
# Expected: 76.76.19.89
```

**Test 2: Visit Frontend**
```
Open browser: https://newgenaistudio.com
# Expected: See your NewGen Studio app
```

**Test 3: Check API Health**
```powershell
curl https://api.newgenaistudio.com/api/health
# Expected: { "status": "ok" }
```

**Test 4: Test Marketplace**
```
Browser: https://newgenaistudio.com/plugins
# Expected: See plugin marketplace with 5 plugins
```

**Test 5: Verify CORS**
```powershell
curl -i https://api.newgenaistudio.com/api/v1/plugins
# Expected: Access-Control-Allow-Origin: https://newgenaistudio.com
```

**Expected Time**: 15 minutes (all tests pass)

---

## 🌐 DNS Records Reference

**Copy these exact values into Network Solutions:**

```
┌─────────────────────────────────────────────────────────┐
│                     A RECORD (Root)                     │
├─────────────────────────────────────────────────────────┤
│ Host:  @                                                 │
│ Type:  A                                                 │
│ Value: 76.76.19.89                                      │
│ TTL:   3600                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              CNAME RECORD (WWW Subdomain)               │
├─────────────────────────────────────────────────────────┤
│ Host:  www                                              │
│ Type:  CNAME                                            │
│ Value: cname.vercel-dns.com                            │
│ TTL:   3600                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              CNAME RECORD (API Subdomain)               │
├─────────────────────────────────────────────────────────┤
│ Host:  api                                              │
│ Type:  CNAME                                            │
│ Value: newgen-backend.onrender.com                     │
│ TTL:   3600                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 What Each Domain Does

| Domain | Purpose | Service | Status |
|--------|---------|---------|--------|
| `newgenaistudio.com` | Frontend (React app) | Vercel | ⏳ Waiting DNS |
| `www.newgenaistudio.com` | Alias to frontend | Vercel | ⏳ Waiting DNS |
| `api.newgenaistudio.com` | Backend API | Render | ⏳ Waiting DNS |

---

## 🔐 HTTPS / SSL

**Good news**: Both Vercel and Render automatically provide HTTPS!

- ✅ Vercel: Auto-generates Let's Encrypt certificate (takes 5-10 min after DNS live)
- ✅ Render: Auto-generates certificate (takes 5-10 min after DNS live)
- ✅ All traffic will be `https://` automatically

---

## 📊 Current Configuration

### Environment Variables
```
Frontend URL:      https://newgenaistudio.com
API URL:           https://api.newgenaistudio.com/api
Frontend Origin:   https://newgenaistudio.com
CORS Enabled:      true
```

### Deployment Status
- Frontend: ✅ Vercel (ready)
- Backend: ✅ Render (ready)
- DNS: ⏳ Network Solutions (waiting to be configured)

### Services Running Locally
- Frontend Dev: http://localhost:5175 (Vite)
- Backend Dev: http://localhost:4000 (Express)
- Marketplace: ✅ 5 plugins ready

---

## 🚨 Common Issues & Solutions

### "DNS Still Not Propagating After 48 Hours"

**Check**:
1. Verify records saved in Network Solutions
2. Copy exact values from NETWORK_SOLUTIONS_DNS_SETUP.md
3. Check for typos (especially `cname.vercel-dns.com`)

**Verify in Network Solutions**:
```
1. Log in → Domain Management
2. Select newgenaistudio.com
3. Check Advanced DNS or DNS Records
4. Verify all 3 records are there with exact values
```

### "HTTPS Certificate Not Working"

**Wait**: Certificates take 5-10 minutes after DNS propagates  
**Retry**: Clear browser cache (Ctrl+Shift+Delete), try again

### "API Returns 404"

**Check**:
1. Verify Render backend is running: https://render.com/dashboard
2. Check logs in Render for errors
3. Verify CNAME is correct: `newgen-backend.onrender.com`
4. Wait for DNS propagation to complete

### "Vercel Shows 'Invalid Configuration'"

**Expected**: Will show "Pending Verification" while DNS propagates  
**Solution**: Wait for DNS propagation, usually takes 24 hours  
**Force refresh**: In Vercel settings, click "Verify DNS" button

---

## 📞 Support Resources

### Network Solutions DNS Help
- **Dashboard**: https://www.networksolutions.com/manage-my-domain
- **Support**: https://www.networksolutions.com/support
- **Phone**: 1-844-293-9333

### Vercel Deployment Help
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support

### Render Deployment Help
- **Dashboard**: https://render.com/dashboard
- **Docs**: https://render.com/docs
- **Support**: https://render.com/docs/support

### DNS Propagation Checker
- **whatsmydns.net**: https://www.whatsmydns.net
- **dnschecker.org**: https://dnschecker.org

---

## 🎯 Success Criteria

**DNS Configured**: ✅ Complete
- [ ] 3 records entered in Network Solutions
- [ ] Records visible in Network Solutions dashboard
- [ ] whatsmydns.net shows all green ✅

**Frontend Live**: ✅ Verified
- [ ] https://newgenaistudio.com loads React app
- [ ] Vercel shows "Valid Configuration"
- [ ] HTTPS certificate working

**Backend Live**: ✅ Verified
- [ ] https://api.newgenaistudio.com/api/health returns 200
- [ ] Render shows "Active" status
- [ ] HTTPS certificate working

**Full Integration**: ✅ Verified
- [ ] Marketplace loads at /plugins
- [ ] Plugin list shows 5 plugins
- [ ] Install button works
- [ ] No CORS errors in console

---

## 📝 Next Steps (In Order)

1. **Now** (Today)
   - [ ] Read NETWORK_SOLUTIONS_DNS_SETUP.md
   - [ ] Log into Network Solutions
   - [ ] Enter 3 DNS records
   - [ ] Save and verify

2. **In 5 minutes**
   - [ ] Go to Vercel dashboard
   - [ ] Add domain: newgenaistudio.com
   - [ ] Check status (will be "Pending")

3. **In 5 minutes**
   - [ ] Go to Render dashboard
   - [ ] Add domain: api.newgenaistudio.com
   - [ ] Copy CNAME value

4. **Next 24-48 hours**
   - [ ] Monitor DNS propagation
   - [ ] Periodically check whatsmydns.net
   - [ ] Keep browser tab with Vercel open to check status

5. **Once DNS Propagates**
   - [ ] Visit https://newgenaistudio.com
   - [ ] Run 5 verification tests
   - [ ] Celebrate! 🎉

---

## 🎉 Launch Timeline

```
Today (Dec 10):
  ├─ Enter DNS records (30 min)
  ├─ Set up Vercel domain (5 min)
  └─ Set up Render domain (5 min)
  
Day 1-2 (Dec 11-12):
  ├─ Wait for DNS propagation (24-48 hours)
  └─ Monitor at whatsmydns.net
  
Day 3 (Dec 12-13):
  ├─ DNS should be live
  ├─ Run verification tests (15 min)
  ├─ Fix any issues (15 min)
  └─ LAUNCH! 🚀
```

---

**Status**: ✅ Ready for DNS Configuration  
**Action**: Follow NETWORK_SOLUTIONS_DNS_SETUP.md  
**ETA to Launch**: 24-48 hours after DNS config  

**Let's go! 🚀**
