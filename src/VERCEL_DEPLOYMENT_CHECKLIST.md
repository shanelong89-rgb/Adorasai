# ✅ Vercel Deployment Checklist for Adoras

## 🎯 Pre-Deployment Verification

Before pushing to GitHub, ensure ALL these files are correct:

### ✅ 1. `.npmrc` (CRITICAL - Solves peer dependency conflicts)
```
legacy-peer-deps=true
```
**Status:** ✅ Created

---

### ✅ 2. `package.json` (CRITICAL - Correct date-fns version)

**Key Dependencies to Verify:**
```json
{
  "dependencies": {
    "date-fns": "^3.0.0",              ← MUST be 3.x NOT 4.x
    "@supabase/supabase-js": "^2.39.0", ← NO @jsr/ prefix
    "react-day-picker": "^8.10.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",                   ← Required for build
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```
**Status:** ✅ Already correct in Figma Make

---

### ✅ 3. `vercel.json` (CRITICAL - Build configuration)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",           ← Must match vite.config.ts
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"     ← SPA routing
    }
  ]
}
```
**Status:** ✅ Updated to use "dist"

---

### ✅ 4. `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  ← Must match vercel.json outputDirectory
    sourcemap: true,
  }
});
```
**Status:** ✅ Already correct

---

### ✅ 5. `.gitignore`
```
node_modules/
dist/
.env
.vercel/
```
**Status:** ✅ Created

---

## 🚀 Deployment Steps

### Step 1: Copy Files to GitHub Repository

You need to copy **ALL** files from this Figma Make environment to your GitHub repo.

**Option A: Manual Copy (Recommended for first-time)**
1. Download all files from Figma Make
2. Delete contents of your GitHub repo (or create new branch)
3. Copy all files to GitHub repo
4. Verify the 5 critical files above are correct

**Option B: Git Commands (If you have local clone)**
```bash
# Ensure you're in your GitHub repo directory
cd /path/to/Adorasai

# Copy all files from Figma Make export to this directory

# Add all files
git add .

# Commit
git commit -m "Fix: Vercel deployment with correct dependencies"

# Push to main branch
git push origin main
```

---

### Step 2: Trigger Vercel Deployment

After pushing to GitHub:
1. Go to Vercel dashboard
2. Your deployment should auto-trigger
3. Watch the build logs

**Expected Success Output:**
```
✓ Installing dependencies... (25-35s)
✓ Running "npm run build"
✓ vite v5.x building for production...
✓ 3000+ modules transformed
✓ built in 9-12s
✓ Deployment ready
```

---

### Step 3: Configure Environment Variables in Vercel

Go to Vercel Project → **Settings** → **Environment Variables**

Add these (you already have them in Figma Make):
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_db_url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_phone
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key
VAPID_PUBLIC_KEY=your_vapid_public
VAPID_PRIVATE_KEY=your_vapid_private
VAPID_SUBJECT=your_vapid_subject
```

---

### Step 4: Connect Custom Domain (adoras.ai)

After successful deployment:

1. **In Vercel:**
   - Go to Project → Settings → Domains
   - Click "Add Domain"
   - Enter `adoras.ai`
   - Click "Add"
   - Vercel will show DNS records needed

2. **In Your Domain Registrar (where you bought adoras.ai):**
   - Go to DNS settings
   - Add these records:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21 (Vercel's IP - check Vercel for current)
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

3. **Wait 5-60 minutes for DNS propagation**

4. **Verify:**
   - Visit https://adoras.ai
   - Should redirect to your app
   - SSL certificate auto-issued by Vercel

---

## 🐛 Troubleshooting Common Errors

### Error 1: "ERESOLVE unable to resolve dependency tree"
```
npm error peer date-fns@"^2.28.0 || ^3.0.0" from react-day-picker
npm error   date-fns@"^4.1.0" from the root project
```

**Solution:**
- ✅ Change `package.json`: `"date-fns": "^3.0.0"`
- ✅ Ensure `.npmrc` has `legacy-peer-deps=true`

---

### Error 2: "@jsr/supabase__supabase-js - Not found"
```
npm error 404 Not Found - GET https://registry.npmjs.org/@jsr%2fsupabase__supabase-js
```

**Solution:**
- ✅ Remove ANY `@jsr/` packages from package.json
- ✅ Use `@supabase/supabase-js` instead

---

### Error 3: "No Output Directory named 'dist' found"
```
Error: No Output Directory named "dist" found after the Build completed.
```

**Solution:**
- ✅ Ensure `vercel.json` has `"outputDirectory": "dist"`
- ✅ Ensure `vite.config.ts` has `outDir: 'dist'`
- ✅ NOT "build" directory

---

### Error 4: "vite: command not found"
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

**Solution:**
- ✅ Ensure `package.json` has `"vite": "^5.0.0"` in devDependencies
- ✅ Ensure `vercel.json` has `"buildCommand": "npm run build"`

---

## 📊 Build Size Warnings (Expected & Safe to Ignore)

You may see this warning - it's NORMAL:
```
(!) Some chunks are larger than 500 kB after minification.
```

This is expected because:
- React, Supabase, and Radix UI components are large
- For production apps, code-splitting can be added later
- Initial load will be fine with compression

---

## 🎉 Success Checklist

After deployment succeeds, verify:

- [ ] ✅ App loads at Vercel URL (e.g., adoras-ai.vercel.app)
- [ ] ✅ Login/signup works
- [ ] ✅ Supabase connection works
- [ ] ✅ Media upload works
- [ ] ✅ PWA installable on mobile
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ Custom domain connected (adoras.ai)
- [ ] ✅ SSL certificate active
- [ ] ✅ Mobile responsive

---

## 📋 Quick Reference: Files That MUST Match

Your **GitHub repository** must have these exact configurations:

| File | Key Setting | Current Status |
|------|-------------|----------------|
| `.npmrc` | `legacy-peer-deps=true` | ✅ Created |
| `package.json` | `"date-fns": "^3.0.0"` | ✅ Correct |
| `vercel.json` | `"outputDirectory": "dist"` | ✅ Updated |
| `vite.config.ts` | `outDir: 'dist'` | ✅ Correct |
| `.gitignore` | Include `node_modules/`, `dist/` | ✅ Created |

---

## 🔗 Helpful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs - Custom Domains:** https://vercel.com/docs/projects/domains
- **Vite Build Config:** https://vitejs.dev/config/build-options.html

---

## 💡 Pro Tips

1. **Test Locally First:**
   ```bash
   npm install
   npm run build
   npm run preview
   ```
   If this works locally, it will work on Vercel.

2. **Check Build Logs:**
   Always read Vercel build logs completely - they show exact errors

3. **Environment Variables:**
   Add them in Vercel BEFORE first deployment for faster setup

4. **Domain Propagation:**
   Use https://dnschecker.org to check if your domain DNS has propagated

---

**Last Updated:** After fixing all dependency conflicts and build configuration
**Next Step:** Copy files to GitHub and push!
