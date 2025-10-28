# Phase 1d: Load Real Data from API - Implementation Plan

## Current Status

✅ **Phase 1a-1c Complete:**
- Backend API fully functional
- Authentication working
- Signup creates real accounts
- Login loads user session
- Logout clears state

❌ **Phase 1d Needed:**
- Dashboard still uses mock data
- Connections not loaded from API  
- Memories not loaded from API
- Connection switching uses local state

---

## What Needs to Change

### 1. Add Connection Loading State

**File:** `/components/AppContent.tsx`

**Add new state variables:**
```typescript
const [isLoadingConnections, setIsLoadingConnections] = useState(false);
const [connectionsError, setConnectionsError] = useState<string | null>(null);
const [connections, setConnections] = useState<ConnectionWithPartner[]>([]);
```

### 2. Create Helper Functions

**Add after state declarations:**

```typescript
/**
 * Convert API memory format to UI memory format
 */
const convertApiMemoryToUIMemory = (apiMemory: ApiMemory): Memory => {
  return {
    ...apiMemory,
    timestamp: new Date(apiMemory.timestamp),
    tags: apiMemory.tags || [],
  };
};

/**
 * Load user's connections from API
 */
const loadConnectionsFromAPI = async () => {
  console.log('📡 Loading connections from API...');
  setIsLoadingConnections(true);
  setConnectionsError(null);

  try {
    const response = await apiClient.getConnections();
    
    if (response.success && response.connections) {
      console.log(`✅ Loaded ${response.connections.length} connections`);
      setConnections(response.connections);
      
      // Transform connections into UI format
      if (userType === 'keeper') {
        await transformConnectionsToStorytellers(response.connections);
      } else {
        await transformConnectionsToLegacyKeepers(response.connections);
      }
    } else {
      console.warn('⚠️ No connections found - showing empty state');
      setStorytellers([]);
      setLegacyKeepers([]);
      setPartnerProfile(null);
      setIsConnected(false);
    }
  } catch (error) {
    console.error('❌ Failed to load connections:', error);
    setConnectionsError('Failed to load connections. Please refresh.');
  } finally {
    setIsLoadingConnections(false);
  }
};

/**
 * Transform API connections to Storyteller format (for Keepers)
 */
const transformConnectionsToStorytellers = async (apiConnections: ConnectionWithPartner[]) => {
  const storytellerList: Storyteller[] = apiConnections.map((conn) => ({
    id: conn.connection.id,
    name: conn.partner?.name || 'Unknown',
    relationship: conn.partner?.relationship || 'Family',
    bio: conn.partner?.bio || '',
    photo: conn.partner?.photo,
    isConnected: conn.connection.status === 'active',
  }));

  setStorytellers(storytellerList);
  
  // Set first active connection as default
  const firstActive = storytellerList.find((s) => s.isConnected);
  if (firstActive) {
    setActiveStorytellerId(firstActive.id);
    setPartnerProfile({
      name: firstActive.name,
      relationship: firstActive.relationship,
      bio: firstActive.bio,
      photo: firstActive.photo,
    });
    setIsConnected(true);
    await loadMemoriesForConnection(firstActive.id);
  } else if (storytellerList.length > 0) {
    // Has pending connections but none active yet
    const firstPending = storytellerList[0];
    setActiveStorytellerId(firstPending.id);
    setPartnerProfile({
      name: firstPending.name,
      relationship: firstPending.relationship,
      bio: firstPending.bio,
      photo: firstPending.photo,
    });
    setIsConnected(false);
    setMemories([]);
  }
};

/**
 * Transform API connections to Legacy Keeper format (for Tellers)
 */
const transformConnectionsToLegacyKeepers = async (apiConnections: ConnectionWithPartner[]) => {
  const keeperList: LegacyKeeper[] = apiConnections.map((conn) => ({
    id: conn.connection.id,
    name: conn.partner?.name || 'Unknown',
    relationship: conn.partner?.relationship || 'Family',
    bio: conn.partner?.bio || '',
    photo: conn.partner?.photo,
    isConnected: conn.connection.status === 'active',
  }));

  setLegacyKeepers(keeperList);
  
  // Set first active connection as default
  const firstActive = keeperList.find((k) => k.isConnected);
  if (firstActive) {
    setActiveLegacyKeeperId(firstActive.id);
    setPartnerProfile({
      name: firstActive.name,
      relationship: firstActive.relationship,
      bio: firstActive.bio,
      photo: firstActive.photo,
    });
    setIsConnected(true);
    await loadMemoriesForConnection(firstActive.id);
  } else if (keeperList.length > 0) {
    // Has pending connections but none active yet
    const firstPending = keeperList[0];
    setActiveLegacyKeeperId(firstPending.id);
    setPartnerProfile({
      name: firstPending.name,
      relationship: firstPending.relationship,
      bio: firstPending.bio,
      photo: firstPending.photo,
    });
    setIsConnected(false);
    setMemories([]);
  }
};

/**
 * Load memories for a specific connection
 */
const loadMemoriesForConnection = async (connectionId: string) => {
  console.log(`📡 Loading memories for connection: ${connectionId}`);
  
  try {
    const response = await apiClient.getMemories(connectionId);
    
    if (response.success && response.memories) {
      console.log(`✅ Loaded ${response.memories.length} memories`);
      
      // Convert API memories to UI format
      const uiMemories = response.memories.map(convertApiMemoryToUIMemory);
      
      // Update memories state
      setMemories(uiMemories);
      
      // Update memories by connection
      if (userType === 'keeper') {
        setMemoriesByStoryteller((prev) => ({
          ...prev,
          [connectionId]: uiMemories,
        }));
      } else {
        setMemoriesByLegacyKeeper((prev) => ({
          ...prev,
          [connectionId]: uiMemories,
        }));
      }
    } else {
      console.warn(`⚠️ No memories found for connection: ${connectionId}`);
      setMemories([]);
    }
  } catch (error) {
    console.error('❌ Failed to load memories:', error);
    setMemories([]);
  }
};
```

