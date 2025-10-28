# 🔔 Mobile Notification Troubleshooting Guide

## ❌ Problem: No Notifications on Mobile

**Symptoms:**
- No push notifications appearing
- No badges on app icon
- No banners or alerts

---

## ✅ Step-by-Step Diagnostic

### Step 1: Check VAPID Keys in Supabase (CRITICAL!)

**This is the #1 reason notifications don't work!**

**Go to:** https://supabase.com/dashboard
1. Select your Adoras project
2. Click **Edge Functions** (⚡ icon)
3. Click **Secrets** tab
4. **Check if these 3 secrets exist:**
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

**If they DON'T exist:**
- Notifications WILL NOT WORK! ❌
- **Add them now** from `/VAPID_KEYS_FOR_SUPABASE.txt`
- Wait 2 minutes after adding
- Restart your app

**If they DO exist:**
- ✅ Continue to Step 2

---

### Step 2: Check Supabase Realtime Enabled

**Go to:** https://supabase.com/dashboard
1. Select your Adoras project
2. Click **Settings** (⚙️)
3. Click **API**
4. Scroll to **Realtime** section
5. **Check if toggle is ON (green)**

**If it's OFF:**
- Toggle it ON
- Wait 2 minutes
- Restart your app

**If it's ON:**
- ✅ Continue to Step 3

---

### Step 3: Check Browser Console Logs

**Open browser console:**
- Desktop: Press `F12`
- Mobile Safari: Settings → Safari → Advanced → Web Inspector → Enable
- Mobile Chrome: chrome://inspect

**Look for these logs when you log in:**

**✅ GOOD (Working):**
```
🔔 Showing notification onboarding for first-time user
✅ Successfully subscribed to push notifications
🔌 Setting up real-time sync...
✅ Real-time channel connected!
```

**❌ BAD (Not working):**
```
❌ VAPID key not available
❌ Push notifications not configured
❌ Failed to subscribe to push notifications
❌ Real-time channel error
```

**If you see errors:**
- Go back to Step 1 and 2
- VAPID keys likely missing or Realtime not enabled

---

### Step 4: Check Notification Permissions

#### iOS (iPhone/iPad):

**Settings App Method:**
1. Open **Settings** app on iPhone
2. Scroll down to **Adoras** (or your app name)
3. Tap it
4. Check **Notifications** section:
   - Allow Notifications: **ON** ✅
   - Lock Screen: **ON** ✅
   - Notification Center: **ON** ✅
   - Banners: **ON** ✅
   - Badge App Icon: **ON** ✅ (for badge counts)
   - Sounds: **ON** ✅

**If any are OFF:**
- Turn them all ON
- Close and reopen the app
- Test again

**In-App Check:**
1. Open Adoras
2. Menu → Notification Settings
3. Click "Test Notification" button
4. Should see notification within 2 seconds

#### Android:

**Settings App Method:**
1. Settings → Apps → Adoras
2. Notifications → **ON**
3. All notification categories → **ON**

**In-App Check:**
1. Open Adoras
2. Menu → Notification Settings
3. Click "Test Notification"

---

### Step 5: Check PWA Installation (iOS CRITICAL!)

**iOS REQUIRES the app to be installed as PWA for notifications!**

**Check if installed:**
1. Look for Adoras icon on home screen
2. When you open it, does it open in Safari or full screen?
   - **Safari with URL bar** = NOT installed ❌
   - **Full screen, no Safari UI** = Installed ✅

**If NOT installed:**
1. Open Adoras in Safari
2. Tap **Share** button (square with arrow)
3. Scroll down, tap **Add to Home Screen**
4. Tap **Add**
5. Close Safari
6. Open Adoras from **Home Screen icon**
7. Log in again
8. Should see notification popup after 1.5 seconds

**Android:**
- Not required, but recommended
- Chrome will show "Install app" prompt
- Click it to install

---

### Step 6: Test Notification Subscription

**In Adoras app:**

1. **Open Menu** (☰ icon)
2. **Click "Notification Settings"**
3. **Look at subscription status:**
   - Shows "Subscribed" ✅ = Good
   - Shows "Not subscribed" ❌ = Bad

**If "Not subscribed":**
1. Click "Enable Notifications" button
2. Browser/iOS will ask for permission
3. Click "Allow"
4. Should show "Subscribed" now

**Test it:**
1. Click **"Send Test Notification"** button
2. **Wait 2-5 seconds**
3. Should see notification appear!

**If notification appears:**
- ✅ System is working!
- Try sending a real message

**If notification DOESN'T appear:**
- Continue to Step 7

---

### Step 7: Manual Subscription Test

**Open browser console (F12):**

