# 🔍 Live Notification Debugging Guide

## Issue
Notifications are enabled for both Shane and Allison, but when one sends a message, the other doesn't receive a notification banner.

## What I Added

### ✅ Enhanced Logging

I've added comprehensive logging at every step of the notification flow:

#### **Frontend - Memory Creation (AppContent.tsx)**
When a memory is created, you'll see:
```
📱 Starting notification flow...
📱 Connection lookup:
📱 Sending notification to partner:
📱 Push notification result:
```

#### **Frontend - API Call (notificationService.ts)**
When calling the backend:
```
📱 notifyNewMemory called:
📱 Notification API response:
📱 Notification API response data:
✅ New memory notification sent successfully:
```

#### **Backend - New Memory Endpoint (notifications.tsx)**
When receiving the notification request:
```
📱 [NEW MEMORY NOTIFICATION] Request received:
📱 User preferences:
📱 Calling /send endpoint with payload:
📱 /send response status:
✅ /send success:
```

#### **Backend - Send Endpoint (notifications.tsx)**
When sending the push notification:
```
📱 [SEND] Sending push notification to user:
📱 [SEND] User subscriptions lookup:
✅ Notification sent to X subscriptions
```

---

## 🧪 How to Test (Step-by-Step)

### **Step 1: Clear Cache & Reinstall**
Both Shane and Ally need to reinstall the PWA:

**iOS:**
```
1. Delete Adoras from home screen
2. Open Safari → go to Adoras URL
3. Share → Add to Home Screen
4. Open from home screen
5. Login
```

### **Step 2: Open Browser Console (CRITICAL)**

**On iOS Safari:**
```
1. On Mac: Safari → Develop → [Your iPhone] → [Adoras PWA]
2. Or use iOS Safari Web Inspector
3. Keep console open during entire test
```

**On Desktop Chrome:**
```
1. Right-click → Inspect
2. Go to Console tab
3. Keep it open
```

### **Step 3: Send a Test Message**

**As Shane:**
```
1. Open Adoras PWA
2. Go to Chat tab
3. Type a message: "Testing notifications"
4. Send
```

**Watch Console Logs:**
Look for this sequence:

```
✅ Expected Flow:

1. Memory creation starts
2. 📱 Starting notification flow... { hasPartnerProfile: true, userName: "shane", ... }
3. 📱 Connection lookup: { foundConnection: true, partnerId: "user_abc...", partnerName: "allison tam" }
4. 📱 Sending notification to partner: { partnerUserId: "user_xyz...", senderName: "shane", ... }
5. 📱 notifyNewMemory called: { url: "...", params: {...} }
6. 📱 Notification API response: { status: 200, ok: true }
7. 📱 Notification API response data: { success: true, sent: 1 }
8. ✅ New memory notification sent successfully

Backend (check Supabase logs):
9. 📱 [NEW MEMORY NOTIFICATION] Request received: { userId: "...", senderName: "shane", ... }
10. 📱 User preferences: { newMemoriesEnabled: true, ... }
11. 📱 Calling /send endpoint with payload: { title: "💬 shane", body: "Testing notifications" }
12. 📱 [SEND] User subscriptions lookup: { subsCount: 1, subscriptions: [...] }
13. ✅ Notification sent to 1 subscriptions
```

### **Step 4: Check for Issues**

Look for these **WARNING SIGNS** in the logs:

#### ⚠️ **Problem 1: No Connection Found**
```
📱 Connection lookup: { foundConnection: false }
📱 No connection found - cannot send notification
```
**Fix:** Ensure Shane and Allison are connected in the database

#### ⚠️ **Problem 2: No Partner ID**
```
📱 Connection lookup: { foundConnection: true, partnerId: undefined }
```
**Fix:** Connection data is corrupt - check database

#### ⚠️ **Problem 3: No Subscriptions**
```
📱 [SEND] User subscriptions lookup: { subsCount: 0, subscriptions: [] }
⚠️ [SEND] No active subscriptions for user: user_xyz...
```
**Fix:** Partner hasn't subscribed to notifications yet - go to Notifications settings and enable

#### ⚠️ **Problem 4: API Call Failed**
```
📱 Notification API response: { status: 500, ok: false }
❌ Failed to send new memory notification
```
**Fix:** Backend error - check Supabase logs

#### ⚠️ **Problem 5: Preferences Disabled**
```
📱 User preferences: { newMemoriesEnabled: false }
⚠️ New memory notifications disabled for user: user_xyz...
```
**Fix:** Partner has notifications disabled - go to Settings and enable "New Memories"

---

## 🔧 Common Issues & Fixes

### **Issue 1: "No active subscriptions"**

**Problem:** The partner hasn't subscribed to push notifications

**Solution:**
```
1. Partner opens Adoras PWA
2. Tap menu (≡) → Notifications
3. Tap "Enable Notifications"
4. Grant permission when browser asks
5. Should see "Status: Subscribed ✅"
```

**Verify:**
```javascript
// In console, run:
const { isPushSubscribed } = await import('./utils/notificationService');
const subscribed = await isPushSubscribed();
console.log('Subscribed:', subscribed);
```

