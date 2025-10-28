# Phase 2 Implementation Plan - Connect CRUD Operations to API

**Status:** 📋 **READY TO START**  
**Goal:** Connect all remaining user actions to Supabase backend  
**Approach:** Break into 4 sub-phases (2a, 2b, 2c, 2d) with multiple parts each

---

## Overview

Phase 1d successfully replaced mock data with real API data for **reading** operations (login, signup, loading connections, loading memories). Phase 2 will connect all **write** operations (create, update, delete) to the API.

### **Current State (After Phase 1d):**
✅ Login loads real data  
✅ Signup creates real account  
✅ Connection switching loads real memories  
✅ Dashboard displays real data  

⚠️ Add memory - local only  
⚠️ Edit memory - local only  
⚠️ Delete memory - local only  
⚠️ Update profile - local only  
⚠️ Invitations - not implemented  
⚠️ Media uploads - not implemented  

### **Target State (After Phase 2):**
✅ All operations connected to API  
✅ Data persists in Supabase  
✅ Real-time sync across devices  
✅ Cloud storage for media files  

---

## Phase 2a: Memory Operations

**Goal:** Connect add, edit, and delete memory operations to API

### Part 1: Add Memory API Integration
**File:** `/components/AppContent.tsx`  
**Function:** `handleAddMemory()`  
**Endpoint:** `POST /make-server-deded1eb/memories`

**Current Implementation:**
```typescript
const handleAddMemory = (memory: Omit<Memory, 'id' | 'timestamp'>) => {
  const newMemory: Memory = {
    ...memory,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  
  setMemories((prev) => [...prev, newMemory]);
  
  // Updates local state only - no API call
};
```

**Target Implementation:**
```typescript
const handleAddMemory = async (memory: Omit<Memory, 'id' | 'timestamp'>) => {
  try {
    const connectionId = userType === 'keeper' 
      ? activeStorytellerId 
      : activeLegacyKeeperId;
    
    if (!connectionId) {
      console.error('No active connection');
      return;
    }
    
    // Call API to create memory
    const response = await apiClient.createMemory({
      connectionId,
      type: memory.type,
      content: memory.content,
      category: memory.category,
      tags: memory.tags || [],
      mediaUrl: memory.mediaUrl,
      transcript: memory.transcript,
      originalText: memory.originalText,
      location: memory.location,
      note: memory.note,
    });
    
    if (response.success && response.memory) {
      // Convert API memory to UI format
      const newMemory = convertApiMemoryToUIMemory(response.memory);
      
      // Update local state
      setMemories((prev) => [...prev, newMemory]);
      
      // Update memories by connection
      if (userType === 'keeper') {
        setMemoriesByStoryteller((prev) => ({
          ...prev,
          [connectionId]: [...(prev[connectionId] || []), newMemory],
        }));
      } else {
        setMemoriesByLegacyKeeper((prev) => ({
          ...prev,
          [connectionId]: [...(prev[connectionId] || []), newMemory],
        }));
      }
      
      console.log('✅ Memory created successfully');
    }
  } catch (error) {
    console.error('❌ Failed to create memory:', error);
    // TODO: Show error toast
  }
};
```

**Changes:**
- Make function async
- Get active connection ID
- Call `apiClient.createMemory()`
- Handle response and convert to UI format
- Update local state with server response
- Add error handling

---

### Part 2: Edit Memory API Integration
**File:** `/components/AppContent.tsx`  
**Function:** `handleEditMemory()`  
**Endpoint:** `PUT /make-server-deded1eb/memories/:id`

**Current Implementation:**
```typescript
const handleEditMemory = (memoryId: string, updates: Partial<Memory>) => {
  setMemories((prev) => prev.map((memory) => 
    memory.id === memoryId ? { ...memory, ...updates } : memory
  ));
  
  // Updates local state in multiple places - no API call
};
```

