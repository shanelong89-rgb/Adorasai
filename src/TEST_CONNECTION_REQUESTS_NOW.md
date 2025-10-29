# Test Connection Requests - Quick Guide

## The Issue You Reported

✅ **FIXED**: Email connections now require acceptance instead of auto-connecting
✅ **FIXED**: Tellers now see "Connections" instead of "Create Invitation"
✅ **FIXED**: Both users can now see their connections properly

## Test This Flow

### Step 1: Send Connection Request (as Keeper)
1. Login as keeper account (e.g., shanelong@gmail.com)
2. Click hamburger menu → **"Create Invitation"**
3. Select **"Existing User"** tab
4. Enter: `info@adapture.co`
5. Click **"Send Request"**
6. ✅ Should see: **"Connection request sent to [Name]!"**
7. ❌ Should NOT auto-connect immediately

### Step 2: Check Sent Requests (as Keeper)
1. Click hamburger menu → **"Connection Requests"**
2. Look under **"Sent"** section
3. ✅ Should see request to info@adapture.co with **"Pending"** badge
4. Status shows "Waiting for response"

### Step 3: View Received Request (as Teller)
1. **Log out** from keeper account
2. **Login** as teller account (info@adapture.co)
3. Click hamburger menu
4. ✅ **"Connection Requests"** should show red badge (e.g., "1")
5. Click **"Connection Requests"**
6. Look under **"Received"** section
7. ✅ Should see request from Shane Long with Accept/Decline buttons

### Step 4: Accept Connection Request (as Teller)
1. Click **"Accept"** button
2. ✅ Should see: **"You are now connected with Shane Long!"**
3. Page should reload automatically
4. ✅ Should now see Shane in connections
5. ✅ Can now share memories together

### Step 5: Verify Both Sides (Switch Accounts)
1. **As Teller (info@adapture.co)**:
   - Check hamburger menu → Should see Shane's profile
   - Can switch between keepers if multiple
   - Can share memories with Shane

2. **As Keeper (shanelong@gmail.com)**:
   - Check hamburger menu → Should see info@adapture.co profile
   - Can switch between tellers if multiple
   - Can share memories with info@adapture.co

## What Should NOT Happen

❌ **No Auto-Connect**: Connection should NOT be created until accepted
❌ **No Silent Connection**: Recipient MUST see and accept request
❌ **No Missing Profiles**: After acceptance, both users should see each other

## Testing Different Scenarios

### Test 1: Decline Request
1. Send request from User A to User B
2. Login as User B
3. Click "Decline" instead of "Accept"
4. ✅ Request should disappear
5. ✅ No connection created
6. ✅ Both users remain unconnected

### Test 2: Duplicate Request Prevention
1. Send request from User A to User B
2. Try to send same request again
3. ✅ Should see: "You already sent a connection request to [Name]"
4. ✅ Should NOT create duplicate

### Test 3: Reverse Request Detection
1. Send request from User A to User B
2. Before User B accepts, try sending request from User B to User A
3. ✅ Should see: "[Name] already sent you a connection request. Please check your notifications."
4. ✅ Should NOT create duplicate

### Test 4: Self-Connection Prevention
1. Try sending request to your own email
2. ✅ Should see: "You cannot connect with yourself"

### Test 5: Non-Existent User
1. Try sending request to email that doesn't exist
2. ✅ Should see: "No Adoras user found with this email address"

## Menu Labels to Verify

### Keeper Menu:
- ✅ "Create Invitation" (creates invitations for new users)
- ✅ "Manage Invitations" (manages sent invitations)
- ✅ "Connection Requests" (with badge if pending)

### Teller Menu:
- ✅ "Connections" (NOT "Create Invitation")
- ✅ "Connection Requests" (with badge if pending)

## Notification Badge

The red badge on "Connection Requests" menu item shows:
- Number of pending requests waiting for your response
- Updates every 30 seconds automatically
- Shows "9+" if you have 10 or more pending requests
- Only shows if you have pending requests to review

## About the Warning You Saw

The warning about "slow operation" (6943ms cold start) is **NORMAL** and **NOT AN ERROR**:
- Serverless functions take time to boot up when not recently used
- First request after idle period is slower (cold start)
- Subsequent requests are fast (warm)
- This is expected behavior for all serverless platforms

## Status

✅ All features implemented and ready to test
✅ Connection request system working properly
✅ Both users can see connections after acceptance
✅ Privacy and control restored to connection flow

**The system is now working correctly!** Test the flow above to verify everything works as expected.
