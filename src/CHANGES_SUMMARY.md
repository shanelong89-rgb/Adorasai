# Summary of Changes for Video Location Display

## Problem
Video media uploaded with GPS data was not showing location information in the "Edit Memory" dialog the same way photos were showing it.

## Changes Made

### 1. Enhanced Video GPS Extraction (`/utils/exifExtractor.ts`)
**Lines ~227-235**: Added QuickTime-specific EXIF parsing options
- Added `iptc: true`
- Added `icc: true`  
- Added `mergeOutput: true`

These options help extract GPS data from MOV/MP4 video files which store metadata differently than photos.

### 2. Improved GPS Coordinate Preservation (`/components/MediaLibraryTab.tsx`)

**Lines ~424-436** (Photo save handler):
- Changed condition from `if (editPhotoLocation)` to `if (editPhotoLocation !== undefined)`
- Added explicit GPS coordinate preservation: `updates.photoGPSCoordinates = editingMemory.photoGPSCoordinates`

**Lines ~438-456** (Video save handler):
- Changed condition from `if (editVideoLocation)` to `if (editVideoLocation !== undefined)`
- Added explicit GPS coordinate preservation: `updates.videoGPSCoordinates = editingMemory.videoGPSCoordinates`

**Why This Matters**: 
- Previously, GPS coordinates could be lost when editing other fields
- Now coordinates are explicitly preserved even if location text is edited
- The `!== undefined` check allows saving empty strings (clearing location)

### 3. Added Comprehensive Console Logging

**In `/components/MediaLibraryTab.tsx`**:

Lines ~550-554 (Photo edit dialog open):
```typescript
console.log('📸 Opening edit dialog for photo:', {
  photoLocation: memory.photoLocation,
  photoGPSCoordinates: memory.photoGPSCoordinates,
  photoDate: memory.photoDate
});
```

Lines ~557-562 (Video edit dialog open):
```typescript
console.log('🎬 Opening edit dialog for video:', {
  videoLocation: memory.videoLocation,
  videoGPSCoordinates: memory.videoGPSCoordinates,
  videoDate: memory.videoDate
});
```

Lines ~413-414 (Save edit start):
```typescript
console.log('💾 Saving memory edit for:', editingMemory.type, editingMemory.id);
```

Lines ~471 (Save edit completion):
```typescript
console.log('💾 Saving updates:', updates);
```

### 4. Enhanced Video Metadata Logging (`/utils/exifExtractor.ts`)

Lines ~288-293 (Final metadata before resolve):
```typescript
console.log('📹 Final video metadata before resolve:', {
  location: metadata.location,
  gpsCoordinates: metadata.gpsCoordinates,
  date: metadata.date,
  duration: metadata.duration
});
```

### 5. Created Debugging Documentation

Created three comprehensive guides:
1. `/VIDEO_LOCATION_DEBUG_GUIDE.md` - Complete debugging workflow
2. `/VIDEO_EDIT_DIALOG_DEBUG.md` - Specific edit dialog troubleshooting
3. `/VISUAL_COMPARISON_GUIDE.md` - Visual comparison of photo vs video display

## How to Test

### Test 1: Upload a Video with GPS
1. Record a video on your phone with location services enabled
2. Upload it to Adoras
3. Check browser console for GPS extraction logs:
   - Should see: `📍 Video GPS coordinates found`
   - Should see: `✅ Video reverse geocoding successful`
   - Should see: `📹 Video metadata - location: [City, Country]`

### Test 2: Check Memory Card Display
1. After upload, find the video memory card
2. Should see MapPin icon 📍 with location text below video
3. Location should be human-readable (e.g., "San Francisco, United States")

### Test 3: Open Edit Dialog
1. Long-press the video memory card (as Legacy Keeper)
2. Click the Edit button
3. Check browser console for: `🎬 Opening edit dialog for video: {...}`
4. Verify the logged object has videoLocation and videoGPSCoordinates

