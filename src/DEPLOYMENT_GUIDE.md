# 🚀 Adoras Backend Deployment Guide

**Last Updated:** January 23, 2025  
**Status:** ⏳ Pending Deployment

---

## ⚠️ Current Status

The backend Supabase Edge Function is **NOT DEPLOYED** yet. This is why you're seeing:

```
⚠️ Slow operation detected: resource-fetch took 4413ms
Server Status: Offline 🔴
```

**Good News:** All backend code is complete and ready to deploy! ✅

---

## 📋 What Needs to be Deployed

### Edge Function Details:
- **Function Name:** `make-server-deded1eb`
- **Location:** `/supabase/functions/server/`
- **Project ID:** `cyaaksjydpegofrldxbo`
- **Endpoint:** `https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb`

### Files to Deploy:
```
/supabase/functions/server/
├── index.tsx           # Main server (Hono app)
├── auth.tsx            # Authentication
├── ai.tsx              # AI features
├── memories.tsx        # Memory management
├── invitations.tsx     # Invitations/connections
├── notifications.tsx   # Push notifications
├── database.tsx        # Type definitions
└── kv_store.tsx       # Database utilities (auto-included)
```

---

## 🚀 Deployment Options

### Option 1: Supabase CLI (Recommended)

#### Step 1: Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Or using Homebrew (macOS)
brew install supabase/tap/supabase

# Or download binary
# https://github.com/supabase/cli/releases
```

#### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

#### Step 3: Link to Your Project

```bash
supabase link --project-ref cyaaksjydpegofrldxbo
```

When prompted, select your project from the list.

#### Step 4: Deploy the Edge Function

```bash
# Deploy the edge function
supabase functions deploy make-server-deded1eb \
  --project-ref cyaaksjydpegofrldxbo

# Or if you're in the project directory
cd /path/to/adoras
supabase functions deploy make-server-deded1eb
```

#### Step 5: Verify Deployment

```bash
# Test the health endpoint
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-23T..."
}
```

---

### Option 2: Supabase Dashboard (Manual Upload)

#### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Login with your account
3. Select project: `cyaaksjydpegofrldxbo`

#### Step 2: Navigate to Edge Functions

1. Click on **"Edge Functions"** in the left sidebar
2. Click **"Create a new function"** or **"Deploy new function"**

#### Step 3: Configure Function

1. **Function Name:** `make-server-deded1eb`
2. **Region:** Auto (or select closest to your users)
3. **Method:** Upload code

#### Step 4: Upload Code

You have two options:

**Option A - Upload Directory:**
1. Zip the `/supabase/functions/server/` directory
2. Upload the zip file
3. Supabase will extract and deploy

**Option B - Copy/Paste Code:**
1. Create new function with name `make-server-deded1eb`
2. Copy contents of `/supabase/functions/server/index.tsx`
3. Paste into the editor
4. Create additional files for each module
5. Deploy

#### Step 5: Set Import Map (If needed)

If imports fail, create an `import_map.json`:

```json
{
  "imports": {
    "npm:hono": "https://esm.sh/hono@4",
    "npm:hono/cors": "https://esm.sh/hono@4/cors",
    "npm:hono/logger": "https://esm.sh/hono@4/logger",
    "npm:@supabase/supabase-js@2": "https://esm.sh/@supabase/supabase-js@2",
    "jsr:@supabase/supabase-js@2": "https://esm.sh/@supabase/supabase-js@2"
  }
}
```

---

### Option 3: GitHub Actions (CI/CD)

If you want automated deployments:

#### Step 1: Create GitHub Secrets

In your GitHub repository settings, add:

- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token
- `SUPABASE_PROJECT_ID` - `cyaaksjydpegofrldxbo`

#### Step 2: Create Workflow File

Create `.github/workflows/deploy-edge-functions.yml`:

```yaml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Edge Function
        run: |
          supabase functions deploy make-server-deded1eb \
            --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 🔐 Environment Variables

After deployment, set these environment variables in Supabase Dashboard:

### Required Variables:

```bash
# Supabase (Auto-configured)
SUPABASE_URL=https://cyaaksjydpegofrldxbo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://...

# AI Features (Already Set ✅)
OPENAI_API_KEY=sk-...

# SMS Features (Already Set ✅)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### How to Set Environment Variables:

#### Via Supabase CLI:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here --project-ref cyaaksjydpegofrldxbo
```

#### Via Dashboard:
1. Go to Project Settings
2. Click on "Edge Functions"
3. Scroll to "Environment Variables"
4. Add each variable

---

## ✅ Verification Checklist

After deployment, verify everything works:

