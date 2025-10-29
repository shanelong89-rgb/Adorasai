# Chat Mixing Debug Guide

## How to Test the Fix

### Test Setup
1. Log in as a user with **at least 2 active connections** (e.g., Shane with Allison and Adapture)
2. Open browser console to see debug logs

### Test Scenario 1: Connection Switching
1. Start in Connection A's chat
2. Send a message
3. Switch to Connection B's chat
4. **Expected:** Only Connection B's messages should appear
5. **Check console for:** `🔄 Switching to` logs showing correct memory loading

### Test Scenario 2: Wait for Periodic Refresh
1. View Connection A's chat
2. Wait 2-3 minutes for periodic refresh to trigger
3. **Check console for:**
   ```
   🔄 Periodic refresh: Reloading all connections...
   📍 Current active connection at refresh start: <connection_id>
   📦 Refreshing N connections (active first)
   ```
4. **Expected:** Chat should NOT change after refresh
5. **Verify:** Messages still belong to Connection A

### Test Scenario 3: Realtime Updates
1. Open two browser tabs/windows
2. Tab 1: User A viewing Connection with User B
3. Tab 2: User B viewing Connection with User A
4. User B sends a message
5. **Check Tab 1 console for:**
   ```
   📡 Received memory update: {...}
   🎯 Update is for ACTIVE connection
   ```
6. **Expected:** Message appears immediately in Tab 1

### Test Scenario 4: Background Connection Updates
1. User A has connections: X, Y, Z
2. User A is viewing Connection X
3. Someone sends message to Connection Y (in background)
4. **Check console for:**
   ```
   📡 Received memory update: {...}
   🎯 Update is for BACKGROUND connection
   ℹ️ Skipping global memories update for background connection
   ```
5. **Expected:** Connection X's chat does NOT change
6. Switch to Connection Y
7. **Expected:** New message appears in Connection Y

## Debug Console Logs to Monitor

### Normal Operation Logs
```
✅ Updating global memories for ACTIVE connection: <id>
📦 Loading N cached memories for <name>
🔄 Switching to storyteller/keeper: <name>
```

### Warning Signs (Should NOT Appear)
```
⚠️ MEMORY MISMATCH DETECTED!
⚠️ IGNORING stale realtime update
ℹ️ Skipping global memories update for background connection: <id> (active: <different_id>)
```

### Error Signs (Bugs Still Present)
```
❌ If you see memories from Connection B appearing in Connection A's chat
❌ If console shows mismatched connection IDs without correction
❌ If "message deleted" appears without user action
```

## Understanding the Logs

### Connection Switch Flow
```
🔄 Switching to storyteller: Allison (conn_123)
📦 Loading 15 cached memories for Allison
✅ Updating global memories for ACTIVE connection: conn_123
📡 Loading memories for connection: conn_123
✅ Loaded 15 memories
✅ Updating global memories for ACTIVE connection: conn_123
```

### Periodic Refresh Flow (Correct)
```
🔄 Periodic refresh: Reloading all connections...
📍 Current active connection at refresh start: conn_123
📦 Refreshing 2 connections (active first)
📡 Loading memories for connection: conn_123  ← Active first
✅ Updating global memories for ACTIVE connection: conn_123
📡 Loading memories for connection: conn_456  ← Background second
ℹ️ Skipping global memories update for background connection: conn_456 (active: conn_123)
✅ Periodic refresh complete
```

### Realtime Update Flow (Active Connection)
```
📡 Received memory update: {action: 'create', connectionId: 'conn_123', ...}
🎯 Update is for ACTIVE connection (active: conn_123, update: conn_123)
✅ Message added to global memories
```

### Realtime Update Flow (Background Connection)
```
📡 Received memory update: {action: 'create', connectionId: 'conn_456', ...}
🎯 Update is for BACKGROUND connection (active: conn_123, update: conn_456)
ℹ️ Only updating per-connection cache, not global memories
```

## Manual Verification

### Check Memory Count Match
1. Open console
2. Run:
   ```javascript
   // Check if global memories match active connection
   console.log('Global memories:', window.__APP_STATE__.memories.length);
   console.log('Active connection memories:', window.__APP_STATE__.memoriesByConnection[activeId].length);
   ```
3. Counts should ALWAYS match

### Inspect Memory IDs
1. Open console
2. Run:
   ```javascript
   // Check if memory IDs match
   const globalIds = window.__APP_STATE__.memories.map(m => m.id).sort();
   const connectionIds = window.__APP_STATE__.memoriesByConnection[activeId].map(m => m.id).sort();
   console.log('Match:', globalIds.join(',') === connectionIds.join(','));
   ```
3. Should print `Match: true`

## Quick Diagnosis Checklist

- [ ] Console shows correct connection ID when switching
- [ ] Periodic refresh logs show "active first" ordering
- [ ] Background updates are logged as "BACKGROUND connection"
- [ ] No "MEMORY MISMATCH DETECTED" warnings
- [ ] Messages stay in correct chats after 2+ minutes
- [ ] No "message deleted" without user action
- [ ] Notification badges still update correctly

## If Issues Persist

1. **Check browser console** for the specific logs above
2. **Note the connection IDs** involved in the mixing
3. **Check timing** - does it happen after refresh? After switch? Immediately?
4. **Export console logs** and share for analysis
5. **Try clearing browser cache** and localStorage
6. **Check if it's a specific connection** or all connections

## Recovery Actions

If chat mixing occurs:
1. Switch away from the connection and back
2. This triggers fresh memory load from per-connection cache
3. Dashboard validation will auto-correct the display
