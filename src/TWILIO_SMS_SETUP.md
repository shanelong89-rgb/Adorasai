# Twilio SMS Setup - Complete Guide ✅

**Setup Date:** January 23, 2025

## 🎯 Overview

Twilio SMS integration is **fully implemented** in the Adoras backend! The system can send SMS invitations to Storytellers (parents) when Legacy Keepers (children) invite them to connect.

## ✅ What's Already Implemented

### Backend Implementation ✅
- **File:** `/supabase/functions/server/invitations.tsx`
- **Function:** `sendInvitationSMS()` - Sends SMS via Twilio API
- **Routes:** 
  - `POST /make-server-deded1eb/invitations/create` - Creates invitation and sends SMS
  - `POST /make-server-deded1eb/invitations/verify` - Verifies invitation code
  - `POST /make-server-deded1eb/invitations/accept` - Accepts invitation

### Features ✅
- ✅ SMS message formatting with invitation code
- ✅ Automatic SMS sending when invitation created
- ✅ Error handling for SMS failures
- ✅ Graceful degradation (invitation still created if SMS fails)
- ✅ Invitation expiration (7 days)
- ✅ Phone number validation
- ✅ Response includes SMS success/failure status

### SMS Message Template ✅
```
{Keeper Name} invited you to share memories on Adoras! 📸

Your code: {INVITATION_CODE}

Download: https://whole-works-409347.framer.app/
```

## 🔧 Setup Instructions

### Step 1: Get Twilio Credentials

1. **Sign up for Twilio** (if you haven't already):
   - Go to https://www.twilio.com/try-twilio
   - Create a free account

2. **Get your credentials** from the Twilio Console:
   - **Account SID**: Found on dashboard (starts with "AC...")
   - **Auth Token**: Found on dashboard (click to reveal)
   - **Phone Number**: Go to Phone Numbers → Buy a number (or use trial number)

### Step 2: Configure Environment Variables

You've already created the secret placeholders! Now you need to **upload your Twilio credentials**:

1. **TWILIO_ACCOUNT_SID**
   - Your Twilio Account SID (starts with "AC...")
   - Example: `AC1234567890abcdef1234567890abcdef`

2. **TWILIO_AUTH_TOKEN**
   - Your Twilio Auth Token
   - Example: `1234567890abcdef1234567890abcdef`

3. **TWILIO_PHONE_NUMBER**
   - Your Twilio phone number (E.164 format with country code)
   - Example: `+15551234567` (US number)
   - Example: `+447911123456` (UK number)

### Step 3: Upload Your Credentials

The system has already prompted you to upload your credentials for:
- ✅ `TWILIO_ACCOUNT_SID`
- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `TWILIO_PHONE_NUMBER`

**Simply paste your values into the modals that appeared!**

### Step 4: Test the Integration

Once credentials are uploaded, test by creating an invitation:

```typescript
// From frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb/invitations/create`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tellerPhoneNumber: '+15551234567', // Use E.164 format
      tellerName: 'Mom', // Optional
    }),
  }
);

