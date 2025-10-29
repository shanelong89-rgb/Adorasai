# Error Resolution Guide - Adoras App

## Overview
This guide addresses common errors you might encounter while using or testing the Adoras app.

---

## 🔐 Sign In Errors

### Error: "Sign in failed: Invalid login credentials"

#### What It Means
This error from Supabase indicates one of three issues:
1. **No account exists** (most common)
2. **Wrong password**
3. **Email not confirmed** (rare - Adoras auto-confirms)

#### Solutions

**✅ If You're a New User:**
1. Click **"Create New Account"** button
2. Complete the signup flow
3. Then try logging in

**✅ If You Have an Account:**
1. **Check your email spelling**
   - Common mistakes: `gmai.com` vs `gmail.com`
   - Case doesn't matter (emails are case-insensitive)
   
2. **Check your password**
   - Type it in a text editor first to verify
   - Check if Caps Lock is on
   - Try copying and pasting to avoid typos

3. **Verify you completed signup**
   - Did you receive a welcome email?
   - Can you remember creating the account?

**✅ For Testing (Development):**
Use these test accounts:

**Keeper (Legacy Keeper):**
- Email: `shanelong@gmail.com`
- Password: Ask developer for test password
- Name: Shane Long
- Type: Keeper

**Teller (Storyteller):**
- Email: `allison.tam@hotmail.com`  
- Password: Ask developer for test password
- Name: Allison Tam
- Type: Teller
- Connected to: Shane Long via code `FAM-2024-XY9K`

---

## 🌐 Network Errors

### Error: "Failed to fetch" / "Cannot connect to server"

#### What It Means
The frontend cannot reach the Supabase Edge Function backend.

#### Possible Causes
1. **Edge Function not deployed** (most common in development)
2. **Network connectivity issues**
3. **CORS or security blocking**
4. **Server timeout or cold start**

#### Solutions

**✅ Check Deployment:**
```bash
# Ensure the edge function is deployed
cd supabase/functions/server
# Should see deployment confirmation
```

**✅ Check Network:**
- Open browser DevTools (F12)
- Go to Network tab
- Look for failed requests
- Check response status and error details

**✅ Wait for Cold Start:**
- Supabase Edge Functions "sleep" when idle
- First request after sleep takes 10-30 seconds
- Subsequent requests are fast
- The app automatically retries

**✅ Clear Cache & Reload:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear site data in DevTools > Application > Storage
- Close and reopen browser

---

## ⚠️ Connection Request Errors

### Error: "Failed to load connection requests"

#### What It Means
The app couldn't fetch pending connection requests.

#### Impact
- **Low** - This is a non-critical feature
- You can still use the app normally
- Connection requests can be checked manually in Settings

#### Solutions

**✅ Normal Operation:**
- This error is automatically handled
- The app continues working fine
- Check connections manually: Settings > Connections

**✅ If Persistent:**
- Indicates server may be slow or unavailable
- Wait a few minutes and refresh
- Server will auto-recover from cold start

---

## 🔄 Real-time Sync Errors

### Error: "Error removing channel (channel may already be removed)"

#### What It Means
The app tried to unsubscribe from a Supabase Realtime channel that was already closed.

#### Impact
- **None** - This is expected during cleanup
- Happens when switching views or logging out
- Does not affect functionality

