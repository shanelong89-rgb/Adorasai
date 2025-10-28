# Video Upload & Playback Troubleshooting Guide

## Quick Diagnostics

### Step 1: Check Browser Console
Press `F12` (or `Cmd+Option+I` on Mac) to open browser console.

### Step 2: Look for These Messages

#### ✅ Success Messages (Good!)
```
🎬 Starting video conversion: {name: "video.mov", ...}
✅ Video metadata loaded: {width: 1920, height: 1080, ...}
✅ Video converted: 12.45MB → 10.23MB
✅ Video loaded: Video: video.webm
```
**Meaning**: Video uploaded and converted successfully. Should play fine.

#### ❌ Error Messages (Problems)
```
❌ Video playback error: {errorCode: 4, message: "MEDIA_ERR_SRC_NOT_SUPPORTED"}
```
**Meaning**: Browser can't play this video format. See solutions below.

```
❌ Video conversion error: Failed to load video
```
**Meaning**: Conversion failed. Try solution #1 or #2 below.

```
⚠️ Video network error - may be temporary
```
**Meaning**: Connection issue. Try refreshing or check internet.

## Common Problems & Solutions

### Problem 1: "Video format not supported by your browser"

**What it looks like**:
- Video appears in chat but won't play
- Click play button → nothing happens or error
- Console shows error code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)

**Quick Fix**:
1. **Convert before uploading**:
   - **iPhone**: Settings → Camera → Formats → "Most Compatible"
   - **Mac**: Export as MP4 using QuickTime or iMovie
   - **Windows**: Use HandBrake (free) to convert to MP4

2. **Try different browser**:
   - MOV files: Try Safari (better support)
   - MP4 files: Try Chrome or Firefox
   - Update browser to latest version

3. **Re-upload**:
   - Delete the failed video from Media Library
   - Convert to MP4 format
   - Upload again

**Detailed Solution**:

**On iPhone/iPad**:
```
1. Open Settings
2. Scroll to Camera
3. Tap Formats
4. Select "Most Compatible" (not "High Efficiency")
5. Record new videos - they'll be MP4 now
```

**On Mac with QuickTime**:
```
1. Open video in QuickTime
2. File → Export As → 1080p or 720p
3. Save as MP4
4. Upload the exported file
```

**On Mac with iMovie**:
```
1. Import video into iMovie
2. Tap Share button
3. Select "File"
4. Choose HD 720p or 1080p
5. Save and upload
```

**On Windows with HandBrake** (Free Tool):
```
1. Download from handbrake.fr
2. Open HandBrake
3. Drag video file to window
4. Choose "Fast 720p30" preset
5. Click "Start Encode"
6. Upload the converted file
```

### Problem 2: Video conversion takes forever or times out

**What it looks like**:
- "Converting video: 45%" message stays forever
- Eventually shows "Conversion failed" or times out
- Console shows "Video loading timeout"

**Causes**:
- Video is too large (>50MB)
- Video is very long (>5 minutes)
- Video codec is exotic/unsupported
- Browser is running out of memory

**Solutions**:

1. **Trim the video shorter**:
   - iPhone: Photos app → Edit → Trim
   - Mac: QuickTime → Edit → Trim
   - Goal: Under 2 minutes

2. **Reduce video size**:
   ```
   iPhone Settings:
   Settings → Camera → Record Video → Choose 1080p at 30fps
   (Not 4K, not 60fps)
   ```

3. **Convert externally first**:
   - Use HandBrake with "Fast 720p30" preset
   - This compresses the video before upload
   - Usually results in 5-10MB file

4. **Upload in segments**:
   - Split long videos into 1-2 minute clips
   - Upload separately
   - Easier to manage and convert

### Problem 3: Video plays but has no sound

**What it looks like**:
- Video plays but silent
- No audio controls visible

**Causes**:
- Video has no audio track
- Audio codec not supported
- Browser muted by default

**Solutions**:
1. Check device volume (sounds obvious but often the issue!)
2. Tap unmute button on video player
3. Try different browser
4. Re-record with audio enabled
5. Convert with audio track using HandBrake

### Problem 4: Video plays on computer but not on phone

**What it looks like**:
- Desktop browser: Works fine
- Mobile browser: Error or black screen

**Causes**:
- Missing `playsInline` attribute (iOS)
- Mobile browser codec limitations
- File too large for mobile

**Solutions**:
1. **iOS Specific**: Make sure you're using latest iOS/Safari
2. **Reduce file size**: Compress to under 10MB for mobile
3. **Use MP4**: Most compatible format for mobile
4. **Check mobile data**: Large videos may not load on cellular

### Problem 5: "NotSupportedError: The element has no supported sources"

**What it looks like**:
- Video appears as placeholder
- Console shows "NotSupportedError"
- No play button or black screen

**This is the main error fixed in latest update!**

**Causes**:
- Browser doesn't support video codec
- Conversion failed silently
- Blob URL expired
- Missing video attributes

**Solutions**:
1. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear browsing data
3. **Convert to MP4**: Use external tool before uploading
4. **Try Safari**: Best browser for MOV files
5. **Update app**: Make sure you have latest version

### Problem 6: Cold start warnings in console

**What it looks like**:
```
⚠️ Slow operation detected: resource-fetch took 9602ms (cold start - expected)
```

**This is NORMAL! Not an error!**

**What it means**:
- Server was "sleeping" (not used recently)
- First request wakes it up (takes 5-15 seconds)
- Subsequent requests are fast
- This is how serverless functions work

**What to do**:
- **Nothing!** This is expected behavior
- Only worry if cold starts exceed 20-30 seconds
- After first request, everything will be fast