**Target Implementation:**
```typescript
const handleEditMemory = async (memoryId: string, updates: Partial<Memory>) => {
  try {
    // Call API to update memory
    const response = await apiClient.updateMemory(memoryId, {
      note: updates.note,
      timestamp: updates.timestamp?.toISOString(),
      location: updates.location,
      tags: updates.tags,
    });
    
    if (response.success && response.memory) {
      // Convert API memory to UI format
      const updatedMemory = convertApiMemoryToUIMemory(response.memory);
      
      // Update local state
      setMemories((prev) => prev.map((memory) =>
        memory.id === memoryId ? updatedMemory : memory
      ));
      
      // Update memories by connection
      const connectionId = userType === 'keeper' 
        ? activeStorytellerId 
        : activeLegacyKeeperId;
      
      if (userType === 'keeper' && connectionId) {
        setMemoriesByStoryteller((prev) => ({
          ...prev,
          [connectionId]: (prev[connectionId] || []).map((memory) =>
            memory.id === memoryId ? updatedMemory : memory
          ),
        }));
      }
      
      if (userType === 'teller' && connectionId) {
        setMemoriesByLegacyKeeper((prev) => ({
          ...prev,
          [connectionId]: (prev[connectionId] || []).map((memory) =>
            memory.id === memoryId ? updatedMemory : memory
          ),
        }));
      }
      
      console.log('✅ Memory updated successfully');
    }
  } catch (error) {
    console.error('❌ Failed to update memory:', error);
    // TODO: Show error toast
  }
};
```

**Changes:**
- Make function async
- Call `apiClient.updateMemory()`
- Handle response and convert to UI format
- Update all memory states with server response
- Add error handling

---

### Part 3: Delete Memory API Integration
**File:** `/components/AppContent.tsx`  
**Function:** `handleDeleteMemory()`  
**Endpoint:** `DELETE /make-server-deded1eb/memories/:id`

**Current Implementation:**
```typescript
const handleDeleteMemory = (memoryId: string) => {
  setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
  
  // Removes from local state only - no API call
};
```

**Target Implementation:**
```typescript
const handleDeleteMemory = async (memoryId: string) => {
  try {
    // Call API to delete memory
    const response = await apiClient.deleteMemory(memoryId);
    
    if (response.success) {
      // Remove from local state
      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      
      // Remove from memories by connection
      const connectionId = userType === 'keeper' 
        ? activeStorytellerId 
        : activeLegacyKeeperId;
      
      if (userType === 'keeper' && connectionId) {
        setMemoriesByStoryteller((prev) => ({
          ...prev,
          [connectionId]: (prev[connectionId] || []).filter(
            (memory) => memory.id !== memoryId
          ),
        }));
      }
      
      if (userType === 'teller' && connectionId) {
        setMemoriesByLegacyKeeper((prev) => ({
          ...prev,
          [connectionId]: (prev[connectionId] || []).filter(
            (memory) => memory.id !== memoryId
          ),
        }));
      }
      
      console.log('✅ Memory deleted successfully');
    }
  } catch (error) {
    console.error('❌ Failed to delete memory:', error);
    // TODO: Show error toast
  }
};
```

**Changes:**
- Make function async
- Call `apiClient.deleteMemory()`
- Remove from all memory states after successful API call
- Add error handling

---

## Phase 2b: Profile Updates

**Goal:** Connect profile update operations to API

### Part 1: Update Profile API Integration
**File:** `/components/AppContent.tsx`  
**Function:** `handleUpdateProfile()`  
**Endpoint:** `PUT /make-server-deded1eb/users/profile`

**Current Implementation:**
```typescript
const handleUpdateProfile = (updates: Partial<UserProfile>) => {
  if (userProfile) {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
  }
};
```

**Target Implementation:**
```typescript
const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
  try {
    // Call API to update profile
    const response = await apiClient.updateProfile({
      name: updates.name,
      relationship: updates.relationship,
      bio: updates.bio,
      phoneNumber: updates.phoneNumber,
      appLanguage: updates.appLanguage as 'english' | 'spanish' | 'french' | 'chinese' | 'korean' | 'japanese' | undefined,
      birthday: updates.birthday?.toISOString(),
      photo: updates.photo,
    });
    
    if (response.success && response.user) {
      // Update local state with server response
      setUserProfile({
        name: response.user.name,
        relationship: response.user.relationship || '',
        bio: response.user.bio || '',
        email: response.user.email,
        phoneNumber: response.user.phoneNumber,
        appLanguage: response.user.appLanguage,
        birthday: response.user.birthday ? new Date(response.user.birthday) : undefined,
        photo: response.user.photo,
      });
      
      console.log('✅ Profile updated successfully');
    }
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    // TODO: Show error toast
  }
};
```

