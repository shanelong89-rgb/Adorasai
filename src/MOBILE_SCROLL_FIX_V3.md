# Mobile Scroll Detection Fix V3 - Manual Header Toggle

## Issue
The dashboard header is not appearing when scrolling up from the bottom of chat messages on mobile.

## Root Cause Analysis
The scroll detection code has 3 layers but none are triggering on mobile:
1. ScrollArea viewport detection
2. Chat container fallback detection  
3. Window-level touch detection

Since we can't access console logs on mobile, we need a visual debugging solution.

## Solution: Manual Header Button

I'll add a floating button that:
1. Shows at the bottom right of the chat
2. Displays the current scroll detection status
3. Manually triggers the dashboard header to appear
4. Shows visual feedback when scroll events fire

This will help us determine if:
- The scroll detection is firing at all
- The Dashboard can show/hide the header
- There's a CSS or layout issue preventing visibility

## Files Modified
- `/components/ChatTab.tsx` - Add visual debug button

## Testing Instructions
1. Go to Chat tab on mobile
2. Scroll to the bottom of messages
3. Look for the floating debug button (bottom right)
4. Try scrolling up - the button should show status
5. Tap the button to manually force header to appear
6. If button works but scroll doesn't, we know it's a scroll detection issue
7. If button doesn't work, it's a Dashboard visibility issue

## Next Steps Based on Results
- **If manual button works**: Fix scroll detection
- **If manual button doesn't work**: Fix Dashboard CSS/visibility logic