### 3. Update Authentication Effect

**Replace the auth initialization in useEffect:**

```typescript
useEffect(() => {
  // User logged in - redirect to dashboard
  if (!isLoading && isAuthenticated && user && !hasInitializedAuth) {
    console.log('✅ User is authenticated, redirecting to dashboard');
    
    // Set user type from authenticated user
    setUserType(user.type as UserType);
    
    // Set user profile from authenticated user
    const profile: UserProfile = {
      name: user.name,
      relationship: user.relationship || '',
      bio: user.bio || '',
      email: user.email,
      phoneNumber: user.phoneNumber,
      appLanguage: user.appLanguage,
      birthday: user.birthday ? new Date(user.birthday) : undefined,
    };
    
    setUserProfile(profile);
    
    // Load real connections from API (Phase 1d) ✅
    loadConnectionsFromAPI();
    
    // Mark as initialized to prevent re-running
    setHasInitializedAuth(true);
    
    // Navigate to dashboard AFTER data is set
    setCurrentScreen('dashboard');
  }
  
  // ... rest of useEffect
}, [isLoading, isAuthenticated, user, hasInitializedAuth]);
```

### 4. Update Signup Handler

**Replace setupMockData call in `handleOnboardingComplete`:**

```typescript
if (result.success) {
  console.log('✅ Account created successfully!');
  setUserProfile(profile);
  setCurrentScreen('dashboard');
  
  // Load real connections from API (Phase 1d) ✅
  await loadConnectionsFromAPI();
}
```

### 5. Update Connection Switching

**Replace `handleSwitchStoryteller`:**

```typescript
const handleSwitchStoryteller = async (storytellerId: string) => {
  const storyteller = storytellers.find((s) => s.id === storytellerId);
  if (storyteller) {
    setActiveStorytellerId(storytellerId);
    setPartnerProfile({
      name: storyteller.name,
      relationship: storyteller.relationship,
      bio: storyteller.bio,
      photo: storyteller.photo,
    });
    setIsConnected(storyteller.isConnected);
    
    // Load memories from API ✅
    await loadMemoriesForConnection(storytellerId);
  }
};
```

**Replace `handleSwitchLegacyKeeper`:**

```typescript
const handleSwitchLegacyKeeper = async (legacyKeeperId: string) => {
  const legacyKeeper = legacyKeepers.find((lk) => lk.id === legacyKeeperId);
  if (legacyKeeper) {
    setActiveLegacyKeeperId(legacyKeeperId);
    setPartnerProfile({
      name: legacyKeeper.name,
      relationship: legacyKeeper.relationship,
      bio: legacyKeeper.bio,
      photo: legacyKeeper.photo,
    });
    setIsConnected(legacyKeeper.isConnected);
    
    // Load memories from API ✅
    await loadMemoriesForConnection(legacyKeeperId);
  }
};
```

### 6. Delete setupMockData Function

**Remove entirely:**
- The `setupMockData` function
- All mock data arrays
- All fake memory objects

---

## Testing Checklist

After making these changes, test:

### ✅ New User Flow
1. Sign up → Complete onboarding
2. Dashboard loads with empty state
3. No connections shown
4. Can create invitation (UI ready for Phase 2)

### ✅ Existing User Flow
1. Sign in with account that has connections
2. Connections load from API
3. First active connection selected
4. Memories load for active connection
5. Display correct data

### ✅ Connection Switching
1. Click different storyteller/keeper
2. Memories reload from API
3. Partner profile updates
4. Connection status updates

### ✅ Error Handling
1. Network error shows error message
2. Empty connections shows empty state
3. No crashes on failed API calls

---

## Summary

**Changes Required:**
- ✅ Add 3 new state variables
- ✅ Add 5 helper functions
- ✅ Update auth useEffect
- ✅ Update signup handler  
- ✅ Update 2 connection switch handlers
- ✅ Delete setupMockData function

**Lines Added:** ~200
**Lines Removed:** ~200 (mock data)
**Net Change:** Minimal

**Time Estimate:** 20-30 minutes

**Result:**
- 📡 All data loaded from API
- 🗑️ No more mock data
- ✅ Real connections
- ✅ Real memories
- ✅ Empty states
- ✅ Loading states
- ✅ Error handling

**Ready for Phase 2:** Create/Edit/Delete memories via API
