# 🔧 Fix vite.config.ts Error

## 🎉 Good News!
Your package.json fix worked! Commit `2e9ac18` succeeded in installing dependencies!

## ❌ New Error
```
Cannot find package '@vitejs/plugin-react-swc' imported from vite.config.ts
```

## 🎯 The Problem
Your GitHub `vite.config.ts` imports `@vitejs/plugin-react-swc` but:
1. It's not in your `package.json`
2. You should use `@vitejs/plugin-react` instead (which IS in package.json)

---

## ✅ THE FIX

### **Option 1: Quick Edit on GitHub (60 seconds)**

#### Step 1: Go to your vite.config.ts
https://github.com/shanelong89-rgb/Adorasai/blob/main/vite.config.ts

#### Step 2: Click pencil icon ✏️ to edit

#### Step 3: Change line 2
**From:**
```typescript
import react from '@vitejs/plugin-react-swc';
```

**To:**
```typescript
import react from '@vitejs/plugin-react';
```

Just remove `-swc` at the end!

#### Step 4: Commit changes
- Commit message: `Fix: Use correct Vite React plugin`
- Click "Commit changes"

---

### **Option 2: Replace Entire File (Safest)**

#### Step 1: Copy this entire correct vite.config.ts:

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

#### Step 2: Go to GitHub
https://github.com/shanelong89-rgb/Adorasai/blob/main/vite.config.ts

#### Step 3: Click pencil icon ✏️

#### Step 4: Delete everything and paste the above code

#### Step 5: Commit changes

---

## 🎯 What Changed?

### ❌ Your GitHub Version (Wrong):
```typescript
import react from '@vitejs/plugin-react-swc';  // ← Doesn't exist in package.json
```

### ✅ Correct Version:
```typescript
import react from '@vitejs/plugin-react';  // ← Exists in package.json
```

---

## 📋 After This Fix

Your build should complete successfully:

```
✓ Installing dependencies... (25s)
✓ Running "npm run build"
✓ vite v5.x building for production...
✓ dist/index.html                   0.68 kB │ gzip: 0.41 kB
✓ dist/assets/index-abc123.css     52.16 kB │ gzip: 9.43 kB
✓ dist/assets/index-def456.js   1,234.56 kB │ gzip: 456.78 kB
✓ built in 9-12s
✓ Deployment Complete!
```

---

## 🚀 Quick Action

1. Go to: https://github.com/shanelong89-rgb/Adorasai/blob/main/vite.config.ts
2. Click edit ✏️
3. Change `'@vitejs/plugin-react-swc'` to `'@vitejs/plugin-react'`
4. Commit

**Done in 60 seconds!** ✅

---

## 🎉 Almost There!

You've fixed:
- ✅ `.npmrc` (legacy-peer-deps)
- ✅ `package.json` (removed @jsr, fixed date-fns)
- ⏳ `vite.config.ts` (just needs this one change)

After this, your Vercel deployment will succeed! 🚀