#### What We Did
- Added null checks before unsubscribing
- Silenced the warning (it's not really an error)
- This is normal WebSocket cleanup behavior

---

## 📱 Notification Errors

### Warning: "No connection found - cannot send notification"

#### What It Means
You tried to send a notification but don't have a partner connected yet.

#### Impact
- **None** - This is normal for new users
- You can still use all other app features

#### Solutions

**✅ For Keepers:**
1. Go to Settings > Connections
2. Click "Send Invitation"
3. Share the code with your parent/elder
4. Once they join, notifications will work

**✅ For Tellers:**
1. You'll receive an invitation code from your child
2. Enter it during signup
3. Once connected, notifications will work

---

## ⏱️ Performance Warnings

### Warning: "Slow operation detected: resource-fetch took 3154ms"

#### What It Means
A network request took longer than the performance threshold.

#### Impact
- **Low** - Request still succeeded
- Just slower than ideal
- Usually happens on:
  - Cold starts
  - Large media uploads
  - AI processing
  - Slow network connections

#### What We Did
- Increased thresholds for memory fetches (now 5s)
- Increased thresholds for AI calls (now 10s)
- Added cold start detection (18s for auth)

#### When to Worry
- Only if **every** request is slow (>10s)
- Or if the app becomes unresponsive

---

## 🛠️ Diagnostic Tools

### Built-in Diagnostics

**1. Mobile Auth Diagnostic**
- Location: Login screen > "Run Diagnostic" button
- Shows: Server status, auth flow, connection tests

**2. Notification Diagnostic**
- Location: Settings > Notifications > "Test Notifications"
- Shows: Permission status, service worker, push capability

**3. PWA Diagnostic**
- Location: Settings (if PWA install available)
- Shows: Install status, update available, cache status

### Browser DevTools

**Console Tab:**
```
Look for these markers:
✅ Success operations
❌ Critical errors
⚠️ Warnings (usually safe to ignore)
ℹ️ Informational (always safe to ignore)
```

**Network Tab:**
```
Filter by: "make-server-deded1eb"
Check: Status codes (200 = good, 401 = auth issue, 500 = server error)
```

**Application Tab:**
```
Service Workers: Should show "activated and running"
Cache Storage: Check if media is cached
Local Storage: Check for "adoras_access_token"
```

---

## 🚀 Quick Fixes

### "I Can't Sign In"
1. Have you signed up? → No? Click "Create New Account"
2. Check email spelling → Common typos
3. Check password → Try typing elsewhere first
4. Try test accounts (if developer)

### "Server Not Responding"
1. Wait 30 seconds (cold start)
2. Hard refresh (Ctrl+Shift+R)
3. Check internet connection
4. Try again in a few minutes

### "Notifications Not Working"
1. Check if you have a connection → Settings > Connections
2. Check notification permissions → Settings > Notifications
3. For iOS: Enable in Safari > Settings for This Website

### "App Feels Slow"
1. First load after idle = slow (cold start, expected)
2. Clear browser cache
3. Close other tabs
4. Check network speed

---

## 📊 Error Priority Levels

### 🔴 Critical (Must Fix)
- Cannot sign up or login
- App crashes on load
- Cannot send/receive messages

### 🟡 Medium (Should Fix)
- Features not working (e.g., voice recording)
- Persistent slow performance
- Media upload failures

### 🟢 Low (Can Ignore)
- Connection request fetch failures
- Channel cleanup warnings
- Single slow request (cold start)
- "No connection found" for new users

---

## 📞 Getting Help

### Information to Provide

When reporting an error, include:

1. **Error Message** (copy from screen or console)
2. **What You Were Doing** (e.g., "Trying to send a photo")
3. **Account Type** (Keeper or Teller)
4. **Browser & Device** (e.g., "Chrome on iPhone 14")
5. **Console Logs** (F12 > Console > screenshot)
6. **Network Logs** (F12 > Network > screenshot of failed request)

### Where to Check First

1. **This Guide** - Search for your error message
2. **Browser Console** - Look for ❌ errors
3. **Network Tab** - Check failed requests
4. **Diagnostic Tools** - Run built-in diagnostics

---

## 🔍 Error Codes Reference

### HTTP Status Codes
- **200** ✅ Success
- **400** ⚠️ Bad request (check your input)
- **401** 🔐 Unauthorized (login required)
- **403** 🚫 Forbidden (insufficient permissions)
- **404** 📭 Not found (resource doesn't exist)
- **500** 💥 Server error (backend issue)

### Common Supabase Auth Errors
- `Invalid login credentials` → Wrong email/password or no account
- `Email not confirmed` → Check inbox (rare - Adoras auto-confirms)
- `User already exists` → Account exists, use login instead
- `Invalid refresh token` → Session expired, login again

---

## ✅ Prevention Tips

### For Users
1. **Save your password** in a password manager
2. **Remember your email** - write it down if needed
3. **Check internet** before reporting errors
4. **Wait for cold starts** - first load is always slow

### For Developers
1. **Keep edge functions deployed** - don't let them sleep in production
2. **Monitor console logs** - catch errors early  
3. **Test on slow connections** - use DevTools network throttling
4. **Test cold starts** - wait 5 minutes between tests

---

## 📝 Recent Fixes Applied

### January 2025
1. ✅ **Channel cleanup warning** - Added null checks, silenced expected warnings
2. ✅ **Connection request errors** - Changed to info log, non-critical
3. ✅ **Performance thresholds** - Increased for memory/resource fetches
4. ✅ **Login error UX** - Added helpful solutions box with common fixes
5. ✅ **No connection warning** - Changed to info log for new users

---

## Summary

Most errors fall into these categories:

1. **Expected** (cold starts, cleanup, new user warnings) → Ignore
2. **User Error** (wrong credentials, no account) → Follow solutions
3. **Temporary** (network issues, slow connection) → Wait & retry
4. **Bug** (persistent failures, crashes) → Report with details

The app is designed to be resilient and will recover automatically from most errors. Only report persistent issues that prevent core functionality.

---

**Last Updated:** January 28, 2025
**App Version:** Adoras v1.0 (Production Ready)
