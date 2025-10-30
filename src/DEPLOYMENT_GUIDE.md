# Adoras Deployment Guide for Vercel

## 🎯 Quick Fix for Current GitHub Repository

Your GitHub repository has a **different structure** than this Figma Make environment. Follow these steps to fix the deployment:

### Option 1: Copy Files to GitHub (Recommended)

**Download/Copy these 3 critical files to your GitHub repo:**

#### 1. `.npmrc` (create at root)
```
legacy-peer-deps=true
```

#### 2. `package.json` - Update `date-fns` dependency
Find this line:
```json
"date-fns": "^4.1.0"
```
Change to:
```json
"date-fns": "^3.0.0"
```

Also ensure you have:
```json
"@supabase/supabase-js": "^2.39.0"
```
**NOT** `@jsr/supabase__supabase-js` (this doesn't exist on npm)

#### 3. `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### Then Commit and Push:
```bash
git add .npmrc package.json vercel.json
git commit -m "Fix: Vercel deployment configuration"
git push origin main
```

---

## Option 2: Fresh Start with Complete File Replacement

If you want to **completely replace** your GitHub repository with this working version:

### Step 1: Delete your current GitHub repo content
```bash
# In your local clone
rm -rf * .git
# Or delete all files via GitHub web interface
```

### Step 2: Copy ALL files from this Figma Make environment
Use the file structure shown and copy everything to your GitHub repo.

### Step 3: Ensure these key files exist:
- ✅ `.npmrc` (with `legacy-peer-deps=true`)
- ✅ `package.json` (with `date-fns: "^3.0.0"`)
- ✅ `vercel.json` (with `outputDirectory: "dist"`)
- ✅ `vite.config.ts` (with `outDir: 'dist'`)
- ✅ `index.html` (at root, not in /public)
- ✅ `main.tsx` (React entry point)

### Step 4: Commit everything
```bash
git add .
git commit -m "Fresh deployment-ready build"
git push origin main --force
```

---

## 🌐 Connecting Your Custom Domain (adoras.ai)

**AFTER your build succeeds on Vercel:**

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add `adoras.ai` and `www.adoras.ai`
4. Vercel will give you DNS records
5. Add these to your domain registrar:
   - **A Record**: `@` → Vercel's IP
   - **CNAME**: `www` → `cname.vercel-dns.com`
6. Wait for DNS propagation (5-60 minutes)

---

## 🐛 Troubleshooting

### Error: "date-fns peer dependency"
**Fix**: Ensure `package.json` has `"date-fns": "^3.0.0"` (NOT `^4.1.0`)

### Error: "@jsr/supabase__supabase-js not found"
**Fix**: Remove any `@jsr/` package references. Use `@supabase/supabase-js` instead.

### Error: "No Output Directory named 'dist' found"
**Fix**: Ensure `vercel.json` has `"outputDirectory": "dist"` and `vite.config.ts` has `outDir: 'dist'`

### Error: "vite: command not found"
**Fix**: Ensure `package.json` has:
```json
"devDependencies": {
  "vite": "^5.0.0"
}
```

---

## ✅ Verification Checklist

Before pushing to GitHub, verify:

- [ ] `.npmrc` file exists with `legacy-peer-deps=true`
- [ ] `package.json` has `date-fns@^3.0.0`
- [ ] `package.json` has `@supabase/supabase-js@^2.39.0` (NOT @jsr version)
- [ ] `vercel.json` has `outputDirectory: "dist"`
- [ ] `vite.config.ts` has `outDir: 'dist'`
- [ ] `index.html` is at root (not in /public folder)
- [ ] `main.tsx` exists at root
- [ ] No `/src` directory confusion (GitHub should match this structure)

---

## 📋 Current Working Configuration

**File Structure:**
```
/ (root)
├── .npmrc                    ← MUST have legacy-peer-deps=true
├── index.html               ← MUST be at root for Vite
├── main.tsx                 ← React entry point
├── package.json             ← date-fns@^3.0.0
├── vercel.json              ← outputDirectory: "dist"
├── vite.config.ts           ← outDir: 'dist'
├── App.tsx
├── components/
├── utils/
├── styles/
├── public/                  ← Static assets only
└── supabase/
```

**Package.json Key Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.10.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🎉 Success Indicators

When deployment works, you'll see:
```
✓ Installing dependencies... (30s)
✓ Running "npm run build"
✓ built in 9-12s
✓ Deployment ready in dist/
✓ Deployed to: https://your-project.vercel.app
```

Then connect your domain `adoras.ai` in Vercel settings!
