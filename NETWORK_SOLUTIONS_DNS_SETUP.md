# 🌐 Network Solutions DNS Setup — newgenaistudio.com

**Date**: December 10, 2025  
**Domain**: newgenaistudio.com  
**Registrar**: Network Solutions  
**Status**: Ready for DNS configuration

---

## Quick Summary

You have two subdomains to configure in Network Solutions:

| Subdomain | Purpose | Destination | Type |
|-----------|---------|-------------|------|
| `newgenaistudio.com` (root) | Frontend (React app) | Vercel | A + CNAME |
| `api.newgenaistudio.com` | Backend API | Render | CNAME |

---

## Step 1: Log Into Network Solutions

1. Go to https://www.networksolutions.com
2. Click **"Manage My Domain"**
3. Sign in with your Network Solutions account
4. Search for **newgenaistudio.com**
5. Click **"Manage"** next to your domain

---

## Step 2: Access DNS Settings

1. From domain management page, look for **"Manage DNS"**
2. Click on **"Advanced DNS"** or **"DNS Management"**
3. You should see a list of current DNS records

---

## Step 3: Configure DNS Records

### Record 1: Root Domain (Frontend) — Type A

**For Vercel Root Domain:**

1. Find or create an **A Record** for `@` (root domain)
2. Enter these values:
   - **Host**: `@` (or leave blank)
   - **Type**: `A`
   - **Value**: `76.76.19.89`
   - **TTL**: `3600` (or Network Solutions default)

3. Click **Save**

**Alternative**: If Vercel gives you different IPs, use those instead. Check Vercel dashboard:
- Go to https://vercel.com/dashboard
- Select your project
- Settings → Domains
- Look for "A Record" value

---

### Record 2: WWW Subdomain (Frontend) — Type CNAME

1. Create a **CNAME Record** for `www`:
   - **Host**: `www`
   - **Type**: `CNAME`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `3600`

2. Click **Save**

---

### Record 3: API Subdomain (Backend) — Type CNAME

1. Create a **CNAME Record** for `api`:
   - **Host**: `api`
   - **Type**: `CNAME`
   - **Value**: `newgen-backend.onrender.com`
   - **TTL**: `3600`

2. Click **Save**

**Note**: Replace `newgen-backend.onrender.com` with your actual Render deployment URL.

---

## Step 4: Verify DNS Records in Network Solutions

Your DNS records should look like:

```
@ (root)     A      76.76.19.89           3600
www          CNAME  cname.vercel-dns.com  3600
api          CNAME  newgen-backend.onrender.com  3600
```

---

## Step 5: Update Vercel with Your Domain

1. Go to https://vercel.com/dashboard
2. Select your frontend project (newgen-studio)
3. Go to **Settings → Domains**
4. Click **Add**
5. Enter: `newgenaistudio.com`
6. Click **Add Domain**
7. Vercel will show you the DNS records needed
8. Verify they match what you entered in Network Solutions

**Important**: Once DNS is added in Vercel, it will show:
- ✅ **Valid Configuration** (green check)
- Or ⏳ **Pending** (while DNS propagates)

---

## Step 6: Update Render with Your Backend Domain

1. Go to https://render.com/dashboard
2. Select your backend project (newgen-backend)
3. Go to **Settings → Custom Domain**
4. Enter: `api.newgenaistudio.com`
5. Render will provide CNAME target
6. Verify it matches what you set in Network Solutions

---

## DNS Propagation Timeline

**Time to propagate**: 24-48 hours (sometimes up to 72 hours)

**How to check**:
- https://www.whatsmydns.net
- https://dnschecker.org
- Search for `newgenaistudio.com`

**Status indicators**:
- 🟢 Green = Propagated globally
- 🟡 Yellow = Propagating to some regions
- 🔴 Red = Not yet propagated

---

## Testing DNS (After Propagation)

### Test 1: Root Domain
```powershell
nslookup newgenaistudio.com
# Expected: 76.76.19.89
```

### Test 2: WWW Subdomain
```powershell
nslookup www.newgenaistudio.com
# Expected: Should resolve to Vercel IP
```

### Test 3: API Subdomain
```powershell
nslookup api.newgenaistudio.com
# Expected: Should resolve to Render IP
```

### Test 4: Visit Website
```
Open browser: https://newgenaistudio.com
# Expected: See your React app
```

### Test 5: Test API
```powershell
curl https://api.newgenaistudio.com/api/health
# Expected: { "status": "ok" }
```

---

## Troubleshooting DNS Issues

### Issue 1: "Domain Not Found"
**Symptoms**: Browser shows "ERR_NAME_NOT_RESOLVED"

**Causes**:
- DNS not yet propagated (wait 24-48 hours)
- Wrong A record value
- DNS not saved in Network Solutions

