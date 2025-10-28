# Mobile Scroll Detection - Debug Guide

## Current Status
The scroll detection hook has been completely rewritten with extensive debugging and multiple fallback mechanisms.

## What to Check in Console

### 1. When you load the Chat tab, you should see:

```
🔧 useChatScrollDetection: Hook mounted
🔧 Callbacks provided: { onScrollUp: true, onScrollDown: true }
🔧 scrollContainerRef.current: [object HTMLDivElement]
🔍 Attempt 1/10 to find scroll viewport...
📊 Found X Radix viewports
```

### 2. If viewport is found (SUCCESS):

```
✅✅✅ SUCCESS: Found scroll viewport!
Viewport details: { tagName: "DIV", className: "...", ... }
✅✅✅ Event listeners ATTACHED successfully!
Listening for: scroll, touchstart, touchmove
```

### 3. If viewport is NOT found after 10 attempts (FALLBACK):

```
❌ FAILED: Could not find scroll viewport after all attempts
🔧 FALLBACK: Attaching to WINDOW touch events as last resort
✅ WINDOW fallback listeners attached
```

### 4. When you touch the screen on mobile:

```
👆 TOUCHSTART: 450
👉 TOUCHMOVE: { currentTouchY: 475, touchStartY: 450, delta: 25 }
🎯🎯🎯 Touch swipe DOWN (content scrolling UP) - CALLING onScrollUp()
🎯 Dashboard: onScrollUp called, setting showHeader = true
```

OR if using fallback:

```
🌍 WINDOW touchstart: 450
🌍 WINDOW touchmove: { currentTouchY: 475, lastTouchY: 450, delta: 25 }
🎯🎯🎯 WINDOW: Swipe DOWN - CALLING onScrollUp()
🎯 Dashboard: onScrollUp called, setting showHeader = true
```

## Debugging Steps

### Step 1: Open Browser Console
- On mobile: Use Chrome remote debugging or Safari Web Inspector
- On desktop: Open DevTools (F12) and enable mobile emulation

### Step 2: Navigate to Chat Tab
- Watch the console for the initial setup messages
- **Key question**: Does it find the viewport?

### Step 3: Try Scrolling/Swiping
- Swipe down (finger moving down = content scrolls up)
- **Key question**: Do you see TOUCHSTART and TOUCHMOVE logs?

### Step 4: Check Dashboard Response
- **Key question**: Do you see "Dashboard: onScrollUp called"?

## Common Issues and Solutions

### Issue 1: "Callbacks not provided"
**Symptom**: `⚠️ useChatScrollDetection: Callbacks not provided`
**Cause**: onScrollUp or onScrollDown is undefined
**Fix**: Check ChatTab.tsx - make sure callbacks are passed from Dashboard

### Issue 2: "Scroll viewport not found"
**Symptom**: `❌ Attempt X: Scroll viewport not found` (10 times)
**Cause**: ScrollArea component not rendering or has different structure
**Solution**: Fallback to window events will activate automatically

### Issue 3: Touch events not firing
**Symptom**: No TOUCHSTART or TOUCHMOVE logs when touching screen
**Possible causes**:
- Not testing on actual mobile device (desktop emulation doesn't always work)
- Another element is capturing touch events
- Passive event listeners not supported

**Try**:
1. Test on real mobile device
2. Check if fallback activated (should use window events)
3. Try harder swipes (need >15px movement to trigger)

### Issue 4: Events fire but header doesn't show
**Symptom**: See "CALLING onScrollUp()" but no "Dashboard: onScrollUp called"
**Cause**: Dashboard not receiving the callback
**Fix**: Check Dashboard.tsx onScrollUp/onScrollDown implementation

### Issue 5: Header shows briefly then hides again
**Symptom**: Header appears for a split second then disappears
**Cause**: Dashboard's window scroll handler is interfering
**Fix**: Verify Dashboard.tsx lines 106-108 return early for chat tab

## Manual Testing Steps

1. **Open app on mobile** (or Chrome DevTools mobile mode)
2. **Navigate to Chat tab**
3. **Open Console** (remote debugging if on mobile)
4. **Look for**:
   - ✅ "Hook mounted"
   - ✅ "SUCCESS: Found scroll viewport" OR "WINDOW fallback listeners attached"
   - ✅ "Event listeners ATTACHED"
5. **Swipe down** (finger moving down on screen)
6. **Expected**:
   - See TOUCHSTART log
   - See TOUCHMOVE logs with positive delta
   - See "CALLING onScrollUp()"
   - See "Dashboard: onScrollUp called"
   - **Header should appear**
7. **Swipe up** (finger moving up on screen)
8. **Expected**:
   - See TOUCHMOVE logs with negative delta
   - See "CALLING onScrollDown()"
   - See "Dashboard: onScrollDown called"
   - **Header should disappear**

## Quick Fixes

### If touch events aren't being detected at all:
The fallback window event listener should kick in. Look for:
```
🌍 WINDOW touchstart: XXX
🌍 WINDOW touchmove: { ... }
```

### If you see the events but dashboard doesn't respond:
Check Dashboard.tsx - the callbacks should look like this:
```typescript
onScrollUp={() => {
  console.log('🎯 Dashboard: onScrollUp called, setting showHeader = true');
  setShowHeader(true);
}}
onScrollDown={() => {
  console.log('⬇️ Dashboard: onScrollDown called, setting showHeader = false');
  setShowHeader(false);
}}
```

### If dashboard responds but header doesn't move:
Check the CSS transform:
```css
className={`... transition-transform ... ${
  showHeader ? 'translate-y-0' : '-translate-y-full'
}`}
```

## Next Steps

1. **Test on mobile** and report what console logs you see
2. **Take screenshot** of console if issue persists
3. **Try the fallback** - even if viewport isn't found, window events should work

The new implementation is much more robust with:
- 10 retry attempts to find viewport
- 3 different detection methods
- Automatic fallback to window events
- Extensive logging for debugging
