# 🔍 Real-Time Diagnostic Script

## ✅ Realtime IS Enabled - So What's Wrong?

Since Realtime is enabled, the issue must be:
1. Real-time connection isn't establishing
2. Users connecting to different channels
3. Broadcast messages not being received
4. Network blocking WebSocket connections

---

## 🧪 RUN THIS DIAGNOSTIC NOW

### Step 1: Open Browser Console

**Both Shane and Allison need to do this:**

1. **Log in** to Adoras
2. **Press F12** (or right-click → Inspect)
3. **Click Console tab**
4. **Copy/paste this script:**

```javascript
console.clear();
console.log('🔍 ADORAS REAL-TIME DIAGNOSTIC');
console.log('================================\n');

// Check if user is logged in
const checkAuth = () => {
  const user = localStorage.getItem('supabase.auth.token');
  console.log('1️⃣ AUTH CHECK:', user ? '✅ Logged in' : '❌ Not logged in');
  return !!user;
};

// Check real-time connection
const checkRealtime = () => {
  // The realtimeSync is a global singleton
  try {
    console.log('2️⃣ REAL-TIME STATUS:');
    console.log('   Checking connection...');
    
    // Look for Supabase realtime channels in window
    const supabaseChannels = window.__supabase_channels || [];
    console.log('   Active channels:', supabaseChannels.length);
    
    if (supabaseChannels.length === 0) {
      console.log('   ❌ No real-time channels found');
      console.log('   This means real-time sync is NOT connected');
    } else {
      console.log('   ✅ Real-time channels exist');
      supabaseChannels.forEach((ch, i) => {
        console.log(`   Channel ${i + 1}:`, ch);
      });
    }
  } catch (e) {
    console.log('   ⚠️ Could not check real-time:', e.message);
  }
};

// Check localStorage for connection info
const checkConnection = () => {
  console.log('\n3️⃣ CONNECTION INFO:');
  
  const keys = Object.keys(localStorage);
  const connectionKeys = keys.filter(k => 
    k.includes('connection') || 
    k.includes('user') || 
    k.includes('partner')
  );
  
  console.log('   Stored keys:', connectionKeys.length);
  connectionKeys.forEach(key => {
    const value = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(value);
      console.log(`   ${key}:`, parsed);
    } catch {
      console.log(`   ${key}:`, value?.substring(0, 50) + '...');
    }
  });
};

// Check for recent console logs about real-time
const checkConsoleLogs = () => {
  console.log('\n4️⃣ RECENT ACTIVITY:');
  console.log('   Look above for these messages:');
  console.log('   - "🔌 Connecting to real-time channel"');
  console.log('   - "✅ Real-time channel connected!"');
  console.log('   - "📡 Memory update received"');
  console.log('   - "⚠️ Real-time channel error"');
};

// Run all checks
checkAuth();
checkRealtime();
checkConnection();
checkConsoleLogs();

console.log('\n================================');
console.log('📋 NEXT STEPS:');
console.log('1. Check if you see "✅ Real-time channel connected!" above');
console.log('2. If NOT, refresh the page and check again');
console.log('3. Copy ALL the output above and share it');
console.log('================================\n');
```

---

## 📊 WHAT TO LOOK FOR

### ✅ GOOD (Working):

```
🔍 ADORAS REAL-TIME DIAGNOSTIC
================================

1️⃣ AUTH CHECK: ✅ Logged in
2️⃣ REAL-TIME STATUS:
   Checking connection...
   Active channels: 1
   ✅ Real-time channels exist
   Channel 1: [object]
3️⃣ CONNECTION INFO:
   Stored keys: 3
   [connection data shown]
4️⃣ RECENT ACTIVITY:
   Look above for these messages:
```

**And scroll up to see:**
```
🔌 Connecting to real-time channel: conn_xxx
✅ Real-time channel connected!
👤 Presence tracked: { userId: "xxx", userName: "Shane", online: true }
```

---

### ❌ BAD (Not working):

```
1️⃣ AUTH CHECK: ✅ Logged in
2️⃣ REAL-TIME STATUS:
   Checking connection...
   Active channels: 0
   ❌ No real-time channels found
```

**Or scroll up and see:**
```
⚠️ Real-time channel error - will retry
🔄 Reconnecting in 2000ms (attempt 1/3)...
⚠️ Max reconnection attempts reached - real-time features disabled
```

---

## 🔧 IF NO REAL-TIME CONNECTION

### Issue: "❌ No real-time channels found"

**This means:**
- Real-time sync tried to connect but failed
- Or never tried to connect at all
- Network might be blocking WebSocket

**Fix:**
1. Hard refresh page (Ctrl+Shift+R)
2. Check console for error messages
3. Check network tab for WebSocket failures
4. Try different network (WiFi → Cellular)

---

### Issue: "⚠️ Real-time channel error"

**This means:**
- WebSocket connection is failing
- Supabase can't establish connection
- Network/firewall blocking

**Fix:**
1. Check network connection
2. Try different WiFi network
3. Try cellular data
4. Disable VPN if using one
5. Check corporate firewall settings

---

### Issue: "⚠️ Max reconnection attempts reached"

**This means:**
- System tried 3 times and gave up
- Real-time permanently disabled until refresh

**Fix:**
1. Hard refresh (Ctrl+Shift+R)
2. Check what caused the failures
3. Fix underlying issue
4. Refresh again

