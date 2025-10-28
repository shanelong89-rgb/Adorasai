# 📱 iOS PWA Push Notifications - Complete Setup Guide

## What Changed

### ✅ New Features

1. **First-Time Login Notification Prompt**
   - Shows popup after first successful login
   - Platform-specific instructions for iOS/Android
   - Guides iOS users through PWA installation
   - One-click notification enablement
   - Never shows again after being dismissed

2. **iOS PWA Detection & Guidance**
   - Automatically detects if app is running as PWA
   - Shows installation instructions if not installed
   - Provides step-by-step guide for adding to home screen
   - Verifies standalone mode before enabling notifications

3. **Enhanced Notification Settings**
   - iOS-specific tips and instructions
   - Badge icon configuration guidance
   - Settings app navigation help
   - Platform detection and status display

---

## How It Works

### First Login Flow

```
User logs in for first time
         ↓
Dashboard loads (1.5s delay)
         ↓
Check: Already subscribed to push?
         ↓
    ┌────NO─────┐
    ↓            ↓
Show prompt   Skip (already enabled)
    ↓
iOS Device?
    ↓
┌───YES───┬───NO───┐
↓         ↓         ↓
PWA?    Show       Skip
    ↓   standard
┌─YES─┬─NO─┐  prompt
↓     ↓     ↓
Show  Show  Enable
enable install notifications
notif guide
```

### iOS PWA Installation Detection

The app checks if it's running as a PWA using:
- `window.matchMedia('(display-mode: standalone)')`
- `window.navigator.standalone` (iOS-specific)
- `document.referrer.includes('android-app://')` (Android)

### Notification Permission States

| State | Meaning | Action |
|-------|---------|--------|
| `default` | Not asked yet | Show enable button |
| `granted` | Enabled | Show success message |
| `denied` | Blocked | Show iOS Settings instructions |

---

## iOS-Specific Requirements

### Why PWA Installation is Required

Apple's iOS has **strict requirements** for push notifications:

1. ✅ **Must be installed to home screen** (not running in Safari)
2. ✅ **Must be opened from home screen icon** (not from Safari bookmarks)
3. ✅ **Requires iOS 16.4+** for Web Push support
4. ✅ **Must have valid manifest.json** with proper icons
5. ✅ **Service worker must be registered** and active

### Checking if PWA is Properly Installed

**To verify PWA installation on iOS:**

1. **App appears in home screen** - Look for Adoras icon
2. **App appears in iOS Settings** - Go to Settings, scroll down, find "Adoras"
3. **Runs in fullscreen** - No Safari URL bar when opened
4. **Settings → Adoras exists** - This is the KEY indicator

**If "Adoras" doesn't appear in iOS Settings:**
- App is NOT properly installed as PWA
- Running in Safari browser mode
- Notifications will NOT work
- Must reinstall following steps below

---

## Step-by-Step: Enable Notifications on iOS

### Step 1: Install PWA to Home Screen

1. **Open Safari** on iPhone
2. **Navigate** to your Adoras URL
3. **Tap Share button** (⬆️) at bottom of screen
4. **Scroll down** in share sheet
5. **Tap "Add to Home Screen"**
6. **Tap "Add"** in top right corner
7. **Find Adoras icon** on home screen

### Step 2: Launch from Home Screen

🚨 **CRITICAL:** Must open from home screen, NOT Safari!

1. **Close Safari** completely
2. **Tap Adoras icon** on home screen
3. **App opens fullscreen** (no Safari UI)

### Step 3: Enable Notifications in App

1. **Login** to Adoras
2. **Notification popup appears** automatically
3. **Tap "Enable Notifications"**
4. **Allow** when iOS prompts for permission

### Step 4: Configure iOS Settings (Optional)

1. Open **iOS Settings** app
2. Scroll down to find **"Adoras"**
3. Tap **"Notifications"**
4. Enable these options:
   - ✅ Allow Notifications
   - ✅ Badge App Icon (shows notification count)
   - ✅ Sounds
   - ✅ Lock Screen
   - ✅ Notification Center
   - ✅ Banners

### Step 5: Verify It's Working

1. **Test notification**: Menu → Notification Settings → Test button
2. **Should see**: Notification banner appears
3. **App icon**: Shows red badge with count
4. **Lock screen**: Notification appears even when locked

---

## Troubleshooting

### Issue: "Adoras" Not in iOS Settings

**Problem:** App not recognized as installed PWA

**Solution:**
1. Delete app from home screen (long-press → Remove App)
2. Clear Safari cache: Settings → Safari → Clear History and Website Data
3. Reinstall using Safari (not other browsers)
4. Make sure to:
   - Add from Safari's Share button
   - Open from home screen icon (not Safari)
   - Don't use "Open in Safari" link

### Issue: Notification Permission Denied

**Problem:** Accidentally clicked "Don't Allow"

**Solution:**
1. Open **iOS Settings**
2. Find **"Adoras"** in app list
3. Tap **"Notifications"**
4. Toggle **"Allow Notifications"** ON
5. Return to Adoras app
6. Go to Menu → Notification Settings
7. Should now work

### Issue: No Notification Popup Appears

**Problem:** First-time prompt not showing

