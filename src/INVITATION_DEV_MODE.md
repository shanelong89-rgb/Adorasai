# Invitation Development Mode

## Overview

The Adoras app now includes a **Development Mode** for invitation codes to make testing easier without requiring a full keeper-teller setup flow.

## How It Works

### Normal Flow (Production)
1. **Keeper** creates an account
2. **Keeper** sends an invitation via the dashboard (generates a unique code like `FAM-2024-XY9K`)
3. **Teller** receives the code via SMS
4. **Teller** uses the code during signup to connect with the keeper

### Development Mode Flow
When a teller enters an invitation code that doesn't exist in the database, the system automatically:

1. ✅ Creates a test keeper profile (if needed)
2. ✅ Generates a test invitation for that code
3. ✅ Allows the teller to proceed with signup
4. ✅ Creates a connection between the teller and test keeper

## Testing Invitation Codes

### Option 1: Use Any Valid Code Format
Enter any code that matches the format `XXX-YYYY-ZZZZ` during teller signup:
- `FAM-2024-XY9K` ✅
- `TEST-2025-ABC1` ✅
- `DEV-1234-TEST` ✅

The system will auto-create a test invitation and connect you to a "Test Keeper".

### Option 2: Skip Invitation
Click the **"Skip Invitation"** button or leave the code field empty and click **"Continue"**. You can connect with a keeper later from the dashboard.

## What Gets Created

When dev mode activates, the system creates:

**Test Keeper Profile:**
```
Name: Test Keeper
Email: keeper@test.adoras.app
Type: keeper
```

**Test Invitation:**
```
Code: [your entered code]
Status: sent
Expires: 30 days from now
```

## Console Messages

Look for these messages in the browser console:

```
🧪 DEV MODE: Creating test invitation for code: FAM-2024-XY9K
🧪 DEV MODE: Creating test keeper profile
✅ DEV MODE: Test invitation created successfully
```

## Benefits

✅ **Faster testing** - No need to create a keeper first  
✅ **Flexible** - Use any code format you want  
✅ **Realistic** - Full connection flow is tested  
✅ **Optional** - Can still skip invitations entirely  

## Production Behavior

In production, this dev mode will still work but:
- Real users should use actual invitation codes from keepers
- The "Skip Invitation" option allows signup without a code
- Users can connect later via the "Invite Connection" feature

## Error Handling

The system handles these scenarios:
- ❌ **Invalid format** → Error message shown
- ❌ **Expired invitation** → Error message shown  
- ❌ **Already used** → Error message shown
- ✅ **Not found** → Dev mode auto-creates invitation
- ✅ **Empty code** → Skip to next step

## Server Logs

The server provides detailed logging:
```
🔍 Verifying invitation code: FAM-2024-XY9K
❌ Invitation not found in KV store for code: FAM-2024-XY9K
📋 No invitations in database. A keeper needs to create one first.
🧪 DEV MODE: Creating test invitation for code: FAM-2024-XY9K
✅ DEV MODE: Test invitation created successfully
```

## Files Modified

- `/supabase/functions/server/invitations.tsx` - Added dev mode logic
- `/components/TellerOnboarding.tsx` - Made invitation optional, added skip button

---

**Last Updated:** October 24, 2025  
**Status:** ✅ Active and Working
