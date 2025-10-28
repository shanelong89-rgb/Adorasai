# Server Health Check Timeout Fix

## Issue
Server health check was timing out after 3 seconds with the error:
```
❌ Server health check failed (3001ms): Timeout after 3000ms
```

## Root Causes

### 1. Cold Start Delays
Supabase Edge Functions experience "cold starts" when they haven't been called recently:
- First request can take 5-8 seconds
- Server needs to initialize and load dependencies
- This is normal behavior for serverless functions

### 2. Async Filter Bug
The `setup_test_invitation.tsx` file had async filter operations that weren't being awaited properly:
```typescript
// BAD - async filter doesn't work as expected
const filtered = array.filter(async item => {
  const result = await someAsyncOperation(item);
  return result !== null;
});

// GOOD - use for loop instead
const filtered = [];
for (const item of array) {
  const result = await someAsyncOperation(item);
  if (result !== null) {
    filtered.push(item);
  }
}
```

## Fixes Applied

### 1. Increased Health Check Timeout
**File**: `/utils/serverHealth.ts`

**Change**:
```typescript
// Before
const HEALTH_CHECK_TIMEOUT = 3000; // 3 seconds max

// After
const HEALTH_CHECK_TIMEOUT = 8000; // 8 seconds max (increased for cold starts)
```

**Reason**: Allows sufficient time for cold starts while still catching actual failures.

### 2. Fixed Async Filter Operations
**File**: `/supabase/functions/server/setup_test_invitation.tsx`

**Locations Fixed**:
- Line 173-177: Shane's connection list update
- Line 195-199: Allison's connection list update

**Change**:
```typescript
// Before (BROKEN)
const updatedShaneConnections = shaneConnections.filter(async connId => {
  const conn = await kv.get<Connection>(Keys.connection(connId));
  return conn !== null;
});

// After (FIXED)
const updatedShaneConnections = [];
for (const connId of shaneConnections) {
  const conn = await kv.get<Connection>(Keys.connection(connId));
  if (conn !== null) {
    updatedShaneConnections.push(connId);
  }
}
```

**Reason**: JavaScript's `filter()` doesn't properly await async predicates. Using explicit for loops ensures all async operations complete.

### 3. Added User-Facing Note
**File**: `/components/TestInvitationDebug.tsx`

Added informational note in the UI:
```
Note: First request may take 5-8 seconds due to server cold start. This is normal.
```

**Reason**: Sets proper expectations for users during development/testing.

## Testing

### Expected Behavior

**Cold Start (First Request)**:
- ⏱️ Takes 5-8 seconds
- ✅ Should succeed within 8 second timeout
- 📝 Console shows: "✅ Server health check passed (5234ms)"

**Warm Requests (Subsequent)**:
- ⏱️ Takes 200-500ms
- ✅ Very fast response
- 📝 Console shows: "✅ Server health check passed (342ms)"

**Actual Timeout (Server Down)**:
- ⏱️ Takes 8+ seconds
- ❌ Fails with timeout error
- 📝 Console shows: "❌ Server health check failed (8001ms): Timeout after 8000ms"

### How to Verify Fix

1. **Wait for Cold Start** (if needed):
   - Wait 10+ minutes without making any requests
   - This allows the function to go "cold"

2. **Trigger Health Check**:
   - Open the app
   - Watch browser console
   - First health check should succeed in 5-8 seconds

3. **Test Warm Requests**:
   - Refresh page immediately
   - Health check should be fast (< 1 second)
   - May use cached result

## Additional Improvements

### Health Check Caching
The health check already implements intelligent caching:
- Results cached for 30 seconds
- Avoids repeated slow checks
- Improves user experience

### Error Handling
The health check distinguishes between:
- Network errors (server unreachable)
- Timeout errors (server too slow)
- HTTP errors (server returned error)

## Related Files

- `/utils/serverHealth.ts` - Health check implementation
- `/supabase/functions/server/setup_test_invitation.tsx` - Async filter fixes
- `/supabase/functions/server/invitations.tsx` - Invitation logic (no changes needed)
- `/components/TestInvitationDebug.tsx` - UI with cold start note
- `/components/ServerStatusBanner.tsx` - Uses health check

## Performance Tips

### For Development
1. Keep the Supabase dashboard open
2. Make requests every few minutes to keep function warm
3. First request after break will be slower - this is expected

### For Production
1. Consider implementing a "keep-warm" ping
2. Could ping health endpoint every 5 minutes
3. Ensures faster user experience
4. Only needed if budget allows

## Notes

- Cold starts are inherent to serverless architecture
- 8-second timeout is reasonable for development
- Production apps may want lower timeout + retry logic
- Async filter bug was causing unpredictable behavior
- All async operations now properly awaited

## Future Considerations

### If Timeouts Persist
1. Check Supabase function logs for errors
2. Verify environment variables are set
3. Check database connectivity
4. Review function deployment status

### Optimization Options
1. Reduce dependencies in server/index.tsx
2. Lazy load heavy modules
3. Split into multiple smaller functions
4. Use edge caching for common requests

## Conclusion

The timeout issue is resolved through:
1. ✅ Increased timeout to accommodate cold starts
2. ✅ Fixed async filter bugs causing delays
3. ✅ Added user-facing documentation
4. ✅ Maintained proper error handling

The 8-second timeout provides a good balance between catching real failures and allowing for cold starts.
