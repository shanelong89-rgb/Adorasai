# 🔐 VAPID Keys & Supabase Realtime Setup - DO THIS NOW

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

### Generate Keys Using npx

**Open your terminal and run:**

```bash
npx web-push generate-vapid-keys
```

**Expected output:**
```
=======================================

Public Key:
BHxPz1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijk

Private Key:
abc1234567890DEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz

=======================================
```

**Copy both keys!** You'll need them in the next step.

---

## Step 2: Add VAPID Keys to Supabase

I'm opening dialogs for you to paste the keys. You'll see 3 popups:

1. **VAPID_PUBLIC_KEY** - Paste your Public Key
2. **VAPID_PRIVATE_KEY** - Paste your Private Key  
3. **VAPID_SUBJECT** - Paste `mailto:your-email@example.com` (use your real email)

### Alternative Method (If Dialogs Don't Work)

**Manually add via Supabase Dashboard:**

1. Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions`
2. Click **"Secrets"** tab
3. Click **"Add new secret"**
4. Add these 3 secrets:

| Name | Value |
|------|-------|
| `VAPID_PUBLIC_KEY` | Your public key from step 1 |
| `VAPID_PRIVATE_KEY` | Your private key from step 1 |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` |

5. Click **"Save"** for each

---

## Step 3: Enable Supabase Realtime

**This MUST be done for chat messages to work in real-time!**

### Enable Realtime in Dashboard

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
   ```

2. **Scroll down to "Realtime" section**

3. **Toggle "Enable Realtime" to ON**
   - Should see green toggle
   - May need to confirm

4. **Wait 1-2 minutes**
   - Changes take time to propagate
   - Don't refresh immediately

5. **Verify it's enabled:**
   - Refresh the settings page
   - Check toggle is still ON
   - Should see "Realtime API enabled" status

---

## Step 4: Verify Setup

### Check VAPID Keys Are Set

**In Supabase Dashboard:**

1. Functions → Secrets tab
2. Look for:
   - ✅ VAPID_PUBLIC_KEY (value hidden)
   - ✅ VAPID_PRIVATE_KEY (value hidden)
   - ✅ VAPID_SUBJECT (value visible)

### Check Realtime Is Enabled

**Test the Realtime endpoint:**

```javascript
// Open browser console and run:
fetch('https://YOUR_PROJECT_ID.supabase.co/realtime/v1/')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);

// Expected: Some HTML response (not an error)
// If error: Realtime is not enabled
```

---

## Step 5: Test Notifications

### On iPhone (Shane):

1. **Open Adoras from home screen** (must be PWA)
2. **Menu → Notification Settings**
3. **Tap test button** (TestTube icon)
4. **Should see notification appear!**

### On Computer (Allison):

1. **Open Adoras**
2. **Menu → Notification Settings**
3. **Click test button**
4. **Should see desktop notification!**

**If test fails:**
- Check browser console for errors
- Verify VAPID keys are correct
- Wait a few more minutes for changes to apply
- Try hard refresh (Ctrl+Shift+R)

---

## Step 6: Test Real-time Chat

### Setup:
1. **Computer:** Allison logged in
2. **iPhone:** Shane logged in
3. **Both:** Open browser console

### Test:

1. **Check console logs on both devices:**
   ```
   Should see:
   🔌 Setting up real-time sync...
   🔌 Connecting to real-time channel: connection:xxxxx
   ✅ Real-time channel connected!
   ```

2. **Send message from Computer (Allison):**
   - Type: "Test message 1"
   - Send

3. **Check iPhone (Shane):**
   - Message should appear **IMMEDIATELY** without refresh
   - Console shows: "📡 Received memory update"
   - Toast: "New memory from Legacy Keeper!"

4. **Reply from iPhone (Shane):**
   - Type: "Test reply 1"
   - Send

5. **Check Computer (Allison):**
   - Reply appears immediately without refresh

---

## Troubleshooting

### VAPID Keys Not Working

**Error:** "Push notifications not configured"

**Solutions:**
1. Verify keys are exactly as generated (no extra spaces)
2. Make sure both public AND private keys are set
3. VAPID_SUBJECT must start with `mailto:`
4. Try regenerating keys and setting again
5. Wait 5 minutes after setting keys

### Realtime Not Connecting

**Error:** "Real-time channel error - will retry"

**Solutions:**
1. Verify Realtime is enabled in dashboard
2. Wait 2-3 minutes after enabling
3. Hard refresh browser (Ctrl+Shift+R)
4. Check Supabase status page for outages
5. Try different network (WiFi vs mobile data)

### WebSocket Not Connecting

**Check Network tab in DevTools:**
- Filter by "WS"
- Should see: `wss://...supabase.co/realtime/v1/websocket`
- If not there: Realtime is disabled OR blocked by firewall