### **Issue 2: Subscriptions Exist but Notifications Don't Show**

**Problem:** iOS may not show notifications if:
- App is in foreground
- Notifications are muted in iOS Settings
- Service Worker isn't registered

**Solution (iOS):**
```
1. Close Adoras PWA completely (swipe up from app switcher)
2. Go to iOS Settings → Notifications → Safari
3. Ensure "Allow Notifications" is ON
4. Ensure notification style is "Banners" or "Alerts"
5. Reopen Adoras PWA
6. Lock phone
7. Send message from other device
8. Should see banner on lock screen
```

**Solution (Service Worker):**
```javascript
// In console, check service worker status:
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Push Manager:', reg.pushManager);
});
```

### **Issue 3: Quiet Hours**

**Problem:** Notifications are being suppressed due to quiet hours

**Check:**
```
📱 User preferences: { 
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00" 
}
```

**Solution:**
```
1. Open Notifications settings
2. Scroll to "Quiet Hours"
3. Disable quiet hours or adjust time
4. Save preferences
```

### **Issue 4: Browser Doesn't Support Push**

**Check:**
```javascript
// In console:
console.log('Notification' in window); // Should be true
console.log('serviceWorker' in navigator); // Should be true
console.log('PushManager' in window); // Should be true
console.log(Notification.permission); // Should be "granted"
```

**iOS Requirement:**
- Must be installed as PWA (Add to Home Screen)
- Must have granted notification permission
- Must have Safari 16.4+ (iOS 16.4+)

---

## 📊 Expected Console Output

### **Sender Side (Shane):**
```
Memory created successfully!
📱 Starting notification flow... {
  hasPartnerProfile: true,
  hasUser: true,
  userName: "shane",
  userType: "keeper",
  activeStorytellerId: "conn_abc123",
  connectionsCount: 1
}
📱 Connection lookup: {
  foundConnection: true,
  connectionId: "conn_abc123",
  partnerId: "user_allison123",
  partnerName: "allison tam"
}
📱 Sending notification to partner: {
  partnerUserId: "user_allison123",
  senderName: "shane",
  memoryType: "text",
  previewText: "Testing notifications",
  hasMediaUrl: false
}
📱 notifyNewMemory called: {
  url: "https://xxx.supabase.co/functions/v1/make-server-deded1eb/notifications/new-memory",
  params: {
    userId: "user_allison123",
    senderName: "shane",
    memoryType: "text",
    memoryId: "mem_xyz789",
    previewText: "Testing notifications"
  }
}
📱 Notification API response: {
  status: 200,
  statusText: "OK",
  ok: true
}
📱 Notification API response data: {
  success: true,
  sent: 1,
  message: "iMessage-style notification sent"
}
✅ New memory notification sent successfully: {
  success: true,
  sent: 1
}
📱 Push notification result: true
```

### **Receiver Side (Allison):**

**In Background/Locked Screen:**
```
[Notification banner appears]
💬 shane
Testing notifications

[Tap to open Adoras]
```

**In Foreground (App Open):**
```
[Service Worker receives push event but may not show banner]
[In-app toast notification appears instead]
```

---

## 🚨 Critical Checklist

Before testing, ensure:

- [ ] Both users have **reinstalled PWA** (cleared cache)
- [ ] Both users are **logged in**
- [ ] Both users have **granted notification permission** (Check: Settings → Notifications → Safari)
- [ ] Both users have **notifications enabled** in app (Menu → Notifications → Enable)
- [ ] Both users have **"New Memories" enabled** in preferences
- [ ] Both users have **valid connection** (Shane ↔ Allison)
- [ ] **Browser console is open** to see logs
- [ ] Test with **receiver's app closed** (lock screen) for best results

---

## 🎯 Next Steps

### **If You See "No active subscriptions":**
```
1. Partner opens Notifications settings
2. Taps "Enable Notifications"
3. Grants browser permission
4. Verifies "Status: Subscribed ✅"
5. Try sending message again
```

### **If You See "foundConnection: false":**
```
1. Check database connections
2. Verify Shane and Allison are connected
3. Run test user connection script if needed
```

### **If Subscriptions Exist but No Banner:**
```
1. Close Adoras PWA completely
2. Lock iPhone
3. Send message from other device
4. Should see banner on lock screen
5. If not, check iOS Settings → Notifications → Safari
```

### **If Everything Looks Good in Logs but Still No Notification:**
```
1. Check Supabase Edge Function logs
2. Look for Web Push errors
3. Verify VAPID keys are configured
4. Check service worker registration
5. Try on different device/browser
```

---

## 📝 What to Share

When testing, share:

1. **Full console output** from sender side
2. **Full console output** from receiver side (if app open)
3. **Screenshots** of notification settings (both users)
4. **Device/browser info** (iOS version, Safari version)
5. **Supabase logs** from Edge Functions

I can help debug based on what you see in the logs!

---

**Status:** ✅ Enhanced logging added - Ready to test!