```javascript
// Check if notifications are supported
console.log('Notifications supported:', 'Notification' in window);
console.log('Permission:', Notification.permission);

// Check service worker
navigator.serviceWorker.ready.then(reg => {
  console.log('Service worker registered:', !!reg);
  
  // Check push subscription
  reg.pushManager.getSubscription().then(sub => {
    console.log('Push subscription:', sub ? 'EXISTS' : 'NONE');
    if (sub) {
      console.log('Endpoint:', sub.endpoint);
    }
  });
});
```

**Expected output:**
```
Notifications supported: true
Permission: "granted"
Service worker registered: true
Push subscription: EXISTS
Endpoint: https://fcm.googleapis.com/...
```

**If any are different:**
- Notifications not supported = Old browser, update it
- Permission "denied" = User denied, go to Settings and enable
- Service worker not registered = App not PWA, reinstall from home screen
- Push subscription NONE = Not subscribed, use app to subscribe

---

### Step 8: Check Backend Logs (Advanced)

**This requires Supabase access.**

**Go to:** https://supabase.com/dashboard
1. Select project
2. Click **Edge Functions**
3. Click **Logs** tab
4. Send test notification
5. **Look for:**

**✅ GOOD:**
```
Subscribing user to push notifications: user123
Push subscription saved: push_sub:user123:...
Sending push notification to user: user123
Notification sent to 1 subscriptions
```

**❌ BAD:**
```
VAPID_PUBLIC_KEY not configured
Push notifications not configured
No active subscriptions for user
```

**If you see "not configured":**
- VAPID keys missing! Go back to Step 1

**If you see "no active subscriptions":**
- User not subscribed. Go back to Step 6

---

## 🎯 Quick Checklist

**Before notifications will work, ALL must be ✅:**

### Backend Setup
- [ ] VAPID_PUBLIC_KEY added to Supabase
- [ ] VAPID_PRIVATE_KEY added to Supabase
- [ ] VAPID_SUBJECT added to Supabase
- [ ] Waited 2+ minutes after adding keys
- [ ] Supabase Realtime enabled (toggle ON)
- [ ] Waited 2+ minutes after enabling Realtime

### Frontend Setup
- [ ] App installed as PWA (iOS home screen, NOT Safari)
- [ ] Opened from home screen icon (iOS)
- [ ] Service worker registered (check console)
- [ ] User logged in successfully

### Permissions
- [ ] Browser/iOS notification permission granted
- [ ] iOS Settings → Adoras → Notifications → All ON
- [ ] iOS Settings → Adoras → Badge App Icon → ON
- [ ] User clicked "Enable Notifications" in app

### Subscription
- [ ] Notification Settings shows "Subscribed"
- [ ] Test notification button works
- [ ] Console shows "Successfully subscribed"
- [ ] No errors in console

---

## 🐛 Common Issues & Solutions

### Issue 1: "VAPID key not available"

**Cause:** VAPID keys not added to Supabase

**Solution:**
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Add all 3 keys from `/VAPID_KEYS_FOR_SUPABASE.txt`
4. Wait 2 minutes
5. Hard refresh app (Ctrl+Shift+R)

---

### Issue 2: Notifications Don't Appear on iOS

**Cause:** App not installed as PWA

**Solution:**
1. Safari → Share → Add to Home Screen
2. Open from home screen icon (NOT Safari)
3. Log in again
4. Enable notifications when prompted

**iOS WILL NOT show notifications if:**
- Opened in Safari browser ❌
- Opened via link ❌
- Not installed on home screen ❌

**iOS WILL show notifications if:**
- Installed on home screen ✅
- Opened from home screen icon ✅
- Full screen mode (no Safari UI) ✅

---

### Issue 3: Badge Count Not Showing (iOS)

**Cause:** Badge setting disabled in iOS Settings

**Solution:**
1. Settings → Adoras
2. Toggle "Badge App Icon" ON
3. Close and reopen app
4. Send test notification
5. Badge should appear on icon

---

### Issue 4: "Not Subscribed" in Notification Settings

**Cause:** User hasn't granted permission or subscription failed

**Solution:**
1. Menu → Notification Settings
2. Click "Enable Notifications"
3. Click "Allow" when iOS/browser asks
4. Should show "Subscribed" now
5. Click "Test Notification" to verify

---

### Issue 5: Test Notification Button Does Nothing

**Cause:** Backend not receiving request or VAPID keys missing

**Solution:**
1. Open browser console (F12)
2. Click "Test Notification"
3. Look for errors:
   - "VAPID key not available" → Add VAPID keys
   - "Failed to send notification" → Check Supabase logs
   - Network error → Edge function not deployed
4. Fix the error shown
5. Try again

---

### Issue 6: Real-Time Chat Not Working

**Cause:** Supabase Realtime not enabled

**Solution:**
1. Supabase Dashboard → Settings → API
2. Realtime → Toggle ON
3. Wait 2 minutes
4. Hard refresh app
5. Console should show "Real-time channel connected"

---

