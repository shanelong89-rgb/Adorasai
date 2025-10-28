# Test Users: Shane & Allison - Permanent Connection

## Overview

This guide explains the permanent connection between Shane Long (Legacy Keeper) and Allison Tam (Storyteller) for testing prompts and chat features.

## Test Users

### Shane Long (Legacy Keeper)
- **Email**: shanelong@gmail.com
- **Password**: (set during signup)
- **Type**: Legacy Keeper
- **Phone**: +11234567890
- **Birthday**: June 15, 1975

### Allison Tam (Storyteller)
- **Email**: allison.tam@hotmail.com
- **Password**: (set during signup)
- **Type**: Storyteller (Teller)
- **Phone**: +11234567891
- **Birthday**: March 22, 1948

### Test Invitation Code
- **Code**: `TESTCODE`
- **Expires**: 1 year from creation
- **Auto-reset**: Yes (can be reused)

## Quick Setup

### One-Click Setup (Recommended)

1. **Press Ctrl+Shift+D** to open debug panel
2. **Click "✨ Ensure Connected"** button
3. This will:
   - Create Shane Long if he doesn't exist
   - Create Allison Tam if she doesn't exist
   - Create TESTCODE invitation
   - Create active connection between them
   - Mark invitation as accepted

**Done!** Shane and Allison are now connected and ready for testing.

### Manual Setup

If you prefer to test the full signup flow:

1. **Delete existing users** (if any)
   - Press Ctrl+Shift+D
   - Click "Delete Shane Long"
   - Click "Delete Allison Tam"

2. **Sign up Shane as Legacy Keeper**
   - Email: shanelong@gmail.com
   - Password: (your choice)
   - Type: Legacy Keeper
   - Complete profile

3. **Sign up Allison as Storyteller**
   - Email: allison.tam@hotmail.com
   - Password: (your choice)
   - Type: Storyteller
   - Use invitation code: `TESTCODE`
   - Complete profile

4. **Verify connection**
   - Press Ctrl+Shift+D
   - Click "Check Connection"
   - Should show "Connected"

## API Endpoint

### Ensure Connected
```
POST /make-server-deded1eb/test/ensure-connected
```

**What it does:**
- Idempotent operation (safe to call multiple times)
- Creates users if they don't exist
- Creates invitation if it doesn't exist
- Creates connection if it doesn't exist
- Returns current status

**Response:**
```json
{
  "success": true,
  "shane": {
    "id": "user_xxx",
    "name": "Shane Long",
    "email": "shanelong@gmail.com",
    "type": "keeper"
  },
  "allison": {
    "id": "user_yyy",
    "name": "Allison Tam",
    "email": "allison.tam@hotmail.com",
    "type": "teller"
  },
  "invitation": {
    "code": "TESTCODE",
    "status": "accepted",
    ...
  },
  "connection": {
    "id": "conn_zzz",
    "status": "active",
    ...
  }
}
```

## Testing Features

With Shane and Allison connected, you can now test:

### Prompts Tab
- **As Shane**: View daily prompts, answer them
- **As Allison**: View Shane's responses to prompts

### Chat Tab
- **As Shane**: Send messages to Allison
- **As Allison**: Send messages to Shane
- Test real-time sync
- Test message history

### Media Library
- **As Shane**: Upload photos, videos, voice notes
- **As Allison**: View Shane's shared media
- Test categorization
- Test AI tagging

## Connection Details

### Database Structure

**User Profiles:**
```
user:shane_id -> Shane Long profile
user:allison_id -> Allison Tam profile
```

**Invitation:**
```
invitation:TESTCODE -> {
  keeperId: shane_id,
  tellerId: allison_id,
  status: "accepted",
  ...
}
```

**Connection:**
```
connection:conn_id -> {
  keeperId: shane_id,
  tellerId: allison_id,
  status: "active",
  invitationCode: "TESTCODE",
  ...
}
```

**User Connections Lists:**
```
user_connections:shane_id -> [conn_id]
user_connections:allison_id -> [conn_id]
```

**User Invitations List:**
```
user_invitations:shane_id -> ["TESTCODE"]
```

## Debug Panel Features

Press **Ctrl+Shift+D** to access:

### ✨ Ensure Connected
- Creates/updates users and connection
- Idempotent (safe to run multiple times)
- Use this to quickly set up test environment

### Reset Invitation
- Deletes connection
- Keeps users
- Resets invitation to "sent" status
- Use this to re-test acceptance flow

### Check Connection
- Verifies current connection status
- Shows both user profiles
- Shows connection details
- Use this to debug issues

### Delete Users
- **Delete Shane Long**: Complete removal
- **Delete Allison Tam**: Complete removal
- Removes all associated data
- Use this to start fresh

## Automatic Features

### Auto-Reset on Verification
When Allison uses TESTCODE:
- If already accepted, automatically resets connection
- Deletes old connection
- Creates new connection
- Updates invitation status

This allows testing the invitation flow multiple times without manual cleanup.

### Idempotent Creation
The "Ensure Connected" function is idempotent:
- Can be called multiple times safely
- Only creates what doesn't exist
- Updates nothing if already correct
- Returns current state

## Testing Workflows

### Test Prompt Flow
1. **Ensure Connected** (Ctrl+Shift+D → ✨ Ensure Connected)
2. **Login as Shane** (shanelong@gmail.com)
3. **Go to Prompts tab**
4. **Answer a prompt**
5. **Logout and login as Allison**
6. **View Shane's response**

### Test Chat Flow
1. **Ensure Connected**
2. **Login as Shane**
3. **Go to Chat tab**
4. **Send message to Allison**
5. **Login as Allison** (different browser/incognito)
6. **See Shane's message**
7. **Reply to Shane**
8. **Check real-time sync**

### Test Media Flow
1. **Ensure Connected**
2. **Login as Shane**
3. **Go to Media Library tab**
4. **Upload photo/video/voice**
5. **Add description and tags**
6. **Login as Allison**
7. **View shared media**
8. **Test filters and search**

## Troubleshooting

### Users not connected
**Solution**: Click "✨ Ensure Connected"

### Can't login
**Solution**: 
1. Delete users
2. Click "✨ Ensure Connected"
3. Try logging in again
4. If still fails, check browser console for errors

### Connection shows as inactive
**Solution**:
1. Check connection status
2. Click "✨ Ensure Connected" to fix
3. Verify both users exist

### Invitation code doesn't work
**Solution**:
1. Click "Reset Invitation"
2. Click "✨ Ensure Connected"
3. Try again

## Notes

- Test users are created with minimal data
- Birthdays are set to realistic values for personas
- Phone numbers are fake but valid format
- Connection expires after 1 year (can be extended)
- All data is stored in KV store
- No Supabase Auth involved (custom auth)

## Future Improvements

### Potential Enhancements
- Add sample memories on connection
- Add sample prompts with answers
- Add sample chat messages
- Pre-populate with realistic test data
- Add multiple test connections

### Production Considerations
- This is for testing ONLY
- Remove test endpoints in production
- Remove Ctrl+Shift+D debug panel
- Remove auto-reset functionality
- Require proper invitation flow

## Summary

The "✨ Ensure Connected" button is your one-click solution to set up Shane and Allison for testing. It handles everything automatically and is safe to use repeatedly. Once connected, you can test all features of the Adoras app without worrying about the signup/invitation flow.

**Quick Start:**
1. Press Ctrl+Shift+D
2. Click "✨ Ensure Connected"
3. Login as Shane or Allison
4. Start testing!
