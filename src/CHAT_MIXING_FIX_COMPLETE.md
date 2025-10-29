# Chat Mixing & Notification Spam - COMPREHENSIVE FIX v3 ✅

## Problem
After a couple of seconds, messages from different connections were mixing together. For example, Allison's messages would appear in the Adapture chat, showing "message deleted" and triggering random notifications.

## Root Cause
The bug was caused by the **periodic refresh mechanism** in `/components/AppContent.tsx` (lines 869-898):

1. Every 60 seconds, `refreshAllConnections()` loads memories for ALL connections in parallel
2. The `loadMemoriesForConnection()` function was **unconditionally** calling `setMemories(uiMemories)` (line 715)
3. This replaced the **global memories array** with whichever connection loaded last
4. Since the global `memories` array is what ChatTab displays, users would see messages from the wrong chat

### Example Timeline:
```
00:00 - User viewing Allison's chat (connection A)
01:00 - Periodic refresh starts loading all connections
01:01 - Allison's memories load: setMemories([Allison's messages])
01:02 - Adapture's memories load: setMemories([Adapture's messages]) ← OVERWRITES!
01:02 - User now sees Adapture's messages in Allison's chat ❌
```

## Solution
Fixed the `loadMemoriesForConnection()` function to ONLY update the global `memories` array when loading the **currently active** connection:

### Changes Made:

1. **`loadMemoriesForConnection()` - Line 695-750**
   ```typescript
   // Get the currently active connection ID
   const activeConnectionId = userType === 'keeper' ? activeStorytellerId : activeLegacyKeeperId;
   
   // ONLY update the global memories array if this is the ACTIVE connection
   if (connectionId === activeConnectionId) {
     console.log(`✅ Updating global memories for ACTIVE connection: ${connectionId}`);
     setMemories(uiMemories);
   } else {
     console.log(`ℹ️ Skipping global memories update for background connection: ${connectionId}`);
   }
   
   // Always update the per-connection dictionaries (for notification badges)
   if (userType === 'keeper') {
     setMemoriesByStoryteller((prev) => ({ ...prev, [connectionId]: uiMemories }));
   } else {
     setMemoriesByLegacyKeeper((prev) => ({ ...prev, [connectionId]: uiMemories }));
   }
   ```

2. **Realtime Sync Updates - Line 165-241**
   - Added same logic to prevent realtime updates from other connections mixing into the active chat
   - Only updates global `memories` array if `update.connectionId === connectionId`
   - Always updates per-connection dictionaries for accurate notification badges

3. **Connection Switching - Line 1894-1942**
   - Added instant cache lookup when switching connections for better UX
   - Immediately loads cached memories from `memoriesByStoryteller` / `memoriesByLegacyKeeper`
   - Then refreshes from API in the background

## Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│ State Architecture (Multi-Connection)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  memories: Memory[]           ← ONLY for ACTIVE connection   │
│     ↑                                                         │
│     └─ What ChatTab displays                                 │
│                                                               │
│  memoriesByStoryteller: Record<string, Memory[]>             │
│     ├─ storyteller_1: [...]   ← All connections cached       │
│     ├─ storyteller_2: [...]                                  │
│     └─ storyteller_3: [...]                                  │
│                                                               │
│  memoriesByLegacyKeeper: Record<string, Memory[]>            │
│     ├─ keeper_1: [...]        ← All connections cached       │
│     └─ keeper_2: [...]                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Testing
1. Log in as a user with multiple connections
2. Send messages in one chat
3. Wait 60+ seconds for periodic refresh
4. Switch to another chat
5. ✅ Messages should remain in their correct chats
6. ✅ No mixing or "message deleted" errors
7. ✅ Notification badges should still work correctly

## Additional Fixes in v2

### 4. **Realtime Subscription Stale Closure Fix**
The realtime subscription callback was capturing `connectionId` in its closure, but when the user switched connections, the old callback would still reference the old connectionId!

**Fix:**
- Added `isCleanedUp` flag to detect and ignore stale callbacks
- Changed to use CURRENT `activeStorytellerId`/`activeLegacyKeeperId` instead of captured `connectionId`
- Added comprehensive logging to detect stale updates

```typescript
// Before: Used captured connectionId (STALE!)
const isActiveConnection = update.connectionId === connectionId;

// After: Get CURRENT active connection
const currentActiveConnectionId = userType === 'keeper' ? activeStorytellerId : activeLegacyKeeperId;
const isActiveConnection = update.connectionId === currentActiveConnectionId;
```

### 5. **Periodic Refresh Race Condition**
Background refreshes were loading ALL connections in parallel, causing whichever finished last to overwrite the global memories array.

**Fix:**
- Changed from parallel to sequential loading
- Load active connection FIRST, then others
- Increased interval from 60s to 120s to reduce server load
- Added logging to track current active connection before refresh starts

### 6. **Dashboard-Level Memory Validation**
Added a final safety check at the Dashboard component to detect and fix memory mismatches.

**Fix:**
- Added `validatedMemories` computed value that compares global `memories` with per-connection cache
- If mismatch detected, automatically uses correct memories from cache
- Logs warning when mismatch occurs for debugging
- All tab components now use `validatedMemories` instead of raw `memories`

## Files Modified
- `/components/AppContent.tsx` - Fixed memory loading, realtime sync, and periodic refresh logic
- `/components/Dashboard.tsx` - Added memory validation layer

## Additional Fixes in v3

### 7. **Notification Spam Prevention**
The notification system was showing notifications for OLD messages during initial load, connection switches, and periodic refreshes.

**Fix:**
- Changed from count-based to **ID-based change detection**
- Added **10-second timestamp validation** - only messages from last 10 seconds trigger notifications
- Added **1-second throttling** between notifications
- Added **duplicate prevention** in both global and per-connection caches
- Removed duplicate toast from AppContent realtime sync

```typescript
// Before: Count-based (triggered for old messages)
if (validatedMemories.length > prevMemoryCountRef.current)

// After: ID-based with timestamp validation
const newMemories = validatedMemories.filter(m => 
  !prevMemoryIdsRef.current.has(m.id) &&
  m.timestamp.getTime() > (Date.now() - 10000)
);
```

**See NOTIFICATION_SPAM_FIX_COMPLETE.md for full details**

## Impact
- ✅ No more chat mixing between connections
- ✅ No more random "message deleted" notifications  
- ✅ No more notification spam for old messages
- ✅ No more random prompt notifications
- ✅ Better performance (background refreshes don't trigger UI updates)
- ✅ Notification badges still work correctly
- ✅ Realtime sync remains functional
- ✅ Stale callback protection prevents delayed updates from wrong connections
- ✅ Sequential refresh prevents race conditions
- ✅ Dashboard validation provides fail-safe against any memory mixing
- ✅ Clean notifications only for truly NEW messages