## Video Format Quick Reference

| Format | Extension | Chrome | Firefox | Safari | Mobile | Recommendation |
|--------|-----------|--------|---------|--------|--------|----------------|
| MP4 (H.264) | .mp4 | ✅ | ✅ | ✅ | ✅ | **Best choice** |
| WebM | .webm | ✅ | ✅ | ⚠️ | ⚠️ | Good for web |
| MOV | .mov | ❌ | ❌ | ✅ | ⚠️ | Convert first |
| AVI | .avi | ❌ | ❌ | ❌ | ❌ | Must convert |
| WMV | .wmv | ❌ | ❌ | ❌ | ❌ | Must convert |

✅ = Native support  
⚠️ = Partial support  
❌ = No support  

## Recommended Settings

### Recording New Videos

**iPhone Camera**:
```
Settings → Camera → Formats: "Most Compatible"
Settings → Camera → Record Video: "1080p HD at 30 fps"
```

**Android Camera**:
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 fps
- Avoid 4K unless necessary

### Converting Existing Videos

**Best Settings for Web**:
- Format: MP4
- Codec: H.264
- Resolution: 1080p or 720p
- Frame rate: 30 fps
- Bitrate: 2-5 Mbps
- Audio: AAC codec

**HandBrake Preset**: "Fast 720p30" or "Fast 1080p30"

## Testing Your Video

Before sharing with family, test the video:

1. **Upload the video**
2. **Wait for conversion** (if needed)
3. **Tap to play**
4. **Check**:
   - ✅ Video plays immediately
   - ✅ Audio works
   - ✅ No error messages
   - ✅ Video looks good quality

5. **Test on different device**:
   - If uploaded from computer, test on phone
   - If uploaded from phone, test on computer

## When to Contact Support

Contact support if:
- ❌ Same video fails repeatedly after conversion
- ❌ MP4 files won't play at all
- ❌ Conversion takes >5 minutes for 1-minute video
- ❌ Cold starts consistently >30 seconds
- ❌ Videos work in one browser but not others
- ❌ Error messages you don't understand

**What to include**:
1. Video format (MP4, MOV, etc.)
2. File size (in MB)
3. Video length (in seconds)
4. Device (iPhone 12, Windows PC, etc.)
5. Browser (Chrome 120, Safari 17, etc.)
6. Console error messages (screenshot or copy)
7. What you've already tried

## FAQ

**Q: Why do iPhone videos need conversion?**  
A: iPhones save videos in .MOV format (QuickTime). This only works in Safari. Chrome, Firefox, and other browsers need WebM or MP4 format.

**Q: Does conversion reduce quality?**  
A: No! Quality is maintained. You won't see a visible difference.

**Q: How long should conversion take?**  
A: Usually 30-90 seconds for a 1-minute video. Longer videos take more time.

**Q: Can I use 4K videos?**  
A: Yes, but not recommended. They're very large (100+ MB) and slow to upload/convert. Use 1080p instead.

**Q: Why does conversion sometimes fail?**  
A: Usually because:
- Video codec is very exotic
- File is corrupted
- Browser runs out of memory
- Video is too long (>5 minutes)

**Q: What's the maximum video size?**  
A: 50MB per video. But we recommend under 20MB for best experience.

**Q: Do videos use a lot of data?**  
A: Yes. A 2-minute video is typically 5-15MB. Use WiFi when uploading videos.

**Q: Can I delete videos after uploading?**  
A: Yes! Go to Media Library → Find video → Delete. It's permanently removed.

**Q: Are videos backed up?**  
A: Yes, stored in secure cloud storage. But we recommend keeping originals on your device too.

## Quick Commands for Developers

**Check video support in browser console**:
```javascript
// Check if format is supported
const video = document.createElement('video');
console.log('MP4:', video.canPlayType('video/mp4')); 
console.log('WebM:', video.canPlayType('video/webm'));
console.log('MOV:', video.canPlayType('video/quicktime'));

// Check MediaRecorder support
console.log('MediaRecorder:', 'MediaRecorder' in window);
console.log('VP9:', MediaRecorder.isTypeSupported('video/webm;codecs=vp9'));
console.log('VP8:', MediaRecorder.isTypeSupported('video/webm;codecs=vp8'));
```

**Force video reload**:
```javascript
// In browser console
const videos = document.querySelectorAll('video');
videos.forEach(v => {
  v.load();
  console.log('Reloaded:', v.src);
});
```

## Prevention Tips

To avoid video issues:

1. ✅ Use MP4 format whenever possible
2. ✅ Keep videos under 2 minutes
3. ✅ Use 1080p or 720p (not 4K)
4. ✅ Record at 30fps (not 60fps)
5. ✅ Test playback after upload
6. ✅ Use WiFi for uploading
7. ✅ Update your browser regularly
8. ✅ Enable "Most Compatible" format on iPhone
9. ✅ Compress large videos before upload
10. ✅ Keep device storage free (at least 1GB)

## Additional Resources

**Free Video Converters**:
- HandBrake: https://handbrake.fr (Desktop)
- CloudConvert: https://cloudconvert.com (Online)
- OnlineConverter: https://www.onlineconverter.com (Online)

**Video Compression Tips**:
- https://support.apple.com/guide/iphone/change-camera-settings
- https://www.youtube.com/watch?v=... (HandBrake tutorial)

**Browser Compatibility**:
- https://caniuse.com/?search=video
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video

---

**Last Updated**: January 2025  
**Version**: 1.0  
**For**: Adoras Memory Sharing App
