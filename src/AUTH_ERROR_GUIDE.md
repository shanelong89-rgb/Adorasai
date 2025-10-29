# Authentication Error Guide

## Current Error
```
⚠️ Authentication required [/auth/signin]: Invalid or expired token
❌ Sign in failed with error: Sign in failed: Invalid login credentials
```

## What This Means

The error "Invalid login credentials" means one of the following:

1. **The email/password combination doesn't exist** - You may be trying to sign in with an account that was never created
2. **The password is incorrect** - The password you're entering doesn't match what was set during signup
3. **The account was deleted** - The account may have been removed from Supabase

## How to Fix

### Option 1: Create a New Account
1. Click "Sign Up" instead of "Sign In"
2. Fill out the signup form with:
   - **Email**: Use any email (doesn't need to be real since email confirmation is disabled)
   - **Password**: Choose a password you'll remember
   - **Name**: Your name
   - **Type**: Choose "Keeper" or "Teller"
3. Complete the onboarding
4. You'll be automatically signed in

### Option 2: Reset Your Test Environment

If you're testing and want to start fresh:

1. **Clear your browser's local storage:**
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Delete all items starting with `adoras_`

2. **Sign up with a new test account**

### Option 3: Verify Existing Credentials

If you believe you have an existing account:

1. Make sure you're using the **exact same email and password** that you used during signup
2. Email addresses are case-insensitive, but passwords are case-sensitive
3. Check for typos, especially:
   - Extra spaces
   - Caps Lock being on
   - Similar-looking characters (0/O, 1/l/I)

## For Developers

### Check Supabase Auth Table

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Check if the user exists
4. If the user exists but you forgot the password, you can:
   - Delete the user and create a new one
   - Or use Supabase's password reset feature (requires email configuration)

### Server Logs

The server logs will show:
- ✅ If authentication succeeded
- ❌ If authentication failed with the specific Supabase error

Check the Supabase Edge Function logs for more details:
```bash
supabase functions logs make-server-deded1eb
```

## Common Mistakes

1. **Using the wrong credentials** - Double-check email and password
2. **Trying to sign in before signing up** - You must create an account first
3. **Browser autofill using old credentials** - Clear the form and type manually
4. **Testing with production credentials in development** - Make sure you're using the right environment

## Next Steps

1. Try signing up with a new account
2. If that works, the issue was invalid credentials
3. If signup also fails, check the server logs for backend issues

## Still Having Issues?

If you've tried all of the above and still can't sign in:

1. Check that the Supabase Edge Function is deployed and running
2. Verify the `SUPABASE_SERVICE_ROLE_KEY` environment variable is set correctly
3. Check the browser console for specific error messages
4. Check the server logs for detailed error information

---

**Quick Test:**
Try these steps in order:
1. Click "Sign Up" (not "Sign In")
2. Use email: `test@adoras.app`
3. Use password: `Test123456`
4. Fill out the rest of the form
5. Complete onboarding
6. You should be signed in automatically

If this works, your authentication system is functioning correctly, and the original error was due to invalid credentials.
