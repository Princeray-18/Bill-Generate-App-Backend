# FAQ - Bill Generation Backend on Render

## Quick Fixes for Common Issues

### Q1: Getting "executablePath or channel must be specified" Error

**A:** This means `NODE_ENV` is not set to `production`.

**Solution:**
1. Go to Render Dashboard
2. Your Service → Settings → Environment Variables
3. Add/Update: `NODE_ENV=production`
4. Restart the service
5. Wait 1-2 minutes for changes to take effect

**Verify it worked:**
- Check logs for: `NODE_ENV: production`
- Check logs for: `Chromium executable path set:`

---

### Q2: How do I know if the fix worked?

**A:** Check the Render logs for these lines during startup:

```
=== ENVIRONMENT VERIFICATION ===
NODE_ENV: production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
Production mode: Using @sparticuz/chromium
Chromium executable path set: /path/to/chromium-...
✅ Connected to MongoDB
🚀 Server running on port 8080
```

If you see all of these, everything is configured correctly.

---

### Q3: My PDF still won't generate. What should I do?

**A:** Follow this troubleshooting path:

1. **Check environment variables:**
   - `NODE_ENV=production` ✓
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` ✓
   - `MONGODB_URI` is set ✓
   - `CLOUDINARY_*` variables are set ✓

2. **Restart the service:**
   - Render Dashboard → Service → Restart

3. **Check logs for specific error:**
   - Look for error messages mentioning "chromium", "puppeteer", or "browser"
   - Share the exact error message

4. **Test with curl:**
   ```bash
   curl -X GET https://your-app.onrender.com/health
   ```
   Should return: `{"status":"OK"}`

5. **Upgrade plan if needed:**
   - Free plan doesn't have enough resources
   - Use **Standard** plan minimum

---

### Q4: What does "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true" do?

**A:** It tells Puppeteer not to download Chromium during `npm install`.

Instead, it uses `@sparticuz/chromium` which is already in your dependencies. This is necessary for Render because:
- It's smaller
- It's pre-built for Linux
- It works in the Render environment

**Don't forget to set this!**

---

### Q5: Can I use the Free plan?

**A:** No, PDF generation requires the **Standard plan** minimum.

**Why?**
- Free plan has very limited CPU and memory
- PDF generation is resource-intensive
- Chromium needs ~500MB+ memory
- Browser launch often fails on Free plan

**Action:** Upgrade to Standard plan in Render settings.

---

### Q6: How long should PDF generation take?

**A:** Typically 3-5 seconds per document.

If it's taking longer:
- Standard plan might be underpowered → upgrade to Pro plan
- Browser might be crashing → check logs
- Check network latency for exchange rate API calls

---

### Q7: The build succeeds but PDF generation still fails

**A:** The package might not be installing correctly.

**Check:**
1. Build logs should show: `added XXX packages`
2. Verify `@sparticuz/chromium` is listed in build output
3. Try a manual deploy from Render dashboard
4. Check if `package-lock.json` is committed to git

**If still failing:**
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Refresh dependencies"
git push
```

---

### Q8: How do I test locally before deploying?

**A:** 
```bash
# Set production mode
NODE_ENV=production npm start

# In another terminal, test PDF generation
curl -X POST http://localhost:8080/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "items": [{"description": "Item", "quantity": 1, "unitPrice": 100}],
    "currency": "INR"
  }'
```

Should work without errors.

---

### Q9: Which files were changed to fix the issue?

**A:** Main files:

1. **services/pdf.service.js** - Core fix for Chromium path detection
2. **server.js** - Added environment verification on startup
3. **test-puppeteer.js** - Updated test script

**Documentation added:**
- DEPLOYMENT_GUIDE.md
- FIXES_SUMMARY.md
- RENDER_CHECKLIST.md
- Updated README.md
- render.yaml

---

### Q10: Do I need to change my code?

**A:** No! The fixes are already applied.

Just ensure:
1. All changes are committed and pushed
2. Render environment variables are set correctly
3. Your Render service is restarted
4. You're using Standard plan or higher

---

### Q11: What if Chromium path is empty?

**A:** The code handles this gracefully.

If `chromium.executablePath()` returns empty, it will:
1. Log a warning
2. Still try to launch with default settings
3. Use system Chromium if available
4. Provide clear error message if all fails

This is better than crashing.

---

### Q12: How do I enable debugging?

**A:** The code already logs extensively:

```bash
# Check Render logs for:
Creating new browser instance...
Production mode: Using @sparticuz/chromium
Chromium executable path set: /path/to/chromium
Launching browser with options: {...}
```

For more details:
- Look at PDF service logs
- Check controller logs for bill creation
- Verify database is working

---

### Q13: Will this work on other platforms (Heroku, Vercel, etc.)?

**A:** 

- **Heroku**: Works similarly, but needs different setup
- **Vercel**: Not suitable for long-running processes like PDF generation
- **AWS Lambda**: Needs different Chromium build
- **DigitalOcean**: Works with standard Puppeteer

For other platforms, you may need different dependencies. Contact support if needed.

---

### Q14: How do I rollback if something goes wrong?

**A:** 

1. Go to Render Dashboard
2. Your Service → Deployments
3. Find the last working deployment
4. Click "Redeploy" on that version

Or manually revert code:
```bash
git revert <commit-hash>
git push
```

---

### Q15: Is there a way to see what @sparticuz/chromium is doing?

**A:** Yes, enable detailed logging:

In `services/pdf.service.js`, add before launch:
```javascript
launchOptions.dumpio = true; // Logs Chrome STDOUT/STDERR
```

Then check logs for Chromium messages.

---

## Still Need Help?

1. **Read**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Check**: [RENDER_CHECKLIST.md](./RENDER_CHECKLIST.md)
3. **Review**: [FIXES_SUMMARY.md](./FIXES_SUMMARY.md)
4. **Look at**: Render logs for specific error messages

---

**Last Updated**: December 2025
**Version**: 1.0.0
