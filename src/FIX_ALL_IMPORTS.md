# 🚨 CRITICAL: Import Version Syntax Issue

## THE PROBLEM

All UI components and many regular components use versioned imports like:
```typescript
import { toast } from 'sonner@2.0.3';
import * as Switch from '@radix-ui/react-switch@1.1.3';
```

This @version syntax **ONLY works in Figma Make**, NOT in production builds!

## THE FIX

I need to remove ALL version numbers from imports.

**Change FROM:**
```typescript
import { toast } from 'sonner@2.0.3';
```

**Change TO:**
```typescript
import { toast } from 'sonner';
```

## FILES AFFECTED (86+ imports across 61+ files!)

### UI Components (~/components/ui/)
All files in this directory have versioned imports

### Regular Components
- App.tsx
- AIAssistant.tsx
- AccountSettings.tsx  
- AdvancedAIFeatures.tsx
- ChatTab.tsx
- ConnectionManagement.tsx
- ConnectionRequests.tsx
- And 40+ more files...

## THIS IS TOO MANY FILES TO COPY MANUALLY!

I will fix all of them programmatically and provide you a comprehensive list.

**Stand by...**
