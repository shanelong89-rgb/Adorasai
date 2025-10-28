# OpenAI API Key Setup Guide

## Issue
The OpenAI API key is currently set to a test value "0246810" instead of your real API key, causing AI features to fail with error:
```
Incorrect API key provided: 0246810
```

## Solution

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/account/api-keys
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-...`)
5. **Important:** Save it somewhere safe - you won't be able to see it again!

### Step 2: Set the Environment Variable in Supabase

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project: `cyaaksjydpegofrldxbo`

2. **Navigate to Edge Functions Settings:**
   - Click on "Edge Functions" in the left sidebar
   - Click on "Secrets" or "Environment Variables"

3. **Update OPENAI_API_KEY:**
   - Find the `OPENAI_API_KEY` variable (it's currently set to "0246810")
   - Click "Edit" or the edit icon
   - Replace "0246810" with your real OpenAI API key (starts with `sk-...`)
   - Click "Save"

4. **Redeploy Edge Functions:**
   After updating the environment variable, you need to redeploy:
   
   **Option A: Using Supabase CLI (Recommended)**
   ```bash
   supabase functions deploy server
   ```
   
   **Option B: Using the Dashboard**
   - Go to "Edge Functions" in Supabase dashboard
   - Find the `server` function
   - Click "Deploy" or "Redeploy"

### Step 3: Verify the Setup

1. **Wait 1-2 minutes** for the deployment to complete

2. **Test AI features:**
   - Upload a photo in the Adoras app
   - The AI should automatically analyze it and generate tags
   - Check the browser console for success messages instead of "Incorrect API key" errors

3. **Check the logs:**
   - In Supabase Dashboard > Edge Functions > server > Logs
   - You should see successful OpenAI API calls
   - No more "invalid_api_key" errors

## Important Notes

### Security
- ✅ The API key is stored securely as an environment variable in Supabase
- ✅ It's never exposed to the frontend
- ✅ All AI requests go through your secure backend
- ⚠️ Never commit API keys to git or share them publicly

### Cost Management
- OpenAI charges based on usage (tokens processed)
- The app uses `gpt-4o-mini` model which is cost-efficient
- We use `detail: 'low'` for image analysis to minimize costs
- Monitor your usage at https://platform.openai.com/usage

### Troubleshooting

**If AI features still don't work after setup:**

1. **Verify the key is correct:**
   - Check it starts with `sk-`
   - No extra spaces or quotes
   - Copy-paste carefully to avoid typos

2. **Check deployment status:**
   ```bash
   supabase functions list
   ```
   Should show `server` function as deployed

3. **View real-time logs:**
   ```bash
   supabase functions logs server
   ```
   Look for "OpenAI API error" messages

4. **Test the AI status endpoint:**
   - Open browser console
   - Run:
   ```javascript
   fetch('https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/ai/status', {
     headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
   }).then(r => r.json()).then(console.log)
   ```
   - Should return `configured: true`

## Current Environment Variables

According to your setup, these secrets are already configured:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ SUPABASE_DB_URL
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_PHONE_NUMBER
- ⚠️ **OPENAI_API_KEY** (currently set to test value "0246810" - needs update!)

## Next Steps

After setting up the OpenAI API key:
1. ✅ Photo auto-tagging will work
2. ✅ AI-powered categorization will activate
3. ✅ Smart memory recommendations will function
4. ✅ Advanced AI features (summaries, insights, semantic search) will be available

---

**Need Help?**
- OpenAI Platform: https://platform.openai.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
