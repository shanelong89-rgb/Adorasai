# Clear PWA Cache - Quick Steps

## The Issue
PWA caches are preventing the Dashboard notch fix from showing. The code is correct, but the browser is showing the old cached version.

## Quick Fix (Choose One)

### 🚀 FASTEST - Hard Reload

**Desktop (Chrome/Edge/Firefox):**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**iPhone Safari (in browser, not PWA):**
1. Tap the refresh button in address bar
2. Keep holding until you see "Reload Without Content Blockers"
3. Release

**Android Chrome:**
1. Long press the refresh button
2. Select "Hard Reload"

---

### 🔧 MOST THOROUGH - Clear Everything

**Desktop:**
1. Open DevTools: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear storage** or **Clear site data**
4. Check ALL boxes:
   - ✅ Unregister service workers
   - ✅ Local and session storage
   - ✅ Cache storage
   - ✅ IndexedDB
5. Click **Clear site data** button
6. Hard reload: `Ctrl+Shift+R` or `Cmd+Shift+R`

**iPhone PWA (installed app):**
1. **Delete the app** from home screen (long-press > Remove App)
2. **Clear Safari cache:**
   - Settings > Safari > Clear History and Website Data
3. **Reload in Safari browser**
4. **Re-add to home screen** if desired

**Android PWA:**
1. Long-press app icon > App info
2. Storage > Clear storage and cache
3. Uninstall and reinstall from browser

---

### 💻 DEVELOPER METHOD - Service Worker Panel

**Chrome/Edge DevTools:**
1. `F12` to open DevTools
2. **Application** tab
3. Left sidebar > **Service Workers**
4. Click **Unregister** for your service worker
5. Click **Update** to get new version
6. Or click **Skip waiting** if shown
7. Refresh page

---

### ⏰ WAIT - Auto Update (No action needed)

The service worker will auto-update on next app launch (5-10 minutes)

Close and reopen the app to get the new version.

---

## Verification Steps

After clearing cache, you should see:

### ✅ Dashboard (where sidebar is)
- Background color extends to top of iPhone notch
- Color: Light cream/beige `rgb(245, 249, 233)`
- No black or white gap at the top

### ✅ WelcomeScreen (comparison)
- Dark green extends to top of notch
- Color: `rgb(54, 69, 59)`
- Both screens should behave the same way

---

## Console Verification

Open DevTools Console and look for:
```
[SW] Installing service worker...
[SW] Deleting old cache: adoras-v1
[SW] Activating service worker...
```

If you see these messages, the cache was cleared successfully!

---

## Still Not Working?

### Check Service Worker Version
1. DevTools > Application > Service Workers
2. Look for version in the script URL
3. Should see `v2` in cache names

### Force Update Button
1. DevTools > Application > Service Workers
2. Check "Update on reload" checkbox
3. Refresh the page

### Nuclear Option - Incognito/Private Mode
1. Open app in Incognito/Private browsing
2. This bypasses ALL caches
3. You'll see the latest version immediately
4. If it works here, your cache needs clearing

---

## Quick Test in Console

Paste this in DevTools Console to check cache version:
```javascript
caches.keys().then(keys => console.log('Caches:', keys));
```

**Expected output:**
```
Caches: ['adoras-v2', 'adoras-runtime-v2']
```

**If you see v1, cache hasn't updated yet** - use hard reload!

---

## Summary

1. **Quick:** Hard reload (`Ctrl+Shift+R`)
2. **Thorough:** DevTools > Clear site data
3. **PWA:** Delete app, clear Safari cache, reinstall
4. **Wait:** Auto-updates in 5-10 minutes

The notch fix IS DEPLOYED. You just need to see the new version! 🚀
