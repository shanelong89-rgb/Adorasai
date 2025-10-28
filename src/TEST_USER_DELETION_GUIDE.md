# Test User Deletion & Fresh Invitation Setup Guide

## Overview
Complete system to delete test users and create fresh invitation codes for testing the Keeper-Teller connection flow.

## Quick Start

### Step 1: Open Debug Panel
Press **Ctrl+Shift+D** (or **Cmd+Shift+D** on Mac) to open the Test Invitation Debug panel.

### Step 2: Delete Shane Long (if exists)
1. Click **"Delete Shane Long"** button
2. Confirm the deletion
3. Wait for success message showing:
   - User deleted
   - Connections removed
   - Invitations cleared
   - Memories deleted

### Step 3: Re-register Shane Long
1. Sign up as a **Legacy Keeper** with:
   - Email: `shanelong@gmail.com`
   - Password: (your choice)
   - Name: Shane Long
   - Type: keeper

### Step 4: Setup Fresh Invitation
1. Click **"Setup Invitation"** button
2. System creates invitation code: **FAM-2024-XY9K**
3. Verify success message shows:
   - Invitation Code: FAM-2024-XY9K
   - Keeper: Shane Long
   - Expected Teller: Allison Tam
   - Status: sent
   - Expires: (90 days from now)

### Step 5: Register Allison Tam (Teller)
1. Sign up as a **Storyteller** with:
   - Invitation Code: `FAM-2024-XY9K`
   - Email: `allison.tam@hotmail.com`
   - Password: (your choice)
   - Name: Allison Tam

### Step 6: Verify Connection
1. Click **"Check Connection"** button
2. Verify both users are connected:
   - Shane Long: keeper
   - Allison Tam: teller
   - Status: Connected

## API Endpoints

### Delete User
```
POST /make-server-deded1eb/test/delete-user
Body: { "email": "shanelong@gmail.com" }
```

Deletes:
- User profile
- All connections (and updates partner's connection list)
- All invitations sent by user
- All memories created by user
- All associated lists

### Setup Invitation
```
POST /make-server-deded1eb/test/setup-invitation
Body: { "forceReset": false }
```

Creates invitation code FAM-2024-XY9K linking Shane to Allison.

### Reset Invitation
```
POST /make-server-deded1eb/test/reset-invitation
```

Clears only the invitation and its connection without deleting users.

### Check Connection
```
GET /make-server-deded1eb/test/check-connection
```

Returns status of Shane and Allison's connection.

## Auto-Reset Feature

The invitation verification automatically handles the test code **FAM-2024-XY9K**:

- **Auto-create**: If code doesn't exist and Shane exists, creates it automatically
- **Auto-reset**: If code is already accepted, resets it to 'sent' status
- **Only for testing**: This behavior ONLY applies to FAM-2024-XY9K

## Testing Workflow

### Full Reset Test
1. Delete Shane Long
2. Delete Allison Tam (if exists)
3. Sign up Shane as Keeper
4. Setup invitation
5. Sign up Allison as Teller with code
6. Check connection

### Partial Reset Test
1. Reset invitation (keeps users)
2. Allison signs up again with same code
3. Check connection

### Quick Re-test
1. Just sign up Allison again with FAM-2024-XY9K
2. Auto-reset will handle the rest
3. Connection created automatically

## Invitation Code Details

**Code**: FAM-2024-XY9K
**Format**: FAM-YYYY-XXXXX (Family-Year-Random)
**Expiration**: 90 days from creation
**Keeper**: Shane Long (shanelong@gmail.com)
**Expected Teller**: Allison Tam (allison.tam@hotmail.com)

## Database Keys Used

- `user:{userId}` - User profile
- `invitation:FAM-2024-XY9K` - Invitation record
- `connection:{connectionId}` - Connection record
- `user_connections:{userId}` - User's connection list
- `user_invitations:{userId}` - User's invitation list
- `connection_memories:{connectionId}` - Connection's memory list
- `memory:{memoryId}` - Individual memories

## Troubleshooting

### "User not found" error
- Shane hasn't signed up yet
- Solution: Sign up Shane as Legacy Keeper first

### "Invitation already accepted" error
- Auto-reset should handle this automatically
- If not working, use "Reset Invitation" button

### "Connection already exists" error
- Previous connection wasn't cleaned up
- Solution: Click "Reset Invitation" or "Delete Users"

### No connection after signup
- Check invitation was created first
- Verify Allison used correct code: FAM-2024-XY9K
- Check "Check Connection" to see status

## Button Reference

| Button | Action | When to Use |
|--------|--------|-------------|
| Reset Invitation | Clears invitation & connection only | Quick re-test without deleting users |
| Setup Invitation | Creates FAM-2024-XY9K code | After Shane signs up |
| Check Connection | Shows connection status | Verify test worked |
| Delete Shane Long | Removes Shane completely | Fresh start needed |
| Delete Allison Tam | Removes Allison completely | Fresh start needed |

## Success Criteria

✅ Shane Long exists as keeper
✅ Invitation FAM-2024-XY9K created
✅ Invitation status: sent
✅ Allison Tam signs up successfully
✅ Connection created automatically
✅ Both users see each other
✅ Connection status: active

## Notes

- This system is for **TESTING ONLY**
- Production invitations will not auto-reset
- FAM-2024-XY9K is a special test code
- Regular invitation codes follow format: FAM-2025-XXXXX
- Regular codes expire in 7 days (test code: 90 days)
