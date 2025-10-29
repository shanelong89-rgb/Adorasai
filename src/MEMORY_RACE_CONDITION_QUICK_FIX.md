# Memory Race Condition - Quick Fix Reference

## Symptoms
```
⚠️ MEMORY MISMATCH DETECTED! {
  "activeConnectionId": "1761643265170-l4xxfd3",
  "memoriesCount": 17,
  "expectedCount": 0
}
⚠️ ChatTab has 0 memories - this might indicate a loading issue
```

## Root Cause
State updates in wrong order - global `memories` updated before `memoriesByStoryteller`/`memoriesByLegacyKeeper` cache.

## Solution Pattern

### ❌ WRONG (Old Code):
```typescript
// Update global first
setMemories(newData);

// Update per-connection cache after
setMemoriesByStoryteller((prev) => ({ ...prev, [id]: newData }));
```

### ✅ CORRECT (Fixed Code):
```typescript
// Update per-connection cache FIRST
setMemoriesByStoryteller((prev) => ({ ...prev, [id]: newData }));

// Update global AFTER
setMemories(newData);
```

## Why This Matters

Dashboard's validation logic depends on per-connection cache:
```typescript
const expectedMemories = memoriesByStoryteller[activeConnectionId] || [];
```

If global state updates first, validation runs before cache is ready → mismatch error.

## Locations Fixed (5 total)

1. ✅ `loadMemoriesForConnection()` - Initial load
2. ✅ Realtime sync - create action
3. ✅ Realtime sync - update action
4. ✅ Realtime sync - delete action
5. ✅ `handleAddMemory()` - User creates memory

## Testing
- [x] No mismatch warnings
- [x] ChatTab shows correct count
- [x] Dashboard validation passes
- [x] Real-time sync works
- [x] Connection switching works

## Status
✅ **FIXED** - All state updates follow correct order

---
**Date:** January 28, 2025
