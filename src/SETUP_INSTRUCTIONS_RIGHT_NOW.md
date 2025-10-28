# ⚡ SETUP INSTRUCTIONS - Do This Right Now

## 🔴 You Should See 3 Popups

I just triggered 3 environment variable prompts. You should see modals asking for:

1. **VAPID_PUBLIC_KEY**
2. **VAPID_PRIVATE_KEY**
3. **VAPID_SUBJECT**

**DON'T CLOSE THEM YET!** Follow the steps below first.

---

## Step 1: Generate VAPID Keys

**Open your terminal** (any terminal - Mac Terminal, Windows PowerShell, VS Code terminal, etc.)

### Run This Command:

```bash
npx web-push generate-vapid-keys
```

### Expected Output:

```
=======================================

Public Key:
BHxPz1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijk

Private Key:
abc1234567890DEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz

=======================================
```

**The keys will be different!** That's expected - they're randomly generated.

---

## Step 2: Fill in the Popups

Now go back to the popups and fill them in:

### Popup 1: VAPID_PUBLIC_KEY

**Paste the Public Key** from your terminal

Example (yours will be different):
```
BHxPz1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijk
```

**Starts with "B"** - usually around 87 characters long

### Popup 2: VAPID_PRIVATE_KEY

**Paste the Private Key** from your terminal

Example (yours will be different):
```
abc1234567890DEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

**Different from public key** - usually around 43 characters long

### Popup 3: VAPID_SUBJECT

**Type your email** with `mailto:` prefix

Example (use YOUR real email):
```
mailto:your-email@example.com
```

**Must start with "mailto:"** - this is required!

Use the email you want to be identified as the sender.

---

## Step 3: Enable Supabase Realtime

**This is CRITICAL for real-time chat to work!**

### Go to Supabase Dashboard

1. **Open:** `https://supabase.com/dashboard`

2. **Select your Adoras project**

3. **Click:** Settings (⚙️ icon in left sidebar)

4. **Click:** API

5. **Scroll down** to find "Realtime" section

6. **Toggle "Enable Realtime" to ON** (should turn green)

7. **Wait 2 minutes** - don't skip this! Changes take time to propagate

### How to Know It's Enabled

**Look for:**
- ✅ Toggle is green/ON
- ✅ Status says "Realtime API enabled"

**If you see:**
- ❌ Toggle is gray/OFF
- ❌ Status says "Disabled"

Then click the toggle to turn it ON.

---

## Step 4: Verify Everything

### Check VAPID Keys Are Set

1. **Supabase Dashboard** → Your project
2. **Edge Functions** → **Secrets** tab
3. **Should see:**
   - ✅ VAPID_PUBLIC_KEY (value hidden with ••••)
   - ✅ VAPID_PRIVATE_KEY (value hidden with ••••)
   - ✅ VAPID_SUBJECT (shows your email)

**If not there:**
- Popups didn't save properly
- Add manually via Supabase dashboard
- Click "Add new secret" button
- Copy/paste from terminal

### Check Realtime Is Enabled

1. **Supabase Dashboard** → Settings → API
2. **Scroll to Realtime section**
3. **Toggle should be ON/green**

**If still OFF:**
- Click it to turn ON
- Confirm if prompted
- Wait 2 minutes

---

## Step 5: Test It Works

### Restart Your Apps

**Important:** Need to reload for changes to take effect

**On Computer (Allison):**
```
Hard refresh: Ctrl + Shift + R (Windows/Linux)
Hard refresh: Cmd + Shift + R (Mac)
```

**On iPhone (Shane):**
```
Close app completely (swipe up)
Reopen from home screen
```

### Test Notifications

**On iPhone:**
1. Menu → Notification Settings
2. Tap test button (TestTube icon 🧪)
3. **Should see notification!** 🎉

**On Computer:**
1. Menu → Notification Settings
2. Click test button
3. **Should see desktop notification!** 🎉

**If test fails:**
- Wait 2 more minutes (changes still propagating)
- Check browser console for errors
- Verify VAPID keys are correct (no extra spaces)
- Make sure VAPID_SUBJECT has `mailto:` prefix

### Test Real-time Chat

**Both devices open, console visible:**

1. **Computer:** Send message "Test 1"
2. **iPhone:** Should appear **instantly** without refresh
3. **iPhone:** Send reply "Test 2"  
4. **Computer:** Should appear **instantly** without refresh

**Console should show:**
```
🔌 Setting up real-time sync...
✅ Real-time channel connected!
📡 Broadcasting memory update...
📡 Received memory update...
```

**If messages don't appear:**
- Check console for "Real-time channel connected"
- If not connected: Realtime not enabled yet
- Wait 2 more minutes
- Hard refresh both devices

---

## Troubleshooting