**Solution:**
1. Already dismissed or already subscribed
2. Clear app data:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```
3. Log out and log back in
4. Prompt should appear again

### Issue: Notifications Work but No Badge Count

**Problem:** Badge not showing on app icon

**Solution:**
1. iOS Settings → Adoras → Notifications
2. Enable **"Badge App Icon"**
3. That's it! Badges should now appear

### Issue: Running iOS 16.3 or Earlier

**Problem:** iOS too old for Web Push

**Solution:**
- Update to iOS 16.4 or later
- Or use Android device
- Web Push requires iOS 16.4+ minimum

---

## For Developers

### How to Test

**Test on real iOS device (required):**
1. Can't test in Safari on Mac (not supported)
2. Must use actual iPhone/iPad
3. iOS 16.4+ required
4. Must be installed as PWA

**Clear test data:**
```javascript
// In console:
localStorage.removeItem('adoras_notification_prompt_shown');
location.reload();
```

### Check PWA Status

```javascript
// In console:
console.log({
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  isStandaloneIOS: window.navigator.standalone,
  permission: Notification.permission,
  supported: 'Notification' in window && 'serviceWorker' in navigator
});
```

### Force Show Prompt

```javascript
// In console:
localStorage.removeItem('adoras_notification_prompt_shown');
// Then trigger by reloading or going to dashboard
```

---

## VAPID Keys Still Required

🚨 **IMPORTANT:** For notifications to actually work, you still need to:

1. **Generate VAPID keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add to Supabase**:
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Add these environment variables:
     - `VAPID_PUBLIC_KEY`
     - `VAPID_PRIVATE_KEY`
     - `VAPID_SUBJECT` = `mailto:your@email.com`

3. **Without VAPID keys:**
   - Subscribe will fail silently
   - Test notifications won't send
   - No error shown to user (graceful degradation)

---

## What Users See

### First Login - iOS (Not Installed)

```
┌────────────────────────────────────┐
│  📱 Install Adoras First           │
│                                    │
│  iOS requires the app to be        │
│  installed                         │
│                                    │
│  📋 Follow these steps:            │
│                                    │
│  1️⃣ Tap Share button ⬆️           │
│  2️⃣ Tap "Add to Home Screen"      │
│  3️⃣ Tap "Add"                     │
│  4️⃣ Open from home screen         │
│  5️⃣ Enable notifications          │
│                                    │
│         [I'll Do This Later]       │
└────────────────────────────────────┘
```

### First Login - iOS (Installed)

```
┌────────────────────────────────────┐
│  🔔 Stay Connected                 │
│                                    │
│  Get notified when memories are    │
│  shared                            │
│                                    │
│  ✓ New Memories                    │
│    Get notified when John shares   │
│                                    │
│  ✓ Daily Prompts                   │
│    Gentle reminders to share       │
│                                    │
│  ✓ Never Miss a Moment             │
│    Stay in touch                   │
│                                    │
│  [Maybe Later] [Enable ✓]          │
└────────────────────────────────────┘
```

### Success Screen

```
┌────────────────────────────────────┐
│  ✅ All Set! 📱                    │
│                                    │
│  Notifications are enabled         │
│                                    │
│  💡 iOS Tips:                      │
│  • Settings → Adoras → Notifications│
│  • Enable "Badge App Icon"         │
│  • Customize sounds and alerts     │
│                                    │
│  📝 Customize anytime              │
│  Menu → Notification Settings      │
│                                    │
│            [Got It!]               │
└────────────────────────────────────┘
```

---

## Files Changed

### New Files
- `/components/NotificationOnboardingDialog.tsx` - First-time notification prompt

### Modified Files
- `/components/AppContent.tsx` - Added dialog integration and first-login detection
- `/components/NotificationSettings.tsx` - Enhanced iOS guidance (previous update)
- `/public/manifest.json` - Fixed icon types and permissions (previous update)
- `/public/sw.js` - Badge API support (previous update)

---

## Testing Checklist

### iOS Testing

- [ ] Install PWA to home screen
- [ ] Open from home screen icon
- [ ] Login for first time
- [ ] See notification onboarding popup
- [ ] Enable notifications
- [ ] Check "Adoras" appears in iOS Settings
- [ ] Enable "Badge App Icon" in Settings
- [ ] Send test notification from app
- [ ] Verify notification appears
- [ ] Verify badge count shows on icon
- [ ] Lock phone and send another test
- [ ] Verify notification on lock screen

### Android Testing

- [ ] Install PWA
- [ ] Login for first time
- [ ] See notification popup
- [ ] Enable notifications
- [ ] Send test notification
- [ ] Verify notification appears

### Desktop Testing

- [ ] Login for first time
- [ ] See notification popup
- [ ] Enable notifications
- [ ] Send test notification
- [ ] Verify desktop notification

---

## Summary

✅ **First-time notification prompt** guides users through setup
✅ **iOS PWA detection** ensures proper installation before enabling
✅ **Platform-specific instructions** for iOS/Android
✅ **Badge support** on iOS when properly configured
✅ **One-time popup** that never shows again
✅ **Graceful degradation** if notifications aren't supported

**Next Steps:**
1. Generate and add VAPID keys to Supabase
2. Test on real iOS device (iPhone with iOS 16.4+)
3. Verify "Adoras" appears in iOS Settings after installation
4. Test notification delivery end-to-end
