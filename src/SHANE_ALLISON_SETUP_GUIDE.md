# 📱 Shane & Allison - Notification Setup Guide

## ✅ What Just Changed

**Good news!** I've automated the notification setup process. Here's what's now working:

### For Both of You

- 🎯 **Automatic popup** - Shows automatically when you log in for the first time
- 📱 **One-click enable** - Just click "Enable Notifications" and allow
- 🔔 **Push notifications** - Get notified when your partner shares a memory
- ⚡ **Real-time chat** - Messages appear instantly without refresh
- 🔴 **Badge counts** (iOS) - App icon shows unread count
- 💾 **One-time setup** - Never see the popup again

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Allison Adds VAPID Keys (5 minutes)

**Allison, you need to add 3 environment variables to Supabase:**

1. **Go to:** https://supabase.com/dashboard
2. **Click** on the Adoras project
3. **Click** Edge Functions (⚡ icon)
4. **Click** Secrets tab
5. **Click** "Add new secret"
6. **Copy/paste from** `/VAPID_KEYS_FOR_SUPABASE.txt`

**Add these 3 secrets:**

| Name | Value (from file) |
|------|-------------------|
| VAPID_PUBLIC_KEY | BNx8XqFJ... (long key) |
| VAPID_PRIVATE_KEY | 8K9L0mN1... (shorter key) |
| VAPID_SUBJECT | mailto:adoras-notifications@example.com |

7. **Click Save** after each one

---

### Step 2: Allison Enables Realtime (1 minute)

**Still in Supabase Dashboard:**

1. **Click** Settings (⚙️ icon)
2. **Click** API
3. **Scroll down** to "Realtime"
4. **Toggle ON** (should turn green)

---

### Step 3: Wait 2 Minutes ⏱️

**Both of you wait 2 minutes!** Don't skip this.

Grab coffee ☕ or tea 🍵

**Why?** Supabase needs time to activate the changes.

---

### Step 4: Test the Automatic Popup

#### Shane (iPhone):

1. **Log out** of Adoras (if logged in)
2. **Close** the app completely
3. **Reopen** Adoras from home screen
4. **Log in** as Shane
5. **Wait for dashboard** to load
6. **After 1.5 seconds** → 🔔 Popup appears automatically!

**Expected popup:**
- If in Safari: "Install Adoras First" (shows how to add to home screen)
- If PWA already: "Stay Connected" with "Enable Notifications" button

7. **Follow the steps** in the popup
8. **Allow notifications** when iOS asks
9. **Done!** ✅

#### Allison (Computer):

1. **Log out** of Adoras (if logged in)
2. **Close all** Adoras tabs
3. **Reopen** Adoras
4. **Log in** as Allison
5. **Wait for dashboard** to load
6. **After 1.5 seconds** → 🔔 Popup appears automatically!

**Expected popup:**
- "Stay Connected" with "Enable Notifications" button

7. **Click** "Enable Notifications"
8. **Allow** when browser asks
9. **Done!** ✅

---

### Step 5: Test Push Notifications Together

**Now test that everything works:**

1. **Allison (Computer):** Send Shane a message "Test notification 🎉"
2. **Shane (iPhone):** You should:
   - Receive push notification 🔔
   - See badge count on app icon 🔴1
   - Message appears in chat without refresh ⚡
3. **Shane:** Reply "Got it! 🎊"
4. **Allison (Computer):** Reply should appear instantly! ⚡

**If both work:** 🎉 **SUCCESS!** You're all set!

---

## 🎯 What You'll Experience

### Shane (iPhone PWA)

**First Login:**
```
1. Dashboard loads
2. (1.5 seconds pass)
3. 🔔 Popup: "Install Adoras First"
   - Shows how to add to home screen
   - iOS-specific instructions
4. Follow steps → Install as PWA
5. Log in from home screen
6. Dashboard loads
7. (1.5 seconds pass)
8. 🔔 Popup: "Stay Connected"
9. Tap "Enable Notifications"
10. iOS asks permission → Allow
11. ✅ Success screen
12. Popup closes, never shows again
```

**Subsequent Logins:**
```
1. Dashboard loads
2. No popup! ✅
3. Notifications work automatically
```

**When Allison Sends Message:**
```
1. 🔔 Push notification appears
2. Badge shows: 🔴1
3. Tap notification → Opens chat
4. Message visible (no refresh needed)
5. Notification sound/vibration
```

---

### Allison (Computer)

**First Login:**
```
1. Dashboard loads
2. (1.5 seconds pass)
3. 🔔 Popup: "Stay Connected"
4. Click "Enable Notifications"
5. Browser asks permission → Allow
6. ✅ Success screen
7. Popup closes, never shows again
```

**Subsequent Logins:**
```
1. Dashboard loads
2. No popup! ✅
3. Notifications work automatically
```