---

## 🧪 STEP 2: Test Message Sending

**After running diagnostic above:**

### User A (Shane):
1. Keep console open
2. Send a test message: "Test 123"
3. **Watch console for these logs:**

```javascript
// Should see:
📡 Creating memory with fields: [...]
✅ Memory created successfully: { id: "mem_xxx", type: "text" }
📡 Memory update broadcasted to connected users
📱 Push notification sent to partner
```

**Copy the output** and share it.

---

### User B (Allison):
1. Keep console open
2. **Watch for message to appear**
3. **Watch console for these logs:**

```javascript
// Should see:
📡 Memory update received: { action: "create", memoryId: "mem_xxx" }
```

**If you see this:** Real-time IS working! ✅

**If you DON'T see this:** Real-time broadcast not received ❌

---

## 🔍 STEP 3: Check Connection IDs Match

**Both users run this:**

```javascript
console.log('🔍 CONNECTION ID CHECK');

// Get connection ID from localStorage
const keys = Object.keys(localStorage);
const stateKey = keys.find(k => k.includes('appState') || k.includes('connection'));

if (stateKey) {
  const state = JSON.parse(localStorage.getItem(stateKey));
  console.log('Active Connection ID:', state.activeConnectionId || state.activeStorytellerId || state.activeLegacyKeeperId);
  console.log('User Type:', state.userType);
  console.log('User Name:', state.userProfile?.name);
} else {
  console.log('❌ No connection state found');
}
```

**Expected:**
- **Shane (Keeper):** Connection ID: `conn_123`
- **Allison (Teller):** Connection ID: `conn_123`

**Should be THE SAME!**

**If different:**
- They're in different channels
- Messages won't sync
- This is the problem!

---

## 🔧 FIX: Connection ID Mismatch

**If connection IDs are different:**

1. **Check invitation was accepted correctly**
2. **Both users log out and log back in**
3. **Check connection status in app:**
   - Menu → Should show partner name
   - Should show "Connected" status

---

## 📱 STEP 4: Test Notifications

**User A:**
1. Menu → Notification Settings
2. Check status: Should show "Subscribed" ✅
3. Click "Send Test Notification"
4. **Watch console:**

```javascript
// Should see:
✅ Test notification sent
```

**User A's backend logs should show:**
```
Sending push notification to user: user_xxx
✅ Push notification delivered successfully
```

**User A should see notification within 5 seconds**

---

## 🆘 COMMON ISSUES

### Issue: Console shows connection but messages don't sync

**Check:**
1. Are users in same connection? (connection IDs match?)
2. Is broadcast code running? (check User A console)
3. Is User B listening? (check User B console)

**Debug:**
```javascript
// User A - Send test broadcast
console.log('Sending test broadcast...');
```

```javascript
// User B - Check if receiving
console.log('Listening for broadcasts...');
```

---

### Issue: Push notifications work but real-time doesn't

**This means:**
- Backend API works ✅
- But WebSocket sync doesn't ❌

**Likely causes:**
1. Network blocking WebSocket
2. Firewall blocking wss:// protocol
3. Connection IDs don't match
4. Real-time channel subscription failed

---

### Issue: Real-time works but notifications don't

**This means:**
- WebSocket works ✅
- But push service doesn't ❌

**Check:**
1. VAPID keys correct?
2. User subscribed to notifications?
3. Notification permission granted?
4. Backend logs for push errors?

---

## 📋 DIAGNOSTIC CHECKLIST

**Both users run through this:**

- [ ] Logged in successfully
- [ ] Console shows "✅ Real-time channel connected!"
- [ ] Connection ID shown in diagnostic
- [ ] Connection IDs match between users
- [ ] Can send messages (saves to DB)
- [ ] Messages appear after refresh
- [ ] Console shows "📡 Memory update broadcasted"
- [ ] Partner console shows "📡 Memory update received"
- [ ] Test notification works
- [ ] Real message triggers notification

---

## 🎯 EXPECTED RESULTS

**When everything works:**

### User A Console:
```
🔌 Connecting to real-time channel: conn_123
✅ Real-time channel connected!
👤 Presence tracked
📡 Creating memory...
✅ Memory created successfully
📡 Memory update broadcasted to connected users
📱 Push notification sent to partner
```

### User B Console:
```
🔌 Connecting to real-time channel: conn_123
✅ Real-time channel connected!
👤 Presence tracked
📡 Memory update received: { action: "create" }
```

### User B App:
- Message appears instantly ✅
- No refresh needed ✅
- Notification received ✅

---

## 🎬 FULL TEST SEQUENCE

1. **Both users:** Run diagnostic script
2. **Check:** Both show "✅ Real-time channel connected!"
3. **Check:** Connection IDs match
4. **User A:** Send message "Test 1"
5. **User B:** Should see message instantly
6. **User A:** Check console for "broadcasted"
7. **User B:** Check console for "received"
8. **User A:** Send message "Test 2"
9. **User B:** Should get notification
10. **Both:** Check backend logs

---

## 📞 SHARE THESE RESULTS

After running diagnostic, share:

1. **Diagnostic output** (from script)
2. **Connection IDs** (do they match?)
3. **Console logs** (any errors?)
4. **Test message results** (did it sync?)
5. **Notification test** (did it work?)

This will tell us EXACTLY what's wrong!

