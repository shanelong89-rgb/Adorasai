# 🔄 Update Your Twilio Credentials - Action Required

**Date:** December 28, 2024

## ✅ Good News!

The Twilio environment variables **already exist** in your Supabase project:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

However, they currently have placeholder/invalid values. Now that you've signed up for Twilio, you need to **UPDATE** these with your real credentials.

## 🎯 What To Do Right Now

### Step 1: Get Your Twilio Credentials

Go to your Twilio Console: https://console.twilio.com

You need these 3 values:

1. **Account SID** (starts with "AC", 34 characters total)
   - Found on the main dashboard
   - Example: `AC1234567890abcdef1234567890abcdef`

2. **Auth Token** (32 characters)
   - Found on the main dashboard
   - Click the eye icon to reveal it
   - Example: `1234567890abcdef1234567890abcdef`

3. **Phone Number** (E.164 format)
   - Go to: Phone Numbers → Manage → Buy a Number
   - Or use your trial number
   - Format: `+15551234567` (must include country code)

### Step 2: Update in Supabase

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/[your-project-id]

Then:
1. Click **Project Settings** (gear icon in bottom left)
2. Click **Edge Functions** in the left sidebar
3. Click **Secrets** tab
4. Find each of these three secrets and click **Edit**:
   - `TWILIO_ACCOUNT_SID` → paste your Account SID
   - `TWILIO_AUTH_TOKEN` → paste your Auth Token  
   - `TWILIO_PHONE_NUMBER` → paste your phone number (with country code)
5. Click **Save** for each one

### Step 3: Restart Edge Functions (Optional)

The edge functions should automatically pick up the new values, but if needed:
1. In Supabase Dashboard → Edge Functions
2. Click the three dots next to "make-server-deded1eb"
3. Click "Restart"

### Step 4: Test!

1. Open your Adoras app
2. As a Legacy Keeper, create a new invitation
3. Use your own phone number for testing (include country code!)
4. You should receive an SMS within seconds!

## 📱 IMPORTANT: Phone Number Format

When you enter phone numbers in the app, they MUST be in E.164 international format:

✅ **Correct:**
- `+15551234567` (US)
- `+447911123456` (UK)
- `+61412345678` (Australia)

❌ **Wrong:**
- `5551234567` (missing +1)
- `(555) 123-4567` (has formatting)
- `+1 555-123-4567` (has spaces)

## 🧪 Test SMS Message

Once setup, recipients will receive:
```
[Your Name] invited you to share memories on Adoras! 📸

Your code: ADR-XK2P9

Download: https://whole-works-409347.framer.app/
```

## ⚠️ Trial Account Notes

If you're using a **Twilio Trial Account**:

1. **Verification Required:**
   - You can only send SMS to verified numbers
   - Go to: Phone Numbers → Manage → Verified Caller IDs
   - Add your test phone number and verify it

2. **Message Prefix:**
   - Trial SMS will include: "Sent from your Twilio trial account"
   - This is normal and expected

3. **Free Credit:**
   - You have $15 free credit
   - Enough for 500-1000 test messages
   - Upgrade when ready for production

## 🎯 How to Verify Numbers (Trial Account)

1. Go to Twilio Console
2. Click **Phone Numbers** in left sidebar
3. Click **Manage** → **Verified Caller IDs**
4. Click **Add New Caller ID**
5. Enter the phone number you want to test with
6. Twilio will call or SMS you a verification code
7. Enter the code to verify
8. Now you can send SMS to this number!

## 🐛 Troubleshooting

### If SMS doesn't send:

**Check 1: Server Logs**
Look for these in your Supabase Edge Function logs:
- ✅ `"✅ SMS sent successfully"` → Working!
- ⚠️ `"⚠️ Twilio credentials not configured"` → Credentials empty
- ⚠️ `"⚠️ Invalid Twilio Account SID format"` → Wrong Account SID format
- ❌ `"❌ Twilio API error: 20003"` → Wrong credentials
- ❌ `"❌ Twilio API error: 21211"` → Number not verified (trial account)

**Check 2: Credentials Format**
- Account SID: Must start with "AC" and be exactly 34 characters
- Auth Token: Must be exactly 32 characters
- Phone Number: Must start with + and include country code

**Check 3: Trial Account**
- Is the recipient number verified in Twilio?
- Trial accounts cannot send to unverified numbers

**Check 4: Phone Number Format**
- Did you include the country code?
- No spaces, dashes, or parentheses?
- Format: `+[country][number]`

### Common Twilio Errors:

| Error | Meaning | Fix |
|-------|---------|-----|
| 20003 | Authentication failed | Check Account SID and Auth Token |
| 21608 | From number invalid | Check TWILIO_PHONE_NUMBER |
| 21211 | To number invalid | Verify number (if trial) or check format |
| 63016 | Cannot route | Number doesn't exist |

## ✅ Success Checklist

- [ ] Found Account SID in Twilio Console
- [ ] Found Auth Token in Twilio Console  
- [ ] Got or bought a phone number
- [ ] Updated TWILIO_ACCOUNT_SID in Supabase
- [ ] Updated TWILIO_AUTH_TOKEN in Supabase
- [ ] Updated TWILIO_PHONE_NUMBER in Supabase (with +)
- [ ] Verified test number (if using trial)
- [ ] Created test invitation
- [ ] Received SMS successfully
- [ ] Code in SMS matches app
- [ ] Accepted invitation successfully

## 🎉 After Setup

Once your credentials are updated:
- ✅ SMS will send automatically when invitations are created
- ✅ Storytellers will receive invitation codes via SMS
- ✅ Codes expire after 7 days
- ✅ Each code can only be used once
- ✅ If SMS fails, users can still manually share the code

## 💡 Pro Tips

1. **Test with yourself first** - Use your own phone number to verify everything works
2. **Save your credentials** - Keep them somewhere safe for future reference
3. **Monitor usage** - Check Twilio Console to see SMS sent and costs
4. **Upgrade when ready** - Remove trial restrictions when you're ready for production
5. **International users** - Make sure they include their country code when entering numbers

## 🆘 Need Help?

If you're stuck:
1. Check the server logs for specific Twilio error codes
2. Verify your credentials are copied correctly (no extra spaces)
3. Test with a verified phone number first (if using trial)
4. Double-check phone number format includes country code

---

## 📝 Quick Copy-Paste Template

When updating in Supabase, you'll paste values like this:

```
TWILIO_ACCOUNT_SID = AC[paste your 32 character SID here]
TWILIO_AUTH_TOKEN = [paste your 32 character token here]
TWILIO_PHONE_NUMBER = +1[paste your number here]
```

Example (don't copy these - they're fake):
```
TWILIO_ACCOUNT_SID = AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN = 9876543210fedcba9876543210fedcba
TWILIO_PHONE_NUMBER = +15551234567
```

---

**That's it! Update these 3 values and SMS invitations will start working immediately.** 🚀

*The code is already fully implemented - you just need to add your real credentials!*