**Changes:**
- Make function async
- Call `apiClient.updateProfile()`
- Update local state with server response
- Add error handling

---

## Phase 2c: Invitation System

**Goal:** Implement complete invitation flow (create, send, accept)

### Part 1: Create Invitation Handler
**File:** `/components/AppContent.tsx`  
**New Function:** `handleCreateInvitation()`  
**Endpoint:** `POST /make-server-deded1eb/invitations`

**Implementation:**
```typescript
const handleCreateInvitation = async (
  partnerName: string,
  partnerRelationship: string,
  phoneNumber: string
) => {
  try {
    // Call API to create invitation
    const response = await apiClient.createInvitation({
      partnerName,
      partnerRelationship,
      phoneNumber,
    });
    
    if (response.success && response.invitation) {
      console.log('✅ Invitation created:', response.invitation.id);
      
      // Reload connections to show pending invitation
      await loadConnectionsFromAPI();
      
      return { success: true, invitationId: response.invitation.id };
    } else {
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('❌ Failed to create invitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create invitation' 
    };
  }
};
```

**Changes:**
- New async function
- Calls `apiClient.createInvitation()`
- Reloads connections after creating invitation
- Returns success/error result

---

### Part 2: Accept Invitation Handler
**File:** `/components/AppContent.tsx`  
**New Function:** `handleAcceptInvitation()`  
**Endpoint:** `POST /make-server-deded1eb/invitations/:id/accept`

**Implementation:**
```typescript
const handleAcceptInvitation = async (invitationCode: string) => {
  try {
    // Call API to accept invitation
    const response = await apiClient.acceptInvitation(invitationCode);
    
    if (response.success) {
      console.log('✅ Invitation accepted');
      
      // Reload connections to show new active connection
      await loadConnectionsFromAPI();
      
      return { success: true };
    } else {
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('❌ Failed to accept invitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to accept invitation' 
    };
  }
};
```

**Changes:**
- New async function
- Calls `apiClient.acceptInvitation()`
- Reloads connections after accepting
- Returns success/error result

---

### Part 3: Add Invitation UI to Dashboard
**File:** `/components/Dashboard.tsx`  
**Changes:**
- Add "Invite" button for Legacy Keepers
- Add "Enter Code" button for Storytellers
- Pass invitation handlers as props
- Show invitation dialogs

---

## Phase 2d: Media Upload

**Goal:** Implement media upload to Supabase Storage

### Part 1: Photo Upload Integration
**File:** `/components/ChatTab.tsx`  
**Function:** Photo capture/upload flow  
**Endpoint:** `POST /make-server-deded1eb/media/upload`

**Implementation:**
```typescript
const handlePhotoCapture = async (photoDataUrl: string, metadata?: PhotoMetadata) => {
  try {
    // Convert data URL to Blob
    const blob = await fetch(photoDataUrl).then(r => r.blob());
    
    // Upload to API
    const response = await apiClient.uploadMedia({
      file: blob,
      type: 'photo',
      metadata: {
        location: metadata?.location,
        timestamp: metadata?.timestamp?.toISOString(),
        note: metadata?.note,
      },
    });
    
    if (response.success && response.url) {
      // Create memory with uploaded photo URL
      await handleAddMemory({
        type: 'photo',
        content: response.url,
        mediaUrl: response.url,
        sender: userType === 'keeper' ? 'keeper' : 'teller',
        category: 'Photo',
        tags: ['photo'],
        location: metadata?.location,
        note: metadata?.note,
      });
    }
  } catch (error) {
    console.error('❌ Failed to upload photo:', error);
    // TODO: Show error toast
  }
};
```