**When Shane Sends Message:**
```
1. 🔔 Desktop notification appears
2. Message appears in chat (no refresh)
3. Notification sound
4. Click notification → Brings Adoras to front
```

---

## 🆘 Troubleshooting

### Popup Doesn't Appear

**Try:**
1. Make sure you're logged in
2. Make sure you see the dashboard
3. Wait full 1.5 seconds
4. Open console (F12), look for: `🔔 Showing notification onboarding`

**Force show it:**
```javascript
// In browser console (F12)
localStorage.removeItem('adoras_notification_prompt_shown');
location.reload();
```

---

### Notifications Don't Work

**Check:**

**Allison:** Did you add all 3 VAPID keys to Supabase?
- Dashboard → Edge Functions → Secrets
- Should see 3 entries: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

**Allison:** Did you enable Realtime?
- Dashboard → Settings → API → Realtime
- Toggle should be green/ON

**Both:** Did you wait 2 minutes?
- Changes need time to activate
- If just added, wait 2 more minutes

**Both:** Did you allow notifications when asked?
- Shane: Settings → Adoras → Notifications → Allow
- Allison: Browser settings → Site permissions → Notifications → Allow

---

### Real-Time Chat Doesn't Work

**Check console (F12):**

**Should see:**
```
✅ Real-time channel connected!
📡 Broadcasting memory update...
📡 Received memory update...
```

**If you see errors:**
```
❌ Real-time channel error
```

**Then:**
- Realtime not enabled yet
- Wait 2 more minutes
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

---

### iOS Badge Not Showing

**Shane, check:**
1. App installed as PWA (not Safari)?
2. Settings → Adoras → Notifications → ON?
3. Settings → Adoras → Badge App Icon → ON?

**Enable it:**
1. Open Settings app
2. Scroll down to "Adoras"
3. Toggle all notification options ON:
   - Allow Notifications
   - Badge App Icon  
   - Show on Lock Screen
   - Banner

---

## ✅ Success Checklist

**Before you say it's working:**

**Shane:**
- [ ] Saw popup automatically on first login
- [ ] Enabled notifications through popup
- [ ] Can receive push notifications from Allison
- [ ] Badge count shows on app icon
- [ ] Messages appear instantly without refresh

**Allison:**
- [ ] Added 3 VAPID keys to Supabase
- [ ] Enabled Realtime in Supabase
- [ ] Saw popup automatically on first login
- [ ] Enabled notifications through popup
- [ ] Can receive desktop notifications from Shane
- [ ] Messages appear instantly without refresh

**Both:**
- [ ] No popup appears on second login (already seen)
- [ ] Can send test notification via Menu → Notification Settings
- [ ] Console shows "Real-time channel connected"
- [ ] No errors in browser console

---

## 📊 Expected Timeline

| Time | Action | Who |
|------|--------|-----|
| 0 min | Add VAPID keys to Supabase | Allison |
| 3 min | Enable Realtime | Allison |
| 5 min | **WAIT - both of you!** | Both |
| 7 min | Log out and back in | Both |
| 8 min | Popup appears automatically | Both |
| 9 min | Enable notifications | Both |
| 10 min | Test sending messages | Both |
| 11 min | **Everything works!** 🎉 | Both |

**Total time: ~11 minutes**

---

## 🎉 What You Get

After setup:

✅ **Push notifications** - Stay connected even when app is closed
✅ **Badge counts** (iOS) - See unread count at a glance
✅ **Real-time chat** - Messages appear instantly, no refresh
✅ **Typing indicators** - See when your partner is typing
✅ **Online status** - See when your partner is online
✅ **Automatic** - Everything works seamlessly
✅ **One-time setup** - Never have to do this again
✅ **Professional** - Feels like iMessage or WhatsApp

---

## 📝 Notes

### About the VAPID Keys

**Are they safe?**
- Yes! Generated specifically for you
- Private key stays secret on server
- Public key is safe to use in browser

**Can we change them later?**
- Yes, but not necessary
- These work great for production too
- Only change if you want unique keys

**How were they generated?**
- Using standard web-push cryptography
- Same method as Google, Mozilla, etc.
- Industry-standard VAPID protocol

### About the Popup

**Why 1.5 seconds delay?**
- Gives you time to see the dashboard first
- Not intrusive or immediate
- Professional user experience

**Can we change the delay?**
- Yes, edit in `/components/AppContent.tsx`
- Line with `setTimeout(() => { ... }, 1500)`
- Change 1500 to different milliseconds

**Will it show again?**
- No! One-time per user per browser
- Stored in localStorage
- Can be reset manually if needed

---

## 🚀 You're Ready!

**Allison:** Add those 3 VAPID keys to Supabase → Enable Realtime → Wait 2 minutes

**Both:** Log out → Log back in → Popup appears automatically → Enable → Test!

**That's it!** 🎉

Need help? Check `/AUTOMATIC_NOTIFICATION_SETUP.md` for detailed troubleshooting.

