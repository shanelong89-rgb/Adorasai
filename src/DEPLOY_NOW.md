# 🚀 Deploy Adoras Backend NOW

**Status:** ⚠️ Backend Not Deployed  
**Time Required:** 5 minutes  
**Difficulty:** Easy

---

## Why You're Seeing "Backend Server Not Available"

The Adoras app is **ready** but the backend server hasn't been deployed to Supabase yet. All the code is complete - it just needs to be uploaded to Supabase's servers.

---

## ⚡ Quick Deploy (Choose One Method)

### Method 1: Automated Script (Recommended) ✨

#### macOS / Linux:
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

#### Windows:
```cmd
deploy.bat
```

The script will:
- ✅ Check if Supabase CLI is installed
- ✅ Authenticate with Supabase
- ✅ Link to your project
- ✅ Deploy the Edge Function
- ✅ Verify deployment with health check

---

### Method 2: Manual Commands

If you prefer to run commands yourself:

```bash
# Step 1: Install Supabase CLI (if not installed)
npm install -g supabase

# Step 2: Login to Supabase
supabase login

# Step 3: Link to your project
supabase link --project-ref cyaaksjydpegofrldxbo

# Step 4: Deploy the Edge Function
supabase functions deploy make-server-deded1eb

# Step 5: Test it works
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-01-23T..."}
```

---

### Method 3: Supabase Dashboard (No CLI)

If you don't want to install the CLI:

1. **Go to:** https://supabase.com/dashboard
2. **Select project:** `cyaaksjydpegofrldxbo`
3. **Click:** Edge Functions (left sidebar)
4. **Click:** "Create a new function" or "Deploy function"
5. **Name:** `make-server-deded1eb`
6. **Upload:** The `/supabase/functions/server/` folder
7. **Deploy:** Click the deploy button

---

## ✅ Verify Deployment

After deployment, check these indicators:

### 1. Test the Health Endpoint
```bash
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

Should return: `{"status":"ok",...}`

### 2. Check App Status
- Open your Adoras app
- Refresh the page
- Look for: **🟢 Server Online**
- The warning banner should disappear

### 3. Try Authentication
- Go to sign up
- Create a test account
- If it works, deployment succeeded! 🎉

---

## 🐛 Troubleshooting

### "Supabase CLI not found"

**Solution:** Install it first
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### "Not authenticated"

**Solution:** Run login command
```bash
supabase login
```
This opens your browser to authenticate.

### "Function deployed but health check fails"

**Wait 30 seconds** - Functions need time to warm up on first deployment.

Then retry:
```bash
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

### "Import errors" or "Module not found"

The code uses correct import specifiers. If you see errors, check the deployment logs:
```bash
supabase functions logs make-server-deded1eb --project-ref cyaaksjydpegofrldxbo
```

### Still having issues?

1. Check deployment logs (command above)
2. Verify project ID: `cyaaksjydpegofrldxbo`
3. Try redeploying: `supabase functions deploy make-server-deded1eb`
4. Check Supabase status: https://status.supabase.com

---

## 📦 What Gets Deployed

The deployment includes all these backend features:

- ✅ **Authentication** - Sign up, sign in, profile management
- ✅ **Invitations** - SMS invitations via Twilio
- ✅ **Memories** - Photo/video/audio upload with Supabase Storage
- ✅ **AI Features** - Photo tagging, transcription, chat assistant
- ✅ **Notifications** - Push notifications for new memories
- ✅ **Storage** - Secure file storage with signed URLs

**Total:** 24+ API endpoints ready to use

---

## 🎉 After Deployment

Once deployed successfully:

1. **Refresh your Adoras app** - Status should show "Server Online"
2. **Test sign up** - Create a test account
3. **Try features** - Upload photos, create memories
4. **Invite a storyteller** - Test the full flow

Everything will work immediately after deployment! 🚀

---

## 📞 Need Help?

- **Documentation:** See `/DEPLOYMENT_GUIDE.md` for detailed info
- **API Reference:** See `/BACKEND_API_DOCUMENTATION.md`
- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Supabase Discord:** https://discord.supabase.com

---

## 🚀 Quick Deploy One-Liner

For the truly impatient:

```bash
npm install -g supabase && supabase login && supabase link --project-ref cyaaksjydpegofrldxbo && supabase functions deploy make-server-deded1eb && curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

If you see `{"status":"ok"}` - **YOU'RE DONE!** 🎉

---

**Ready?** Choose a method above and deploy now! ⚡

*Last Updated: January 23, 2025*
