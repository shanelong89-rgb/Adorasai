# 🔍 Invitation Code Debugging Guide

## Issue

You're getting **"Invalid invitation code"** error when trying to use code `FAM-2025-ESFQV` from `shanelong89@gmail.com`.

## What I Added

I've added comprehensive diagnostic tools to help debug this:

### 1. **New Diagnostic Endpoints** (Backend)

Three new endpoints that show what's actually in the database:

```
GET /make-server-deded1eb/diagnostic/invitations
GET /make-server-deded1eb/diagnostic/users  
GET /make-server-deded1eb/diagnostic/connections
```

### 2. **Invitation Diagnostic Component** (Frontend)

A new diagnostic panel that shows:
- ✅ All invitation codes in the database
- ✅ All registered users (Keepers and Tellers)
- ✅ All connections between users

---

## How to Use the Diagnostic Tool

### Step 1: Open Debug Panel

1. **Sign in** to the app (as either user)
2. **Open Settings** (gear icon in dashboard)
3. **Scroll down** and click **"🐛 Debug Panel"**
4. **Click the "Test" tab** at the top

### Step 2: Run Invitation Diagnostic

1. In the Test tab, scroll down to **"🔍 Database Diagnostic"** card
2. Click **"Check All"** button
3. Wait 3-5 seconds (server cold start is normal)

### Step 3: Review Results

The diagnostic will show you:

#### Invitations Section
- **Total invitations** in database
- **Each invitation code** with:
  - Code (e.g., `FAM-2025-ESFQV`)
  - Status (`sent`, `accepted`, or `expired`)
  - Teller name and phone number
  - Keeper ID who created it
  - Sent and expiry dates

#### Users Section
- **All registered users** with:
  - Name
  - Email
  - Type (Keeper or Teller)
  - Phone number
  - User ID
  - Creation date

#### Connections Section
- **All active connections** with:
  - Keeper info
  - Teller info
  - Connection status
  - Invitation code used
  - Creation date

---

## Expected Results

### If Invitation Exists ✅

You'll see:
```
Invitations (1)
┌─────────────────────┐
│ FAM-2025-ESFQV      │
│ Status: sent        │
│ Teller: [Name]      │
│ Keeper ID: 173...   │
│ Sent: Oct 28, 2025  │
│ Expires: Nov 4, 2025│
└─────────────────────┘
```

**This means the invitation is valid!** The issue might be:
- Typo in the code entry
- Code already accepted
- Code expired

### If Invitation Doesn't Exist ❌

You'll see:
```
Invitations (0)
⚠️ No invitations found in database.
A Legacy Keeper needs to create one first.
```

**This means:**
- The invitation was never created in the first place
- Or there was an error during creation
- Or it was deleted

---

## Troubleshooting Scenarios

### Scenario 1: "No invitations found"

**Problem:** The invitation code `FAM-2025-ESFQV` doesn't exist in the database.

**Solutions:**
1. **Create a new invitation** from the Keeper's account:
   - Sign in as `shanelong89@gmail.com` (Legacy Keeper)
   - Go to Settings → Account
   - Scroll to "Storyteller Invitations" section
   - Click "Create New Invitation"
   - Fill in the Storyteller's info
   - Click "Send Invitation"
   - Copy the new code shown

2. **Check if the user who created it is actually registered:**
   - Look in the "Users" section
   - Find `shanelong89@gmail.com`
   - Verify they are type: `keeper`

### Scenario 2: "Invitation exists but says 'accepted'"

**Problem:** Code was already used by someone else.

**Solution:**
- Create a new invitation (see Scenario 1)
- Use the TESTCODE for testing (auto-resets)

### Scenario 3: "Invitation exists but expired"

**Problem:** Code was created more than 7 days ago.

**Solution:**
- Create a new invitation (see Scenario 1)
- Invitations expire after 7 days for security

### Scenario 4: "User shanelong89@gmail.com doesn't exist"

**Problem:** The Keeper account was never properly created.

**Solution:**
1. **Sign up again** as `shanelong89@gmail.com`
2. Choose **"Legacy Keeper"** user type
3. Complete onboarding
4. Then create invitation