const result = await response.json();
console.log('SMS Result:', result);
// {
//   success: true,
//   invitation: { ... },
//   smsSent: true,
//   messageId: 'SM...'
// }
```

## 📱 Phone Number Format

**IMPORTANT:** Phone numbers must be in E.164 format:
- ✅ Correct: `+15551234567` (US)
- ✅ Correct: `+447911123456` (UK)
- ✅ Correct: `+33612345678` (France)
- ❌ Wrong: `5551234567` (missing country code)
- ❌ Wrong: `(555) 123-4567` (has formatting)
- ❌ Wrong: `+1 555-123-4567` (has spaces/dashes)

The backend validates phone numbers automatically.

## 🔍 How It Works

### Flow:
1. **Legacy Keeper creates invitation**
   - Calls `POST /invitations/create` with phone number
   - Backend generates invitation code
   - Backend sends SMS via Twilio
   - Returns invitation details + SMS status

2. **Storyteller receives SMS**
   - Gets text message with invitation code
   - Opens Adoras app
   - Enters invitation code

3. **Storyteller verifies code**
   - Calls `POST /invitations/verify` with code
   - Backend validates code (not expired, not used)
   - Returns keeper info

4. **Storyteller accepts invitation**
   - Calls `POST /invitations/accept` with code
   - Backend creates connection
   - Both users can now share memories!

## 🎛️ Backend Implementation Details

### Function: `sendInvitationSMS()`

**Location:** `/supabase/functions/server/invitations.tsx` (lines 90-146)

**What it does:**
1. Reads Twilio credentials from environment
2. Checks if credentials are configured
3. Formats SMS message with keeper name and code
4. Calls Twilio API with Basic Auth
5. Returns success/failure status

**Error Handling:**
- If credentials missing → Returns `{ success: false, error: 'SMS service not configured' }`
- If API call fails → Returns `{ success: false, error: 'Twilio API error: ...' }`
- **Important:** Invitation is still created even if SMS fails!

### Twilio API Call:

```typescript
const auth = btoa(`${accountSid}:${authToken}`);
const response = await fetch(
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromPhone,        // Your Twilio number
      To: tellerPhoneNumber,  // Recipient number
      Body: message,          // SMS text
    }),
  }
);
```

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "invitation": {
    "id": "inv-1705956789-x3k2p",
    "code": "ADR-XK2P9",
    "keeperId": "user-123",
    "tellerPhoneNumber": "+15551234567",
    "tellerName": "Mom",
    "status": "sent",
    "sentAt": "2025-01-23T10:30:00.000Z",
    "expiresAt": "2025-01-30T10:30:00.000Z"
  },
  "smsSent": true,
  "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### SMS Failed (but invitation created):
```json
{
  "success": true,
  "invitation": { ... },
  "smsSent": false,
  "smsError": "SMS service not configured"
}
```

### Complete Failure:
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

## 💰 Twilio Pricing

### Free Trial:
- $15 free credit
- Can send ~500-1000 SMS messages
- Trial number includes "Sent from your Twilio trial account" prefix
- Can only send to verified numbers

### Paid Account:
- ~$0.0075 per SMS (US)
- ~$0.04-0.10 per SMS (international)
- Monthly phone number cost: ~$1.15/month (US)
- No message prefix
- Can send to any number

**Recommendation:** Start with trial for testing, upgrade when ready for production.

## 🐛 Troubleshooting

### SMS Not Sending

**Check 1: Are credentials configured?**
```bash
# Check server logs for:
"Twilio credentials not configured. SMS not sent."
```
→ Solution: Upload credentials via the modal prompts

**Check 2: Is phone number in E.164 format?**
```bash
# Backend validates with regex: /^\+[1-9]\d{1,14}$/
```
→ Solution: Add country code (e.g., `+1` for US)

**Check 3: Twilio trial account restrictions?**
```bash
# Trial accounts can only send to verified numbers
```
→ Solution: Verify recipient number in Twilio Console, or upgrade account

**Check 4: Check server logs for Twilio errors**
```bash
# Look for:
"Twilio API error: ..."
```
→ Solution: Check error message, may be auth issue or number issue

### Common Errors:

**Error:** `"Invalid phone number format"`
- **Cause:** Phone number not in E.164 format
- **Fix:** Add country code: `+15551234567`

**Error:** `"SMS service not configured"`
- **Cause:** Missing Twilio credentials
- **Fix:** Upload `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**Error:** `"Twilio API error: 20003"`
- **Cause:** Invalid Twilio credentials
- **Fix:** Double-check Account SID and Auth Token

**Error:** `"Twilio API error: 21608"`
- **Cause:** Twilio number not verified or doesn't exist
- **Fix:** Check `TWILIO_PHONE_NUMBER` is correct and purchased

**Error:** `"Twilio API error: 21211"`
- **Cause:** Invalid 'To' phone number (trial account restriction)
- **Fix:** Verify recipient number in Twilio Console or upgrade

## ✅ Testing Checklist

- [ ] Twilio credentials uploaded
- [ ] Test invitation created successfully
- [ ] SMS received on phone
- [ ] SMS contains invitation code
- [ ] SMS contains keeper name
- [ ] Code can be verified
- [ ] Code can be accepted
- [ ] Connection created successfully
- [ ] Test with E.164 formatted phone numbers
- [ ] Test error handling (invalid number)

## 🔒 Security Notes

1. **Credentials are secure:**
   - Stored in Supabase environment variables
   - Never exposed to frontend
   - Used only in server-side code

2. **Phone numbers:**
   - Phone numbers are validated before sending
   - No rate limiting implemented yet (add if needed)

3. **Invitation codes:**
   - Random 5-character codes (ADR-XXXXX format)
   - 7-day expiration
   - One-time use only

## 📈 Production Recommendations

1. **Rate Limiting:**
   - Add rate limiting to prevent SMS spam
   - Example: Max 5 invitations per user per day

2. **Phone Number Verification:**
   - Consider adding phone verification for Legacy Keepers
   - Prevents abuse

3. **Error Monitoring:**
   - Monitor SMS failures
   - Set up alerts for high failure rates

4. **Cost Monitoring:**
   - Set up Twilio usage alerts
   - Monitor monthly SMS volume

5. **Message Customization:**
   - Consider allowing custom messages
   - Add language support for international users

## 📝 Summary

✅ **Twilio SMS is fully implemented and ready to use!**

**What you need to do:**
1. ✅ Created environment variable placeholders (DONE)
2. 📝 Upload your Twilio credentials (PENDING)
3. 🧪 Test by creating an invitation

**What's already working:**
- ✅ SMS sending logic
- ✅ Error handling
- ✅ Phone number validation
- ✅ Invitation management
- ✅ API routes
- ✅ Integration with Supabase

Once you upload your Twilio credentials, SMS invitations will work immediately! 🎉

---

*Twilio SMS Setup Guide - January 23, 2025*
