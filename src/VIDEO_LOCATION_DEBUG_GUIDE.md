# Video Location Debugging Guide

## Overview
This guide helps you debug why video location information might not be showing up the same way as photo location information.

## What Should Happen

When you upload a video with GPS metadata:

1. **GPS Extraction**: The app should extract GPS coordinates from the video's EXIF data
2. **Reverse Geocoding**: Convert GPS coordinates to human-readable format (City, Country)
3. **Display**: Show the location on the video memory card with a MapPin icon
4. **Edit Dialog**: Display the location in the video edit dialog with GPS coordinates

## Console Logs to Check

When you upload a video, look for these console logs in your browser's developer console (F12 or Cmd+Option+I):

### 1. Video EXIF Extraction Start
```
📹 Attempting to extract GPS from video EXIF...
```

### 2. EXIF Data Found (if available)
```
📹 Video EXIF data found: {object with metadata}
```

### 3. GPS Coordinates Found (if available)
```
📍 Video GPS coordinates found: {latitude}, {longitude}
```

### 4. Reverse Geocoding Attempt
```
🌍 Attempting reverse geocoding for video...
🌍 Reverse geocoding coordinates: {latitude}, {longitude}
```

### 5. Reverse Geocoding Response
```
🌍 Reverse geocoding response: {address data}
✅ Reverse geocoded to: {City, Country}
```

### 6. Final Video Location Set
```
✅ Video reverse geocoding successful: {City, Country}
📍 Final video location set to: {City, Country}
```

### 7. Video Metadata Complete
```
📹 Final video metadata before resolve: {
  location: "City, Country",
  gpsCoordinates: {latitude: X, longitude: Y},
  date: Date,
  duration: X
}
```

### 8. ChatTab Receives Metadata
```
📹 Video metadata - location: City, Country date: Date
📹 Creating video memory with location: City, Country
```

### 9. App.tsx Stores Memory
```
📝 App.tsx - Adding new memory: {
  type: "video",
  videoLocation: "City, Country",
  hasVideoGPS: true
}
✅ Created memory with ID: {id}
✅ Video memory has location: City, Country
```

## Common Issues and Solutions

### Issue 1: "⚠️ No GPS data found in video EXIF"

**Cause**: The video file doesn't contain GPS metadata
**Solution**: 
- Ensure the video was recorded with a device that has GPS enabled (e.g., smartphone with location services on)
- Try a different video file that you know has GPS data
- Some video formats don't preserve GPS data - try .MOV or .MP4 files from modern smartphones

### Issue 2: "⚠️ Video EXIF extraction failed"

**Cause**: The video format is not supported by the EXIF reader
**Solution**: 
- Try a video from an iPhone (.MOV) or Android phone (.MP4)
- Check the console for the specific error message
- Some video codecs store metadata differently

### Issue 3: Reverse geocoding fails or times out

**Cause**: The OpenStreetMap Nominatim API is unavailable or timing out
**Solution**: 
- Check your internet connection
- The app will fall back to showing GPS coordinates if reverse geocoding fails
- You should see: `metadata.location = "{latitude}, {longitude}"`

### Issue 4: Location shows GPS coordinates instead of city name

**Cause**: Reverse geocoding failed but GPS data was extracted
**Solution**: 
- This is expected behavior when reverse geocoding fails
- You can still view the location on Google Maps by clicking the "View on Map" button in the edit dialog

### Issue 5: No location showing at all

**Cause**: Multiple possible causes
**Steps to diagnose**:
1. Check if you see "📹 Attempting to extract GPS from video EXIF..." in console
2. If not, the video upload handler might not be working
3. If yes, check what happens next in the log sequence
4. Look for any error messages in red

## Testing with Sample Videos

### Where to Get Videos with GPS Data

1. **Your Phone**: Record a video with location services enabled
2. **iPhone**: Settings > Privacy > Location Services > Camera > "While Using the App"
3. **Android**: Settings > Apps > Camera > Permissions > Location > "Allow"

### Verifying GPS Data Exists

Before uploading to the app, you can verify GPS data using:
- **Mac**: Get Info on the file, check "More Info" section
- **Windows**: File Properties > Details tab
- **Online tools**: ExifTool, Jeffrey's Image Metadata Viewer

## UI Display Check

After upload, verify these locations show the video location:

1. **Memory Card in Media Library**:
   - Look for MapPin icon 📍 below the video preview
   - Should show city name or GPS coordinates

2. **Edit Dialog** (Legacy Keepers only):
   - Long-press on video memory card
   - Click Edit button
   - Scroll to "Video Information" section
   - Check "Video Location" field
   - Should show badge "Extracted from GPS" if data was found
   - Should show "View on Map" button if coordinates exist

## Code Flow Summary

```
Video Upload
    ↓
ChatTab.tsx (handleMediaUpload)
    ↓
extractVideoMetadata(file)
    ↓
exifr.parse() → Extract GPS
    ↓
reverseGeocode(lat, lon)
    ↓
OpenStreetMap Nominatim API
    ↓
Return metadata object
    ↓
onAddMemory({ videoLocation, videoGPSCoordinates })
    ↓
App.tsx (handleAddMemory)
    ↓
Store in memories state
    ↓
MediaLibraryTab receives memory
    ↓
Render location with MapPin icon
```

## Need Help?

If location still isn't showing:
1. Copy all console logs from a video upload
2. Check if the video actually has GPS data using external tools
3. Try with a different video file
4. Check if photos with GPS are working (to isolate the issue)
