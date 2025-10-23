# 🎤 Quick Microphone Permission Guide

## For Users

### If you see "Microphone Access Denied"

#### iPhone/iPad (Safari)
1. Open **Settings** app
2. Scroll to **Safari**
3. Tap **Microphone**
4. Select **Allow** for Adoras
5. Return to app and try again

#### Chrome (Desktop)
1. Click the **🔒** icon in address bar
2. Find **Microphone**
3. Change to **Allow**
4. Refresh page
5. Try recording again

#### Chrome (Mobile)  
1. Tap **ⓘ** next to URL
2. Tap **Site settings**
3. Tap **Microphone**
4. Select **Allow**
5. Go back and try again

---

## For Developers

### Error Messages

| Error | Shown When | Duration |
|-------|-----------|----------|
| Permission denied + instructions | User blocks microphone | 8s |
| No microphone found | Device has no mic | 5s |
| Already in use | Another app using mic | 6s |
| Network error | Speech API offline | 5s |

### Permission Flow

```
User clicks record
    ↓
Request mic permission (getUserMedia)
    ↓
If granted → Start recording + speech recognition
If denied  → Show helpful error message
```

### Key Fix

**Before:**
- Speech recognition started first
- Then getUserMedia called
- Both threw permission errors
- User saw 2-3 duplicate messages

**After:**
- getUserMedia called first
- Only if granted, start speech recognition
- Single error message with instructions
- Speech errors filtered for permission issues

### Code Location

**File:** `/components/ChatTab.tsx`
**Function:** `toggleRecording()`
**Lines:** ~533-780

### Testing

```typescript
// Test permission denial
1. Clear site permissions
2. Click record button
3. Deny permission
4. Should see: Single error with device instructions
5. No duplicate errors

// Test permission granted
1. Clear site permissions  
2. Click record button
3. Allow permission
4. Should see: "Recording with live transcription"
5. Live transcript appears as you speak
```

---

## Error Handling Summary

✅ Single error message (no duplicates)
✅ Device-specific instructions
✅ Longer display time (8s) for instructions
✅ Proper cleanup of resources
✅ Graceful degradation (recording works even if speech fails)

---

**Quick Reference:** Check `/MICROPHONE_PERMISSION_FIX.md` for full details
