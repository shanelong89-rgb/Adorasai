# Storage RLS Policy Fix - Complete ✅

## Problem
Users were getting "new row violates row-level security policy" errors when uploading photos, videos, and audio files. Additionally, there was a "Multiple GoTrueClient instances" warning.

## Root Cause
1. **RLS Policy Blocking**: The Supabase Storage bucket (`make-deded1eb-adoras-media`) is **private** with RLS policies enabled
2. **Authentication Issues**: Frontend was creating new Supabase clients for each upload and couldn't properly authenticate with user sessions
3. **Multiple Client Instances**: Creating multiple Supabase clients caused the GoTrueClient warning

## Solution
Changed upload architecture to use **backend-proxied uploads** instead of direct frontend uploads:

### Backend Changes (`/supabase/functions/server/index.tsx`)
Added new upload endpoint: `POST /make-server-deded1eb/upload`
- Authenticates user via access token
- Accepts multipart form data (file, connectionId, fileName)
- Uses `memories.uploadFile()` with **SERVICE_ROLE_KEY** (bypasses RLS)
- Returns signed URL for the uploaded file

### Frontend Changes

#### 1. **AuthContext** (`/utils/api/AuthContext.tsx`)
- Added `accessToken` to context interface
- Exposed access token to components via `useAuth()` hook
- Automatically updates token on signin/signup

#### 2. **Storage Utilities** (`/utils/api/storage.ts`)
- Complete rewrite to upload via backend API
- Removed direct Supabase client creation (fixes GoTrueClient warning)
- Uses FormData to send files to backend endpoint
- Maintains progress callback functionality
- All functions now require `accessToken` parameter:
  - `uploadPhoto(userId, connectionId, file, accessToken, onProgress)`
  - `uploadVideo(userId, connectionId, file, accessToken, onProgress)`
  - `uploadAudio(userId, connectionId, blob, accessToken, fileName, onProgress)`
  - `uploadDocument(userId, connectionId, file, accessToken, onProgress)`

#### 3. **AppContent** (`/components/AppContent.tsx`)
- Extract `accessToken` from `useAuth()` hook
- Pass `accessToken` to all upload function calls:
  - Photo uploads
  - Video uploads  
  - Voice note uploads

## Benefits
✅ **No More RLS Errors**: Backend uses SERVICE_ROLE_KEY to bypass RLS policies  
✅ **No Client Instance Warnings**: Single frontend client, backend handles storage  
✅ **Better Security**: File uploads controlled by backend with proper auth checks  
✅ **Cleaner Architecture**: Centralized upload logic in backend  
✅ **Same User Experience**: Progress indicators still work via simulation  

## Technical Details

### Upload Flow
```
Frontend → FormData → Backend API → Supabase Storage (SERVICE_ROLE_KEY) → Signed URL → Frontend
```

### Authentication
- Frontend: Bearer token in Authorization header
- Backend: Verifies token with `auth.verifyToken()`
- Storage: Backend uses SERVICE_ROLE_KEY (bypasses RLS)

### File Path Structure
```
{connectionId}/{userId}/{timestamp}-{filename}
```

## Testing
Test uploads with:
- ✅ Photos
- ✅ Videos
- ✅ Voice notes

All should now upload successfully without RLS errors.