### Popups Disappeared / Didn't Work

**No problem!** Add manually via Supabase Dashboard:

1. **Dashboard** → Your project → **Edge Functions** → **Secrets**
2. **Click "Add new secret"**
3. **Add each one:**

| Name | Value |
|------|-------|
| VAPID_PUBLIC_KEY | Your public key from terminal |
| VAPID_PRIVATE_KEY | Your private key from terminal |
| VAPID_SUBJECT | mailto:your-email@example.com |

4. **Click "Save"** after each

### Terminal Command Doesn't Work

**Error:** "npx: command not found"

**Means:** Node.js not installed

**Solution:**
1. Install Node.js from: https://nodejs.org/
2. Restart terminal
3. Try command again

**Or use online generator:**
1. Go to: https://web-push-codelab.glitch.me/
2. Click "Generate VAPID Keys"
3. Copy both keys
4. Use them in Supabase

### Realtime Toggle Doesn't Exist

**Possible reasons:**
1. Wrong section - make sure you're in Settings → API
2. Free tier limitation (unlikely, but check)
3. Old Supabase version (update project)

**Try:**
1. Settings → Database → Replication
2. Or Settings → API → scroll all the way down

### Can't Find Secrets Tab

**Path:**
1. Supabase Dashboard
2. Select your project (top left)
3. **Edge Functions** (in left sidebar, lightning bolt icon ⚡)
4. **Secrets** tab (at top of page)

**If Edge Functions not showing:**
- You might be on the wrong tab
- Try Database → Functions → Secrets
- Or just search "secrets" in dashboard

---

## What Each Setting Does

### VAPID_PUBLIC_KEY
- **Used by:** Frontend (browser)
- **Purpose:** Subscribe to push notifications
- **Security:** Safe to expose
- **Length:** ~87 characters, starts with "B"

### VAPID_PRIVATE_KEY
- **Used by:** Backend (server)
- **Purpose:** Sign push notifications
- **Security:** MUST keep secret!
- **Length:** ~43 characters

### VAPID_SUBJECT
- **Used by:** Backend (server)
- **Purpose:** Identify sender
- **Format:** `mailto:your-email@example.com`
- **Note:** Must start with "mailto:"

### Supabase Realtime
- **Enables:** WebSocket connections
- **Powers:** Real-time chat, presence, typing indicators
- **Without it:** Messages require refresh to appear
- **Cost:** Usually free on all tiers

---

## Success Checklist

After completing all steps, verify:

- [ ] Ran `npx web-push generate-vapid-keys`
- [ ] Copied both public and private keys
- [ ] Filled in all 3 popups (or added to Supabase manually)
- [ ] All 3 secrets show in Supabase Edge Functions → Secrets
- [ ] Supabase Realtime is ON in Settings → API
- [ ] Waited 2 minutes after enabling Realtime
- [ ] Hard refreshed both Computer and iPhone apps
- [ ] Test notification works on iPhone (🧪 button)
- [ ] Test notification works on Computer (🧪 button)
- [ ] Console shows "Real-time channel connected" on both
- [ ] Messages appear instantly without refresh
- [ ] No errors in browser console

**All checked?** You're done! 🎉

---

## Timeline

**Right Now (0 min):**
- Run terminal command
- Fill in popups
- Enable Realtime

**Wait 2 Minutes:**
- Supabase propagates changes
- Don't test yet!

**After 2 Minutes:**
- Hard refresh both devices
- Test notifications
- Test real-time chat
- Everything should work!

**Still Not Working After 5 Minutes:**
- Check console for errors
- Verify all settings in dashboard
- Re-read troubleshooting section
- Report specific error messages

---

## Quick Copy/Paste

**Terminal command:**
```bash
npx web-push generate-vapid-keys
```

**VAPID_SUBJECT format:**
```
mailto:your-email@example.com
```

**Test in console (after setup):**
```javascript
console.log('Permission:', Notification.permission);
console.log('Keys set:', !!Deno?.env?.get?.('VAPID_PUBLIC_KEY'));
```

**Check Realtime endpoint:**
```javascript
fetch('https://YOUR_PROJECT.supabase.co/realtime/v1/')
  .then(r => console.log('Realtime:', r.status))
  .catch(e => console.error('Realtime OFF:', e));
```

---

## When You're Done

**Reply with:**

1. ✅ VAPID keys generated and added
2. ✅ Supabase Realtime enabled  
3. ✅ Test notification works on iPhone
4. ✅ Test notification works on Computer
5. ✅ Real-time chat works (messages appear instantly)

**Or if something failed:**

- What step failed?
- What error did you see?
- Screenshot of console errors?
- Screenshot of Supabase dashboard?

---

That's it! Follow these steps in order and everything should work. The popups are waiting for you to fill them in! 🚀

