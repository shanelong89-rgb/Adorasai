# Test Invitation Setup Guide

## Overview
This guide explains how to setup and test the invitation code **FAM-2024-XY9K** connecting Shane Long (shanelong@gmail.com) to Allison Tam (allison.tam@hotmail.com).

## Quick Access

### Using the Debug Panel
1. Open the app
2. Press **Ctrl+Shift+D** (or **Cmd+Shift+D** on Mac) to open the Debug Panel
3. Click the **"Test"** tab
4. Use the buttons to setup and check the invitation

### Manual API Access

#### 1. Setup Invitation
```bash
POST https://ipmtgtnshqmpbcwmpxco.supabase.co/functions/v1/make-server-deded1eb/test/setup-invitation
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbXRndG5zaHFtcGJjd21weGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzIwMzksImV4cCI6MjA0NTIwODAzOX0.P1gI_sjWXA9dNPrWNSr7vQVXzaJlPCHE-5YCp9gBN2k
```

#### 2. Check Connection Status
```bash
GET https://ipmtgtnshqmpbcwmpxco.supabase.co/functions/v1/make-server-deded1eb/test/check-connection
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbXRndG5zaHFtcGJjd21weGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzIwMzksImV4cCI6MjA0NTIwODAzOX0.P1gI_sjWXA9dNPrWNSr7vQVXzaJlPCHE-5YCp9gBN2k
```

## Testing Flow

### Step 1: Verify Shane Long's Account
1. Shane Long should be signed up with:
   - Email: shanelong@gmail.com
   - User Type: Keeper (Legacy Keeper)
   - Name: Shane Long

### Step 2: Setup the Invitation
1. Click "Setup Invitation" in the Debug Panel Test tab
2. This will:
   - Find Shane Long's user profile
   - Create invitation code **FAM-2024-XY9K**
   - Link it to Shane Long's account
   - Set expiration to 90 days from now
   - Set expected teller name to "Allison Tam"

### Step 3: Allison Signs Up
1. Allison Tam should sign up as a Storyteller (Teller)
2. During signup, enter the invitation code: **FAM-2024-XY9K**
3. The code will be verified and accepted
4. A connection will be created between Shane and Allison

### Step 4: Verify the Connection
1. Click "Check Connection" in the Debug Panel Test tab
2. This will show:
   - Shane Long's profile (should be "keeper" type)
   - Allison Tam's profile (should be "teller" type)
   - Connection status (should be "connected")
   - Connection details (invitation code, status, created date)

## Expected Results

### After Setup (Before Allison Signs Up)
```json
{
  "success": true,
  "invitation": {
    "code": "FAM-2024-XY9K",
    "status": "sent",
    "keeperId": "<Shane's User ID>",
    "tellerName": "Allison Tam",
    "expiresAt": "<90 days from now>"
  },
  "keeper": {
    "name": "Shane Long",
    "email": "shanelong@gmail.com",
    "type": "keeper"
  }
}
```

### After Connection (After Allison Signs Up)
```json
{
  "success": true,
  "shane": {
    "name": "Shane Long",
    "email": "shanelong@gmail.com",
    "type": "keeper"
  },
  "allison": {
    "name": "Allison Tam",
    "email": "allison.tam@hotmail.com",
    "type": "teller"
  },
  "connected": true,
  "connection": {
    "status": "active",
    "invitationCode": "FAM-2024-XY9K",
    "createdAt": "<timestamp>"
  }
}
```

## Troubleshooting

### Shane Long Not Found
- Make sure Shane is signed up at shanelong@gmail.com
- Check if the email is exactly correct (no typos)
- Sign up Shane as a Keeper first

### Invitation Already Exists
- This is normal if you've run the setup before
- The existing invitation will be shown
- You can still use it for testing

### Allison Can't Sign Up with Code
- Make sure the code is typed exactly: **FAM-2024-XY9K**
- Check if the invitation has expired
- Run the setup again to refresh the expiration date

### Connection Not Found
- Make sure Allison has completed the signup process
- Check if she entered the invitation code during signup
- Verify both users exist in the database

## Backend Implementation

### Files Created/Modified
- `/supabase/functions/server/setup_test_invitation.tsx` - Test setup utility functions
- `/supabase/functions/server/index.tsx` - Added test endpoints
- `/components/TestInvitationDebug.tsx` - Frontend debug component
- `/components/DebugPanel.tsx` - Added "Test" tab

### API Endpoints Added
- `POST /make-server-deded1eb/test/setup-invitation` - Setup test invitation
- `GET /make-server-deded1eb/test/check-connection` - Check connection status

## Development Mode

The invitation system includes a development mode that automatically creates test invitations when codes don't exist. However, this guide provides a more controlled way to setup specific test scenarios.

## Notes

- The invitation code **FAM-2024-XY9K** is specifically for Shane and Allison
- The code expires after 90 days (can be adjusted in the setup script)
- This is a test/development feature - in production, Keepers create invitations through the UI
- The Debug Panel is only available when `localStorage.getItem('adoras-debug') === 'true'` or in development mode