---

## Using TESTCODE for Testing

For testing purposes, there's a special code **`TESTCODE`** that:

✅ **Auto-creates** if it doesn't exist  
✅ **Auto-resets** if already used  
✅ **Never expires**  
✅ **Connects:** `shanelong@gmail.com` (not shanelong89!) → `allison.tam@hotmail.com`

**How to use:**
1. Make sure `shanelong@gmail.com` is signed up as Keeper
2. Use code `TESTCODE` when signing up as Teller
3. It will automatically create/reset the invitation

**Note:** `TESTCODE` is hardcoded to work with `shanelong@gmail.com` (without the 89).

---

## Creating a Fresh Invitation

### As Legacy Keeper (shanelong89@gmail.com):

1. **Sign in** to the app
2. **Go to Settings** (gear icon)
3. **Click "Account" tab**
4. **Scroll to "Storyteller Invitations"**
5. **Click "Create New Invitation"**
6. **Fill in the form:**
   - Phone Number: `+1234567890` (or real phone)
   - Name: `[Storyteller's name]`
   - Relationship: `Parent`, `Grandparent`, etc.
   - Birthday: (optional)
   - Bio: (optional)
   - Photo: (optional)
7. **Click "Send Invitation"**
8. **Copy the code** shown (e.g., `FAM-2025-ABC12`)
9. **Share it** with the Storyteller

### As Storyteller (receiving the invitation):

1. **Open the app**
2. **Click "Sign Up"**
3. **Select "Storyteller"**
4. **Enter the invitation code** (e.g., `FAM-2025-ABC12`)
5. **Click "Verify Code"**
6. If valid, you'll see the Keeper's name
7. **Complete signup**
8. You're connected! 🎉

---

## Live Debugging Session

If the diagnostic shows unexpected results, here's what to check:

### Check 1: User Email
```
Expected: shanelong89@gmail.com
Found in DB: shanelong89@gmail.com ✅
```

### Check 2: User Type
```
Expected: keeper
Found in DB: keeper ✅
```

### Check 3: Invitation Code
```
Expected: FAM-2025-ESFQV
Found in DB: FAM-2025-ESFQV ✅
```

### Check 4: Invitation Status
```
Expected: sent
Found in DB: sent ✅
```

### Check 5: Expiry Date
```
Expected: Future date
Found in DB: Nov 4, 2025 ✅ (if today is before Nov 4)
```

---

## Quick Fix: Use the Debug Panel to Connect Users Directly

If you just want to test the app without dealing with invitation codes:

1. **Open Debug Panel**
2. **Go to "Test" tab**
3. **Find "Deep Clean & Connect"** section
4. **Click "🧹 Deep Clean & Connect Shane → Allison"**
5. This will:
   - Remove ALL existing connections
   - Create a direct connection between Shane and Allison
   - Skip the invitation process entirely

**Note:** This requires both users to already be signed up.

---

## Server Logs

The backend logs detailed information when verifying invitation codes. Check the console logs:

```
🔍 Verifying invitation code: FAM-2025-ESFQV
✅ Code format valid
🔑 Looking up KV key: invitation:FAM-2025-ESFQV
❌ Invitation not found in KV store for code: FAM-2025-ESFQV
📋 Total invitations in database: 0
📋 No invitations in database. A keeper needs to create one first.
```

This tells you exactly what's happening!

---

## Summary

**To debug invitation code issues:**

1. ✅ Open Debug Panel → Test tab
2. ✅ Click "Check All" in Database Diagnostic
3. ✅ Review what invitations actually exist
4. ✅ Verify the user who created it exists
5. ✅ Check invitation status and expiry
6. ✅ Create new invitation if needed

**Most common issue:** The invitation was never successfully created in the database. Create a new one!

---

## Need Help?

If you're still seeing issues after checking the diagnostic:

1. Copy the diagnostic output (all three sections)
2. Share the server logs from browser console
3. Tell me what you see vs. what you expected
4. I can help debug further!

The diagnostic tool will show us **exactly** what's in the database, so we can pinpoint the issue immediately. 🔍
