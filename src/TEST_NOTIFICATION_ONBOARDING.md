# 🧪 Test Notification Onboarding - Quick Guide

## What to Test

You now have a **first-time login notification prompt** that appears after logging in. Here's how to test it:

---

## Test #1: First Login on iPhone (Shane Long)

### Setup
1. **On iPhone**: Delete Adoras from home screen if already installed
2. **Clear Safari data**: Settings → Safari → Clear History and Website Data
3. **Navigate to Adoras** in Safari

### Test iOS PWA Installation Flow

1. **Add to Home Screen:**
   - Tap Share button (⬆️)
   - Scroll and tap "Add to Home Screen"
   - Tap "Add"

2. **Launch from Home Screen:**
   - Close Safari
   - **Tap Adoras icon** on home screen (important!)
   - App opens fullscreen

3. **Login:**
   - Login as Shane Long
   - Wait for dashboard to load

4. **Notification Popup Should Appear:**
   - After ~1.5 seconds, popup appears
   - Title: "Stay Connected"
   - Shows benefits of notifications
   - Two buttons: "Maybe Later" | "Enable Notifications"

5. **Tap "Enable Notifications":**
   - iOS permission prompt appears
   - Tap "Allow"
   - Success screen shows
   - iOS Tips displayed

6. **Verify in iOS Settings:**
   - Go to iPhone Settings
   - Scroll down to find "Adoras"
   - **If "Adoras" appears** → ✅ PWA properly installed!
   - **If NOT appearing** → ❌ PWA not recognized, need to reinstall

7. **Configure Badge:**
   - Settings → Adoras → Notifications
   - Enable "Badge App Icon"

8. **Test Notification:**
   - In Adoras: Menu → Notification Settings
   - Tap the test button (TestTube icon)
   - Should see notification appear
   - App icon should show badge count

---

## Test #2: First Login on Computer (Allison)

### Setup
1. **On Computer**: Open incognito/private window
2. **Navigate to Adoras**

### Test Desktop Flow

1. **Login:**
   - Login as Allison
   - Wait for dashboard

2. **Notification Popup Appears:**
   - After ~1.5 seconds
   - No iOS installation step (desktop)
   - Shows benefits directly

3. **Enable:**
   - Click "Enable Notifications"
   - Browser asks for permission
   - Allow

4. **Success:**
   - Success screen shows
   - No iOS-specific tips

---

## Test #3: iOS Without PWA (Safari Mode)

