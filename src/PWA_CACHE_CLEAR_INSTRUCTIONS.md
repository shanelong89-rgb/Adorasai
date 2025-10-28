# 🔄 PWA Cache Clear Instructions

## Issue
You're seeing an old version of the Notifications UI even though the code has been updated.

## Root Cause
**PWA Service Worker is caching the old JavaScript files.** When you make code changes, the PWA may continue showing the cached version until the service worker updates.

---

## ✅ Solution: Force PWA Update

### **Method 1: Complete PWA Reinstall (RECOMMENDED)**

#### **On iOS:**
```
1. Long-press the Adoras app icon on home screen
2. Tap "Remove App"
3. Confirm deletion
4. Open Safari
5. Go to your Adoras URL
6. Tap Share button ⬆️
7. Scroll and tap "Add to Home Screen"
8. Open from home screen
9. ✅ Should now show new UI
```

#### **On Android:**
```
1. Long-press Adoras app icon
2. Tap "App info" or "ⓘ"
3. Tap "Storage"
4. Tap "Clear Data" and "Clear Cache"
5. Go back and tap "Uninstall"
6. Open Chrome
7. Go to your Adoras URL
8. Tap menu (⋮) → "Install app"
9. ✅ Should now show new UI
```

---

### **Method 2: Hard Refresh (Desktop/Mobile Browser)**

If testing in browser (not PWA):

#### **Desktop:**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Safari: `Cmd+Option+R` (Mac)

#### **Mobile Safari:**
```
1. Open Adoras in Safari
2. Tap address bar
3. Tap reload button while holding it
4. Select "Request Desktop Website" then reload again
```

#### **Mobile Chrome:**
```
1. Open Adoras in Chrome
2. Tap menu (⋮)
3. Select "Settings"
4. Select "Privacy"
5. Select "Clear browsing data"
6. Check "Cached images and files"
7. Tap "Clear data"
8. Reload the page
```

---

### **Method 3: Service Worker Manual Update**

If you can access Developer Tools:

#### **Desktop Chrome:**
```
1. Open Adoras
2. Press F12 to open DevTools
3. Go to "Application" tab
4. Click "Service Workers" in left sidebar
5. Click "Unregister" next to your service worker
6. Check "Update on reload"
7. Close DevTools
8. Hard refresh (Ctrl+Shift+R)
```

#### **Mobile Safari (with Mac):**
```
1. Connect iPhone to Mac
2. Open Safari on Mac
3. Develop → [Your iPhone] → Adoras
4. Go to Console
5. Type: navigator.serviceWorker.getRegistrations().then(r => r.forEach(w => w.unregister()))
6. Press Enter
7. Reload Adoras on iPhone
```

---

### **Method 4: Clear All PWA Data**

#### **iOS:**
```
1. Settings → Safari → Advanced
2. Tap "Website Data"
3. Search for your Adoras domain
4. Swipe left → Delete
5. Or tap "Remove All Website Data"
6. Reinstall PWA from home screen
```

#### **Android:**
```
1. Settings → Apps → Adoras
2. Storage → Clear Storage
3. Storage → Clear Cache
4. Reinstall PWA
```

---

## 🧪 How to Verify New UI is Loaded

### **Check 1: Look for New Features**
Open Notifications settings. You should see:
- ✅ Large status card at top (iOS Setup Required or Permission Status)
- ✅ "Enable Notifications" / "Disable Notifications" buttons
- ✅ iOS-specific alerts and warnings
- ✅ "Show Diagnostic Tool" button (iOS only)
- ✅ Green/Blue/Orange/Red alert cards
- ✅ Detailed notification preferences (New Memories, Daily Prompts, etc.)

### **Check 2: Console Log**
Open browser console and tap the Notifications menu item. You should see:
```
🔔 Notifications Dialog Rendering: { isOpen: true, userId: "xxx..." }
```

### **Check 3: Component Structure**
The NEW UI should have:
- Multiple Card components (not just one dialog)
- Status badges (Enabled/Disabled/Not Supported)
- Detailed iOS instructions
- Test notification button
- Diagnostic tool option (on iOS)

