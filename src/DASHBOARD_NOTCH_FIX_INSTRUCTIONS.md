# Dashboard Notch Background Fix - Instructions

## What Was Fixed

The Dashboard background now extends behind the iPhone notch (just like the WelcomeScreen) to show the ADOTAS BG color `rgb(245, 249, 233)` all the way to the top.

## Changes Made

### 1. Dashboard Component (`/components/Dashboard.tsx`)
✅ Added fixed background container that extends upward with `-top-20`
✅ Set main container background to transparent
✅ Added `paddingTop: 'env(safe-area-inset-top)'` for safe area support
✅ Updated sticky header to use `top: 'env(safe-area-inset-top)'`

### 2. Service Worker (`/public/sw.js`)
✅ Bumped cache version from `v1` to `v2`
✅ Updated both `CACHE_NAME` and `RUNTIME_CACHE`
✅ This forces PWA to clear old cached files

## How to See the Changes

### Option 1: Force Reload (Recommended - Quick)

**On Desktop:**
1. Open the app in Chrome/Edge
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. This does a hard refresh bypassing cache

**On iPhone Safari:**
1. Open Safari Developer settings
2. Go to Settings > Safari > Advanced > Website Data
3. Find your app's domain and swipe left to delete
4. Reload the page

### Option 2: Unregister Service Worker (More Thorough)

**On Desktop:**
1. Open DevTools (F12 or Right-click > Inspect)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Find your service worker and click **Unregister**
5. Click **Clear storage** > **Clear site data**
6. Reload the page (Ctrl+R or Cmd+R)

**On iPhone:**
1. Delete the PWA app from home screen (long-press > Remove App)
2. Clear Safari cache: Settings > Safari > Clear History and Website Data
3. Reload the website in Safari
4. Re-add to home screen

### Option 3: Wait for Auto-Update (Slowest)

The service worker will automatically update when:
- You close and reopen the PWA app
- The browser detects a new service worker version
- Usually takes 5-10 minutes or next app launch

## Verification

After clearing cache, you should see:
- ✅ Dashboard background color extends all the way to the top of the screen
- ✅ On iPhone with notch, the ADOTAS BG color fills the notch area
- ✅ Header sticks below the safe area (not hidden behind notch)
- ✅ Content is properly padded for safe areas

## Technical Details

### Before:
```tsx
<div className="min-h-screen bg-background ...">
  {/* Content */}
</div>
```
- Background stopped at viewport top
- Notch area showed black/white depending on OS

### After:
```tsx
<>
  <div className="fixed inset-0 -top-20 bg-background -z-10"></div>
  <div className="min-h-screen bg-transparent ..." style={{ paddingTop: 'env(safe-area-inset-top)' }}>
    {/* Content */}
  </div>
</>
```
- Fixed background extends 80px upward to cover notch
- Main container is transparent to show background
- Safe area padding keeps content below notch
- Sticky header respects safe area

## Color Reference

The background uses `bg-background` which maps to:
- CSS Variable: `--background: var(--adotas-bg)`
- Color: `rgb(245, 249, 233)` - ADOTAS BG (light cream/beige)

## If Still Not Working

### Check Browser Console
1. Open DevTools Console
2. Look for service worker messages:
   - `[SW] Installing service worker...`
   - `[SW] Activating service worker...`
   - `[SW] Deleting old cache: adoras-v1`

### Manual Cache Clear (DevTools)
1. Open DevTools > Application
2. Storage section:
   - ✅ Clear **Cache Storage**
   - ✅ Clear **Local Storage**
   - ✅ Clear **Session Storage**
   - ✅ Clear **IndexedDB**
3. Click **Clear site data** button
4. Hard reload: `Ctrl+Shift+R`

### Check if PWA or Browser
- **If in PWA (installed app):** Must uninstall and reinstall
- **If in browser:** Hard reload should work

## Timeline

1. **Immediate (Desktop):** Hard reload shows changes
2. **5 minutes (PWA):** Service worker auto-updates on next launch
3. **24 hours (iOS):** iOS may cache aggressively, delete and reinstall

## Status

✅ **Code Fixed** - Dashboard background extends behind notch
✅ **Service Worker Updated** - Cache version bumped to v2
✅ **Matches WelcomeScreen** - Same approach, consistent behavior

The fix is deployed. You just need to clear the PWA cache to see it!
