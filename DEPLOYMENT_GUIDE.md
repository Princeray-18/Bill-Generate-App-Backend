# Render Deployment Guide - Puppeteer PDF Generation Fix

## Issue Resolution Summary

The application was failing with the error: `An 'executablePath' or 'channel' must be specified for 'puppeteer-core'`

This error occurs when deploying on Render because:
1. Puppeteer-core requires an explicit path to a Chromium executable
2. Render doesn't include Chromium by default
3. The `@sparticuz/chromium` package (already in `package.json`) provides a pre-built Chromium binary for Render

## Critical Configuration Steps for Render

### 1. **Environment Variables** (MUST BE SET in Render Dashboard)

Set these environment variables in your Render service settings:

```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
MONGODB_URI=<your-mongodb-uri>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
PORT=8080
FRONTEND_URL=https://your-frontend-url.onrender.com
COMPANY_PREFIX_PO=INGPO
COMPANY_PREFIX_PI=INGPI
COMPANY_PREFIX_INV=INGINV
YEAR_RANGE=25-26
```

**⚠️ CRITICAL**: `NODE_ENV=production` MUST be set, or PDF generation will fail!

### 2. **Package.json Dependencies Verification**

Ensure your `package.json` has these dependencies:

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^140.0.0",
    "puppeteer-core": "^24.22.3",
    "cloudinary": "^2.7.0",
    "mongoose": "^7.8.7",
    ...other dependencies
  }
}
```

Both `puppeteer-core` and `@sparticuz/chromium` are required.

### 3. **Build Configuration**

Render should use these settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start` (which runs `node server.js`)

### 4. **How the Fix Works**

The PDF service now:

1. **Checks NODE_ENV at startup** - Verifies production mode is active
2. **Uses @sparticuz/chromium on production** - Automatically finds the pre-built Chromium binary
3. **Falls back gracefully** - If issues occur, provides detailed error messages
4. **Uses system Chrome on development** - For local testing

Updated code in `services/pdf.service.js`:
```javascript
if (!isDev) {
  // Production (Render): Use @sparticuz/chromium
  const executablePath = await chromium.executablePath();
  launchOptions.executablePath = executablePath;
  launchOptions.args = chromium.args.concat(launchOptions.args);
} else {
  // Development: Use system Chrome
  launchOptions.executablePath = // system path to Chrome
}
```

## Troubleshooting

### Still Getting "executablePath" Error?

1. **Check Render Logs**: Go to your Render service → Logs
   - Look for the startup message: `NODE_ENV: production`
   - Look for: `Chromium executable path set: /path/to/chromium`

2. **Verify Environment Variables**:
   ```bash
   # In Render logs, you should see:
   === ENVIRONMENT VERIFICATION ===
   NODE_ENV: production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
   ```

3. **Restart the Service**: 
   - Go to Render Dashboard
   - Service Settings → Manual Deploy or restart the service

4. **Check Package Installation**:
   - Verify `@sparticuz/chromium` is installed: appears in `package-lock.json`
   - Render should show it being installed during the build

### PDF Generation Timeout?

The service has timeouts set to:
- Protocol Timeout: 180 seconds
- Puppeteer Timeout: 90 seconds

If still timing out:
1. Increase `protocolTimeout` in `services/pdf.service.js` → `_createBrowser()`
2. Ensure Render instance has adequate RAM (use at least Standard plan)

## Local Development Testing

To test locally before deploying:

```bash
# Set environment to simulate production
NODE_ENV=production npm start
```

Then make API calls to test PDF generation.

## Deployed File Changes

The following files were modified for this fix:

1. **services/pdf.service.js**
   - Enhanced `_createBrowser()` with better error handling
   - Added detailed logging for debugging
   - Improved production vs development detection

2. **server.js**
   - Added environment variable verification on startup
   - Added warnings if NODE_ENV is not properly configured

## Next Steps

1. Set `NODE_ENV=production` in Render environment variables
2. Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` is set
3. Deploy or manually trigger a build
4. Check Render logs for successful startup messages
5. Test PDF generation via your API

## Additional Resources

- [@sparticuz/chromium Package](https://www.npmjs.com/package/@sparticuz/chromium)
- [Puppeteer-Core Documentation](https://pptr.dev/)
- [Render Documentation](https://render.com/docs)

## Support

If PDF generation still fails after following this guide:
1. Check the complete error message in Render logs
2. Verify all environment variables are set
3. Ensure the build includes the `node_modules` directory with `@sparticuz/chromium`
4. Consider increasing the Render instance plan if memory is limited
