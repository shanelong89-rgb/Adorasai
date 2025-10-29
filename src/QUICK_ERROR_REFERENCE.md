# Quick Error Reference Card

## 🚨 If You See These - Don't Worry!

### ℹ️ Info Messages (Always Safe to Ignore)
```
ℹ️ Connection requests check skipped (server may be slow or unavailable)
ℹ️ No partner connection yet - skipping notification (this is normal)
ℹ️ Real-time features are disabled due to repeated connection failures
```
**What to do:** Nothing. App is working fine.

---

### ⚠️ Warnings (Usually Safe to Ignore)
```
⚠️ Slow operation detected: [operation] took [time]ms
```
**What to do:** 
- If it's a one-time thing → Ignore (cold start)
- If it happens every time → Check network speed

---

## 🔴 If You See These - Take Action!

### Login Errors
```
Sign in failed: Invalid login credentials
```
**Quick Fix:**
1. New user? → Click "Create New Account"
2. Existing user? → Check email spelling & password
3. See blue solutions box for more help

---

### Network Errors
```
💥 Network Error: Failed to fetch
Cannot connect to server - edge function may not be deployed
```
**Quick Fix:**
1. Wait 30 seconds (cold start)
2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Check internet connection
4. If persistent → Contact developer

---

## 📱 Console Markers Guide

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✅ | Success | None needed |
| ℹ️ | Info | Safe to ignore |
| ⚠️ | Warning | Usually safe to ignore |
| ❌ | Error | Check the message |
| 💥 | Critical | Report to developer |

---

## 🔧 Quick Diagnostic Steps

### "I Can't Sign In"
1. Have you signed up? If no → Click "Create New Account"
2. Check email spelling
3. Check password (try typing in notepad first)
4. See blue solutions box on login screen

### "App Won't Load"
1. Wait 30 seconds
2. Hard refresh (Ctrl+Shift+R)
3. Clear cache (DevTools > Application > Clear Storage)
4. Try again

### "Nothing Happens When I Click"
1. Check browser console (F12)
2. Look for red ❌ errors
3. Screenshot and report

---

## 📞 When to Report an Error

**Report if:**
- ❌ Error appears every time you try something
- 💥 App crashes or becomes unresponsive  
- 🔴 You can't use a core feature (send messages, upload media, etc.)
- 🔄 Problem persists after refresh and retry

**Don't report if:**
- ℹ️ Message starts with "Info"
- ⚠️ Only happens once (cold start)
- 🟢 App still works fine
- 📝 Already mentioned in this guide as "safe to ignore"

---

## 🎯 Most Common Issues & 1-Second Fixes

| Issue | 1-Second Fix |
|-------|--------------|
| Can't sign in | Click "Create New Account" if new |
| Server not responding | Wait 30 seconds |
| Slow first load | Expected - cold start |
| No notifications | Need to connect with partner first |
| Console warnings | Probably safe to ignore |

---

## 📚 More Help

- **Full Guide:** See `/ERROR_RESOLUTION_GUIDE.md`
- **Login Help:** See `/SIGNIN_ERROR_RESOLUTION.md`
- **All Fixes:** See `/ERRORS_FIXED_SUMMARY.md`

---

**Last Updated:** January 28, 2025
