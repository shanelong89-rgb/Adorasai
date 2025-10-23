# Voice Recording Duration Fix

## Issue
Voice recordings were showing "0s" in the chat on mobile even though microphone permission was granted and audio was being recorded.

## Root Cause
The recording duration was being captured at the **wrong time**:

1. **Before the fix**: The `savedRecordingTime` variable was captured when recording **started** (line 658)
   - At this point, `recordingTime` was 0
   - The timer that increments `recordingTime` started later (line 756)
   - When the recording stopped, the `onstop` handler used the saved value which was still 0

2. **Execution flow**:
   ```
   User clicks record → savedRecordingTime = 0 → Start MediaRecorder → 
   setRecordingTime(0) → Timer starts incrementing → 
   User stops recording → onstop fires → Uses savedRecordingTime (still 0) → 
   Shows "Voice memo (0s)"
   ```

## Solution
Moved the duration capture to when recording **stops** instead of when it starts:

1. **In the stop section** (line 516):
   - Capture `recordingTime` BEFORE clearing the timer
   - Store it on the MediaRecorder object as `savedDuration`
   
2. **In the onstop handler** (line 680):
   - Read the `savedDuration` from the MediaRecorder object
   - This now contains the actual recording duration

3. **New execution flow**:
   ```
   User clicks record → Start MediaRecorder → setRecordingTime(0) → 
   Timer starts incrementing (1, 2, 3...) → 
   User stops recording → Capture recordingTime (e.g., 5) → 
   Store as savedDuration → onstop fires → 
   Uses savedDuration (5) → Shows "Voice memo (5s)"
   ```

## Changes Made

### `/components/ChatTab.tsx`

1. **Line 516-518** - Added duration capture when stopping:
```typescript
// Capture the recording time BEFORE clearing the timer
const savedRecordingTime = recordingTime;
console.log('⏱️ Captured recording time:', savedRecordingTime, 'seconds');
```

2. **Line 538-539** - Store duration on MediaRecorder:
```typescript
// Store the saved recording time for the onstop handler to access
(mediaRecorderRef.current as any).savedDuration = savedRecordingTime;
```

3. **Line 680-681** - Removed the early capture (was line 658):
```typescript
// REMOVED: const savedRecordingTime = recordingTime;
```

4. **Line 680-682** - Use saved duration in onstop:
```typescript
// Get the duration from the saved property
const duration = (mediaRecorder as any).savedDuration || 0;
console.log('⏱️ Using saved duration:', duration, 'seconds');
```

## Testing
To verify the fix:
1. Record a voice memo for a few seconds
2. Stop the recording
3. Check the chat - should show "Voice memo (Xs)" where X is the actual duration
4. Check browser console - should see logs showing the captured duration

## Related Files
- `/components/ChatTab.tsx` - Main chat component with voice recording
- `/utils/audioRecorder.ts` - Audio recording utility (no changes needed)
- `/utils/speechTranscription.ts` - Speech-to-text utility (no changes needed)
