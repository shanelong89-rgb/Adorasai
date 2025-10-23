# Visual Comparison: Photo vs Video Location Display

## Side-by-Side Comparison

### Photo Edit Dialog - "Photo Information" Section

```
┌─────────────────────────────────────────────────────────┐
│ 📷 Photo Information                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📅 Photo Date & Time          [Extracted from EXIF]    │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 2024-01-15T14:30                                  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ 📍 Photo Location             [Extracted from GPS]     │
│ ┌───────────────────────────────────────────────────┐  │
│ │ San Francisco, California, United States          │  │
│ └───────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📍 GPS: 37.774929, -122.419418    [🔗 View on Map] ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 👥 People in Photo            [2 faces detected]       │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Mom, Dad                                          │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Video Edit Dialog - "Video Information" Section (SHOULD LOOK IDENTICAL)

```
┌─────────────────────────────────────────────────────────┐
│ 🎥 Video Information                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📅 Video Date & Time          [Extracted from EXIF]    │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 2024-01-15T14:30                                  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ 📍 Video Location             [Extracted from GPS]     │ ← KEY: Should look exactly like photo
│ ┌───────────────────────────────────────────────────┐  │
│ │ San Francisco, California, United States          │  │ ← Reverse-geocoded location
│ └───────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📍 GPS: 37.774929, -122.419418    [🔗 View on Map] ││ ← Raw GPS + Map link
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 👥 People in Video                                      │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Mom, Dad                                          │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## What You're Currently Seeing (Problem State)

Please describe or screenshot what you're actually seeing. Common issues:

### Scenario A: No "Video Information" section at all
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
│ [Delete]              [Save]            │
└─────────────────────────────────────────┘
```
**If this is what you see**: The memory might not be recognized as type 'video'

### Scenario B: Video Information section exists but location is empty
```
┌─────────────────────────────────────────┐
│ 🎥 Video Information                    │
├─────────────────────────────────────────┤
│                                         │
│ 📅 Video Date & Time                    │
│ ┌─────────────────────────────────────┐ │
│ │ 2024-01-15T14:30                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📍 Video Location                       │ ← No "Extracted from GPS" badge
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │ ← Empty field
│ └─────────────────────────────────────┘ │
│                                         │
│ 👥 People in Video                      │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
**If this is what you see**: Video was uploaded but no GPS data was extracted

### Scenario C: Video Information exists, location field has text, but no GPS badge below
```
┌─────────────────────────────────────────────────────────┐
│ 🎥 Video Information                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📅 Video Date & Time          [Extracted from EXIF]    │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 2024-01-15T14:30                                  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ 📍 Video Location             [Extracted from GPS]     │
│ ┌───────────────────────────────────────────────────┐  │
│ │ San Francisco, California, United States          │  │
│ └───────────────────────────────────────────────────┘  │
│                                   ← MISSING: GPS badge! │
│ 👥 People in Video                                      │
│ ┌───────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```
**If this is what you see**: Location was extracted and displayed, but GPS coordinates weren't saved

## Memory Card Display (Should Also Match)

### Photo Memory Card
```
┌──────────────────────────┐
│  [Photo Preview]         │
│                          │
│                          │
│                          │
├──────────────────────────┤
│ 📸 Photos  You           │
│ Jan 15, 2024 2:30 PM     │
│ 📍 San Francisco, US     │ ← Location with MapPin icon
│ #family #memory          │
└──────────────────────────┘
```

### Video Memory Card (Should Be Identical)
```
┌──────────────────────────┐
│  [Video Preview]         │
│  ▶️                       │
│                          │
│                          │
├──────────────────────────┤
│ 🎥 Video   You           │
│ Jan 15, 2024 2:30 PM     │
│ 📍 San Francisco, US     │ ← Location with MapPin icon (SAME AS PHOTO)
│ #video #memory           │
└──────────────────────────┘
```

## What to Check RIGHT NOW

1. **Upload a video with GPS** (record on your phone with location enabled)

2. **Check the memory card** - Does it show location?
   - ✅ YES → GPS extraction worked, issue is only in edit dialog
   - ❌ NO → GPS extraction didn't work at all

3. **Open edit dialog** - What do you see?
   - Compare to the scenarios above
   - Which scenario matches what you're seeing?

4. **Check browser console** - Look for these logs:
   ```
   📹 Video metadata - location: [something]
   🎬 Opening edit dialog for video: {...}
   ```

5. **Take screenshots** - Of both:
   - The video memory card
   - The edit dialog Video Information section

## Expected Console Output

When you click Edit on a video WITH GPS data, you should see:

```
🎬 Opening edit dialog for video: {
  videoLocation: "San Francisco, California, United States",
  videoGPSCoordinates: {latitude: 37.774929, longitude: -122.419418},
  videoDate: Mon Jan 15 2024 14:30:00 GMT-0800 (Pacific Standard Time)
}
```

If you see this but the UI doesn't show it, there's a rendering issue.
If videoLocation is undefined or empty, GPS wasn't extracted during upload.