### Setup
1. **On iPhone**: Open Safari (don't install PWA)
2. **Navigate to Adoras** in Safari browser

### Test Browser Detection

1. **Login:**
   - Login as Shane
   - Wait for dashboard

2. **Popup Appears:**
   - Shows "Install Adoras First" screen
   - Instructions for adding to home screen
   - Only one button: "I'll Do This Later"

3. **Cannot Enable:**
   - Enable button disabled until PWA installed
   - Clear instructions shown

---

## Test #4: Already Subscribed

### Setup
1. Already enabled notifications previously
2. Login again (or refresh)

### Expected Behavior

1. **No Popup:**
   - Notification popup does NOT appear
   - Already subscribed, so skipped
   - Marked as "shown" to prevent future display

---

## Test #5: Clear and Reset

### Reset Test Data

**To test the popup again:**

```javascript
// In browser console:
localStorage.removeItem('adoras_notification_prompt_shown');
location.reload();
```

**To fully reset:**

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Then login again → popup should appear

---

## Expected Console Logs

### When Popup Shows
```
✅ User is authenticated, redirecting to dashboard
📡 Loading connections from API...
✅ Connections loaded
[After 1.5s delay]
ℹ️ Showing notification onboarding popup
```

### When Skipped (Already Subscribed)
```
✅ User is authenticated, redirecting to dashboard
📡 Loading connections from API...
✅ Connections loaded
ℹ️ User already subscribed to notifications, skipping prompt
```

---

## Verify iOS PWA Installation

### Method 1: Check iOS Settings
1. Open Settings app
2. Scroll down
3. **Look for "Adoras"** in app list
4. ✅ If present → PWA installed correctly
5. ❌ If absent → Not a proper PWA install

### Method 2: Check in Console
```javascript
console.log({
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  isStandaloneIOS: window.navigator.standalone,
});

// Expected:
// ✅ PWA: { isStandalone: true, isStandaloneIOS: true }
// ❌ Safari: { isStandalone: false, isStandaloneIOS: false }
```

### Method 3: Visual Check
- ✅ **PWA Mode:** Fullscreen, no Safari UI, no URL bar
- ❌ **Browser Mode:** Safari UI visible, URL bar at top

---

## Common Issues & Solutions

### Issue: Popup Never Appears

**Possible causes:**
1. Already shown before (check localStorage)
2. Already subscribed to notifications
3. JavaScript error (check console)

**Solution:**
```javascript
localStorage.removeItem('adoras_notification_prompt_shown');
location.reload();
```

### Issue: "Adoras" Not in iOS Settings

**Cause:** Not installed as PWA, running in Safari

**Solution:**
1. Make sure you tapped "Add to Home Screen" in Safari
2. Make sure you opened from home screen icon (not Safari)
3. Delete and reinstall if needed
4. Don't use "Open in Safari" links

### Issue: Permission Denied on iOS

**Cause:** Clicked "Don't Allow" on permission prompt

**Solution:**
1. Settings → Adoras → Notifications
2. Toggle "Allow Notifications" ON
3. Return to app
4. Try test notification

---

## What Should Happen in Real Usage

### Shane's iPhone Journey

```
Day 1:
1. Shane clicks invite link from Allison
2. Opens in Safari
3. Creates account
4. [Popup: "Install Adoras First" - shows iOS instructions]
5. Shane adds to home screen
6. Opens from home screen
7. Logs in
8. [Popup: "Stay Connected" - shows benefits]
9. Taps "Enable Notifications"
10. iOS asks permission → Shane allows
11. [Success screen with iOS tips]
12. Shane goes to Settings → Adoras
13. Enables "Badge App Icon"
14. Done! ✅

Later:
- Shane gets notification when Allison shares a memory
- Badge shows count on app icon
- Notification appears on lock screen
- Can swipe to reply or open
```

### Allison's Computer Journey

```
Day 1:
1. Allison creates account
2. Logs in on computer
3. [Popup: "Stay Connected"]
4. Clicks "Enable Notifications"
5. Browser asks permission → Allows
6. [Success screen]
7. Done! ✅

Later:
- Allison gets desktop notification when Shane shares
- Browser notification appears
- Click to open app
```

---

## Debug Commands

### Check Notification Status
```javascript
// What's the permission state?
console.log('Permission:', Notification.permission);

// Is prompt shown flag set?
console.log('Prompt shown:', localStorage.getItem('adoras_notification_prompt_shown'));

// Are we subscribed?
navigator.serviceWorker.ready.then(async (reg) => {
  const sub = await reg.pushManager.getSubscription();
  console.log('Subscribed:', !!sub);
});
```

### Force Show Popup
```javascript
// Clear the flag
localStorage.removeItem('adoras_notification_prompt_shown');

// Reload to trigger
location.reload();

// OR manually trigger (if you have access to state)
// This won't work from console, just for reference
setShowNotificationOnboarding(true);
```

### Check Platform Detection
```javascript
console.log({
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent),
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  userAgent: navigator.userAgent
});
```

---

## Success Criteria

✅ **iOS PWA:**
- Popup shows installation instructions if not installed
- Popup shows notification enable if installed
- "Adoras" appears in iOS Settings after install
- Test notification works
- Badge appears on app icon

✅ **Desktop:**
- Popup shows on first login
- Enable button works
- Browser permission prompt appears
- Test notification works

✅ **User Experience:**
- Only shows once per user
- Clear, helpful instructions
- Platform-specific guidance
- Can skip if desired
- Can access settings later

---

## Next Action Items

**For you to test RIGHT NOW:**

1. ✅ On iPhone, delete Adoras if installed
2. ✅ Clear Safari data
3. ✅ Navigate to Adoras in Safari
4. ✅ Add to home screen
5. ✅ Open from home screen
6. ✅ Login as Shane Long
7. ✅ Watch for notification popup (1.5s delay)
8. ✅ Tap "Enable Notifications"
9. ✅ Check Settings → Adoras appears
10. ✅ Enable "Badge App Icon"
11. ✅ Test notification in app

**Report back:**
- Did popup appear? ✓ or ✗
- Does "Adoras" show in Settings? ✓ or ✗
- Did test notification work? ✓ or ✗
- Any errors in console? (paste them)

---

## Still Need VAPID Keys!

🚨 For notifications to actually send, you MUST add VAPID keys:

```bash
# Run this:
npx web-push generate-vapid-keys

# Then add to Supabase Dashboard → Functions → Secrets:
# - VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - VAPID_SUBJECT = mailto:your-email@example.com
```

Without VAPID keys:
- Popup works ✅
- Subscribe appears to work ✅
- But notifications won't actually send ❌

