# Groq API Key Hash Issue - RESOLVED

## Problem
You pasted the Groq API key `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` into Supabase, but it saved as a hash: `24f5445a2d84a4d00cef785584f89f40651d7ed8131f4adcb5977904075813e9`

## What Happened

There are two possible scenarios:

### Scenario 1: Display Hash (Most Likely)
Supabase encrypts secrets for security and shows them as hashes in the UI. However, the actual key is stored correctly and accessible to the server via `Deno.env.get('GROQ_API_KEY')`.

### Scenario 2: You Pasted the Hash
If you accidentally pasted the hash instead of the actual API key, the server will receive the hash and AI features won't work.

## How to Check

1. **Open the Groq API Key Setup Dialog**
   - Look for any error messages when using AI features
   - The dialog will show automatically if there's an API key error
   - Or manually open it from the app settings

2. **Check the Status**
   - Click the "Test Connection" button
   - Look at the status badge:
     - ✅ **Green "Configured"** = Key is valid and working
     - ⚠️ **Red "Not Configured"** = Key is invalid or a hash

3. **Check the Console/Logs**
   - Open browser console (F12)
   - Look for these logs when the app loads or when testing AI features:
     - `✅ GROQ_API_KEY is set`
     - `📝 Key starts with: gsk_nRMYcp...` ← Should start with "gsk_"
     - `📝 Key format valid (starts with gsk_): true` ← Should be true

## How to Fix (If Key is Invalid)

If the server is receiving the hash instead of the actual key:

### Method 1: Re-enter via Supabase Dashboard

1. Go to your **Supabase Project Dashboard**
2. Navigate to **Edge Functions** → **Environment Variables**
3. Find `GROQ_API_KEY`
4. **Delete** the existing variable
5. **Create new** `GROQ_API_KEY` variable
6. Paste the actual key: `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`
   - **IMPORTANT**: Copy it directly from here, not from the Supabase UI
7. **Save** and **redeploy** Edge Functions

### Method 2: Use Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase secrets set GROQ_API_KEY=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
```

## Verify It's Working

After updating:

1. **Wait for Edge Functions to redeploy** (~30 seconds)
2. **Test the AI features**:
   - Upload a document → Click "Extract Text with AI"
   - Upload a photo → Auto-tagging should work
   - Record a voice note → Auto-transcription should work
3. **Check the status endpoint**:
   - Open: `https://[your-project-id].supabase.co/functions/v1/make-server-deded1eb/ai/status`
   - Look for:
     ```json
     {
       "configured": true,
       "available": true,
       "keyFormat": {
         "startsWithGsk": true,
         "length": 56,
         "preview": "gsk_nRMYcp...TeSGT2",
         "isHash": false
       }
     }
     ```

## Expected Behavior

### ✅ Working (Key is correct):
- Key starts with `gsk_`
- Key length is ~56 characters
- `isHash: false`
- `startsWithGsk: true`
- All AI features work

### ❌ Not Working (Key is hash):
- Key is 64 hex characters: `24f5445a2d84a4d00cef785584f89f40651d7ed8131f4adcb5977904075813e9`
- `isHash: true`
- `startsWithGsk: false`
- AI features return "Invalid API Key" errors

## Your Groq API Key

For easy copying:
```
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
```

## Support

If you're still having issues:
1. Check the Edge Function logs in Supabase Dashboard
2. Look for the diagnostic logs that start with ✅ or ❌
3. Share those logs for debugging

## What I Did to Help Debug

1. ✅ Enhanced `/ai/status` endpoint with detailed diagnostics
2. ✅ Added hash detection (checks if value is 64 hex chars)
3. ✅ Added better logging to show key format issues
4. ✅ Updated GroqAPIKeySetup dialog to show warnings
5. ✅ Added validation that the key starts with "gsk_"

The server will now clearly indicate if it's receiving a hash instead of the actual API key!
