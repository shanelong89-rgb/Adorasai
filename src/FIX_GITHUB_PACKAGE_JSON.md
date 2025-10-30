# 🚨 URGENT: Fix Your GitHub package.json

## The Problem

Your GitHub repository has this **WRONG** dependency:
```json
"@jsr/supabase__supabase-js": "^2.49.8"  ❌ DOES NOT EXIST
```

This package **does not exist on npm** and will always fail!

---

## ✅ The Solution

### Step 1: Go to Your GitHub Repository

Visit: https://github.com/shanelong89-rgb/Adorasai

### Step 2: Open `package.json`

Click on the `package.json` file in your repo

### Step 3: Click "Edit" (pencil icon)

### Step 4: Find and DELETE This Line

Search for:
```json
"@jsr/supabase__supabase-js": "^2.49.8",
```

**DELETE IT COMPLETELY**

### Step 5: Ensure You Have This Line Instead

Make sure you have (should already exist):
```json
"@supabase/supabase-js": "^2.39.0",
```

**Note:** It's `@supabase/` NOT `@jsr/supabase__`

### Step 6: Also Check `date-fns` Version

While you're editing, find this line:
```json
"date-fns": "^4.1.0",  ❌ WRONG VERSION
```

Change it to:
```json
"date-fns": "^3.0.0",  ✅ CORRECT
```

### Step 7: Commit Changes

- Scroll to bottom
- Add commit message: "Fix: Remove @jsr package and downgrade date-fns"
- Click "Commit changes"

---

## 📋 Your Complete Correct `package.json`

Here's what your GitHub `package.json` should look like:

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

---

## 🔍 Key Things to Check

Search your `package.json` and ensure:

✅ **NO** `@jsr/` packages anywhere  
✅ **YES** `@supabase/supabase-js` (with forward slash)  
✅ **YES** `date-fns: "^3.0.0"` (version 3, NOT 4)  
✅ **YES** `vite: "^5.0.0"` in devDependencies  

---

## 🎯 After Fixing

1. Commit the changes on GitHub
2. Vercel will automatically redeploy
3. Watch the build logs - it should succeed!

---

## 📱 Alternative: Replace Entire File

If you want to be 100% sure, you can:

1. Copy the entire `package.json` content from above
2. Go to your GitHub repo
3. Delete your current `package.json`
4. Create new `package.json`
5. Paste the content from above
6. Commit

This guarantees correctness!

---

## 🚀 Expected Success

After fixing, your Vercel build should show:

```
✓ Installing dependencies... (25-35s)
✓ Running "npm run build"
✓ vite v5.x building for production...
✓ built in 9-12s
✓ Deployment Complete!
```

No more `@jsr/supabase__supabase-js - Not found` error! 🎉