**Try:**
1. Different browser (Chrome/Safari/Edge)
2. Different network
3. Disable VPN if using one
4. Check corporate firewall settings

### Notifications Permission Denied

**On iOS:**
1. Settings → Adoras → Notifications
2. Toggle "Allow Notifications" ON
3. Return to app and try again

**On Desktop:**
1. Browser settings → Permissions → Notifications
2. Find your Adoras URL
3. Change to "Allow"

---

## Security Notes

### VAPID Keys Are Sensitive!

- **Private Key:** Must NEVER be exposed to frontend
- **Public Key:** Safe to use in frontend
- **Subject:** Should be a real email you own

### Where They're Used:

```
Frontend (Safe):
- Uses VAPID_PUBLIC_KEY to subscribe

Backend (Secure):
- Uses VAPID_PRIVATE_KEY to sign notifications
- Uses VAPID_SUBJECT as sender identity
```

### Keep Private Key Secret:

- ✅ Stored in Supabase Edge Function secrets (secure)
- ✅ Only accessible by server code
- ❌ Never sent to browser
- ❌ Never committed to git
- ❌ Never shared publicly

---

## What Happens After Setup

### Push Notifications:

1. User enables notifications
2. Browser creates subscription
3. Subscription sent to server
4. Server stores subscription with user ID
5. When memory is shared:
   - Server gets recipient's subscription
   - Server signs notification with VAPID_PRIVATE_KEY
   - Push service delivers notification
   - User sees notification!

### Real-time Chat:

1. User opens chat
2. App connects to Supabase Realtime WebSocket
3. Subscribes to connection channel
4. When partner sends message:
   - Saved to database
   - Broadcasted via Realtime
   - Partner's app receives update instantly
   - Message appears in chat immediately

---

## Success Criteria

**✅ VAPID Keys Working:**
- Test notification appears
- No "not configured" errors
- Badge count updates (iOS)

**✅ Realtime Working:**
- Console shows "Real-time channel connected"
- Messages appear without refresh
- Typing indicators work
- Presence (online/offline) works

**✅ Full Integration:**
- Send message on computer → appears on phone instantly
- Send message on phone → appears on computer instantly
- Close app → still receive push notifications
- Badge count updates automatically

---

## Common Mistakes to Avoid

### ❌ Wrong VAPID Subject Format

**Wrong:**
```
your-email@example.com
```

**Correct:**
```
mailto:your-email@example.com
```

Must include `mailto:` prefix!

### ❌ Keys in Wrong Secrets

**Wrong:**
- VAPID_PUBLIC_KEY contains private key
- VAPID_PRIVATE_KEY contains public key

**Correct:**
- Public key → VAPID_PUBLIC_KEY (starts with B...)
- Private key → VAPID_PRIVATE_KEY (different, longer)

### ❌ Not Waiting After Changes

**Wrong:**
- Enable Realtime → test immediately → fails

**Correct:**
- Enable Realtime → wait 2 minutes → test → works

### ❌ Testing in Safari Instead of PWA

**Wrong:**
- Open in Safari browser
- Try to enable notifications
- Doesn't work on iOS

**Correct:**
- Install as PWA (Add to Home Screen)
- Open from home screen
- Enable notifications
- Works!

---

## Final Checklist

Before testing, verify:

- [ ] VAPID keys generated with `npx web-push generate-vapid-keys`
- [ ] VAPID_PUBLIC_KEY added to Supabase secrets
- [ ] VAPID_PRIVATE_KEY added to Supabase secrets
- [ ] VAPID_SUBJECT added as `mailto:your@email.com`
- [ ] Supabase Realtime enabled in dashboard
- [ ] Waited 2 minutes after enabling Realtime
- [ ] Hard refreshed Adoras app on both devices
- [ ] iOS: App installed as PWA (not Safari)
- [ ] iOS: "Adoras" appears in Settings app
- [ ] Opened browser console on both devices

Now test:

- [ ] Test notification works on iPhone
- [ ] Test notification works on computer
- [ ] Console shows "Real-time channel connected" on both
- [ ] Send message from computer → appears on iPhone instantly
- [ ] Send message from iPhone → appears on computer instantly
- [ ] Badge count updates on iOS

---

## Next Steps

Once both are working:

1. ✅ Real-time chat is live!
2. ✅ Push notifications are live!
3. ✅ Users stay connected even when app is closed
4. ✅ Badge counts update automatically
5. ✅ Typing indicators work
6. ✅ Online/offline presence works

**You're all set!** 🎉

