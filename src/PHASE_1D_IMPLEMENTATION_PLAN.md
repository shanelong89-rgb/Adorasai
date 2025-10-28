# Phase 1d Implementation Plan - Split into 8 Parts

## Overview
Phase 1d replaces all mock data with real API data from the backend. This has been split into 8 small, manageable parts to avoid token limits.

---

## Part 1: Add State Variables
**File:** `/components/AppContent.tsx`  
**Location:** After existing state declarations  
**Lines:** ~5

Add three new state variables for connection loading:
```typescript
const [isLoadingConnections, setIsLoadingConnections] = useState(false);
const [connectionsError, setConnectionsError] = useState<string | null>(null);
const [connections, setConnections] = useState<ConnectionWithPartner[]>([]);
```

---

## Part 2: Add Data Conversion Helper
**File:** `/components/AppContent.tsx`  
**Location:** After state declarations, before useEffect  
**Lines:** ~10

Add helper function to convert API memory format to UI format:
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
```

---

## Part 3: Add Load Connections Function
**File:** `/components/AppContent.tsx`  
**Location:** After convertApiMemoryToUIMemory  
**Lines:** ~40

Add main function to load connections from API:
```typescript
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
```

---

## Part 4: Add Transform Functions
**File:** `/components/AppContent.tsx`  
**Location:** After loadConnectionsFromAPI  
**Lines:** ~80

Add two functions to transform API connections to UI format:
```typescript
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
```

---

## Part 5: Add Load Memories Function
**File:** `/components/AppContent.tsx`  
**Location:** After transform functions  
**Lines:** ~40

Add function to load memories for a specific connection:
```typescript
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

---

## Part 6: Update Auth useEffect
**File:** `/components/AppContent.tsx`  
**Location:** Inside the authentication useEffect  
**Lines:** ~5

Replace the `setupMockData(profile);` call with:
```typescript
// Load real connections from API (Phase 1d)
loadConnectionsFromAPI();
```

---

## Part 7: Update Signup Handler
**File:** `/components/AppContent.tsx`  
**Location:** Inside handleOnboardingComplete, after account creation  
**Lines:** ~5

Replace the `setupMockData(profile);` call with:
```typescript
// Load real connections from API (Phase 1d)
await loadConnectionsFromAPI();
```

---

## Part 8: Update Connection Switching
**File:** `/components/AppContent.tsx`  
**Location:** Replace handleSwitchStoryteller and handleSwitchLegacyKeeper  
**Lines:** ~40

Replace both functions to load from API:
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
    
    // Load memories from API
    await loadMemoriesForConnection(storytellerId);
  }
};

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
    
    // Load memories from API
    await loadMemoriesForConnection(legacyKeeperId);
  }
};
```

---

## Part 9: Remove Mock Data (BONUS - Optional for now)
**File:** `/components/AppContent.tsx`  
**Location:** Delete setupMockData function  
**Lines:** -200

This can be done later. For now, the function just won't be called anymore.

---

## Implementation Order

✅ **Ready to implement in sequence:**

1. Part 1: Add state variables (5 lines)
2. Part 2: Add conversion helper (10 lines)
3. Part 3: Add loadConnectionsFromAPI (40 lines)
4. Part 4: Add transform functions (80 lines)
5. Part 5: Add loadMemoriesForConnection (40 lines)
6. Part 6: Update auth useEffect (5 lines)
7. Part 7: Update signup handler (5 lines)
8. Part 8: Update connection switching (40 lines)

**Total:** ~225 lines added, 0 lines removed initially

---

## Testing After Each Part

- **After Part 1-5:** No visible changes (functions not called yet)
- **After Part 6:** Existing users will load real data on login
- **After Part 7:** New users will load real data after signup
- **After Part 8:** Connection switching will load real data

---

## Ready to Start

Say "start phase 1d-1" to begin with Part 1, then continue through parts 2-8.

Each part is small and focused, avoiding token limits while building up the complete functionality step by step.
