# 🚀 DO THIS NOW (5 Minutes)

## You Should See 3 Popups

I just opened 3 dialogs for you to enter VAPID keys.

**Don't close them yet!** Follow steps below first.

---

## ⚠️ If `npx` Command Failed

**Your terminal showed an error?** No problem!

👉 **Go to:** `/START_HERE_NPX_FAILED.md`

That file has **pre-generated VAPID keys** ready to copy/paste.

**Skip Step 1 below and use those keys instead!**

---

## Step 1: Terminal (1 minute)

**Open your terminal and run:**

```bash
npx web-push generate-vapid-keys
```

**You'll see something like:**

```
=======================================

Public Key:
BHxPz...long-key-here...xyz

Private Key:
abc123...another-long-key...789

=======================================
```

**Copy both keys!**

**If this command fails** → Use `/START_HERE_NPX_FAILED.md` instead!

---

## Step 2: Fill Popups (1 minute)

### Popup 1: VAPID_PUBLIC_KEY
Paste the **Public Key** (starts with "B")

### Popup 2: VAPID_PRIVATE_KEY
Paste the **Private Key** (different from public)

### Popup 3: VAPID_SUBJECT
Type: `mailto:your-email@example.com`
(Use YOUR real email!)

**Click Save on each!**

---

## Step 3: Supabase Dashboard (1 minute)

1. Go to: https://supabase.com/dashboard
2. Open your Adoras project
3. Click **Settings** (⚙️) → **API**
4. Scroll down to **"Realtime"**
5. Toggle **ON** (green)

---

## Step 4: Wait (2 minutes)

⏳ **Don't skip this!**

Changes need time to propagate.

Grab coffee ☕

---

## Step 5: Test (2 minutes)

### Refresh Apps

**Computer:** Ctrl+Shift+R
**iPhone:** Close app, reopen

### Test Notification

**Both devices:**
- Menu → Notification Settings
- Click 🧪 Test button
- **Should see notification!** 🔔

### Test Chat

**Computer:** Send "Test 1"
**iPhone:** Should appear **instantly**

**iPhone:** Reply "Test 2"  
**Computer:** Should appear **instantly**

---

## ✅ Success!

If both tests work, you're done! 🎉

---

## ❌ Didn't Work?

**Check:**
1. Did you wait 2 full minutes?
2. Are all 3 VAPID secrets in Supabase? (Edge Functions → Secrets)
3. Is Realtime toggle ON? (Settings → API → Realtime)
4. Did you hard refresh both apps?

**Still stuck?**

Read: `/QUICK_SETUP_CHECKLIST.md`

Or report:
- What failed?
- Any errors in console?

---

## That's It!

Total time: ~7 minutes

Start now! 👇

```bash
npx web-push generate-vapid-keys
```

