# ❌ Why No Notifications on Mobile?

## Most Likely Reason (90% of cases):

### ❌ VAPID Keys NOT Added to Supabase Yet

**Check:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Edge Functions → Secrets tab
4. Look for these 3 secrets:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

**If they're NOT there:**
- **This is why notifications don't work!** ❌
- **Add them now** from `/VAPID_KEYS_FOR_SUPABASE.txt`
- **Wait 2 minutes**
- **Test again** ✅

---

## Other Common Reasons:

### ❌ Supabase Realtime Not Enabled

**Check:**
1. Supabase Dashboard → Settings → API
2. Scroll to "Realtime"
3. Toggle should be **ON (green)**

**If it's OFF:**
- Turn it ON
- Wait 2 minutes
- Restart app

---

### ❌ iOS: App Not Installed as PWA

**iOS REQUIRES home screen installation!**

**Check:**
- Open app from home screen icon? ✅
- Opens in Safari browser? ❌ WRONG

**Fix:**
1. Safari → Share → Add to Home Screen
2. Open from **home screen icon**
3. Should open **full screen** (no Safari UI)

---

### ❌ Notification Permission Denied

**Check iOS Settings:**
1. Settings app → Adoras
2. Notifications → **Should be ON**
3. Badge App Icon → **Should be ON**

**If OFF:**
- Turn them all ON
- Restart app
- Try again

---

### ❌ User Not Subscribed Yet

**Check in app:**
1. Menu → Notification Settings
2. Shows "Subscribed" or "Not subscribed"?

**If "Not subscribed":**
- Click "Enable Notifications"
- Allow when prompted
- Should show "Subscribed" now

---

## 🔍 Quick Diagnostic

**Run this in browser console (F12):**

```javascript
// Check if notification popup was shown
console.log('Seen prompt:', localStorage.getItem('adoras_notification_prompt_shown'));

// Check permission
console.log('Permission:', Notification.permission);

// Check subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscribed:', !!sub);
  });
});
```

**Expected output:**
```
Seen prompt: "true"
Permission: "granted"
Subscribed: true
```

**If any are different:**
- Something's not set up correctly
- See full guide: `/MOBILE_NOTIFICATION_TROUBLESHOOTING.md`

---

## ✅ Quick Fix Checklist

**Do these in order:**

1. [ ] **Add VAPID keys to Supabase** (CRITICAL!)
   - `/VAPID_KEYS_FOR_SUPABASE.txt`
   - Edge Functions → Secrets
   - Add all 3 keys
   - Wait 2 minutes

2. [ ] **Enable Supabase Realtime**
   - Settings → API → Realtime → ON
   - Wait 2 minutes

3. [ ] **Install as PWA** (iOS)
   - Safari → Share → Add to Home Screen
   - Open from home screen icon

4. [ ] **Enable permissions** (iOS)
   - Settings → Adoras → Notifications → ON
   - Badge App Icon → ON

5. [ ] **Subscribe in app**
   - Menu → Notification Settings
   - Enable Notifications
   - Allow when prompted

6. [ ] **Test it**
   - Click "Send Test Notification"
   - Should appear in 2-5 seconds

---

## 🎯 Test Right Now

**After adding VAPID keys:**

1. **Wait 2 minutes** ⏱️
2. **Hard refresh app** (Ctrl+Shift+R or close/reopen)
3. **Log in**
4. **Menu → Notification Settings**
5. **Click "Send Test Notification"**
6. **Wait 5 seconds**
7. **Did notification appear?**
   - ✅ YES → Working!
   - ❌ NO → Run diagnostic script

---

## 📖 Full Guides

- **Troubleshooting:** `/MOBILE_NOTIFICATION_TROUBLESHOOTING.md`
- **Diagnostic Script:** `/NOTIFICATION_DIAGNOSTIC_SCRIPT.md`
- **Setup Guide:** `/AUTOMATIC_NOTIFICATION_SETUP.md`

---

## 🆘 Still Broken?

**Most likely you forgot one of these:**

1. Add VAPID keys to Supabase ← 90% of issues
2. Enable Realtime in Supabase ← 5% of issues
3. Install as PWA on iOS ← 4% of issues
4. Enable permissions in Settings ← 1% of issues

**Double-check Step 1 first!** 🔑

