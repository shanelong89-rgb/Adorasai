# Sign In Error: "Invalid login credentials" - Resolution Guide

## Error Message
```
Sign in failed: Invalid login credentials
```

## What This Error Means

This error from Supabase means **one of three things**:

### 1. **You Haven't Created an Account Yet** ⚠️ MOST COMMON
- The email you're trying to sign in with doesn't exist in the system
- **Solution**: Click "Create New Account" button and sign up first

### 2. **Wrong Password**
- The email exists but the password is incorrect
- **Solution**: Double-check your password (check caps lock, typos)

### 3. **Email Not Confirmed** (Rare - Auto-confirmed in Adoras)
- Your email hasn't been confirmed yet
- **Solution**: Check your inbox for confirmation email
- **Note**: Adoras auto-confirms emails during signup, so this is unlikely

## How to Fix

### Step 1: Verify You Have an Account
1. Think back - did you complete the sign-up process?
2. Did you receive a welcome/confirmation email?
3. Have you logged in successfully before?

### Step 2: If You're a NEW User
1. Click the **"Create New Account"** button on the login screen
2. Complete the signup process:
   - Enter your email
   - Create a password
   - Fill in your name and other details
   - Choose Keeper or Teller

### Step 3: If You KNOW You Have an Account
1. **Check your email spelling** - typos are common!
   - Is it `gmail.com` or `gmai.com`?
   - Did you use uppercase letters?
2. **Check your password**
   - Try typing it in a text editor first to see it clearly
   - Check if Caps Lock is on
   - Make sure you're using the correct password

### Step 4: Password Reset (If Needed)
If you're certain you have an account but can't remember the password:
1. Contact support to reset your password
2. Or create a new account with a different email

## Technical Details

The signin process:
1. Frontend sends email + password to backend
2. Backend calls Supabase `signInWithPassword()`
3. Supabase checks if:
   - Email exists in auth.users table
   - Password hash matches
   - Email is confirmed
4. If ANY check fails → "Invalid login credentials"

## For Developers

The error comes from:
- **File**: `/supabase/functions/server/auth.tsx`
- **Function**: `signIn()`
- **Line**: 139-149
- **Supabase Method**: `supabase.auth.signInWithPassword()`

The frontend has a fallback mechanism that tries direct Supabase auth if the server signin fails, but both will return the same error if credentials are invalid.

## Quick Checklist

- [ ] I have completed the signup process
- [ ] My email is spelled correctly (no typos)
- [ ] My password is correct (no caps lock, no typos)
- [ ] I'm using the same email I signed up with
- [ ] I received confirmation that my account was created

## Still Having Issues?

If you've verified all the above and still can't sign in:

1. **Try signing up again** with the same email
   - If you get "User already exists", your account exists
   - If signup succeeds, you didn't have an account before

2. **Check the browser console** for detailed error logs:
   - Press F12 to open DevTools
   - Go to Console tab
   - Look for errors starting with ❌

3. **Contact support** with:
   - The email you're trying to use
   - Screenshot of the error
   - Browser console logs

---

## Summary

**Most Common Cause**: You haven't created an account yet!

**Solution**: Click "Create New Account" and sign up first, then try logging in.

The error message "Invalid login credentials" is Supabase's generic message for any authentication failure - it doesn't distinguish between "user doesn't exist" and "wrong password" for security reasons.