---

### Part 2: Video Upload Integration
**File:** `/components/ChatTab.tsx`  
**Function:** Video upload flow  
**Endpoint:** `POST /make-server-deded1eb/media/upload`

**Implementation:**
```typescript
const handleVideoUpload = async (videoFile: File, metadata?: VideoMetadata) => {
  try {
    // Upload to API
    const response = await apiClient.uploadMedia({
      file: videoFile,
      type: 'video',
      metadata: {
        location: metadata?.location,
        timestamp: metadata?.timestamp?.toISOString(),
        note: metadata?.note,
      },
    });
    
    if (response.success && response.url) {
      // Create memory with uploaded video URL
      await handleAddMemory({
        type: 'video',
        content: response.url,
        mediaUrl: response.url,
        sender: userType === 'keeper' ? 'keeper' : 'teller',
        category: 'Video',
        tags: ['video'],
        location: metadata?.location,
        note: metadata?.note,
      });
    }
  } catch (error) {
    console.error('❌ Failed to upload video:', error);
    // TODO: Show error toast
  }
};
```

---

### Part 3: Voice Note Upload Integration
**File:** `/components/ChatTab.tsx`  
**Function:** Voice recording upload  
**Endpoint:** `POST /make-server-deded1eb/media/upload`

**Implementation:**
```typescript
const handleVoiceRecordingComplete = async (audioBlob: Blob, duration: number) => {
  try {
    // Upload to API
    const response = await apiClient.uploadMedia({
      file: audioBlob,
      type: 'voice',
      metadata: {
        duration,
      },
    });
    
    if (response.success && response.url) {
      // Create memory with uploaded voice note URL
      await handleAddMemory({
        type: 'voice',
        content: `${duration}"`,
        mediaUrl: response.url,
        sender: userType === 'keeper' ? 'keeper' : 'teller',
        category: 'Voice',
        tags: ['voice'],
      });
    }
  } catch (error) {
    console.error('❌ Failed to upload voice note:', error);
    // TODO: Show error toast
  }
};
```

---

## Implementation Order

### **Phase 2a: Memory Operations** (Start here)
1. ✅ Part 1: Add Memory API Integration
2. ✅ Part 2: Edit Memory API Integration
3. ✅ Part 3: Delete Memory API Integration

### **Phase 2b: Profile Updates**
1. ✅ Part 1: Update Profile API Integration

### **Phase 2c: Invitation System**
1. ✅ Part 1: Create Invitation Handler
2. ✅ Part 2: Accept Invitation Handler
3. ✅ Part 3: Add Invitation UI to Dashboard

### **Phase 2d: Media Upload**
1. ✅ Part 1: Photo Upload Integration
2. ✅ Part 2: Video Upload Integration
3. ✅ Part 3: Voice Note Upload Integration

---

## Testing Checklist

After each sub-phase:

### **Phase 2a Tests:**
- [ ] Add a text memory → verify it appears in database
- [ ] Edit memory metadata → verify changes persist
- [ ] Delete memory → verify it's removed from database
- [ ] Switch connections → verify memories still load correctly

### **Phase 2b Tests:**
- [ ] Update profile name → verify changes persist
- [ ] Update profile photo → verify changes persist
- [ ] Log out and back in → verify profile changes remain

### **Phase 2c Tests:**
- [ ] Create invitation as Keeper → verify SMS sent
- [ ] Accept invitation as Teller → verify connection active
- [ ] View pending invitations → verify status shown correctly

### **Phase 2d Tests:**
- [ ] Upload photo → verify appears in Media Library
- [ ] Upload video → verify appears in Media Library
- [ ] Record voice note → verify appears in Chat
- [ ] Check file sizes and formats

---

## Success Criteria

Phase 2 is complete when:

✅ All memory operations persist to database  
✅ Profile updates save to Supabase  
✅ Invitations can be created and accepted  
✅ Media files upload to Supabase Storage  
✅ All operations have error handling  
✅ UI shows loading states during operations  
✅ Data syncs across sessions/devices  

---

**Ready to start Phase 2a Part 1!** 🚀