**Solution**:
1. Verify records in Network Solutions again
2. Check https://whatsmydns.net
3. Wait longer if showing "pending"

### Issue 2: "Invalid Certificate" or HTTPS Error
**Symptoms**: Browser shows SSL certificate error

**Cause**: Vercel needs time to issue SSL certificate after DNS is live

**Solution**:
1. Wait 5-10 minutes after DNS propagates
2. Vercel auto-generates Let's Encrypt certificate
3. Refresh page
4. Still failing? Check Vercel dashboard for certificate status

### Issue 3: API Returns 404
**Symptoms**: `https://api.newgenaistudio.com/api/health` returns 404

**Causes**:
- Backend not deployed on Render
- CNAME record points to wrong URL
- Render backend not running

**Solution**:
1. Verify Render deployment is live
2. Check Render URL in dashboard
3. Update CNAME if needed
4. Wait for DNS propagation

### Issue 4: CORS Errors in Browser Console
**Symptoms**: "Access-Control-Allow-Origin" errors

**Cause**: Backend not configured to accept requests from your domain

**Solution**:
1. Set environment variable on Render:
   ```
   FRONTEND_ORIGIN=https://newgenaistudio.com
   ```
2. Redeploy backend
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test again

---

## Quick Reference: DNS Records to Enter in Network Solutions

Copy and paste these into Network Solutions DNS management:

### A Record
```
Host:  @
Type:  A
Value: 76.76.19.89
TTL:   3600
```

### CNAME for WWW
```
Host:  www
Type:  CNAME
Value: cname.vercel-dns.com
TTL:   3600
```

### CNAME for API
```
Host:  api
Type:  CNAME
Value: newgen-backend.onrender.com
TTL:   3600
```

---

## What Happens When DNS Propagates

### Timeline
1. **0 minutes**: You save DNS records in Network Solutions
2. **15-30 minutes**: Some regions resolve correctly
3. **4-12 hours**: Most regions resolve correctly
4. **24-48 hours**: Fully propagated globally
5. **Once propagated**:
   - ✅ `newgenaistudio.com` loads your React app
   - ✅ `api.newgenaistudio.com` reaches your Express backend
   - ✅ HTTPS works automatically (Vercel handles SSL)
   - ✅ CORS configured (headers working)

---

## Next Steps

1. **Today**: Enter DNS records in Network Solutions
2. **Next 24-48 hours**: Monitor propagation at https://whatsmydns.net
3. **Once propagated**:
   - Visit https://newgenaistudio.com (should load!)
   - Test API: `curl https://api.newgenaistudio.com/api/health`
   - Try marketplace: https://newgenaistudio.com/plugins
4. **After verification**:
   - Set up monitoring
   - Plan Phase 2 launch
   - Announce to early users

---

## Network Solutions Support

If you need help in Network Solutions:

1. **Dashboard**: https://www.networksolutions.com/manage-my-domain
2. **DNS Help**: Look for "Help" or "?" icon on DNS page
3. **Support Chat**: https://www.networksolutions.com/support
4. **Phone**: 1-844-293-9333

---

## Vercel Setup (Parallel to DNS)

While DNS propagates, set up Vercel:

1. Go to https://vercel.com/dashboard
2. Select `newgen-studio` project
3. **Settings → Domains**
4. Click **Add**
5. Enter: `newgenaistudio.com`
6. Vercel shows required DNS records (should match above)
7. Click **Add Domain**

**Status will show**:
- ⏳ "Pending Verification" (while DNS propagates)
- ✅ "Valid Configuration" (once DNS live)

---

## Render Setup (Parallel to DNS)

While DNS propagates, set up Render backend:

1. Go to https://render.com/dashboard
2. Select `newgen-backend` service
3. **Settings → Custom Domain**
4. Click **Add Custom Domain**
5. Enter: `api.newgenaistudio.com`
6. Render shows CNAME target
7. Verify it matches your Network Solutions CNAME

**Status will show**:
- ⏳ "Pending" (while DNS propagates)
- ✅ "Active" (once DNS live)

---

## Monitoring After Launch

### Uptime Monitoring
Add to your monitoring stack:
- https://status.vercel.com (frontend)
- https://status.render.com (backend)

### Performance Monitoring
- Vercel Analytics: Built-in (check dashboard)
- Render Metrics: Built-in (check dashboard)

### Error Tracking
- Sentry: `npm install @sentry/react`
- Configure in `src/main.jsx`

---

## Summary

**You're all set!**

✅ Domain: newgenaistudio.com (purchased from Network Solutions)  
✅ Configuration: Ready (A + CNAME records defined above)  
✅ Frontend: Vercel deployment prepared  
✅ Backend: Render deployment prepared  

**Next action**: Enter the 3 DNS records in Network Solutions, then wait for propagation (24-48 hours).

**When DNS is live**: Your app will be accessible at https://newgenaistudio.com 🚀
