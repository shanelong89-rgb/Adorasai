# 📱 iOS Safari Feature Flags Guide for Adoras PWA

## ⚠️ Important: You Don't Need to Change Feature Flags!

**Good news:** For Adoras PWA to work fully on iOS, you **DO NOT** need to enable any experimental Safari feature flags.

All required PWA features (notifications, home screen install, offline support) are **enabled by default** on iOS 16.4+.

---

## 🔍 What Are Safari Feature Flags?

**Location:** Settings → Safari → Advanced → Experimental Features

These are **developer testing features** for upcoming Safari capabilities. They're not needed for standard PWA functionality.

---

## ✅ Default Features (Already Enabled)

These work out-of-the-box on iOS 16.4+:

| Feature | Status | What It Does |
|---------|--------|--------------|
| **Push API** | ✅ Enabled | Allows push notifications in PWAs |
| **Notifications API** | ✅ Enabled | Shows notification popups |
| **Service Workers** | ✅ Enabled | Enables offline functionality |
| **Web App Manifest** | ✅ Enabled | Allows "Add to Home Screen" |
| **Badge API** | ✅ Enabled | Shows notification count on icon |

---

## ⚠️ If You're Curious (Advanced Users Only)

**These flags MIGHT help in rare cases, but are NOT required:**

### Push API Features
- **Push API** - Should already be ON
- **Notifications** - Should already be ON

### Service Worker Features  
- **Service Workers** - Should already be ON
- **Service Worker Fetch API** - Should already be ON

### Badge Features
- **Badge API** - Allows app icon badge counts

---

## 🚫 What You Should NOT Touch

**Avoid enabling these experimental flags:**
- Anything marked "Unstable" or "Experimental"
- Features you don't understand
- Flags that warn about breaking websites

**Why?** They can cause:
- Safari crashes
- Website compatibility issues
- Battery drain
- Unexpected behavior

---

## ✅ The ONLY Things You Need to Enable

### For Notifications to Work:

**NOT in Safari flags, but in iOS Settings:**

1. **Install App to Home Screen** (Required)
   - Safari → Share → Add to Home Screen
   
2. **Enable Notifications in iOS Settings** (Required)
   - Settings → Adoras → Notifications → Allow Notifications ON

3. **Enable Badge Icon** (Optional but Recommended)
   - Settings → Adoras → Notifications → Badge App Icon ON

---

## 🔧 If Notifications Still Don't Work

**Check these (NOT feature flags):**

### 1. iOS Version
```
Settings → General → About → Software Version
```
**Required:** iOS 16.4 or newer

### 2. App Installation
```
Check if Adoras icon is on your home screen
```
**If not:** Reinstall using "Add to Home Screen"

### 3. App Mode
```
Open Adoras FROM home screen icon (not Safari)
```
**Must open from:** Home screen icon

### 4. Notification Settings
```
Settings → Adoras → Notifications
```
**Must be ON:**
- Allow Notifications
- Lock Screen (optional)
- Notification Center (optional)
- Banners (optional)

### 5. Focus Mode
```
Settings → Focus
```
**Check:** Do Not Disturb is not blocking Adoras

---

## 🎯 TL;DR

**For Adoras PWA on iOS:**

✅ **DO:**
- Use iOS 16.4 or newer
- Install app to home screen
- Enable notifications in Settings → Adoras
- Open from home screen icon

❌ **DON'T:**
- Change Safari feature flags (not needed!)
- Enable experimental features
- Touch advanced settings

---

## 🆘 Still Having Issues?

**Not a feature flag problem!** Check:

1. App installed correctly?
2. Opening from home screen icon?
3. iOS 16.4+ version?
4. Notifications enabled in Settings → Adoras?
5. Not in Do Not Disturb mode?

---

**Remember:** Safari feature flags are for web developers testing new features. Adoras works perfectly without touching them!