### Test 4: Check Edit Dialog UI
Scroll to "Video Information" section and verify:
1. ✅ "Video Location" label with MapPin icon
2. ✅ "Extracted from GPS" badge (if GPS exists)
3. ✅ Input field showing reverse-geocoded location
4. ✅ GPS coordinates badge below input
5. ✅ "View on Map" button

### Test 5: Save and Reload
1. Make a change (e.g., add a note)
2. Click Save
3. Check console for: `💾 Saving updates: {...}`
4. Verify updates object includes videoLocation and videoGPSCoordinates
5. Reopen edit dialog - verify location still shows

## Common Issues & Solutions

### Issue: Video uploads but no location on memory card
**Diagnosis**: GPS extraction failed or video has no GPS data
**Check**: 
- Console logs during upload - look for GPS extraction messages
- Try a different video file
- Verify video was recorded with location services enabled

### Issue: Location shows on card but not in edit dialog
**Diagnosis**: State initialization problem
**Check**:
- Console log when opening edit dialog: `🎬 Opening edit dialog for video`
- Verify videoLocation is in the logged object
- If it's there but not rendering, check React DevTools state

### Issue: Location shows in edit dialog but disappears after save
**Diagnosis**: GPS coordinates not being preserved
**Check**:
- Console log when saving: `💾 Saving updates`
- Verify updates object includes videoGPSCoordinates
- This should be fixed by the changes above

### Issue: GPS coordinates badge not showing below location input
**Diagnosis**: Either coordinates don't exist OR location field contains coordinates
**Check**:
- The badge only shows if videoGPSCoordinates exists
- The badge WON'T show if editVideoLocation already contains GPS coordinates
- This is intentional to avoid duplication

## Code References

### Video Location Display in Memory Card
**File**: `/components/MediaLibraryTab.tsx`
**Lines**: ~696-701
```tsx
{(memory.type === 'video' && memory.videoLocation) && (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <MapPin className="w-3 h-3" />
    <span>{memory.videoLocation}</span>
  </div>
)}
```

### Video Location in Edit Dialog
**File**: `/components/MediaLibraryTab.tsx`
**Lines**: ~1275-1324
Complete video location input with GPS badge and map link

### Video GPS Extraction
**File**: `/utils/exifExtractor.ts`
**Function**: `extractVideoMetadata`
**Lines**: ~219-303

## Next Steps

1. **Test with real video files** that have GPS data
2. **Check console logs** at each step (upload → display → edit → save)
3. **Compare behavior** between photos and videos
4. **Share console logs** if issues persist

## Verification Checklist

After these changes, verify:
- [ ] Videos with GPS show location on memory card
- [ ] Edit dialog "Video Information" section appears
- [ ] "Video Location" field is populated
- [ ] "Extracted from GPS" badge appears
- [ ] GPS coordinates badge shows below input
- [ ] "View on Map" button opens Google Maps
- [ ] Saving preserves location and coordinates
- [ ] Reopening edit dialog still shows location

## Technical Notes

### GPS Coordinate Preservation Logic
Previously, when saving edits:
```typescript
if (editVideoLocation) {  // Only saves if truthy (non-empty)
  updates.videoLocation = editVideoLocation;
}
```

Now:
```typescript
if (editVideoLocation !== undefined) {  // Saves even if empty string
  updates.videoLocation = editVideoLocation;
}
// PLUS: Explicitly preserve coordinates
if (editingMemory.videoGPSCoordinates) {
  updates.videoGPSCoordinates = editingMemory.videoGPSCoordinates;
}
```

This ensures:
1. You can clear location (set to empty string)
2. GPS coordinates are always preserved separately
3. The "View on Map" button keeps working even if location text is edited

### QuickTime Metadata
Videos (especially from iPhones) use QuickTime format which stores GPS in different atoms than JPEG EXIF. The `mergeOutput: true` option tells exifr to combine all metadata sources, improving GPS extraction from MP4/MOV files.
