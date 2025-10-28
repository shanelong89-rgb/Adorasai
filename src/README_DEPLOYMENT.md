# 🚀 Adoras - Backend Deployment Quick Start

> **Current Status:** Backend code is complete but not deployed yet

---

## ⚡ Quick Deploy (Choose One)

### Option 1: Run Automated Script (Easiest)

**macOS/Linux:**
```bash
chmod +x deploy.sh && ./deploy.sh
```

**Windows:**
```cmd
deploy.bat
```

Takes ~5 minutes. Handles everything automatically.

---

### Option 2: Manual Commands

```bash
npm install -g supabase
supabase login
supabase link --project-ref cyaaksjydpegofrldxbo
supabase functions deploy make-server-deded1eb
```

---

### Option 3: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select project `cyaaksjydpegofrldxbo`
3. Edge Functions → Deploy new function
4. Upload `/supabase/functions/server/` folder
5. Name: `make-server-deded1eb`

---

## ✅ Verify It Worked

```bash
curl https://cyaaksjydpegofrldxbo.supabase.co/functions/v1/make-server-deded1eb/health
```

Should return: `{"status":"ok","timestamp":"..."}`

Or just refresh your app - the red banner should disappear!

---

## 📚 Full Documentation

- **Quick Guide:** `DEPLOY_NOW.md`
- **Full Guide:** `DEPLOYMENT_GUIDE.md`
- **Fix Details:** `BACKEND_CONNECTION_FIX.md`
- **API Reference:** `BACKEND_API_DOCUMENTATION.md`

---

## 🆘 Having Issues?

1. **CLI not found?** → Install: `npm install -g supabase`
2. **Not logged in?** → Run: `supabase login`
3. **Still offline?** → Wait 30 seconds and refresh
4. **Need help?** → Check `BACKEND_CONNECTION_FIX.md`

---

**Ready?** Pick a method above and deploy! Takes 5 minutes. 🚀
