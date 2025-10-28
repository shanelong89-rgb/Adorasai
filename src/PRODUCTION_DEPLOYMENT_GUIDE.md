# Production Deployment Guide - Push Notifications Ready

## Current Status
✅ **Preview Environment:** `https://access-date-65858606.figma.site` (push notifications don't work here)  
⚠️ **Production Deployment:** Required for push notifications to work

## Why You Need Production Deployment

Figma Make's preview environment (`figma.site`) **cannot serve service workers**, which are required for:
- Push notifications
- Offline functionality
- Background sync
- PWA installation on desktop

**Everything else works in preview:**
- ✅ Authentication
- ✅ Database (Supabase)
- ✅ Chat
- ✅ Media uploads
- ✅ AI features
- ✅ In-app notifications (but not push)

---

## Deployment Option 1: Vercel (Recommended)

### Why Vercel?
- ✅ Free tier (generous limits)
- ✅ Automatic HTTPS
- ✅ Perfect for React + Supabase apps
- ✅ Easy GitHub integration
- ✅ Fast global CDN
- ✅ Environment variables support

### Steps:

#### 1. Export Your Code from Figma Make

Figma Make should allow you to export/download your project files.

#### 2. Create GitHub Repository

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit - Adoras app"
git branch -M main
git remote add origin https://github.com/yourusername/adoras.git
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `adoras` repository
5. Configure:
   - **Framework Preset:** Vite (or React)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
6. Add Environment Variables (click "Environment Variables"):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key
   ANTHROPIC_API_KEY=your_anthropic_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   VAPID_PUBLIC_KEY=your_vapid_public
   VAPID_PRIVATE_KEY=your_vapid_private
   VAPID_SUBJECT=mailto:your@email.com
   ```

7. Click "Deploy"

#### 4. Test Subdomain Options

Vercel gives you a free URL like: `adoras.vercel.app`

Or connect a custom domain:
- **Testing:** `test.adoras.ai` or `beta.adoras.ai`
- **Production:** `adoras.ai` (when ready)

**To add custom domain in Vercel:**
1. Go to your project → Settings → Domains
2. Add domain (e.g., `test.adoras.ai`)
3. Add DNS records to your domain provider:
   - Type: CNAME
   - Name: test (or beta)
   - Value: cname.vercel-dns.com

#### 5. Test Push Notifications

After deployment:
1. Visit your Vercel URL
2. Open Chrome DevTools → Console
3. You should see: `✅ Service worker registered`
4. Go to Settings → Notifications
5. Click "Enable Notifications"
6. You should get the browser permission prompt
7. Test notification should appear!

---

## Deployment Option 2: Netlify

### Steps:

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. "Add new site" → "Import an existing project"
4. Connect to your GitHub repo
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables (same as Vercel list above)
7. Deploy!

**Custom domain setup is similar to Vercel.**

---

## Deployment Option 3: Your Own Server

If you prefer self-hosting:
- Use any VPS (DigitalOcean, AWS, etc.)
- Install Node.js
- Set up NGINX or Apache
- Configure SSL (Let's Encrypt)
- Deploy your build files

---

## Post-Deployment Checklist

After deploying to production:

### 1. Verify Service Worker
```javascript
// Open browser console on your production URL
// Should see:
✅ Service worker registered successfully!
```

### 2. Test Push Notifications
- Go to Settings → Notifications
- Click "Enable Notifications"
- Should see browser permission prompt
- Grant permission
- Click "Send Test Notification"
- Should receive notification!

### 3. Test PWA Installation
- Chrome: Look for "Install" icon in address bar
- iOS Safari: Share → Add to Home Screen
- Should install as native-feeling app

### 4. Test Offline Mode
- Go offline (disconnect internet)
- App should still load
- Cached media should display
- New actions should queue for when back online

### 5. Update VAPID Subject (if needed)
Make sure your `VAPID_SUBJECT` matches your domain:
```
VAPID_SUBJECT=mailto:support@adoras.ai
```

---

## Domain Strategy Recommendation

Since you have `adoras.ai` but want to test first:

### Option A: Use Subdomains
- **Testing/Staging:** `beta.adoras.ai` or `staging.adoras.ai`
- **Production:** `adoras.ai` (when ready to launch)

### Option B: Use Vercel Subdomain First
- **Testing:** `adoras.vercel.app` (free, no DNS setup)
- **Production:** Move to `adoras.ai` later

### Option C: Separate Test Domain
- **Testing:** Keep using different domain/subdomain
- **Production:** `adoras.ai` for official launch

**My recommendation:** Use `beta.adoras.ai` for testing. This way:
- ✅ You can test with real domain
- ✅ Everything works exactly as production
- ✅ Easy to migrate to root domain later
- ✅ Looks professional to beta testers

---

## Quick Start: Fastest Path to Working Push Notifications

**If you want push notifications working in 10 minutes:**

1. Export code from Figma Make
2. Push to GitHub
3. Deploy to Vercel (connect GitHub repo)
4. Add environment variables
5. Use Vercel's free URL: `your-app.vercel.app`
6. Test push notifications - they'll work! ✅

**Then later:**
- Add `beta.adoras.ai` custom domain
- Test thoroughly
- When ready, deploy to `adoras.ai`

---

## What Stays the Same

When you deploy to production, **everything else keeps working:**
- ✅ Same Supabase database (same data)
- ✅ Same authentication (same users)
- ✅ Same backend API
- ✅ Same storage (same media)
- ✅ Just add working push notifications!

---

## Need Help?

Common issues:
- **Environment variables not working?** Check they're added in Vercel/Netlify dashboard
- **Service worker 404?** Make sure `sw.js` is in your `public` folder
- **Push permission denied?** Must use HTTPS (Vercel/Netlify provide this automatically)
- **Build failing?** Check Node version (use Node 18+)

---

## Summary

**Current state:**
- Preview: `https://access-date-65858606.figma.site` ← No push notifications (expected)
- Production: Not deployed yet

**To get push notifications working:**
1. Deploy to Vercel, Netlify, or your own hosting
2. Use HTTPS (automatic with Vercel/Netlify)
3. Service worker will register
4. Push notifications will work!

**Recommended quick path:**
- Deploy to Vercel (10 minutes)
- Use `your-app.vercel.app` URL
- Add `beta.adoras.ai` custom domain when ready
- Move to `adoras.ai` for official launch

Push notifications **will absolutely work** once deployed to proper hosting! 🎉
