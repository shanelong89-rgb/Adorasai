# Fix Test Keeper Connection Issue

## Problem
Allison Tam was connected to a generic "Test Keeper" instead of Shane Long (shanelong@gmail.com) when using invitation code FAM-2024-XY9K.

## Solution
Use the new "Cleanup & Fix" button to remove the test keeper and properly link the invitation to Shane Long.

## Quick Fix Steps

### Option 1: Use Cleanup & Fix Button (Recommended)
1. **Press Ctrl+Shift+D** to open debug panel
2. **Click "🧹 Cleanup & Fix"** button
3. This will:
   - Delete the test keeper user
   - Remove test keeper connections from Allison
   - Create fresh FAM-2024-XY9K invitation linked to Shane Long
4. **Done!** Allison should now be properly connected to Shane

### Option 2: Manual Cleanup
1. **Press Ctrl+Shift+D** to open debug panel
2. **Delete Allison Tam** (if she's already signed up)
3. **Click "Reset Invitation"**
4. **Allison signs up again** with code FAM-2024-XY9K
5. **Click "Check Connection"** to verify

## What the Cleanup Function Does

The `cleanupAndFixTestInvitation()` function:

1. **Finds and deletes test keeper**
   - User ID: `test-keeper-dev`
   - Email: `keeper@test.adoras.app`
   - Removes all connections
   - Deletes all invitations

2. **Finds Shane Long**
   - Email: `shanelong@gmail.com`
   - Verifies he exists (errors if not)

3. **Resets FAM-2024-XY9K**
   - Deletes old invitation
   - Creates fresh invitation linked to Shane
   - Status: 'sent'
   - Expires: 90 days

4. **Updates connection lists**
   - Removes test keeper from all partner lists
   - Cleans up orphaned connections

## Updated Debug Panel Features

### New Buttons:
- **🧹 Cleanup & Fix** - Removes test keeper and fixes invitation (RECOMMENDED)
- **Reset Invitation** - Just resets invitation/connection (keeps users)
- **Check Connection** - Verifies connection status
- **Delete Shane Long** - Complete deletion of Shane
- **Delete Allison Tam** - Complete deletion of Allison

### Button Usage:

| Button | When to Use |
|--------|-------------|
| 🧹 Cleanup & Fix | Allison connected to wrong keeper |
| Reset Invitation | Quick re-test with same users |
| Check Connection | Verify current status |
| Delete Users | Start completely fresh |

## How Test Keeper Was Created

The old code had a dev mode fallback that created a generic test keeper when:
- Invitation code didn't exist
- Shane Long didn't exist
- Any valid code format was used

This has been **removed** - FAM-2024-XY9K now ONLY works with Shane Long.

## Verification Steps

After cleanup, verify the fix:

1. **Check Connection**
   - Click "Check Connection" button
   - Should show: "Not Connected" (Allison needs to sign up again)

2. **Check Invitation**
   - Look at the invitation details
   - Keeper should be: Shane Long
   - Keeper email should be: shanelong@gmail.com

3. **Re-signup Allison**
   - Log out Allison
   - Sign up again with FAM-2024-XY9K
   - Should connect to Shane Long this time

4. **Verify Connection**
   - Click "Check Connection"
   - Should show both Shane and Allison connected
   - Connection keeper should be Shane Long

## Backend Changes Made

### New Function: `cleanupAndFixTestInvitation()`
Located in: `/supabase/functions/server/setup_test_invitation.tsx`

```typescript
export async function cleanupAndFixTestInvitation() {
  // 1. Delete test keeper
  // 2. Find Shane Long
  // 3. Reset FAM-2024-XY9K
  // 4. Create fresh invitation linked to Shane
}
```

### New Endpoint
```
POST /make-server-deded1eb/test/cleanup-fix-invitation
```

### Invitation Verification Updated
- Removed generic test keeper fallback
- FAM-2024-XY9K only works with Shane Long
- Auto-reset still works for testing

## Troubleshooting

### "Shane Long not found" error
**Solution**: Shane needs to sign up first
```
1. Sign up Shane at shanelong@gmail.com as Legacy Keeper
2. Run cleanup again
```

### Allison still connected to test keeper
**Solution**: Delete Allison and have her sign up again
```
1. Click "Delete Allison Tam"
2. Click "🧹 Cleanup & Fix"
3. Allison signs up with FAM-2024-XY9K
```

### Invitation still shows test keeper
**Solution**: Use cleanup instead of reset
```
Don't use "Reset Invitation" - use "🧹 Cleanup & Fix" instead
```

## Testing Workflow

### Complete Clean Test:
1. Delete both Shane and Allison
2. Sign up Shane as Keeper
3. Click "🧹 Cleanup & Fix"
4. Sign up Allison with FAM-2024-XY9K
5. Click "Check Connection"
6. ✅ Verify Shane and Allison are connected

### Quick Fix Test:
1. Click "🧹 Cleanup & Fix"
2. Delete Allison (if exists)
3. Sign up Allison with FAM-2024-XY9K
4. Click "Check Connection"
5. ✅ Verify connection to Shane

## Success Criteria

After cleanup, you should see:

✅ Test keeper deleted
✅ FAM-2024-XY9K exists
✅ Invitation keeper: Shane Long (shanelong@gmail.com)
✅ Invitation status: sent
✅ Allison can sign up successfully
✅ Connection creates between Shane and Allison
✅ No test keeper in database

## Code References

- Cleanup function: `/supabase/functions/server/setup_test_invitation.tsx:130-234`
- Endpoint: `/supabase/functions/server/index.tsx:590-603`
- UI Component: `/components/TestInvitationDebug.tsx:166-191`

## Notes

- This fix is **ONLY for testing** with FAM-2024-XY9K
- Production invitations don't have this issue
- Test keeper cleanup is safe - only affects test data
- Shane Long must exist before cleanup can run
