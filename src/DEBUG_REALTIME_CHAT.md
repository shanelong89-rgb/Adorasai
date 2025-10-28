# 🔍 Debug Real-time Chat Not Working

## Current Situation

**Testing Setup:**
- Computer: Allison sending messages
- iPhone: Shane Long receiving messages  
- **Problem:** Messages don't appear in real-time (must refresh to see them)

## Root Cause Analysis

The realtime sync code IS already implemented in `/components/AppContent.tsx`, BUT it may not be connecting successfully.

### Check #1: Is Realtime Sync Connecting?

**Open browser console on BOTH devices and look for these logs:**

#### ✅ SUCCESS - You should see:
```
🔌 Setting up real-time sync...
🔌 Connecting to real-time channel: connection:xxxxx
✅ Real-time channel connected!
👤 Presence tracked: {userId: "...", userName: "...", ...}
```

#### ❌ FAILURE - You might see:
```
⚠️ Real-time channel error - will retry
⚠️ Max reconnection attempts reached - real-time features disabled
ℹ️ App will continue to work without real-time sync
```

### Check #2: Supabase Realtime is Enabled

Supabase Realtime must be enabled for websocket connections to work.

**Go to your Supabase Dashboard:**

1. Navigate to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`
2. Scroll to **"Realtime"** section
3. Check if **Realtime is enabled**
4. If not enabled:
   - Toggle it ON
   - Wait 1-2 minutes for changes to apply
   - Refresh your app

### Check #3: Connection Status

**In browser console, type:**
```javascript
// Check if connection is established
console.log('isConnected:', window.appState?.isConnected);
console.log('activeConnection:', window.appState?.activeStorytellerId || window.appState?.activeLegacyKeeperId);
```

The realtime sync only connects if `isConnected === true`

### Check #4: Network Tab Websocket

**Check if websocket is connecting:**

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `wss://...supabase.co/realtime/v1/websocket`
4. If you see it:
   - Click on it → Messages tab
   - You should see heartbeat messages every 30s
   - Look for `phx_join` and `phx_reply` messages
5. If you DON'T see websocket:
   - Realtime is not enabled or connection is blocked

---

## Quick Fix Steps

### Step 1: Enable Debug Logging

Add this temporary logging to see what's happening:

**On Computer (Allison):**
1. Open browser console  
2. Paste this:
```javascript
localStorage.setItem('debug', 'adoras:*');
location.reload();
```

**On iPhone (Shane):**
1. Add Adoras to home screen if not already
2. Open from home screen
3. Connect to Safari Web Inspector:
   - Connect iPhone to Mac
   - Safari → Develop → [Your iPhone] → Adoras
   - Console should appear
4. Type the same commands as above

### Step 2: Force Reconnect

**In console, type:**
```javascript
// Force disconnect and reconnect
window.location.href = window.location.href + '?force_realtime_reconnect=1';
```

### Step 3: Check Supabase Realtime Status

**API Test:**
```javascript
fetch('https://YOUR_PROJECT_ID.supabase.co/realtime/v1/')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

If this returns an error, Realtime is not enabled.

---

## Manual Test of Real-time

**Send a message and check if it broadcasts:**

1. **On Computer (Allison):**
   - Send a message in chat
   - Check console for:
     ```
     📡 Broadcasting memory update: {action: "create", ...}
     ```

2. **On iPhone (Shane):**
   - Check console for:
     ```
     📡 Received memory update: {action: "create", ...}
     New memory from Storyteller!
     ```

If you DON'T see broadcast logs:
- Check if `realtimeConnected` is true
- Check if memory was actually saved to database
- Check if realtime sync is enabled

---

## Common Issues & Solutions

### Issue 1: "Real-time channel error - will retry"

**Cause:** Supabase Realtime not enabled OR network blocking websockets

**Solution:**
1. Enable Realtime in Supabase Dashboard
2. Check if corporate firewall blocks websockets
3. Try on different network (mobile data vs WiFi)

### Issue 2: No websocket connection in Network tab

**Cause:** Supabase Realtime disabled

**Solution:**
- Enable Realtime in Supabase Dashboard
- Wait 2 minutes
- Hard refresh (Ctrl+Shift+R)

### Issue 3: Websocket connects but no messages

**Cause:** Not joined to correct channel OR connection ID mismatch

**Solution:**
- Check `connectionId` matches in console logs
- Verify both users are in same connection
- Check `activeStorytellerId` / `activeLegacyKeeperId` values

### Issue 4: "isConnected" is false

**Cause:** No active connection OR connection status is "pending"

**Solution:**
1. Check in database if connection exists:
   ```javascript
   fetch('/api/connections')
     .then(r => r.json())
     .then(console.log);
   ```
2. Verify connection status is "active" not "pending"

---

## Expected Console Output (Working System)

### When Allison sends a message:

**Allison's Console:**
```
📡 Creating memory...
✅ Memory created successfully
📡 Broadcasting memory update: {
  action: "create",
  memoryId: "mem_xxx",
  connectionId: "conn_xxx",
  userId: "user_allison",
  memory: {...}
}
```

**Shane's Console (iPhone):**
```
📡 Received memory update: {
  action: "create",
  memoryId: "mem_xxx",
  userId: "user_allison",
  ...
}
📥 Adding new memory to UI
ℹ️ New memory from Legacy Keeper!
```

---

## If All Else Fails

### Fallback: Polling Mode

If realtime never works, we can implement polling as fallback:

1. Check for new messages every 5 seconds
2. Load any new memories
3. Display them

This is less elegant but works if websockets are blocked.

---

## Action Items

**Please do these and report back:**

1. ✅ Check browser console logs on BOTH devices
2. ✅ Look for realtime connection logs
3. ✅ Check Supabase Dashboard → Realtime is enabled
4. ✅ Check Network tab for websocket connections  
5. ✅ Try sending message and watch console
6. ✅ Report what logs you see

Copy/paste any error messages you see!