The OLD UI (what you're seeing) has:
- Simple toggle switches
- Quiet Hours time range
- Cancel/Save Changes buttons
- No status cards or badges

---

## 🔍 Debugging: Which Version Am I Seeing?

### **OLD Version (Cached):**
```
┌─────────────────────────────────┐
│ 🔔 Notification Settings        │
├─────────────────────────────────┤
│ NOTIFY ME ABOUT                 │
│                                 │
│ 📷 New Memories        [Toggle] │
│ 💬 New Messages        [Toggle] │
│ 📅 Daily Prompts       [Toggle] │
│ 🔔 Weekly Digest       [Toggle] │
│                                 │
│ Quiet Hours                     │
│ 9 PM - 8 AM                     │
│                                 │
│ [Cancel]    [Save Changes]      │
└─────────────────────────────────┘
```

### **NEW Version (Updated):**
```
┌─────────────────────────────────┐
│ 🔔 Notification Settings        │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎉 iMessage Notifications   │ │
│ │ (Green alert - if granted)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📱 iOS Setup Required       │ │
│ │ (Blue alert - if not PWA)   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Push Notifications          │ │
│ │ Status: [Badge]             │ │
│ │                             │ │
│ │ [Enable Notifications]      │ │
│ │ or                          │ │
│ │ [Disable] [🧪 Test]         │ │
│ │                             │ │
│ │ [🔧 Show Diagnostic Tool]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Notification Preferences    │ │
│ │                             │ │
│ │ New Memories       [Switch] │ │
│ │ Daily Prompts      [Switch] │ │
│ │ etc...                      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

If you're seeing the OLD version, the PWA cache needs to be cleared!

---

## 📝 Expected File Changes

These files were updated:

1. ✅ `/components/Notifications.tsx` - Simplified to wrapper only
2. ✅ `/components/NotificationSettings.tsx` - Fixed setState issue, added diagnostic
3. ✅ `/components/NotificationDiagnostic.tsx` - NEW comprehensive diagnostic tool

---

## ⚡ Quick Test Command

Open browser console and run:
```javascript
// Check if new NotificationDiagnostic component exists
console.log('NotificationDiagnostic exists:', 
  document.querySelector('[class*="diagnostic"]') !== null
);

// Check component version in console
// Look for this log when opening notifications:
// "🔔 Notifications Dialog Rendering:"
```

---

## 🎯 After Cache Clear

Once you've cleared the cache and reinstalled:

1. **Open Adoras** from home screen
2. **Tap menu** (≡) in top left
3. **Tap "Notifications"**
4. **You should see:**
   - Large status cards
   - iOS-specific alerts
   - Enable/Disable buttons
   - Diagnostic tool option
   - Detailed preferences

---

## 🆘 Still Seeing Old UI?

If after all methods you still see the old UI:

### **Nuclear Option:**
```
1. Delete Adoras PWA
2. Clear all Safari/Chrome data
3. Restart your device
4. Open browser and go to Adoras
5. Sign in
6. Add to Home Screen
7. Open from home screen
8. Check notifications
```

### **Verify Deployment:**
Check that your hosting platform has the latest code:
- If using Supabase/Netlify/Vercel, verify the deployment timestamp
- Check git commits to ensure changes were pushed
- Review build logs for any errors

---

## ✅ Success Indicators

**You know the cache is cleared when:**
- ✅ Notifications dialog shows multiple Card components
- ✅ You see status badges (Enabled/Disabled)
- ✅ iOS-specific alerts appear (blue/green/orange)
- ✅ "Show Diagnostic Tool" button visible (on iOS)
- ✅ Console shows: `🔔 Notifications Dialog Rendering:`
- ✅ No "Save Changes" button at bottom
- ✅ Enable/Disable buttons instead of toggles

---

## 🔄 Auto-Update Behavior

**How PWA updates work:**
1. Service worker checks for updates on app launch
2. Downloads new files in background
3. Updates on NEXT app restart (not immediate)
4. Shows "Update Available" prompt (if configured)

**To force immediate update:**
- Delete and reinstall (Method 1)
- Or use developer tools (Method 3)

---

**Remember:** PWAs cache aggressively for offline support. This is a feature, not a bug! But it means you need to manually clear cache when testing new code.

