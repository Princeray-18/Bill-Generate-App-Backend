# 🔧 EXACT STEPS TO FIX YOUR DEPLOYMENT

## The Error You're Getting
```
An `executablePath` or `channel` must be specified for `puppeteer-core`
```

## The Fix (Copy & Paste Guide)

### STEP 1: Push Code to GitHub

```bash
cd "c:\Users\rayp1\OneDrive\Desktop\Bill Genrate Backend"
git add .
git commit -m "Fix: Puppeteer PDF generation for Render deployment"
git push origin main
```

### STEP 2: Go to Render Dashboard

1. Open: https://render.com
2. Login to your account
3. Find your service (Bill Generation Backend)
4. Click on the service name

### STEP 3: Add Environment Variables

1. Click **Settings** (in the service page)
2. Scroll to **Environment Variables**
3. Click **Add Environment Variable**
4. Add these variables one by one:

**Variable 1:**
- Key: `NODE_ENV`
- Value: `production`
- Click Add

**Variable 2:**
- Key: `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`
- Value: `true`
- Click Add

(If these already exist, just verify they're set correctly)

### STEP 4: Verify Your Instance Plan

1. Still in Settings
2. Look for **Instance Type** or **Plan**
3. If it says "Free", upgrade to **Standard**
   - Click the plan selector
   - Choose Standard
   - Confirm

### STEP 5: Deploy

**Option A: Auto Deploy (If connected to GitHub)**
- Should deploy automatically after you push
- Check **Deployments** tab to see status

**Option B: Manual Deploy**
- Click **Deployments** tab
- Find the latest deploy
- Click **Redeploy**

Wait for the build to complete (usually 2-3 minutes)

### STEP 6: Verify in Logs

1. Click on your service
2. Scroll to the bottom to see **Logs**
3. Look for these success messages:

```
✅ NODE_ENV: production
✅ Chromium executable path set: /path/to/chromium
✅ Connected to MongoDB
✅ Server running on port 8080
```

If you see these → **Success!** ✅

---

## Testing It Works

### Test 1: Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{"status":"OK","timestamp":"2025-12-13T..."}
```

### Test 2: PDF Generation
```bash
curl -X POST https://your-app-name.onrender.com/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "items": [
      {
        "description": "Test Product",
        "quantity": 1,
        "unitPrice": 100
      }
    ],
    "currency": "INR",
    "companyId": "YOUR_COMPANY_ID_HERE"
  }'
```

Expected: Bill created successfully with PDF generated (no executablePath error)

---

## If It Still Doesn't Work

### Check 1: Verify Environment Variables
```bash
# In Render logs, you should see:
=== ENVIRONMENT VERIFICATION ===
NODE_ENV: production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
```

If not showing `production`, go back and double-check the env vars.

### Check 2: Restart Service
1. Render Dashboard → Your Service
2. Settings → Restart Instance
3. Wait for it to restart
4. Check logs again

### Check 3: Check Build Logs
1. Render Dashboard → Your Service
2. Deployments tab
3. Click on latest deployment
4. Scroll to build logs
5. Look for: `@sparticuz/chromium` being installed
6. If not there, something's wrong with npm install

### Check 4: Manual Redeploy
1. Render Dashboard → Your Service
2. Deployments → Find latest
3. Click "Redeploy"
4. Wait for new build

### Check 5: Need More Help?
- Read [FAQ.md](./FAQ.md)
- Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Check exact error message in logs

---

## What Each Environment Variable Does

**NODE_ENV=production**
- Tells the code: "This is production, use Chromium from @sparticuz"
- Without this: Code tries to use system Chrome (not available on Render)
- Result: "executablePath must be specified" error

**PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true**
- Tells npm: "Don't download Chromium during build"
- Instead: Use the one from @sparticuz/chromium package
- Result: Faster builds, smaller size, correct binary for Render

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Still says "executablePath" | NODE_ENV not set to production |
| PDF times out | Upgrade to Standard plan |
| Build fails | Check npm install logs |
| After restart, still error | Restart again, might need 1-2 min |
| Completely stuck | Redeploy from deployments tab |

---

## Local Testing (Optional but Recommended)

If you want to test locally before deploying to Render:

```bash
# Set production environment
$env:NODE_ENV = "production"  # Windows PowerShell

# Or on Mac/Linux:
export NODE_ENV=production

# Start server
npm start

# In another terminal, test PDF generation
curl -X POST http://localhost:8080/api/bills ...
```

If it works locally with `NODE_ENV=production`, it will work on Render.

---

## Summary of Changes Made to Your Code

**Files Modified (3):**
1. `services/pdf.service.js` - Added Chromium detection
2. `server.js` - Added environment verification
3. `test-puppeteer.js` - Updated for consistency

**Files Created (10):**
- Documentation files to help you deploy

**No breaking changes** - Everything is backward compatible.

---

## Final Checklist

Before you're done:

- [ ] Pushed code to GitHub
- [ ] Added NODE_ENV=production on Render
- [ ] Added PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true on Render
- [ ] Upgraded plan to Standard (if was Free)
- [ ] Deployment complete
- [ ] Logs show success messages
- [ ] Tested with health check
- [ ] Tested with PDF generation
- [ ] Everything works!

---

## Time Estimate

- Push code: 1 min
- Add env vars: 2 min
- Deploy: 2-3 min
- Verify: 1 min
- **Total: 6-7 minutes**

---

## Support

If you need help:
1. Check [FAQ.md](./FAQ.md) - Answers to 15 common questions
2. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide
3. Check Render logs - Will show exact error
4. Read the error message carefully - Usually tells you what's wrong

---

**Ready to deploy?** Start with STEP 1! 👆

**Questions?** Check [FAQ.md](./FAQ.md) 💬

**Good luck!** 🚀
