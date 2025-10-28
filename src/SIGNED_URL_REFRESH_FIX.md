# ✅ Signed URL Auto-Refresh Fixed

## Problem
Photos, videos, and other media were failing to load with errors like:
```
Photo failed to load: https://cyaaksjydpegofrldxbo.supabase.co/storage/v1/object/sign/make-deded1eb-adoras-media/176127182
```

The URL was incomplete/expired - missing the `?token=xxx&exp=xxx` query parameters that Supabase signed URLs require.

## Root Cause
Supabase signed URLs expire after 1 hour for security. The app was storing these URLs in the database, but when users returned after an hour, the URLs were no longer valid.

## Solution Implemented
Enhanced `getConnectionMemories()` function in `/supabase/functions/server/memories.tsx` to automatically refresh ALL signed URLs every time memories are fetched:

### What Changed:

1. **Added Smart Path Extraction**
   - Handles both signed URLs and public URLs
   - Extracts the file path from any URL format
   - Falls back gracefully if parsing fails

2. **Automatic URL Refresh on Every Fetch**
   - When memories are loaded, the server regenerates fresh signed URLs (1-hour expiry)
   - Refreshes URLs for:
     - Photos (`photoUrl`)
     - Videos (`videoUrl`)
     - Audio/Voice memos (`audioUrl`)
     - Documents (`documentUrl`)
     - Video thumbnails (`videoThumbnail`)

3. **Database Update**
   - Fresh URLs are saved back to the database
   - Updates the `updatedAt` timestamp
   - Ensures next fetch is faster (uses cached URLs until they expire again)

4. **Error Resilience**
   - If URL refresh fails for any memory, returns the original memory
   - Logs errors for debugging
   - Doesn't break the entire fetch operation

## How It Works Now:

**Before:**
```
1. User uploads photo → Signed URL created (1 hour validity)
2. URL stored in database
3. User returns 2 hours later
4. ❌ Photo fails to load (URL expired)
```

**After:**
```
1. User uploads photo → Signed URL created (1 hour validity)
2. URL stored in database
3. User returns 2 hours later
4. App fetches memories → Server detects expired URL
5. Server generates new signed URL (fresh 1 hour validity)
6. New URL saved to database
7. ✅ Photo loads successfully
```

## Benefits:
- ✅ **No More Broken Images** - URLs always fresh when memories load
- ✅ **Transparent to Users** - Happens automatically in the background
- ✅ **Performance** - Only refreshes when memories are actually fetched
- ✅ **Backward Compatible** - Works with old stored URLs
- ✅ **Future-Proof** - Handles any URL format changes

## Testing:
1. Upload a photo/video/voice memo
2. Wait more than 1 hour (or manually corrupt the URL in database)
3. Refresh the app and view memories
4. ✅ Media loads successfully with fresh URL

## Files Changed:
- `/supabase/functions/server/memories.tsx` - Added automatic URL refresh logic

---

**Status:** ✅ FIXED - All media URLs now auto-refresh on fetch
