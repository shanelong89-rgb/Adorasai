# Document Text Extraction Debug Guide

## Issue Fixed: Document Upload Missing

### Problem Identified
Documents were not being uploaded to Supabase Storage before saving. The `documentUrl` field contained a base64 data URL instead of an actual storage URL, which meant:
1. The AI service couldn't access the document (base64 data URLs can't be accessed externally)
2. The document extraction would fail with "no document to extract from"

### Solution Implemented
Added document upload logic to `AppContent.tsx` (lines ~1306-1371), similar to photo/video/voice upload sections.

## How to Debug Document Text Extraction

### Step 1: Upload a Document
1. Go to the Chat tab
2. Click the document/attachment icon
3. Upload a document (PDF, image, or other supported type)
4. **Check Browser Console** for these logs:
   ```
   📤 Uploading document to Supabase Storage...
   ✅ Document uploaded: https://[...].supabase.co/storage/v1/[...]
   📡 Creating memory with fields: [...]
   ✅ Memory created successfully: {...}
   ```

### Step 2: Verify Document is Stored
After upload, check:
1. **Browser Console**: Look for `documentUrl` in the created memory
2. **Network Tab**: Look for POST request to `/make-server-deded1eb/upload`
3. The `documentUrl` should be a full HTTPS URL, NOT a `data:` URL

Expected console output:
```javascript
{
  id: "...",
  type: "document",
  documentUrl: "https://[project].supabase.co/storage/v1/object/sign/make-deded1eb-media/...",
  documentType: "pdf",
  documentFileName: "example.pdf"
}
```

### Step 3: Try Document Text Extraction
1. Find the uploaded document in Chat tab or Media Library
2. Click "Extract Text with AI" button
3. **Check Browser Console** for:
   ```
   Calling AI document text extraction for: https://[...].supabase.co/[...]
   ```

### Step 4: Check AI Service Response
Look for one of these outcomes in the console:

#### Success Case:
```
✅ AI document text extraction complete: { length: 1234 }
```

#### Error Cases:

**Case 1: AI Not Configured**
```
ℹ️ AI features not available: Groq API key not configured
```
**Solution**: Ensure `GROQ_API_KEY` is set in Supabase Edge Functions environment variables

**Case 2: Image Not Accessible**
```
Image URL not accessible by AI service. The image may be in a private bucket or the signed URL may have expired.
```
**Solution**: 
- Check if the signed URL has expired (they last 1 hour by default)
- Verify the bucket is public or the signed URL is valid
- Try refreshing the memory to get a new signed URL

**Case 3: Groq API Error**
```
Groq AI API error: [status code] [error message]
```
**Solution**: Check the error details - could be rate limiting, invalid API key, or image format issues

### Step 5: Backend Logs
Check Supabase Edge Function logs for:

1. **Upload Success**:
   ```
   📁 Uploading file: document-123456.pdf (size: 12345 bytes)
   ✅ File uploaded successfully
   ```

2. **Document Extraction Request**:
   ```
   Extracting text from document with Groq AI Vision: https://[...].supabase.co/[...]
   ```

3. **Groq AI Response**:
   ```
   Document text extraction complete: { length: 1234 }
   ```

## Common Issues and Solutions

### Issue 1: "No document to extract from" Error
**Cause**: The memory doesn't have a `documentUrl` field or it's undefined
**Solution**: 
- Ensure the document was uploaded successfully
- Check browser console for upload errors
- Verify the memory object has `documentUrl` field

### Issue 2: Document URL is a Data URL
**Cause**: Document wasn't uploaded to Supabase Storage (old bug, now fixed)
**Solution**: Re-upload the document - it will now be properly stored

### Issue 3: Signed URL Expired
**Cause**: Signed URLs expire after 1 hour by default
**Solution**: 
- The app should automatically refresh URLs on load
- Manually refresh by navigating away and back
- Check `AppContent.tsx` line ~342 for URL refresh logic

### Issue 4: Groq API Key Not Configured
**Cause**: `GROQ_API_KEY` environment variable not set
**Solution**: 
1. Go to Supabase Dashboard → Edge Functions → Environment Variables
2. Add `GROQ_API_KEY` with your Groq API key
3. Redeploy edge functions if needed

### Issue 5: Document Format Not Supported
**Cause**: Groq Vision only supports images (PNG, JPG, WebP, GIF)
**Notes**: 
- PDFs need to be converted to images first (not implemented yet)
- For now, only image-based documents work (scanned documents, photos of documents)

## Testing Document Extraction

### Test Case 1: Image Document (PNG/JPG)
1. Take a photo of a document or use a scanned document image
2. Upload via Chat tab
3. Click "Extract Text with AI"
4. Should extract text successfully

### Test Case 2: PDF Document
1. Upload a PDF
2. Click "Extract Text with AI"
3. Currently may fail - PDF support requires conversion to image
4. Feature enhancement needed for full PDF support

### Test Case 3: Large Document
1. Upload a large document image (>1MB)
2. Check upload progress indicator works
3. Check extraction works (may be slower)

## Code Files Involved

1. **Frontend Upload**: `/components/AppContent.tsx` lines ~1306-1371
2. **Frontend Extraction**: `/components/ChatTab.tsx` lines ~1190-1240
3. **Frontend Service**: `/utils/aiService.ts` lines ~246-321
4. **Backend Upload**: `/supabase/functions/server/index.tsx` 
5. **Backend AI**: `/supabase/functions/server/ai.tsx` lines ~705-795
6. **Storage API**: `/utils/api/storage.ts` lines ~180-198

## Next Steps After Testing

If extraction still fails:
1. Share browser console output
2. Share network tab for the AI request
3. Share Supabase edge function logs
4. We'll debug from there

## Environment Variables Checklist

Ensure these are set in Supabase Edge Functions:
- ✅ `GROQ_API_KEY` - Required for document extraction
- ✅ `SUPABASE_URL` - Auto-configured
- ✅ `SUPABASE_ANON_KEY` - Auto-configured
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured
