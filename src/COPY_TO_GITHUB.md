# 📦 Files to Copy to Your GitHub Repository

## 🎯 Quick Start: Copy These 5 Critical Files First

These files MUST be in your GitHub repo for successful Vercel deployment:

### 1. `.npmrc` ← **NEW FILE**
```
legacy-peer-deps=true
```

### 2. `.gitignore` ← **NEW FILE**
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.vercel/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Testing
coverage/

# Misc
*.tsbuildinfo
.cache/
```

### 3. `package.json` ← **VERIFY THIS**
Make sure YOUR GitHub version has these exact versions:

```json
{
  "name": "adoras",
  "version": "1.0.0",
  "description": "Parent-Child Memory Sharing App - Legacy Keeper & Storyteller Memory Sharing",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.487.0",
    "react-day-picker": "^8.10.1",
    "sonner": "^1.4.3",
    "recharts": "^2.10.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "cmdk": "^0.2.0",
    "embla-carousel-react": "^8.0.0",
    "input-otp": "^1.2.4",
    "react-cropper": "^2.3.3",
    "cropperjs": "^1.6.1",
    "vaul": "^0.9.0",
    "browser-image-compression": "^2.0.2",
    "idb": "^8.0.0",
    "qrcode": "^1.5.3",
    "react-hook-form": "^7.55.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/qrcode": "^1.5.5",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**🚨 CRITICAL CHECKS:**
- ✅ `"date-fns": "^3.0.0"` (NOT ^4.1.0)
- ✅ `"@supabase/supabase-js": "^2.39.0"` (NO @jsr/ prefix)
- ✅ `"vite": "^5.0.0"` in devDependencies

### 4. `vercel.json` ← **VERIFY THIS**
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

**🚨 CRITICAL CHECK:**
- ✅ `"outputDirectory": "dist"` (NOT "build")

### 5. `vite.config.ts` ← **Should already be correct**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  publicDir: 'public',
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // Remove version specifiers from imports
      'sonner@2.0.3': 'sonner',
      'lucide-react@0.487.0': 'lucide-react',
      'react-day-picker@8.10.1': 'react-day-picker',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'recharts@2.15.2': 'recharts',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      'cmdk@1.1.1': 'cmdk',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      'vaul@1.1.2': 'vaul',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      'react-hook-form@7.55.0': 'react-hook-form',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      'input-otp@1.4.2': 'input-otp',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu@1.2.2': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-progress@1.1.3': '@radix-ui/react-progress',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-switch@1.1.4': '@radix-ui/react-switch',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-toast@1.2.6': '@radix-ui/react-toast',
      '@radix-ui/react-toggle@1.1.3': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.3': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip@1.1.6': '@radix-ui/react-tooltip',
    },
  },
});
```

---

## 📁 Complete File Structure to Copy

Your GitHub repo should have this structure:

```
/ (root)
├── .gitignore              ← NEW
├── .npmrc                  ← NEW
├── App.tsx
├── index.html
├── main.tsx
├── package.json            ← VERIFY date-fns version
├── vercel.json             ← VERIFY outputDirectory
├── vite.config.ts
├── components/
│   ├── (all your components)
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/
│       └── (all ui components)
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── (icons)
├── styles/
│   └── globals.css
├── supabase/
│   └── functions/
│       └── server/
│           └── (all server files)
└── utils/
    ├── api/
    └── supabase/
```

---

## 🚀 Deployment Steps

### Option 1: Quick Fix (If repo already exists)

Just update these 5 files in your GitHub repo:

1. Create `.npmrc` with: `legacy-peer-deps=true`
2. Create `.gitignore` (copy from above)
3. Update `package.json` - change `date-fns` to `^3.0.0`
4. Update `vercel.json` - change `outputDirectory` to `"dist"`
5. Verify `vite.config.ts` has `outDir: 'dist'`

Then commit and push:
```bash
git add .npmrc .gitignore package.json vercel.json
git commit -m "Fix: Vercel deployment configuration"
git push origin main
```

### Option 2: Complete Replacement

1. Export ALL files from Figma Make
2. Delete your GitHub repo contents (or create new branch)
3. Copy ALL files to GitHub repo
4. Commit and push

---

## ✅ Final Verification Before Push

Run this checklist:

- [ ] `.npmrc` exists with `legacy-peer-deps=true`
- [ ] `.gitignore` exists (don't commit node_modules or dist)
- [ ] `package.json` has `"date-fns": "^3.0.0"`
- [ ] `package.json` has NO `@jsr/` packages
- [ ] `vercel.json` has `"outputDirectory": "dist"`
- [ ] `vite.config.ts` has `outDir: 'dist'`
- [ ] All source files copied (App.tsx, components/, utils/, etc.)
- [ ] `public/` directory with manifest.json and sw.js
- [ ] `index.html` at root level
- [ ] `main.tsx` at root level

---

## 🎉 After Successful Deployment

1. **Test the deployment:**
   - Visit your Vercel URL
   - Test login/signup
   - Upload media
   - Check mobile responsiveness

2. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all Supabase, Twilio, OpenAI keys

3. **Connect adoras.ai domain:**
   - Vercel Settings → Domains
   - Add `adoras.ai`
   - Update DNS at your domain registrar

---

## 📞 Need Help?

Check `VERCEL_DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting!
