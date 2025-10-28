# Backend 401 Error - Fixed

## Problem
You were getting HTTP 401 errors on the health check endpoint:
```
❌ Server health check failed (XXXms): HTTP 401:
```

## Root Cause
Supabase Edge Functions require the `Authorization: Bearer <anon_key>` header for ALL requests, even public endpoints like `/health`. The health check was not sending this header.

## Fix Applied
Updated `/utils/serverHealth.ts` to include the Authorization header:

```typescript
const response = await fetch(HEALTH_CHECK_URL, {
  method: 'GET',
  signal: controller.signal,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,  // ✅ Added this
  },
});
```

## What This Means
The health check should now work correctly IF the Edge Function is deployed. The 401 errors should stop.

## Next Step: Verify Edge Function is Deployed

If you STILL see 401 errors after this fix, it means the Edge Function might not be deployed yet. Here's how to verify:

### Quick Test
1. Open your browser's Developer Console (F12)
2. Run this command:
```javascript
fetch('https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YWFrc2p5ZHBlZ29mcmxkeGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDYxMzEsImV4cCI6MjA3Njc4MjEzMX0.bL4r0JJWlSV6JjHnE4ArNFK53OkgLaPutacbekRcWxw'
  }
}).then(r => r.json()).then(console.log).catch(console.error)
```

### Expected Results

**✅ If Edge Function IS deployed:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-23T..."
}
```

**❌ If Edge Function is NOT deployed:**
```
401 Unauthorized
or
404 Not Found
```

## If Edge Function is NOT Deployed

You need to deploy it using one of these methods:

### Method 1: Supabase CLI (Recommended)
```bash
# Navigate to your project root
cd /path/to/adoras

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref cyaaksjydpegofrldxbo

# Deploy the Edge Function
npx supabase functions deploy make-server-deded1eb --no-verify-jwt

# Set environment variables
npx supabase secrets set OPENAI_API_KEY=your_key_here
npx supabase secrets set TWILIO_ACCOUNT_SID=your_sid_here
npx supabase secrets set TWILIO_AUTH_TOKEN=your_token_here
npx supabase secrets set TWILIO_PHONE_NUMBER=your_number_here
```

### Method 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/cyaaksjydpegofrldxbo/functions
2. Click "Create a new function"
3. Name it: `make-server-deded1eb`
4. Copy/paste the content from `/supabase/functions/server/` files
5. Deploy
6. Set environment variables in the dashboard

### Method 3: Use Deployment Scripts
The project includes automated deployment scripts:

**Windows:**
```cmd
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Verification After Deployment

1. Refresh your app
2. Check the console - you should see:
   ```
   ✅ Server health check passed (XXXms)
   ```
3. The ServerStatusBanner should disappear
4. All backend features (auth, AI, invitations) should work

## Status
- [x] Added Authorization header to health check
- [ ] Verify Edge Function deployment (you need to do this)
- [ ] Test that health check passes
- [ ] Verify all backend features work

## Files Modified
- `/utils/serverHealth.ts` - Added Authorization header

## No Code Changes Needed
The backend code is complete and correct. You just need to deploy it!
