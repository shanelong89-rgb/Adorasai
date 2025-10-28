# Photo Upload Debug & Fix

## Issue
Photos are not uploading in the Chat Tab or showing up in the Media Library Tab.

## Root Cause Analysis

### Potential Issues Identified:

1. **Empty State Blocking**: 
   - ChatTab shows an empty state when `partnerProfile` is null (line 1497)
   - This prevents all upload buttons from being shown
   - If connections exist but `partnerProfile` isn't set, uploads are blocked

2. **AI Tagging Timeout**:
   - `waitForImageLoad()` function was timing out after 10 seconds
   - If the signed URL from Supabase Storage wasn't immediately accessible, AI tagging would hang
   - This was wrapped in try-catch, so it shouldn't completely block uploads, but could delay them

3. **Connection State**:
   - When `loadConnectionsFromAPI()` runs, it transforms connections to storytellers/keepers
   - If no ACTIVE connections exist (status !== 'active'), `partnerProfile` is set to null
   - Even PENDING connections should set partnerProfile but with isConnected=false

## Fixes Implemented

### 1. Reduced AI Tagging Timeout
**File**: `/utils/aiService.ts`
- Reduced `waitForImageLoad` timeout from 10 seconds to 3 seconds
- Added better error logging for image load failures
- Ensured errors in AI tagging don't block photo uploads (already wrapped in try-catch)

### 2. Enhanced Debug Logging
**File**: `/components/AppContent.tsx`
- Added detailed logging in `handleAddMemory()` to track:
  - Memory type being uploaded
  - Connection ID status
  - Partner profile status
  - Connection state
- Added logging for photo upload process:
  - Photo URL type (data URL vs blob URL)
  - Upload success/failure details
- Added logging for API memory creation:
  - Request fields being sent
  - Response details including media URLs

### 3. Improved Error Handling
**File**: `/components/AppContent.tsx`
- Changed silent return in `handleAddMemory()` to show error toast
- Helps users understand when uploads are blocked due to no connection

## Testing Checklist

To verify the fix works:

1. **Check Console Logs**:
   ```
   Open DevTools → Console
   Look for logs starting with:
   - 🎯 handleAddMemory called
   - 📤 Uploading photo to Supabase Storage
   - ✅ Photo uploaded
   - 📡 Creating memory with fields
   - ✅ Memory created successfully
   ```

2. **Verify Connection State**:
   ```javascript
   - Check if partnerProfile is null in ChatTab
   - Look for: "🔄 Transforming connections to storytellers/keepers"
   - Verify: "✅ Connected to storyteller/keeper: [NAME]"
   ```

3. **Test Photo Upload**:
   - Navigate to Chat Tab
   - Click camera icon
   - Select a photo
   - Watch console for upload progress
   - Check Media Library Tab for the photo

4. **Check AI Integration**:
   - If AI is configured, verify: "🤖 AI analyzing photo..."
   - If AI times out, should see: "⚠️ Image load timeout, skipping AI analysis"
   - Photo should still upload even if AI fails

## Expected Behavior

### With Active Connection:
1. User sees Chat interface (not empty state)
2. User can upload photos via camera icon
3. Photo is compressed and uploaded to Supabase Storage
4. AI attempts to tag photo (with 3s timeout)
5. Memory is created via API
6. Memory appears in Chat and Media Library

### With Pending Connection:
1. User sees Chat interface with pending connection indicator
2. User CAN upload photos (partnerProfile exists, isConnected=false)
3. Upload process works the same as active connection

### With No Connection:
1. User sees empty state: "No Storyteller Connected"
2. No upload buttons visible
3. Attempts to call onAddMemory show error toast

## Next Steps

If photos still don't upload:

1. **Check Network Tab**:
   - Look for failed API calls to `/make-server-deded1eb/memories`
   - Check Supabase Storage upload requests
   - Verify signed URLs are being generated

2. **Check Connection Status**:
   - Verify test users (Shane & Allison) are actually connected
   - Check database for connection status = 'active'
   - Run: `await apiClient.ensureTestUsersConnected()`

3. **Check Supabase Storage**:
   - Verify bucket `make-deded1eb-adoras-media` exists
   - Check if files are being uploaded but not retrieved
   - Verify signed URLs are valid

4. **Disable AI Temporarily**:
   - If AI is blocking uploads, try without AI:
   - Comment out lines 1030-1057 in AppContent.tsx
   - Test if photos upload without AI tagging

## Files Modified

1. `/utils/aiService.ts` - Reduced timeout, improved logging
2. `/components/AppContent.tsx` - Enhanced debug logging, better error messages
3. `/PHOTO_UPLOAD_DEBUG.md` - This documentation

## Verification Commands

```javascript
// In browser console:

// Check connection state
console.log('Partner Profile:', partnerProfile);
console.log('Active Connection ID:', activeStorytellerId || activeLegacyKeeperId);

// Check memories loaded
console.log('Memories Count:', memories.length);
console.log('Photo Memories:', memories.filter(m => m.type === 'photo').length);

// Test API manually
const testMemory = {
  connectionId: 'YOUR_CONNECTION_ID',
  type: 'text',
  content: 'Test message',
  sender: 'keeper', // or 'teller'
  category: 'Chat',
  tags: ['test']
};
await apiClient.createMemory(testMemory);
```
