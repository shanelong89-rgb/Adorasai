# Prompt Notification Fix - Complete

## Problem
When Shane (keeper) forwarded a prompt from the Prompts tab, Allison (teller) was not receiving notifications on the chat tab, and the activePrompt banner was not showing in her chat.

## Root Cause
The Dashboard component was checking for messages from the partner using the wrong field name:
- **Bug**: Code was checking `newMemory.senderId === partnerProfile.id`
- **Issue**: The `Memory` interface uses the field `sender` (which is `'keeper' | 'teller'`), NOT `senderId`

This meant the check `newMemory.senderId === partnerProfile.id` was always undefined/false, so:
1. Prompts sent by keepers were never detected as being "from partner"
2. The `activePrompt` state was never set for tellers
3. Notifications were never triggered
4. The activePrompt banner never appeared in the chat tab

## Solution
Fixed the partner message detection logic in `/components/Dashboard.tsx`:

### Before (❌ Broken):
```javascript
// This was checking a non-existent field
const isFromPartner = newMemory.senderId === partnerProfile.id;
```

### After (✅ Fixed):
```javascript
// Now correctly checks the sender field
// Partner's messages have sender !== userType
// e.g., if I'm 'teller', partner is 'keeper'
const isFromPartner = partnerProfile && newMemory.sender !== userType;
```

## Changes Made

### 1. Fixed prompt detection for tellers (Lines 164-181)
```javascript
// Check if message is from partner (sender is different from current userType)
const isFromPartner = partnerProfile && newMemory.sender !== userType;

// Auto-set activePrompt for tellers when they receive a prompt from keeper
if (
  isFromPartner &&
  isPrompt &&
  userType === 'teller'
) {
  setActivePrompt(newMemory.promptQuestion || '');
}
```

### 2. Fixed notification detection (Lines 184-188)
```javascript
// Show notifications if it's from partner and it's a message or prompt
if (
  isFromPartner &&
  (newMemory.type === 'text' || newMemory.type === 'voice')
) {
  // ... show notifications
}
```

### 3. Fixed unread message count (Lines 112-124)
```javascript
const unreadMessageCount = React.useMemo(() => {
  if (!partnerProfile) return 0;
  
  return memories.filter(memory => {
    // Only count messages (text or voice messages) from partner
    // Partner's messages have sender !== userType
    const isFromPartner = memory.sender !== userType;
    const isMessage = memory.type === 'text' || memory.type === 'voice';
    const isUnread = memory.timestamp.getTime() > lastChatReadTimestamp;
    
    return isFromPartner && isMessage && isUnread;
  }).length;
}, [memories, partnerProfile, lastChatReadTimestamp, userType]);
```

### 4. Fixed notification data (Line 215)
```javascript
data: {
  memoryId: newMemory.id,
  sender: newMemory.sender, // Changed from senderId
  type: isPrompt ? 'prompt' : 'message',
}
```

### 5. Added missing useEffect dependencies (Line 278)
Added `userType` and `showToast` to the dependency array.

## How It Works Now

### Keeper (Shane) Sends Prompt:
1. Shane clicks "Send to Storyteller" in Prompts tab
2. Creates memory with:
   - `type: 'text'`
   - `sender: 'keeper'` (Shane's userType)
   - `category: 'Prompts'`
   - `tags: ['prompt', 'question']`
   - `promptQuestion: "..."` (the prompt text)

### Teller (Allison) Receives Prompt:
1. **Dashboard detects new memory** (useEffect at line 159)
2. **Checks if it's a prompt**:
   - Has `promptQuestion` ✓
   - Category is 'Prompts' ✓
   - Tags includes 'prompt' ✓
3. **Checks if from partner**:
   - `newMemory.sender` ('keeper') !== `userType` ('teller') ✓
4. **Sets activePrompt state** for teller
5. **Shows notification**:
   - If NOT on chat tab → Native notification banner
   - If on chat tab → In-app toast notification
6. **User clicks notification or switches to chat tab**:
   - Chat tab receives `activePrompt` prop from Dashboard
   - ActivePrompt banner displays at top with action buttons

### Chat Tab ActivePrompt Banner:
- Shows the prompt question prominently
- For tellers, displays 3 action buttons:
  - **Type**: Focus text input
  - **Voice Memo**: Start recording
  - **Photo/Video**: Open media picker
- Makes it easy for storytellers to respond immediately

## Testing
1. Login as Shane (keeper)
2. Go to Prompts tab
3. Click "Send to Storyteller" on any prompt
4. Login as Allison (teller) in another browser/device
5. **Expected behavior**:
   - ✅ Allison receives notification (toast or banner depending on which tab she's on)
   - ✅ When Allison goes to chat tab, she sees the activePrompt banner at top
   - ✅ Banner shows the prompt question sent by Shane
   - ✅ Banner shows action buttons (Type, Voice Memo, Photo/Video)
   - ✅ Allison can easily respond to the prompt

## Files Modified
- `/components/Dashboard.tsx` - Fixed partner message detection logic

## Status
✅ **COMPLETE** - Prompts now properly forward from keepers to tellers with notifications and activePrompt banner display.
