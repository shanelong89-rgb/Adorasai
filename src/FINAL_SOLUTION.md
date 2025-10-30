# 🎯 FINAL SOLUTION: Two Options

## THE PROBLEM
86+ files have versioned imports like `from "sonner@2.0.3"` which don't work in production builds.

---

## ⚡ OPTION 1: RUN SCRIPT IN GITHUB (FASTEST - 2 MINUTES)

Clone your GitHub repo and run this command:

```bash
cd /path/to/Adorasai

# Mac/Linux - One liner to fix ALL files:
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' -E 's/from (["\'])([^@]+)@[0-9.]+\1/from \1\2\1/g' {} +

# Commit and push
git add .
git commit -m "fix: remove versioned import syntax"
git push
```

### Windows PowerShell:
```powershell
Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse -Exclude node_modules | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'from (["\'])([^@]+)@[0-9.]+\1','from $1$2$1'
    Set-Content $_.FullName -Value $content
}

git add .
git commit -m "fix: remove versioned import syntax"
git push
```

---

## 📝 OPTION 2: I'LL FIX ALL FILES IN FIGMA MAKE (10-15 MINUTES)

I will manually fix all 61+ affected files in Figma Make, then you copy them all to GitHub.

**Which option do you prefer?**

---

## ✅ WHAT I'VE ALREADY FIXED:

Files already fixed in Figma Make:
1. ✅ /components/ui/switch.tsx
2. ✅ /components/ui/accordion.tsx
3. ✅ /components/ui/alert-dialog.tsx
4. ✅ /components/ui/alert.tsx
5. ✅ /components/ui/aspect-ratio.tsx
6. ✅ /components/ui/avatar.tsx
7. ✅ /components/ui/badge.tsx
8. ✅ /components/ui/breadcrumb.tsx
9. ✅ /components/ui/button.tsx
10. ✅ /components/ui/checkbox.tsx
11. ✅ /components/PWADiagnostic.tsx
12. ✅ /package.json

---

## 📊 REMAINING FILES TO FIX: ~50 files

### UI Components (~32 files):
- calendar.tsx, carousel.tsx, chart.tsx, collapsible.tsx
- command.tsx, context-menu.tsx, dialog.tsx, drawer.tsx
- dropdown-menu.tsx, form.tsx, hover-card.tsx, input-otp.tsx
- label.tsx, menubar.tsx, navigation-menu.tsx, pagination.tsx
- popover.tsx, progress.tsx, radio-group.tsx, resizable.tsx
- scroll-area.tsx, select.tsx, separator.tsx, sheet.tsx
- sidebar.tsx, slider.tsx, sonner.tsx, tabs.tsx
- toggle-group.tsx, toggle.tsx, tooltip.tsx

### Main Components (~20 files):
- App.tsx, AIAssistant.tsx, AccountSettings.tsx
- AdvancedAIFeatures.tsx, ChatTab.tsx, ConnectionManagement.tsx
- ConnectionRequests.tsx, GroqAPIKeySetup.tsx, HelpFeedback.tsx
- InvitationManagement.tsx, KeeperConnections.tsx, NotificationOnboardingDialog.tsx
- NotificationSettings.tsx, PrivacySecurity.tsx, PromptsTab.tsx
- StorageData.tsx, TellerConnections.tsx, TwilioSMSTest.tsx
- And a few more...

---

## 🤔 YOUR CHOICE:

**Reply with:**
- **"SCRIPT"** = I'll run the script myself (2 min)
- **"FIX ALL"** = You fix all files in Figma Make (15 min)

Which do you prefer?
