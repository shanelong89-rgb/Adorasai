# Video Edit Dialog Location Display - Debugging Guide

## Issue Description
Video media uploaded with GPS data is not showing location information in the "Edit Memory" dialog the same way photos are showing it.

## What SHOULD Happen

When you upload a video with GPS data and then open the Edit Memory dialog:

### For Photos (Current Working Behavior):
1. Click Edit on a photo memory
2. Scroll to "Photo Information" section
3. See "Photo Location" field with:
   - Badge: "Extracted from GPS" (if GPS data exists)
   - Input field showing the reverse-geocoded location (e.g., "San Francisco, California, United States")
   - Below input: Badge showing raw GPS coordinates
   - "View on Map" button to open Google Maps

### For Videos (Should Be Identical):
1. Click Edit on a video memory
2. Scroll to "Video Information" section
3. See "Video Location" field with:
   - Badge: "Extracted from GPS" (if GPS data exists)
   - Input field showing the reverse-geocoded location (e.g., "San Francisco, California, United States")
   - Below input: Badge showing raw GPS coordinates
   - "View on Map" button to open Google Maps

## Step-by-Step Testing

### 1. Upload a Video with GPS
1. Record a video on your phone with location services enabled
2. Upload it to Adoras
3. Watch the console logs (should see GPS extraction logs from previous debugging)

### 2. Check Memory Card Display
Before opening the edit dialog, verify the video memory card shows:
- Video preview/thumbnail
- MapPin icon 📍 
- Location text below the video (e.g., "San Francisco, United States")

**If location is NOT showing on the card:**
- The video doesn't have GPS data OR
- GPS extraction failed (check console logs from upload)

### 3. Open Edit Dialog
1. As a Legacy Keeper, long-press on the video memory card
2. Click the Edit button (small icon that appears on hover/long-press)
3. Edit Memory dialog should open

### 4. Check Video Information Section
Scroll down in the Edit Memory dialog to find:

```
┌─────────────────────────────────────────┐
│ Edit Memory                             │
│                                         │
│ Notes:                                  │
│ [text area]                             │
│                                         │
│ Location:                               │
│ [text input]                            │
│                                         │
│ Tags:                                   │
│ [text input]                            │
│                                         │
│ Date and Time:                          │
│ [datetime picker]                       │
│                                         │
│ ────────────────────────                │
│ 🎥 Video Information                    │
│                                         │
│ 📅 Video Date & Time  [Extracted...]    │
│ [datetime picker]                       │
│                                         │
│ 📍 Video Location     [Extracted...]    │ ← THIS IS THE KEY FIELD
│ [San Francisco, United States]          │
│ ┌─────────────────────────────────┐    │
│ │ GPS: 37.7749, -122.4194  [View] │    │ ← THIS SHOULD APPEAR
│ └─────────────────────────────────┘    │
│                                         │
│ 👥 People in Video                      │
│ [text input]                            │
│                                         │
│ [Delete]              [Save]            │
└─────────────────────────────────────────┘
```

### 5. Verify Each Component

Check these specific elements:

#### A. Video Location Label
- [ ] "Video Location" label is visible
- [ ] MapPin icon appears next to label
- [ ] "Extracted from GPS" badge appears (if video has GPS)

#### B. Video Location Input Field
- [ ] Input field shows the reverse-geocoded location text
- [ ] Text is human-readable (e.g., "City, State, Country")
- [ ] Input is editable (you can type in it)

#### C. GPS Coordinates Badge (appears BELOW input)
- [ ] If location is reverse-geocoded, shows raw GPS coordinates
- [ ] Format: "GPS: XX.XXXXXX, YY.YYYYYY"
- [ ] Has a "View on Map" button next to it

#### D. View on Map Button
- [ ] Button appears if GPS coordinates exist
- [ ] Clicking opens Google Maps in new tab
- [ ] Google Maps shows correct location

## Console Logs to Check

### When Opening Edit Dialog

Look for this log when you click Edit:
```
[No specific log currently, but memory object is being set]
```

### When Clicking Save

Look for these logs:
```
💾 Saving memory edit for: video {memory-id}
💾 Saving updates: {
  ...
  videoLocation: "City, Country",
  videoGPSCoordinates: {latitude: X, longitude: Y}
  ...
}
```

## Common Issues

### Issue 1: "Video Information" section not appearing
**Cause**: The memory type might not be 'video'
**Solution**: Check console - what type is the memory?