### 1. Health Check
```bash
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Check Server Status in App
- Open the app
- Go to Login screen
- Look for **"Server Online" 🟢** indicator
- If it shows "Server Offline 🔴", refresh the page

### 3. Test Authentication
```bash
# Test signup
curl -X POST https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "type": "keeper",
    "name": "Test User"
  }'
```

Expected: `{"success":true,"user":{...},"authUserId":"..."}`

### 4. Test Signin
```bash
curl -X POST https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Expected: `{"success":true,"accessToken":"...","user":{...}}`

---

## 🐛 Troubleshooting

### Issue 1: "Function not found"

**Cause:** Function not deployed or wrong name

**Solution:**
```bash
# List all functions
supabase functions list --project-ref cyaaksjydpegofrldxbo

# Deploy if missing
supabase functions deploy make-server-deded1eb --project-ref cyaaksjydpegofrldxbo
```

### Issue 2: "Import error"

**Cause:** Missing dependencies

**Solution:** Ensure all imports use correct specifiers:
- `npm:hono` ✅
- `jsr:@supabase/supabase-js@2` ✅
- `node:process` ✅ (for Node built-ins)

### Issue 3: "Environment variable not set"

**Cause:** Missing env vars

**Solution:**
```bash
# Set all required variables
supabase secrets set SUPABASE_URL=https://... --project-ref cyaaksjydpegofrldxbo
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... --project-ref cyaaksjydpegofrldxbo
```

### Issue 4: "CORS error"

**Cause:** CORS not configured

**Solution:** Already configured in code! Check deployment logs:
```bash
supabase functions logs make-server-deded1eb --project-ref cyaaksjydpegofrldxbo
```

### Issue 5: "Timeout after 3 seconds"

**Cause:** Cold start or function crashed

**Solution:**
1. Check logs for errors
2. Redeploy function
3. Verify all imports are correct

---

## 📊 Deployment Status

### Backend Code: ✅ Complete

| Module | Status | Routes |
|--------|--------|--------|
| Authentication | ✅ Ready | 5 endpoints |
| Invitations | ✅ Ready | 4 endpoints |
| Memories | ✅ Ready | 6 endpoints |
| AI Features | ✅ Ready | 5 endpoints |
| Notifications | ✅ Ready | 3 endpoints |
| Health Check | ✅ Ready | 1 endpoint |

**Total:** 24+ API endpoints ready to deploy

### Deployment: ⏳ Pending

- [ ] Edge function deployed
- [ ] Health check passes
- [ ] Environment variables set
- [ ] Authentication tested
- [ ] All features verified

---

## 🎉 After Deployment

Once deployed, these features will immediately work:

✅ **Authentication**
- Sign up (Legacy Keeper / Storyteller)
- Sign in
- Session management
- Profile updates

✅ **Invitations**
- Create invitation
- Send SMS invitation (Twilio)
- Verify invitation code
- Accept invitation

✅ **Memories**
- Upload photos
- Upload videos
- Upload audio
- Record voice notes
- Add text memories
- Edit/delete memories

✅ **AI Features**
- Photo auto-tagging
- Voice transcription
- Memory recommendations
- Semantic search
- Memory insights
- Memory summaries

✅ **Notifications**
- Push notifications
- Subscription management
- New memory alerts

---

## 📞 Support

### Need Help?

1. **Check Deployment Logs:**
   ```bash
   supabase functions logs make-server-deded1eb --project-ref cyaaksjydpegofrldxbo --follow
   ```

2. **Review Documentation:**
   - `/BACKEND_API_DOCUMENTATION.md` - API reference
   - `/ERRORS_FIXED.md` - Common issues
   - `/AI_INTEGRATION_STATUS.md` - AI features

3. **Contact Support:**
   - Supabase Docs: https://supabase.com/docs/guides/functions
   - Supabase Discord: https://discord.supabase.com
   - GitHub Issues: Create an issue in your repo

---

## 🚀 Quick Deploy Command

For the impatient:

```bash
# One-liner to deploy everything
supabase login && \
supabase link --project-ref cyaaksjydpegofrldxbo && \
supabase functions deploy make-server-deded1eb && \
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

If you see `{"status":"ok"}` - **YOU'RE DONE!** 🎉

---

## 📝 Summary

**What to do:**
1. Choose a deployment option (CLI recommended)
2. Run the deployment commands
3. Verify the health check passes
4. Test authentication in the app

**Expected time:** 5-10 minutes

**After deployment:** All features work immediately! 🚀

---

**Status:** ⏳ Ready to Deploy  
**Next Step:** Choose a deployment option and run the commands above

*Last Updated: January 23, 2025*