## 🧪 Testing Procedure

**Once everything is set up, test this way:**

### Test 1: User A Subscribes

1. User A logs in
2. Sees notification popup after 1.5s
3. Clicks "Enable Notifications"
4. Allows permission
5. Menu → Notification Settings shows "Subscribed" ✅

### Test 2: Send Test Notification

1. User A → Menu → Notification Settings
2. Click "Send Test Notification"
3. **Wait 2-5 seconds**
4. Notification should appear ✅
5. Badge count should show on app icon (iOS) ✅

### Test 3: Real Message from User B

1. User B logs in (different device)
2. User B sends message to User A
3. User A should receive notification ✅
4. Badge count updates ✅
5. Clicking notification opens chat ✅

---

## 📱 iOS-Specific Gotchas

### PWA Installation is MANDATORY

**iOS Safari does NOT support push notifications!**

**Only works if:**
- App installed on home screen ✅
- Opened from home screen icon ✅
- Running in full screen (no Safari UI) ✅

**Check:**
1. Open app from home screen
2. Look for Safari UI at top
3. If you see Safari UI = REINSTALL
4. Should see NO Safari UI = ✅

### Badge Permissions

**Separate from notification permissions!**

**Enable in Settings:**
1. Settings → Adoras
2. "Badge App Icon" → ON
3. "Notifications" → ON

**Both must be ON!**

### Notification Previews

**iOS hides content if locked:**

**Lock Screen Settings:**
1. Settings → Notifications → Show Previews
2. Change to "Always" or "When Unlocked"
3. NOT "Never"

**Per-App:**
1. Settings → Adoras
2. "Show Previews" → Always

---

## 🔧 Developer Tools

### Test in Console

**Check subscription status:**
```javascript
// Import service
import { isPushSubscribed, getNotificationPermission } from './utils/notificationService';

// Check status
console.log('Permission:', await getNotificationPermission());
console.log('Subscribed:', await isPushSubscribed());
```

**Manual subscription:**
```javascript
import { subscribeToPushNotifications } from './utils/notificationService';

// Subscribe current user
const userId = 'your-user-id';
const success = await subscribeToPushNotifications(userId);
console.log('Subscribed:', success);
```

**Send test notification:**
```javascript
import { sendTestNotification } from './utils/notificationService';

const userId = 'your-user-id';
const success = await sendTestNotification(userId);
console.log('Test sent:', success);
```

---

## ✅ Success Criteria

**When everything works, you should see:**

1. **First Login:**
   - Notification popup appears after 1.5s ✅
   - Can enable notifications in one click ✅

2. **Notification Settings:**
   - Shows "Subscribed" ✅
   - Test notification button works ✅
   - Notification appears within 2-5 seconds ✅

3. **Real Messages:**
   - Partner sends message → Notification appears ✅
   - Badge count shows on app icon (iOS) ✅
   - Clicking opens chat ✅
   - Sound/vibration plays ✅

4. **Console Logs:**
   - No errors ✅
   - "Successfully subscribed to push notifications" ✅
   - "Real-time channel connected" ✅

---

## 🆘 Still Not Working?

**If you've tried everything and it still doesn't work:**

### Check These Final Items:

1. **Browser/OS Version:**
   - iOS 16.4+ required for PWA notifications
   - Safari on iOS required (not Chrome)
   - Desktop: Chrome, Edge, or Firefox (not Safari)

2. **Network:**
   - Are you on WiFi or cellular?
   - Try switching networks
   - Firewall blocking push services?

3. **Service Worker:**
   - Console → Application → Service Workers
   - Should show "activated and running"
   - If not, click "Update" or reinstall PWA

4. **Clear Everything and Start Over:**
   ```javascript
   // In console
   localStorage.clear();
   sessionStorage.clear();
   
   // Unregister service worker
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   
   // Clear all caches
   caches.keys().then(names => {
     names.forEach(name => caches.delete(name));
   });
   ```
   
   Then:
   1. Hard refresh (Ctrl+Shift+R)
   2. Delete app from home screen (iOS)
   3. Reinstall from home screen
   4. Log in fresh
   5. Enable notifications
   6. Test again

---

## 📞 Get Specific Help

**To get help, provide this info:**

1. **Device:** iPhone 15, Android Pixel, etc.
2. **OS Version:** iOS 17.5, Android 14, etc.
3. **Browser:** Safari, Chrome, Firefox
4. **Installed as PWA?** Yes/No (home screen icon?)
5. **VAPID keys added?** Yes/No
6. **Realtime enabled?** Yes/No
7. **Console errors:** Copy/paste any errors
8. **Subscription status:** Subscribed or Not Subscribed
9. **Test notification works?** Yes/No
10. **Real messages work?** Yes/No

---

**Most likely issue: VAPID keys not added to Supabase yet!**

Check Step 1 first! 🔑