### Issue 2: Video Location field is empty
**Possible Causes**:
1. Video doesn't have GPS data (most common)
2. GPS extraction failed during upload
3. The `editVideoLocation` state is not being initialized

**Check**:
- Look at upload console logs - did GPS extraction succeed?
- Check memory card - does it show location there?
- If card shows location but edit dialog doesn't, there's a state initialization issue

### Issue 3: "Extracted from GPS" badge not showing
**Cause**: The badge only appears if `editingMemory.videoLocation` exists
**Solution**: This is the memory being edited, not the edit state. Check if the memory itself has videoLocation.

### Issue 4: GPS coordinates not showing below input
**Possible Causes**:
1. `editingMemory.videoGPSCoordinates` doesn't exist
2. The location field contains GPS coordinates (so it doesn't show duplicate)

**Logic**:
- If `editVideoLocation` contains coordinates (matches pattern), show them as a badge
- Otherwise, if `editingMemory.videoGPSCoordinates` exists, show those coordinates
- Can't have both at the same time

### Issue 5: Save button doesn't persist changes
**Check**:
- Are you saving the edit?
- Check console for "💾 Saving updates" log
- Verify the updates object includes `videoLocation` and `videoGPSCoordinates`

## Code Verification Checklist

Verify these files have the correct code:

### MediaLibraryTab.tsx - Edit Dialog State Initialization
Around line 545-550, when Edit button is clicked:
```tsx
// Initialize video metadata if it's a video
if (memory.type === 'video') {
  setEditVideoDate(memory.videoDate ? memory.videoDate.toISOString().slice(0, 16) : '');
  setEditVideoLocation(memory.videoLocation || '');
  setEditVideoPeople(memory.videoPeople?.join(', ') || '');
}
```

### MediaLibraryTab.tsx - Edit Dialog Save Handler
Around line 438-455:
```tsx
// Add video metadata if it's a video
if (editingMemory.type === 'video') {
  if (editVideoDate) {
    updates.videoDate = new Date(editVideoDate);
  }
  if (editVideoLocation !== undefined) {
    updates.videoLocation = editVideoLocation;
  }
  // Preserve GPS coordinates from the original memory
  if (editingMemory.videoGPSCoordinates) {
    updates.videoGPSCoordinates = editingMemory.videoGPSCoordinates;
  }
  if (editVideoPeople) {
    updates.videoPeople = editVideoPeople.split(',').map(p => p.trim()).filter(p => p);
    updates.videoFaces = updates.videoPeople.length;
  }
}
```

### MediaLibraryTab.tsx - Edit Dialog Video Location Display
Around line 1275-1324:
```tsx
<Label className="text-sm font-medium flex items-center gap-2">
  <MapPin className="w-4 h-4" />
  Video Location
  {editingMemory.videoLocation && (
    <Badge variant="secondary" className="text-xs ml-auto">
      Extracted from GPS
    </Badge>
  )}
</Label>
<div className="space-y-2">
  <Input
    value={editVideoLocation}
    onChange={(e) => setEditVideoLocation(e.target.value)}
    placeholder="Add location (e.g., New York, NY)"
  />
  {editVideoLocation && isGPSCoordinates(editVideoLocation) && (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        GPS: {editVideoLocation}
      </Badge>
      <Button ... >View on Map</Button>
    </div>
  )}
  {editingMemory.videoGPSCoordinates && !isGPSCoordinates(editVideoLocation) && (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        GPS: {editingMemory.videoGPSCoordinates.latitude.toFixed(6)}, {editingMemory.videoGPSCoordinates.longitude.toFixed(6)}
      </Badge>
      <Button ... >View on Map</Button>
    </div>
  )}
</div>
```

## Next Steps

If after all this checking the video location STILL doesn't show:

1. **Share Console Logs**: Copy ALL console logs from:
   - Uploading the video
   - Opening the edit dialog
   - The memory object structure

2. **Share Screenshots**: Take screenshots of:
   - The video memory card (does it show location?)
   - The edit dialog (what does the Video Information section look like?)

3. **Test with Photo**: Upload the same exact video as both:
   - A video file
   - Convert a frame to photo and upload
   - Compare if photo shows location but video doesn't

4. **Check Memory Object**: In console, type:
   ```javascript
   // Find the video memory in the memories array
   // This will show you exactly what data is stored
   ```

5. **Manual Test**: Try manually editing the video location field:
   - Open edit dialog
   - Type a location manually (e.g., "Test Location")
   - Save
   - Reopen - does "Test Location" persist?
   - If yes, the save/load works, but GPS extraction doesn't
   - If no, there's a save/load issue
