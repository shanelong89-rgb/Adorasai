# Microphone Permission Race Condition Fix

## Issue
Users were getting "NotAllowedError: Permission denied" errors when trying to record voice memos, even after granting microphone permission.

## Root Causes

### 1. **Media Stream Not Cleaned Up Before New Recording**
When stopping a recording, the media stream cleanup happened in a `setTimeout` with a 100ms delay. If the user tried to start a new recording before this cleanup completed, the old stream was still holding the microphone, causing a permission conflict.

### 2. **Race Conditions from Multiple Toggle Attempts**
Users could rapidly click the record button multiple times, causing overlapping start/stop operations that would corrupt the state and leave resources dangling.

### 3. **Incomplete Error Cleanup**
When an error occurred during recording startup, the cleanup wasn't thorough enough:
- MediaRecorder ref wasn't cleared
- Recording timer wasn't stopped
- Recording time wasn't reset

## Solutions Implemented

### 1. **Pre-Recording Cleanup** (Line 580-585)
Before requesting microphone access for a new recording, we now explicitly clean up any existing media streams:

```typescript
// IMPORTANT: Clean up any existing streams first to avoid permission conflicts
if (mediaStreamRef.current) {
  console.log('🧹 Cleaning up existing stream before new recording...');
  mediaStreamRef.current.getTracks().forEach(track => track.stop());
  mediaStreamRef.current = null;
}
```

**Why this helps:**
- Ensures the microphone is fully released before requesting it again
- Prevents "resource busy" errors from overlapping streams
- Cleans up any streams that might have been left in a bad state

### 2. **Toggle Guard with Ref** (Line 149, 512-516)
Added a ref-based guard to prevent multiple simultaneous toggle operations:

```typescript
// In state declarations:
const isTogglingRef = useRef(false);

// In toggleRecording:
if (isTogglingRef.current) {
  console.log('⚠️ Already toggling recording, ignoring...');
  return;
}

isTogglingRef.current = true;
const wasRecording = isRecording;
```

**Why this helps:**
- Prevents race conditions from rapid button clicks
- Uses a ref (not state) for instant synchronous checking
- Tracks whether we're in stop or start mode for proper cleanup timing

### 3. **Comprehensive Error Cleanup** (Line 833-865)
Enhanced the error handler to clean up ALL resources when recording fails to start:

```typescript
// Clean up all resources if there was an error
if (mediaStreamRef.current) {
  mediaStreamRef.current.getTracks().forEach(track => track.stop());
  mediaStreamRef.current = null;
}
if (mediaRecorderRef.current) {
  try {
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  } catch (e) {
    console.log('MediaRecorder already stopped');
  }
  mediaRecorderRef.current = null;
}
if (recordingTimerRef.current) {
  clearInterval(recordingTimerRef.current);
  recordingTimerRef.current = null;
}
setRecordingTime(0);
```

**Why this helps:**
- Prevents resource leaks that could block future recordings
- Ensures clean state after errors
- Stops any running timers to prevent UI showing incorrect time

### 4. **Delayed Toggle Reset for Stop Operations** (Line 566-577)
For stop operations, the toggle guard is reset after cleanup completes:

```typescript
setTimeout(() => {
  if (mediaStreamRef.current) {
    console.log('🛑 Stopping media stream tracks...');
    mediaStreamRef.current.getTracks().forEach(track => {
      console.log('Stopping track:', track.kind, track.label);
      track.stop();
    });
    mediaStreamRef.current = null;
  }
  // Reset toggling flag after cleanup is complete
  // Add a small delay to ensure the stream is fully released
  setTimeout(() => {
    isTogglingRef.current = false;
    console.log('✅ Recording stopped and cleaned up');
  }, 50);
}, 100);
```

**Why this helps:**
- Ensures the toggle guard stays active during async cleanup
- Prevents starting a new recording before the old one is fully cleaned up
- Total delay: 150ms (100ms + 50ms) gives the browser time to release resources

### 5. **Immediate Toggle Reset for Start Operations** (Line 869-875)
For start operations (or errors during start), the toggle guard is reset immediately:

```typescript
} finally {
  // Reset the toggling flag only for start operations
  // Stop operations reset in the setTimeout to avoid interrupting cleanup
  if (!wasRecording) {
    isTogglingRef.current = false;
  }
}
```

**Why this helps:**
- Start operations complete synchronously (getUserMedia either succeeds or throws)
- No async cleanup needed for failed starts
- Allows retry immediately after a permission error

## Execution Flow

### Starting a Recording
```
1. User clicks record button
2. Check if already toggling → exit if yes
3. Set toggle guard to true
4. Clean up any existing streams
5. Request microphone permission
6. Create MediaRecorder and start
7. Start timer
8. Reset toggle guard in finally block
9. User can now stop or start a new recording
```

### Stopping a Recording
```
1. User clicks stop button
2. Check if already toggling → exit if yes
3. Set toggle guard to true
4. Capture recording duration
5. Stop speech recognition
6. Stop MediaRecorder
7. Schedule stream cleanup (100ms)
8. Stream tracks stopped
9. Reset toggle guard (after 50ms delay)
10. Total delay: 150ms before next recording allowed
```

### Error During Start
```
1. User clicks record button
2. Check if already toggling → exit if yes
3. Set toggle guard to true
4. Request microphone permission → FAILS
5. Catch error and show user-friendly message
6. Clean up ALL resources (stream, recorder, timer)
7. Reset toggle guard in finally block
8. User can retry immediately
```

## Testing Checklist

1. **Normal Recording**
   - [ ] Start recording → works
   - [ ] Stop recording → works
   - [ ] Start again → works

2. **Rapid Button Clicks**
   - [ ] Click record multiple times rapidly → only one recording starts
   - [ ] Click stop multiple times rapidly → stops cleanly once

3. **Quick Successive Recordings**
   - [ ] Record 1 second → stop → immediately start new recording → works

4. **Permission Denied**
   - [ ] Deny permission → see helpful error message
   - [ ] Grant permission → retry works

5. **Error Recovery**
   - [ ] Error during recording → resources cleaned up
   - [ ] Try recording again → works

## Technical Notes

### Why Use Ref Instead of State for Toggle Guard?
- **Synchronous**: Ref changes are instant, no re-render delay
- **Immediate**: Can check and set in same execution without race conditions
- **Persistent**: Survives re-renders without causing them

### Why the 150ms Total Delay for Stop?
- **100ms**: Allows MediaRecorder's `onstop` event to fire and save audio
- **50ms**: Ensures browser fully releases the microphone resource
- **Mobile browsers**: Need more time than desktop to release hardware

### Why Clean Up Before Starting?
- **Defense in depth**: Even if cleanup failed before, we try again
- **Error recovery**: Handles cases where previous recording errored mid-stream
- **Browser quirks**: Some browsers don't immediately release resources

## Files Modified

- `/components/ChatTab.tsx`:
  - Line 149: Added `isTogglingRef`
  - Line 512-519: Added toggle guard and tracking
  - Line 566-577: Enhanced stop cleanup with delayed reset
  - Line 580-585: Added pre-recording cleanup
  - Line 833-865: Enhanced error cleanup
  - Line 869-875: Added smart toggle reset logic

## Related Fixes

This fix builds on:
- Voice Recording Duration Fix (VOICE_RECORDING_DURATION_FIX.md)
- Previous microphone permission fixes (MICROPHONE_PERMISSION_FIX.md)
