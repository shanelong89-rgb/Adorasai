# Video Format Support in Adoras

## Overview
Adoras automatically converts .MOV and other incompatible video formats to web-compatible formats when you upload them. This ensures your videos play smoothly across all browsers and devices.

## Supported Video Formats

### Native Support (No Conversion Needed)
- **MP4** (.mp4) - Best compatibility across all browsers
- **WebM** (.webm) - Modern format with good compression

### Automatic Conversion
These formats are automatically converted to WebM when uploaded:
- **MOV** (.mov) - Apple QuickTime format
- **AVI** (.avi) - Windows video format  
- **WMV** (.wmv) - Windows Media Video
- **FLV** (.flv) - Flash video format

## How It Works

### Upload Process
1. When you upload a .MOV or other incompatible video, Adoras detects it automatically
2. A conversion process begins in your browser (no server upload needed for conversion)
3. You'll see a progress indicator showing the conversion percentage
4. Once complete, the converted video is saved and ready to play

### Browser Compatibility
- **Safari (iOS/macOS)**: Can play .MOV files natively, but conversion still occurs for cross-browser compatibility
- **Chrome/Firefox/Edge**: Require conversion for .MOV files

## Technical Details

### Conversion Method
- Client-side conversion using browser's native video decoder and MediaRecorder API
- No video quality loss during conversion
- Maintains original video metadata (creation date, GPS location)
- Typical conversion time: 30-90 seconds for a 1-minute video

### File Size
- Converted videos may be slightly larger or smaller than originals depending on codec
- Maximum video size: 50MB (before or after conversion)

## Troubleshooting

### Video Won't Play After Upload
If you see an error message after uploading:

1. **"MOV video failed to convert"**
   - The browser couldn't decode the video format
   - Solution: Use a video converter app to convert to MP4 before uploading
   - Recommended apps: HandBrake (free), CloudConvert (online)

2. **"This video format cannot be played"**
   - The video codec is not supported
   - Solution: Convert to MP4 with H.264 codec before uploading

### Conversion Takes Too Long
- Videos longer than 5 minutes may take several minutes to convert
- Consider trimming longer videos or uploading in shorter segments
- For large videos, pre-convert to MP4 on your device before uploading

### Best Practices
1. **Use MP4 when possible** - No conversion needed, fastest upload
2. **Keep videos under 2 minutes** - Better for loading and playback
3. **Good lighting and stable camera** - Better compression results
4. **Test playback** - After upload, tap the video to ensure it plays correctly

## Video Codec Recommendations

### For Best Compatibility
When creating or converting videos outside Adoras:
- **Container**: MP4 (.mp4)
- **Video Codec**: H.264 (also called AVC)
- **Audio Codec**: AAC
- **Resolution**: 1920x1080 or lower
- **Frame Rate**: 30fps or lower
- **Bitrate**: 2-5 Mbps for good quality

### Conversion Tools
**Desktop:**
- HandBrake (Windows, Mac, Linux) - Free, open-source
- VLC Media Player - Free, can convert videos
- FFmpeg - Command-line tool for advanced users

**Online:**
- CloudConvert.com
- OnlineConverter.com
- FreeConvert.com

**Mobile:**
- iOS: iMovie, Video Converter
- Android: Video Converter Android, Media Converter

## Technical Implementation

### For Developers
The video conversion system uses:
- HTML5 Video API for decoding
- Canvas API for frame extraction
- MediaRecorder API for re-encoding
- Blob/File APIs for file handling

Location: `/utils/videoConverter.ts`

Key functions:
- `needsConversion(file)` - Check if video needs conversion
- `canPlayVideo(file)` - Test if browser can play the format
- `convertVideoToMP4(file)` - Perform the conversion
- `getVideoPlayabilityInfo(file)` - Get detailed compatibility info

## Future Enhancements
- Server-side conversion for unsupported codecs
- Batch video conversion
- Video trimming/editing before upload
- Compression options for large files
- Support for more exotic formats

## Support
If you encounter issues with video uploads:
1. Check the browser console for detailed error messages
2. Try converting the video to MP4 using an external tool
3. Ensure your browser is up to date
4. Test with a different browser (Chrome, Safari, Firefox)

---

**Last Updated**: January 2025
**Video System Version**: 1.0
