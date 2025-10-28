/**
 * AppContent Component
 * Main app logic with access to AuthContext
 */

import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { LoginScreen } from './LoginScreen';
import { SignUpInitialScreen, SignUpCredentials } from './SignUpInitialScreen';
import { UserTypeSelection } from './UserTypeSelection';
import { KeeperOnboarding } from './KeeperOnboarding';
import { TellerOnboarding } from './TellerOnboarding';
import { Dashboard } from './Dashboard';
import { useAuth } from '../utils/api/AuthContext';
import { apiClient } from '../utils/api/client';
import { uploadPhoto, uploadVideo, uploadAudio, uploadDocument } from '../utils/api/storage';
import { compressImage, validateVideo, validateAudio, formatFileSize } from '../utils/mediaOptimizer'; // Phase 3d
import { useNetworkStatus } from '../utils/networkStatus'; // Phase 3e
import { prefetchMedia, clearExpiredCache } from '../utils/mediaCache'; // Phase 3e
import { queueOperation, processQueue, setupAutoSync, getQueueStats, type QueuedOperation } from '../utils/offlineQueue'; // Phase 3e
import { autoTagPhoto } from '../utils/aiService'; // Phase 4a
import { autoTranscribeVoiceNote, getLanguageCode } from '../utils/aiService'; // Phase 4b
import { realtimeSync, type PresenceState, type MemoryUpdate } from '../utils/realtimeSync'; // Phase 5
import { initializeDailyPromptScheduler } from '../utils/dailyPromptScheduler'; // Daily prompts
import { subscribeToPushNotifications, isPushSubscribed, getNotificationPreferences } from '../utils/notificationService'; // Push notifications
import { NotificationOnboardingDialog } from './NotificationOnboardingDialog'; // First-time notification prompt
import { toast } from 'sonner';
import type { UserType, UserProfile, Storyteller, LegacyKeeper, Memory, DisplayLanguage } from '../App';
import type { ConnectionWithPartner, Memory as ApiMemory } from '../utils/api/types';

export function AppContent() {
  const { signup, user, isLoading, isAuthenticated, accessToken } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<
    'welcome' | 'login' | 'signup' | 'userType' | 'keeperOnboarding' | 'tellerOnboarding' | 'dashboard'
  >('welcome');
  const [userType, setUserType] = useState<UserType>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [signupCredentials, setSignupCredentials] = useState<SignUpCredentials | null>(null);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [activeStorytellerId, setActiveStorytellerId] = useState<string>('');
  const [memoriesByStoryteller, setMemoriesByStoryteller] = useState<Record<string, Memory[]>>({});
  const [legacyKeepers, setLegacyKeepers] = useState<LegacyKeeper[]>([]);
  const [activeLegacyKeeperId, setActiveLegacyKeeperId] = useState<string>('');
  const [memoriesByLegacyKeeper, setMemoriesByLegacyKeeper] = useState<Record<string, Memory[]>>({});
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState<DisplayLanguage>('all');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [hasInitializedAuth, setHasInitializedAuth] = useState(false);
  
  // Phase 1d: Connection loading state
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionWithPartner[]>([]);

  // Phase 3c: Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Phase 3e: Network status and offline support
  const networkStatus = useNetworkStatus();
  const [queuedOperationsCount, setQueuedOperationsCount] = useState<number>(0);

  // Phase 5: Real-time sync
  const [presences, setPresences] = useState<Record<string, PresenceState>>({});
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);

  // Notification onboarding
  const [showNotificationOnboarding, setShowNotificationOnboarding] = useState(false);
  const [hasCheckedNotificationOnboarding, setHasCheckedNotificationOnboarding] = useState(false);

  /**
   * Phase 3e: Setup auto-sync when coming back online
   */
  useEffect(() => {
    const handleQueuedOperation = async (operation: QueuedOperation): Promise<boolean> => {
      try {
        switch (operation.type) {
          case 'create-memory':
            const response = await apiClient.createMemory(operation.payload);
            return response.success;
          
          case 'update-memory':
            const updateResponse = await apiClient.updateMemory(
              operation.payload.memoryId,
              operation.payload.updates
            );
            return updateResponse.success;
          
          case 'delete-memory':
            const deleteResponse = await apiClient.deleteMemory(operation.payload.memoryId);
            return deleteResponse.success;
          
          case 'update-profile':
            const profileResponse = await apiClient.updateProfile(operation.payload);
            return profileResponse.success;
          
          default:
            console.warn('Unknown operation type:', operation.type);
            return false;
        }
      } catch (error) {
        console.error('Failed to execute queued operation:', error);
        return false;
      }
    };

    // Setup auto-sync
    const cleanup = setupAutoSync(handleQueuedOperation);

    // Listen for sync complete events
    const handleSyncComplete = (event: CustomEvent) => {
      const { processed, failed } = event.detail;
      if (processed > 0) {
        toast.success(`${processed} queued operation${processed > 1 ? 's' : ''} synced!`);
        // Reload data after sync
        loadConnectionsFromAPI();
      }
    };

    window.addEventListener('adoras:sync-complete', handleSyncComplete as EventListener);

    return () => {
      cleanup();
      window.removeEventListener('adoras:sync-complete', handleSyncComplete as EventListener);
    };
  }, [userType]);

  /**
   * Phase 5: Setup real-time sync for active connection
   */
  useEffect(() => {
    let unsubscribePresence: (() => void) | null = null;
    let unsubscribeMemoryUpdates: (() => void) | null = null;

    const setupRealtime = async () => {
      const connectionId = userType === 'keeper' ? activeStorytellerId : activeLegacyKeeperId;
      
      // Only connect if we have a connection and user is authenticated
      if (!connectionId || !user || !isConnected) {
        return;
      }

      console.log('🔌 Setting up real-time sync...');

      try {
        // Connect to real-time channel
        await realtimeSync.connect({
          connectionId,
          userId: user.id,
          userName: user.name,
          userPhoto: user.photo,
        });

        setRealtimeConnected(true);

        // Subscribe to presence updates
        unsubscribePresence = realtimeSync.onPresenceChange((presenceState) => {
          console.log('👥 Presence updated:', presenceState);
          setPresences(presenceState);
        });

        // Subscribe to memory updates from other clients
        unsubscribeMemoryUpdates = realtimeSync.onMemoryUpdate(async (update) => {
          console.log('📡 Received memory update:', update);

          // Ignore updates from ourselves (current user)
          if (update.userId === user.id) {
            return;
          }

          // Handle different update types
          if (update.action === 'create' && update.memory) {
            // Convert and add new memory
            const newMemory = convertApiMemoryToUIMemory(update.memory);
            
            setMemories((prev) => {
              // Check if memory already exists (prevent duplicates)
              if (prev.some(m => m.id === newMemory.id)) {
                return prev;
              }
              return [...prev, newMemory];
            });

            // Show notification
            toast.info(`New memory from ${update.memory.sender === 'keeper' ? 'Legacy Keeper' : 'Storyteller'}!`, {
              duration: 3000,
            });
          } else if (update.action === 'update' && update.memory) {
            // Update existing memory
            const updatedMemory = convertApiMemoryToUIMemory(update.memory);
            
            setMemories((prev) =>
              prev.map((m) => (m.id === update.memoryId ? updatedMemory : m))
            );
          } else if (update.action === 'delete') {
            // Remove deleted memory
            setMemories((prev) => prev.filter((m) => m.id !== update.memoryId));
          }
        });

      } catch (error) {
        console.error('❌ Failed to setup real-time sync:', error);
        console.log('ℹ️ App will continue to work without real-time features');
        setRealtimeConnected(false);
        // Don't show error to user - real-time is optional
      }
    };

    setupRealtime();

    // Cleanup on unmount or connection change
    return () => {
      if (unsubscribePresence) {
        unsubscribePresence();
      }
      if (unsubscribeMemoryUpdates) {
        unsubscribeMemoryUpdates();
      }
      realtimeSync.disconnect();
      setRealtimeConnected(false);
      setPresences({});
    };
  }, [userType, activeStorytellerId, activeLegacyKeeperId, user, isConnected]);

  /**
   * Notification Onboarding: Show on first dashboard load if not subscribed
   */
  useEffect(() => {
    const checkNotificationOnboarding = async () => {
      // Only check once per session
      if (hasCheckedNotificationOnboarding) {
        return;
      }

      // Only show if user is on dashboard and has a connection
      if (currentScreen !== 'dashboard' || !user || !isConnected) {
        return;
      }

      // Check if user has seen the prompt before
      const hasSeenPrompt = localStorage.getItem('adoras_notification_prompt_shown');
      if (hasSeenPrompt) {
        setHasCheckedNotificationOnboarding(true);
        return;
      }

      // Check if already subscribed
      const alreadySubscribed = await isPushSubscribed();
      if (alreadySubscribed) {
        // Already subscribed, mark as seen
        localStorage.setItem('adoras_notification_prompt_shown', 'true');
        setHasCheckedNotificationOnboarding(true);
        return;
      }

      // Show the onboarding dialog after a short delay
      setTimeout(() => {
        console.log('🔔 Showing notification onboarding for first-time user');
        setShowNotificationOnboarding(true);
        localStorage.setItem('adoras_notification_prompt_shown', 'true');
        setHasCheckedNotificationOnboarding(true);
      }, 1500);
    };

    checkNotificationOnboarding();
  }, [currentScreen, user, isConnected, hasCheckedNotificationOnboarding]);

  /**
   * Phase 3e: Clear expired cache and prefetch media on mount
   */
  useEffect(() => {
    const initializeCache = async () => {
      // Clear expired cache entries
      const removed = await clearExpiredCache();
      if (removed > 0) {
        console.log(`🗑️ Cleared ${removed} expired cache entries`);
      }

      // Prefetch media for current memories when online
      if (networkStatus.isOnline && memories.length > 0) {
        const mediaUrls: string[] = [];
        
        memories.forEach((memory) => {
          if (memory.type === 'photo' && memory.photoUrl) {
            mediaUrls.push(memory.photoUrl);
          } else if (memory.type === 'video' && memory.videoUrl) {
            mediaUrls.push(memory.videoUrl);
          } else if (memory.type === 'voice' && memory.audioUrl) {
            mediaUrls.push(memory.audioUrl);
          }
        });

        if (mediaUrls.length > 0 && !networkStatus.isSlowConnection) {
          console.log(`📦 Prefetching ${mediaUrls.length} media items...`);
          prefetchMedia(mediaUrls);
        }
      }
    };

    if (currentScreen === 'dashboard' && memories.length > 0) {
      initializeCache();
    }
  }, [currentScreen, memories, networkStatus.isOnline]);

  /**
   * Phase 3e: Update queued operations count
   */
  useEffect(() => {
    const updateQueueCount = async () => {
      const stats = await getQueueStats();
      setQueuedOperationsCount(stats.totalCount);
    };

    updateQueueCount();
    
    // Update count every 30 seconds
    const interval = setInterval(updateQueueCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Phase 3e: Show network status changes to user
   */
  useEffect(() => {
    if (!networkStatus.isOnline) {
      toast.warning('You are offline. Changes will be synced when you reconnect.', {
        duration: 5000,
        icon: '📴',
      });
    }
  }, [networkStatus.isOnline]);

  /**
   * Initialize push notifications and daily prompts when user is authenticated
   */
  useEffect(() => {
    const setupNotifications = async () => {
      if (!user || !userProfile || currentScreen !== 'dashboard') {
        return;
      }

      try {
        // Check if already subscribed
        const isSubscribed = await isPushSubscribed();
        
        if (!isSubscribed) {
          // Request permission and subscribe
          const success = await subscribeToPushNotifications(user.id);
          
          if (success) {
            toast.success('Notifications enabled! 🔔', {
              description: 'You\'ll receive daily prompts and memory updates',
              duration: 4000,
            });
          }
        }

        // Get notification preferences
        const prefs = await getNotificationPreferences(user.id);
        
        // Initialize daily prompt scheduler if enabled
        if (prefs?.dailyPrompts !== false) {
          initializeDailyPromptScheduler(user.id, {
            enabled: true,
            time: '09:00', // 9 AM default
            timezone: prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [user, userProfile, currentScreen]);

  /**
   * Phase 1d-2: Convert API memory format to UI memory format
   * Transforms timestamp string to Date object and ensures tags array exists
   */
  const convertApiMemoryToUIMemory = (apiMemory: ApiMemory): Memory => {
    return {
      ...apiMemory,
      timestamp: new Date(apiMemory.timestamp),
      tags: apiMemory.tags || [],
    };
  };

  /**
   * Phase 3b: Check if a Supabase signed URL is expired or close to expiring
   * Signed URLs expire after 1 hour (3600 seconds)
   */
  const isUrlExpiredOrExpiringSoon = (url: string | undefined, thresholdMinutes = 5): boolean => {
    if (!url) return false;
    
    try {
      // Extract token parameter from URL
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      
      if (!token) return false;
      
      // Supabase signed URL tokens contain expiration timestamp
      // Format: {timestamp}-{hash}
      const tokenParts = token.split('-');
      if (tokenParts.length < 2) return false;
      
      const expirationTimestamp = parseInt(tokenParts[0], 10);
      if (isNaN(expirationTimestamp)) return false;
      
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const timeUntilExpiry = expirationTimestamp - now;
      const thresholdSeconds = thresholdMinutes * 60;
      
      // Return true if expired or expiring within threshold
      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      console.error('Error checking URL expiration:', error);
      return false;
    }
  };

  /**
   * Phase 3b: Refresh expired or expiring URLs for a memory
   */
  const refreshMemoryUrlIfNeeded = async (memory: Memory): Promise<Memory> => {
    // Check if memory has media that might need refresh
    const hasExpiredUrl = 
      (memory.type === 'photo' && isUrlExpiredOrExpiringSoon(memory.photoUrl)) ||
      (memory.type === 'video' && isUrlExpiredOrExpiringSoon(memory.videoUrl)) ||
      (memory.type === 'voice' && isUrlExpiredOrExpiringSoon(memory.audioUrl)) ||
      (memory.type === 'document' && isUrlExpiredOrExpiringSoon(memory.documentUrl));
    
    if (!hasExpiredUrl) {
      return memory; // No refresh needed
    }
    
    try {
      console.log(`🔄 Refreshing expired URL for memory ${memory.id}...`);
      
      const response = await apiClient.refreshMediaUrl(memory.id);
      
      if (response.success && response.memory) {
        console.log(`✅ URL refreshed for memory ${memory.id}`);
        return convertApiMemoryToUIMemory(response.memory);
      } else {
        console.warn(`⚠️ Failed to refresh URL for memory ${memory.id}:`, response.error);
        return memory; // Return original if refresh fails
      }
    } catch (error) {
      console.error(`❌ Error refreshing URL for memory ${memory.id}:`, error);
      return memory; // Return original on error
    }
  };

  /**
   * Phase 3b: Batch refresh expired URLs for multiple memories
   */
  const refreshExpiredMemoryUrls = async (memoriesToCheck: Memory[]): Promise<Memory[]> => {
    const refreshPromises = memoriesToCheck.map(memory => refreshMemoryUrlIfNeeded(memory));
    const refreshedMemories = await Promise.all(refreshPromises);
    return refreshedMemories;
  };

  /**
   * Phase 1d-3: Load user's connections from API
   */
  const loadConnectionsFromAPI = async () => {
    console.log('📡 Loading connections from API...');
    console.log('   Current userType:', userType);
    console.log('   Current user:', user);
    setIsLoadingConnections(true);
    setConnectionsError(null);

    try {
      const response = await apiClient.getConnections();
      
      if (response.success && response.connections) {
        console.log(`✅ Loaded ${response.connections.length} connections`);
        setConnections(response.connections);
        
        // Use the authenticated user's type if userType state isn't set yet
        const effectiveUserType = userType || user?.type;
        console.log('   Effective user type for transformation:', effectiveUserType);
        
        // Transform connections into UI format
        if (effectiveUserType === 'keeper') {
          console.log('   🔄 Transforming to storytellers...');
          await transformConnectionsToStorytellers(response.connections);
        } else if (effectiveUserType === 'teller') {
          console.log('   🔄 Transforming to legacy keepers...');
          await transformConnectionsToLegacyKeepers(response.connections);
        } else {
          console.error('❌ Invalid user type:', effectiveUserType);
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
   * Phase 1d-4: Transform API connections to Storyteller format (for Keepers)
   */
  const transformConnectionsToStorytellers = async (apiConnections: ConnectionWithPartner[]) => {
    console.log('🔄 Transforming connections to storytellers...', apiConnections);
    const storytellerList: Storyteller[] = apiConnections.map((conn) => {
      console.log(`   - Connection ${conn.connection.id}: status='${conn.connection.status}', partner='${conn.partner?.name}'`);
      return {
        id: conn.connection.id,
        name: conn.partner?.name || 'Unknown',
        relationship: conn.partner?.relationship || 'Family',
        bio: conn.partner?.bio || '',
        photo: conn.partner?.photo,
        isConnected: conn.connection.status === 'active',
      };
    });

    setStorytellers(storytellerList);
    
    // Set first active connection as default
    const firstActive = storytellerList.find((s) => s.isConnected);
    console.log(`   First active storyteller:`, firstActive);
    if (firstActive) {
      console.log(`   🎯 Setting activeStorytellerId to: ${firstActive.id}`);
      setActiveStorytellerId(firstActive.id);
      setPartnerProfile({
        id: firstActive.id,
        name: firstActive.name,
        relationship: firstActive.relationship,
        bio: firstActive.bio,
        photo: firstActive.photo,
      });
      setIsConnected(true);
      console.log(`   ✅ Connected to storyteller: ${firstActive.name} (ID: ${firstActive.id})`);
      await loadMemoriesForConnection(firstActive.id);
    } else if (storytellerList.length > 0) {
      const firstPending = storytellerList[0];
      console.log(`   🎯 Setting activeStorytellerId to pending: ${firstPending.id}`);
      setActiveStorytellerId(firstPending.id);
      setPartnerProfile({
        id: firstPending.id,
        name: firstPending.name,
        relationship: firstPending.relationship,
        bio: firstPending.bio,
        photo: firstPending.photo,
      });
      setIsConnected(false);
      console.log(`   ⏳ Pending connection to: ${firstPending.name} (ID: ${firstPending.id})`);
      setMemories([]);
    } else {
      console.log(`   ❌ No storytellers found - clearing active connection`);
      setActiveStorytellerId('');
      setPartnerProfile(null);
      setIsConnected(false);
      setMemories([]);
    }
  };

  /**
   * Phase 1d-4: Transform API connections to Legacy Keeper format (for Tellers)
   */
  const transformConnectionsToLegacyKeepers = async (apiConnections: ConnectionWithPartner[]) => {
    console.log('🔄 Transforming connections to legacy keepers...', apiConnections);
    const keeperList: LegacyKeeper[] = apiConnections.map((conn) => {
      console.log(`   - Connection ${conn.connection.id}: status='${conn.connection.status}', partner='${conn.partner?.name}'`);
      return {
        id: conn.connection.id,
        name: conn.partner?.name || 'Unknown',
        relationship: conn.partner?.relationship || 'Family',
        bio: conn.partner?.bio || '',
        photo: conn.partner?.photo,
        isConnected: conn.connection.status === 'active',
      };
    });

    setLegacyKeepers(keeperList);
    
    // Set first active connection as default
    const firstActive = keeperList.find((k) => k.isConnected);
    if (firstActive) {
      console.log(`   🎯 Setting activeLegacyKeeperId to: ${firstActive.id}`);
      setActiveLegacyKeeperId(firstActive.id);
      setPartnerProfile({
        id: firstActive.id,
        name: firstActive.name,
        relationship: firstActive.relationship,
        bio: firstActive.bio,
        photo: firstActive.photo,
      });
      setIsConnected(true);
      console.log(`   ✅ Connected to legacy keeper: ${firstActive.name} (ID: ${firstActive.id})`);
      await loadMemoriesForConnection(firstActive.id);
    } else if (keeperList.length > 0) {
      const firstPending = keeperList[0];
      console.log(`   🎯 Setting activeLegacyKeeperId to pending: ${firstPending.id}`);
      setActiveLegacyKeeperId(firstPending.id);
      setPartnerProfile({
        id: firstPending.id,
        name: firstPending.name,
        relationship: firstPending.relationship,
        bio: firstPending.bio,
        photo: firstPending.photo,
      });
      setIsConnected(false);
      console.log(`   ⏳ Pending connection to: ${firstPending.name} (ID: ${firstPending.id})`);
      setMemories([]);
    } else {
      console.log(`   ❌ No legacy keepers found - clearing active connection`);
      setActiveLegacyKeeperId('');
      setPartnerProfile(null);
      setIsConnected(false);
      setMemories([]);
    }
  };

  /**
   * Phase 1d-5: Load memories for a specific connection
   */
  const loadMemoriesForConnection = async (connectionId: string) => {
    console.log(`📡 Loading memories for connection: ${connectionId}`);
    
    try {
      const response = await apiClient.getMemories(connectionId);
      
      if (response.success && response.memories) {
        console.log(`✅ Loaded ${response.memories.length} memories`);
        
        // Convert API memories to UI format
        let uiMemories = response.memories.map(convertApiMemoryToUIMemory);
        
        // Phase 3b: Auto-refresh expired URLs
        console.log('🔄 Checking for expired URLs...');
        uiMemories = await refreshExpiredMemoryUrls(uiMemories);
        
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

  /**
   * Handle authentication state changes
   * - Redirect to dashboard if user logs in
   * - Redirect to welcome if user logs out
   */
  useEffect(() => {
    // User logged in - redirect to dashboard
    if (!isLoading && isAuthenticated && user && !hasInitializedAuth) {
      console.log('✅ User is authenticated, redirecting to dashboard');
      
      // Set user type from authenticated user
      setUserType(user.type as UserType);
      
      // Set user profile from authenticated user
      const profile: UserProfile = {
        id: user.id,
        name: user.name,
        relationship: user.relationship || '',
        bio: user.bio || '',
        email: user.email,
        phoneNumber: user.phoneNumber,
        appLanguage: user.appLanguage,
        birthday: user.birthday ? new Date(user.birthday) : undefined,
        photo: user.photo,
      };
      
      setUserProfile(profile);
      
      // Load real connections from API (Phase 1d)
      // TESTING: Auto-ensure Shane and Allison are connected
      const initializeConnections = async () => {
        if (user.email === 'shanelong@gmail.com' || user.email === 'allison.tam@hotmail.com') {
          console.log('🧪 TEST USER: Ensuring Shane and Allison are connected...');
          toast.loading('Setting up test connection...', { id: 'test-setup' });
          try {
            const response = await apiClient.ensureTestUsersConnected();
            if (response.success) {
              console.log('✅ Test users connected successfully');
              toast.success('Test users connected!', { id: 'test-setup', duration: 2000 });
            } else {
              console.warn('⚠️ Failed to ensure test users connected:', response.error);
              toast.error(`Connection setup failed: ${response.error}`, { id: 'test-setup' });
            }
          } catch (error) {
            console.error('❌ Error ensuring test users connected:', error);
            toast.error('Failed to setup test connection', { id: 'test-setup' });
          }
        }
        
        // Load connections after ensuring test users are set up
        console.log('📡 Loading connections from API...');
        await loadConnectionsFromAPI();
        console.log('✅ Connections loaded');
      };
      
      // Wait for connections to load before navigating to dashboard
      initializeConnections().then(async () => {
        // Mark as initialized to prevent re-running
        setHasInitializedAuth(true);
        
        // Navigate to dashboard AFTER data is set
        setCurrentScreen('dashboard');
        
        // Check if this is first login (show notification onboarding)
        const hasSeenNotificationPrompt = localStorage.getItem('adoras_notification_prompt_shown');
        
        if (!hasSeenNotificationPrompt) {
          // Check if user is already subscribed
          const alreadySubscribed = await isPushSubscribed();
          
          // Only show if not already subscribed
          if (!alreadySubscribed) {
            // Wait a bit for dashboard to load, then show notification prompt
            setTimeout(() => {
              setShowNotificationOnboarding(true);
              localStorage.setItem('adoras_notification_prompt_shown', 'true');
            }, 1500); // 1.5 second delay for better UX
          } else {
            // Already subscribed, mark as shown
            localStorage.setItem('adoras_notification_prompt_shown', 'true');
          }
        }
      });
    }
    
    // User logged out - redirect to welcome
    if (!isLoading && !isAuthenticated && hasInitializedAuth) {
      console.log('🚪 User logged out, redirecting to welcome');
      
      // Disconnect from realtime
      realtimeSync.disconnect();
      
      // Reset all state
      setUserType(null);
      setUserProfile(null);
      setPartnerProfile(null);
      setMemories([]);
      setStorytellers([]);
      setLegacyKeepers([]);
      setActiveStorytellerId('');
      setActiveLegacyKeeperId('');
      setMemoriesByStoryteller({});
      setMemoriesByLegacyKeeper({});
      setIsConnected(false);
      setHasInitializedAuth(false);
      setRealtimeConnected(false);
      setPresences({});
      
      // Navigate to welcome screen
      setCurrentScreen('welcome');
    }
  }, [isLoading, isAuthenticated, user, hasInitializedAuth]);

  const handleWelcomeNext = () => {
    setCurrentScreen('userType');
  };

  const handleWelcomeLogin = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = () => {
    // Don't navigate to dashboard here - let the useEffect handle it
    // after connections are loaded. Just ensure we're in a loading state.
    console.log('🔐 Login successful, waiting for connections to load...');
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentScreen('signup');
  };

  const handleSignUpComplete = (credentials: SignUpCredentials) => {
    setSignupCredentials(credentials);
    if (userType === 'keeper') {
      setCurrentScreen('keeperOnboarding');
    } else {
      setCurrentScreen('tellerOnboarding');
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile, invitationCode?: string) => {
    if (!signupCredentials) {
      console.error('No signup credentials found');
      alert('Error: Missing signup credentials. Please try again.');
      setCurrentScreen('signup');
      return;
    }

    setIsSigningUp(true);
    setSignupError(null);

    try {
      console.log('🔐 Creating account...');
      
      // Call signup API with credentials + profile data
      const result = await signup({
        email: signupCredentials.email,
        password: signupCredentials.password,
        type: userType!,
        name: profile.name,
        relationship: profile.relationship,
        bio: profile.bio,
        phoneNumber: profile.phoneNumber,
        appLanguage: profile.appLanguage as 'english' | 'spanish' | 'french' | 'chinese' | 'korean' | 'japanese' | undefined,
        birthday: profile.birthday?.toISOString(),
        photo: profile.photo,
      });

      if (result.success) {
        console.log('✅ Account created successfully!');
        setUserProfile(profile);

        // Extract code and storyteller info
        const codeToUse = invitationCode || ('invitationCode' in profile ? (profile as any).invitationCode : undefined);
        const storytellerInfo = (profile as any).storytellerInfo;
        
        // If keeper with invitation code, create the invitation in backend
        if (userType === 'keeper' && codeToUse && storytellerInfo) {
          console.log('📤 Creating invitation in backend with code:', codeToUse);
          
          try {
            const createResult = await apiClient.createInvitation({
              tellerPhoneNumber: profile.phoneNumber || '+1234567890', // Use a placeholder if no phone
              tellerName: storytellerInfo.name,
              tellerBirthday: storytellerInfo.birthday?.toISOString(),
              tellerRelationship: storytellerInfo.relationship,
              tellerBio: storytellerInfo.bio,
              tellerPhoto: storytellerInfo.photo,
              code: codeToUse, // Pass the generated code
            });

            if (createResult.success) {
              console.log('✅ Invitation created in backend!');
              
              // Show appropriate success message based on SMS status
              if (createResult.smsSent) {
                toast.success('Invitation sent via SMS!');
              } else {
                // SMS failed or wasn't configured - that's OK!
                console.log('ℹ️ SMS not sent:', createResult.smsError);
                toast.success(`Invitation code created: ${codeToUse}`, {
                  description: 'Share this code with your storyteller to connect',
                  duration: 5000,
                });
              }
            } else {
              console.error('❌ Failed to create invitation:', createResult.error);
              toast.warning('Account created but invitation setup incomplete.');
            }
          } catch (inviteError) {
            console.error('❌ Error creating invitation:', inviteError);
            toast.warning('Account created but invitation setup incomplete.');
          }
        }

        // If teller with invitation code, accept the invitation
        if (userType === 'teller' && codeToUse) {
          console.log('🔗 Accepting invitation with code:', codeToUse);
          
          try {
            const acceptResult = await apiClient.acceptInvitation({
              code: codeToUse,
            });

            if (acceptResult.success) {
              console.log('✅ Invitation accepted, connection created!');
              toast.success('Connected to your keeper successfully!');
            } else {
              console.error('❌ Failed to accept invitation:', acceptResult.error);
              // Don't block the flow, but show a warning
              toast.error('Account created but connection failed. Please contact your keeper.');
            }
          } catch (inviteError) {
            console.error('❌ Error accepting invitation:', inviteError);
            toast.error('Account created but connection failed. Please contact your keeper.');
          }
        }

        // Load real connections from API FIRST (Phase 1d)
        console.log('📡 Loading connections...');
        await loadConnectionsFromAPI();
        
        // Then navigate to dashboard
        // Dashboard will show the data if connections loaded, or "not connected" state
        console.log('🎯 Navigating to dashboard...');
        setCurrentScreen('dashboard');
      } else {
        console.error('❌ Signup failed:', result.error);
        
        // Check if user already exists
        if (result.error && (result.error.includes('already been registered') || result.error.includes('already registered'))) {
          console.log('ℹ️ User already exists, redirecting to login');
          setSignupError('This email is already registered. Redirecting to login...');
          toast.info('Account already exists! Please log in.', { duration: 3000 });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            setCurrentScreen('login');
            setSignupError(null);
          }, 1500);
        } else {
          setSignupError(result.error || 'Failed to create account. Please try again.');
        }
        // Stay on onboarding screen to show error
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setSignupError(error instanceof Error ? error.message : 'Network error. Please check your connection.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const setupMockData = (profile: UserProfile) => {
    if (userType === 'keeper') {
      const storytellerFromOnboarding = (profile as any).storytellerInfo;
      
      const mockStorytellers: Storyteller[] = [
        storytellerFromOnboarding && storytellerFromOnboarding.name
          ? {
              id: 'primary',
              name: storytellerFromOnboarding.name,
              relationship: storytellerFromOnboarding.relationship || 'Family',
              bio: storytellerFromOnboarding.bio || '',
              photo: storytellerFromOnboarding.photo,
              isConnected: false,
            }
          : {
              id: 'dad',
              name: 'Dad',
              relationship: 'Father',
              bio: 'Your father who loves telling stories about his childhood',
              isConnected: true,
            },
        {
          id: 'grandma',
          name: 'Grandma',
          relationship: 'Grandmother',
          bio: 'Your grandmother with endless wisdom and family stories',
          isConnected: true,
        },
      ];
      
      setStorytellers(mockStorytellers);
      setActiveStorytellerId(storytellerFromOnboarding && storytellerFromOnboarding.name ? 'primary' : 'dad');
      
      const sampleVoiceMessage: Memory = {
        id: 'sample-voice-1',
        type: 'voice',
        content: '9"',
        sender: 'teller',
        timestamp: new Date(Date.now() - 3600000),
        category: 'Voice',
        tags: ['voice', 'translation'],
        originalText: '行，搞了你们搞个 high manager，有没有回复你呀？',
        transcript: "Alright, let's get a high-ranking manager involved. Has anyone responded to you yet?",
      };
      
      const dadMemory: Memory = {
        id: 'dad-message-1',
        type: 'text',
        content: 'Hey kiddo! Remember that time we went fishing?',
        sender: 'teller',
        timestamp: new Date(Date.now() - 7200000),
        category: 'Chat',
        tags: ['chat', 'memory'],
      };
      
      const primaryId = storytellerFromOnboarding && storytellerFromOnboarding.name ? 'primary' : 'dad';
      
      setMemoriesByStoryteller({
        primary: storytellerFromOnboarding && storytellerFromOnboarding.name ? [] : [sampleVoiceMessage],
        dad: [dadMemory],
        grandma: [],
      });
      
      setMemories(primaryId === 'primary' ? [] : [sampleVoiceMessage]);
      setPartnerProfile({
        name: storytellerFromOnboarding && storytellerFromOnboarding.name ? storytellerFromOnboarding.name : 'Dad',
        relationship: storytellerFromOnboarding && storytellerFromOnboarding.relationship ? storytellerFromOnboarding.relationship : 'Father',
        bio: storytellerFromOnboarding && storytellerFromOnboarding.bio ? storytellerFromOnboarding.bio : 'Your father who loves telling stories about his childhood',
        photo: storytellerFromOnboarding && storytellerFromOnboarding.photo ? storytellerFromOnboarding.photo : '/api/placeholder/100/100',
        birthday: storytellerFromOnboarding && storytellerFromOnboarding.birthday ? storytellerFromOnboarding.birthday : new Date(1962, 0, 1),
      });
    } else {
      const mockLegacyKeepers: LegacyKeeper[] = [
        {
          id: 'alex',
          name: 'Alex',
          relationship: 'Son',
          bio: 'College student studying computer science',
          photo: '/api/placeholder/100/100',
          isConnected: true,
        },
        {
          id: 'sarah',
          name: 'Sarah',
          relationship: 'Daughter',
          bio: 'High school senior, loves photography',
          photo: '/api/placeholder/100/100',
          isConnected: true,
        },
        {
          id: 'michael',
          name: 'Michael',
          relationship: 'Son',
          bio: 'Working as a software engineer in Seattle',
          photo: '/api/placeholder/100/100',
          isConnected: false,
        },
      ];
      
      setLegacyKeepers(mockLegacyKeepers);
      setActiveLegacyKeeperId('alex');
      
      setPartnerProfile({
        name: 'Alex',
        age: 23,
        relationship: 'Son',
        bio: 'College student studying computer science',
        photo: '/api/placeholder/100/100',
      });
      
      const alexVoiceMessage: Memory = {
        id: 'sample-voice-1',
        type: 'voice',
        content: '9"',
        sender: 'keeper',
        timestamp: new Date(Date.now() - 3600000),
        category: 'Voice',
        tags: ['voice', 'translation'],
        originalText: '行，搞了你们搞个 high manager，有没有回复你呀？',
        transcript: "Alright, let's get a high-ranking manager involved. Has anyone responded to you yet?",
      };
      
      const sarahTextMessage: Memory = {
        id: 'sarah-message-1',
        type: 'text',
        content: 'Mom! I just got accepted to NYU!',
        sender: 'keeper',
        timestamp: new Date(Date.now() - 7200000),
        category: 'Chat',
        tags: ['chat', 'milestone'],
      };
      
      setMemoriesByLegacyKeeper({
        alex: [alexVoiceMessage],
        sarah: [sarahTextMessage],
        michael: [],
      });
      
      setMemories([alexVoiceMessage]);
    }
    setIsConnected(true);
  };

  const handleAddMemory = async (memory: Omit<Memory, 'id' | 'timestamp'>) => {
    // Unique toast ID for this upload
    const toastId = `upload-${Date.now()}`;
    
    try {
      const connectionId = userType === 'keeper' 
        ? activeStorytellerId 
        : activeLegacyKeeperId;
      
      console.log('🎯 handleAddMemory called:', {
        memoryType: memory.type,
        connectionId,
        userType,
        activeStorytellerId,
        activeLegacyKeeperId,
        hasPartner: !!partnerProfile,
        isConnected,
        isLoadingConnections,
        storytellers: storytellers.map(s => ({ id: s.id, name: s.name, isConnected: s.isConnected })),
        legacyKeepers: legacyKeepers.map(k => ({ id: k.id, name: k.name, isConnected: k.isConnected }))
      });
      
      // Check if connections are still loading
      if (isLoadingConnections) {
        console.warn('⏳ Connections are still loading - please wait');
        toast.warning('Please wait while connections load...');
        return;
      }
      
      if (!connectionId) {
        console.error('❌ No active connection - cannot create memory');
        console.error('   - User type:', userType);
        console.error('   - Active storyteller ID:', activeStorytellerId);
        console.error('   - Active legacy keeper ID:', activeLegacyKeeperId);
        console.error('   - Storytellers:', storytellers);
        console.error('   - Legacy keepers:', legacyKeepers);
        toast.error('No active connection. Please ensure you have a connected partner first.');
        return;
      }
      
      console.log('📡 Creating memory via API...');
      
      // Show initial loading toast based on media type
      const mediaTypeLabel = memory.type === 'photo' ? 'photo' : 
                            memory.type === 'video' ? 'video' : 
                            memory.type === 'voice' ? 'voice note' : 
                            memory.type === 'document' ? 'document' : 'message';
      toast.loading(`Uploading ${mediaTypeLabel}...`, { id: toastId });
      
      // Phase 2d: Upload media files to Supabase Storage before creating memory
      let uploadedMediaUrl: string | undefined = memory.mediaUrl;
      
      // Helper function to convert data URL to Blob
      const dataURLtoBlob = (dataUrl: string): Blob => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };
      
      // Upload photo if present
      if (memory.type === 'photo' && memory.photoUrl) {
        console.log('📤 Uploading photo to Supabase Storage...', {
          photoUrlType: memory.photoUrl.startsWith('data:') ? 'data URL' : 
                        memory.photoUrl.startsWith('blob:') ? 'blob URL' : 'unknown',
          photoUrlLength: memory.photoUrl.length
        });
        try {
          let photoFile: File | Blob;
          
          // Check if it's a data URL (from FileReader)
          if (memory.photoUrl.startsWith('data:')) {
            photoFile = dataURLtoBlob(memory.photoUrl);
          } 
          // Check if it's a blob URL (from URL.createObjectURL)
          else if (memory.photoUrl.startsWith('blob:')) {
            const response = await fetch(memory.photoUrl);
            photoFile = await response.blob();
          } else {
            console.warn('���️ Unknown photo URL format, skipping upload');
            photoFile = new Blob();
          }
          
          // Phase 3d: Compress image before upload
          console.log(`📦 Compressing photo (${formatFileSize(photoFile.size)})...`);
          const compressionResult = await compressImage(photoFile as File);
          
          if (!compressionResult.success) {
            console.error('❌ Image compression/validation failed:', compressionResult.error);
            toast.error(compressionResult.error || 'Image compression failed', { id: toastId });
            setUploadProgress(0);
            return;
          }
          
          const compressedPhoto = compressionResult.file as File;
          console.log(`✅ Photo optimized: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.optimizedSize)} (${compressionResult.compressionRatio.toFixed(2)}x)`);
          
          const uploadResult = await uploadPhoto(
            user!.id,
            connectionId,
            compressedPhoto,
            accessToken!,
            (progress) => {
              // Phase 3c: Update toast with progress
              toast.loading(`Uploading photo... ${Math.round(progress)}%`, { id: toastId });
              setUploadProgress(progress);
            }
          );
          
          if (uploadResult.success && uploadResult.url) {
            uploadedMediaUrl = uploadResult.url;
            console.log('✅ Photo uploaded:', uploadResult.url);
            
            // Phase 4a: Auto-tag photo with AI
            try {
              console.log('🤖 AI analyzing photo...');
              toast.loading('AI analyzing photo...', { id: toastId });
              
              const aiResult = await autoTagPhoto(uploadResult.url);
              
              if (aiResult.aiGenerated && aiResult.tags.length > 0) {
                console.log(`✅ AI generated ${aiResult.tags.length} tags:`, aiResult.tags);
                
                // Merge AI tags with existing tags
                const existingTags = memory.tags || [];
                const mergedTags = Array.from(new Set([...existingTags, ...aiResult.tags]));
                memory.tags = mergedTags;
                
                // Update category if not set
                if (!memory.category || memory.category === 'General') {
                  memory.category = aiResult.category;
                }
                
                toast.success(`Photo analyzed! Added ${aiResult.tags.length} AI tags`, { id: toastId, duration: 2000 });
              } else {
                console.log('ℹ️ AI tagging skipped (not configured or failed)');
                // Continue without AI tags - don't block upload
              }
            } catch (aiError) {
              console.warn('⚠️ AI tagging failed, continuing without AI tags:', aiError);
              // Don't block upload if AI fails
            }
          } else {
            console.error('❌ Photo upload failed:', uploadResult.error);
            throw new Error(uploadResult.error || 'Photo upload failed');
          }
        } catch (error) {
          console.error('❌ Photo upload error:', error);
          setUploadProgress(0);
          toast.error('Failed to upload photo. Please try again.', { 
            id: toastId,
            action: {
              label: 'Retry',
              onClick: () => handleAddMemory(memory)
            }
          });
          return;
        }
      }
      
      // Upload video if present
      if (memory.type === 'video' && memory.videoUrl) {
        console.log('📤 Uploading video to Supabase Storage...');
        try {
          let videoFile: File | Blob;
          
          // Check if it's a blob URL (videos typically use blob URLs)
          if (memory.videoUrl.startsWith('blob:')) {
            const response = await fetch(memory.videoUrl);
            videoFile = await response.blob();
          }
          // Check if it's a data URL
          else if (memory.videoUrl.startsWith('data:')) {
            videoFile = dataURLtoBlob(memory.videoUrl);
          } else {
            console.warn('⚠️ Unknown video URL format, skipping upload');
            videoFile = new Blob();
          }
          
          // Phase 3d: Validate video file size
          console.log(`📦 Validating video (${formatFileSize(videoFile.size)})...`);
          const videoValidation = await validateVideo(videoFile as File);
          
          if (!videoValidation.success) {
            console.error('❌ Video validation failed:', videoValidation.error);
            toast.error(videoValidation.error || 'Video file size exceeds limit', { id: toastId });
            setUploadProgress(0);
            return;
          }
          
          console.log('✅ Video validated successfully');
          
          const uploadResult = await uploadVideo(
            user!.id,
            connectionId,
            videoFile as File,
            accessToken!,
            (progress) => {
              // Phase 3c: Update toast with progress
              toast.loading(`Uploading video... ${Math.round(progress)}%`, { id: toastId });
              setUploadProgress(progress);
            }
          );
          
          if (uploadResult.success && uploadResult.url) {
            uploadedMediaUrl = uploadResult.url;
            console.log('✅ Video uploaded:', uploadResult.url);
            
            // Upload video thumbnail if present
            if (memory.videoThumbnail && memory.videoThumbnail.startsWith('data:')) {
              try {
                console.log('📤 Uploading video thumbnail...');
                const thumbnailBlob = dataURLtoBlob(memory.videoThumbnail);
                const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
                
                const thumbnailUploadResult = await uploadPhoto(
                  user!.id,
                  connectionId,
                  thumbnailFile,
                  accessToken!,
                  () => {} // No progress callback for thumbnail
                );
                
                if (thumbnailUploadResult.success && thumbnailUploadResult.url) {
                  memory.videoThumbnail = thumbnailUploadResult.url;
                  console.log('✅ Video thumbnail uploaded:', thumbnailUploadResult.url);
                } else {
                  console.warn('⚠️ Thumbnail upload failed, continuing without it');
                  memory.videoThumbnail = undefined;
                }
              } catch (thumbError) {
                console.warn('⚠️ Error uploading thumbnail:', thumbError);
                memory.videoThumbnail = undefined;
              }
            }
          } else {
            console.error('❌ Video upload failed:', uploadResult.error);
            throw new Error(uploadResult.error || 'Video upload failed');
          }
        } catch (error) {
          console.error('❌ Video upload error:', error);
          setUploadProgress(0);
          toast.error('Failed to upload video. Please try again.', { 
            id: toastId,
            action: {
              label: 'Retry',
              onClick: () => handleAddMemory(memory)
            }
          });
          return;
        }
      }
      
      // Upload audio if present
      if (memory.type === 'voice' && (memory.audioUrl || memory.audioBlob)) {
        console.log('📤 Uploading audio to Supabase Storage...');
        try {
          let audioBlob: Blob;
          
          // Prefer audioUrl (base64) over audioBlob (blob URL)
          const audioSource = memory.audioUrl || memory.audioBlob;
          
          if (!audioSource) {
            console.warn('⚠️ No audio source found');
            audioBlob = new Blob();
          }
          // Check if it's a data URL (base64)
          else if (audioSource.startsWith('data:')) {
            audioBlob = dataURLtoBlob(audioSource);
          }
          // Check if it's a blob URL
          else if (audioSource.startsWith('blob:')) {
            const response = await fetch(audioSource);
            audioBlob = await response.blob();
          } else {
            console.warn('⚠️ Unknown audio URL format, skipping upload');
            audioBlob = new Blob();
          }
          
          // Phase 3d: Validate audio file size
          console.log(`📦 Validating audio (${formatFileSize(audioBlob.size)})...`);
          const audioValidation = await validateAudio(audioBlob);
          
          if (!audioValidation.success) {
            console.error('❌ Audio validation failed:', audioValidation.error);
            toast.error(audioValidation.error || 'Audio file size exceeds limit', { id: toastId });
            setUploadProgress(0);
            return;
          }
          
          console.log('✅ Audio validated successfully');
          
          const fileName = `voice-${Date.now()}.webm`;
          
          const uploadResult = await uploadAudio(
            user!.id,
            connectionId,
            audioBlob,
            accessToken!,
            fileName,
            (progress) => {
              // Phase 3c: Update toast with progress
              toast.loading(`Uploading voice note... ${Math.round(progress)}%`, { id: toastId });
              setUploadProgress(progress);
            }
          );
          
          if (uploadResult.success && uploadResult.url) {
            uploadedMediaUrl = uploadResult.url;
            console.log('✅ Audio uploaded:', uploadResult.url);
            
            // Phase 4b: Auto-transcribe voice note with AI
            try {
              console.log('🤖 AI transcribing voice note...');
              toast.loading('AI transcribing voice note...', { id: toastId });
              
              // Detect language from voice note if available
              const detectedLanguage = memory.voiceLanguage ? getLanguageCode(memory.voiceLanguage) : undefined;
              
              const aiResult = await autoTranscribeVoiceNote(uploadResult.url, detectedLanguage);
              
              if (aiResult.aiGenerated && aiResult.transcript) {
                console.log(`✅ AI generated transcript (${aiResult.transcript.length} chars):`, aiResult.transcript.substring(0, 100) + '...');
                
                // Update transcript
                memory.transcript = aiResult.transcript;
                
                // Update voice language if detected
                if (aiResult.language && aiResult.language !== 'unknown') {
                  memory.voiceLanguage = aiResult.language;
                }
                
                toast.success(`Voice note transcribed!`, { id: toastId, duration: 2000 });
              } else {
                console.log('ℹ️ AI transcription skipped (not configured or failed)');
                // Continue without transcript - don't block upload
              }
            } catch (aiError) {
              console.warn('⚠️ AI transcription failed, continuing without transcript:', aiError);
              // Don't block upload if AI fails
            }
          } else {
            console.error('❌ Audio upload failed:', uploadResult.error);
            throw new Error(uploadResult.error || 'Audio upload failed');
          }
        } catch (error) {
          console.error('❌ Audio upload error:', error);
          setUploadProgress(0);
          toast.error('Failed to upload voice note. Please try again.', { 
            id: toastId,
            action: {
              label: 'Retry',
              onClick: () => handleAddMemory(memory)
            }
          });
          return;
        }
      }
      
      // Upload document if present
      if (memory.type === 'document' && memory.documentUrl) {
        console.log('📤 Uploading document to Supabase Storage...');
        try {
          let documentFile: File | Blob;
          
          // Check if it's a data URL (base64)
          if (memory.documentUrl.startsWith('data:')) {
            documentFile = dataURLtoBlob(memory.documentUrl);
            
            // Create a proper File object with the original file name
            const fileName = memory.documentFileName || `document-${Date.now()}.pdf`;
            documentFile = new File([documentFile], fileName, { 
              type: documentFile.type 
            });
          } 
          // Check if it's a blob URL
          else if (memory.documentUrl.startsWith('blob:')) {
            const response = await fetch(memory.documentUrl);
            documentFile = await response.blob();
            
            // Create a proper File object with the original file name
            const fileName = memory.documentFileName || `document-${Date.now()}.pdf`;
            documentFile = new File([documentFile], fileName, { 
              type: documentFile.type 
            });
          } 
          // If it's already a URL (e.g., from Supabase), skip upload
          else if (memory.documentUrl.startsWith('http')) {
            console.log('✅ Document already uploaded:', memory.documentUrl);
            uploadedMediaUrl = memory.documentUrl;
            documentFile = null as any; // Skip upload
          } else {
            console.warn('⚠️ Unknown document URL format, skipping upload');
            documentFile = new Blob();
          }
          
          // Only upload if we have a document file to upload
          if (documentFile && documentFile.size > 0) {
            const uploadResult = await uploadDocument(
              user!.id,
              connectionId,
              documentFile as File,
              accessToken!,
              (progress) => {
                toast.loading(`Uploading document... ${Math.round(progress)}%`, { id: toastId });
                setUploadProgress(progress);
              }
            );
            
            if (uploadResult.success && uploadResult.url) {
              uploadedMediaUrl = uploadResult.url;
              console.log('✅ Document uploaded:', uploadResult.url);
              
              // Automatically extract text from document using documentScanner
              try {
                toast.loading('Extracting text from document...', { id: toastId });
                console.log('📄 Starting automatic document text extraction...');
                
                const { scanDocument } = await import('../utils/documentScanner');
                const scanResult = await scanDocument(documentFile as File);
                
                if (scanResult.text && scanResult.text.length > 0) {
                  // Add extracted text to memory
                  memory.documentScannedText = scanResult.text;
                  memory.documentScanLanguage = scanResult.language;
                  
                  console.log('✅ Document text extracted:', {
                    textLength: scanResult.text.length,
                    wordCount: scanResult.wordCount,
                    language: scanResult.language,
                    confidence: scanResult.confidence
                  });
                  
                  toast.success(`Document uploaded! ${scanResult.wordCount} words extracted.`, { id: toastId });
                } else {
                  console.log('ℹ️ No text extracted from document');
                  toast.success('Document uploaded successfully!', { id: toastId });
                }
              } catch (scanError) {
                console.warn('⚠️ Document text extraction failed:', scanError);
                // Don't block upload if extraction fails
                toast.success('Document uploaded successfully!', { id: toastId });
              }
            } else {
              console.error('❌ Document upload failed:', uploadResult.error);
              throw new Error(uploadResult.error || 'Document upload failed');
            }
          }
        } catch (error) {
          console.error('❌ Document upload error:', error);
          setUploadProgress(0);
          toast.error('Failed to upload document. Please try again.', { 
            id: toastId,
            action: {
              label: 'Retry',
              onClick: () => handleAddMemory(memory)
            }
          });
          return;
        }
      }
      
      // Call API to create memory with uploaded media URL
      // Build type-specific API request with correct field names
      const apiRequest: any = {
        connectionId,
        type: memory.type,
        content: memory.content,
        sender: memory.sender, // Required!
        category: memory.category,
        tags: memory.tags || [],
        estimatedDate: memory.estimatedDate,
        notes: memory.note, // Fix: note -> notes
        location: memory.location,
        promptQuestion: memory.promptQuestion,
        conversationContext: memory.conversationContext,
      };

      // Add type-specific media URLs and metadata
      if (memory.type === 'photo') {
        apiRequest.photoUrl = uploadedMediaUrl;
        apiRequest.photoDate = memory.photoDate?.toISOString();
        apiRequest.photoLocation = memory.photoLocation;
        apiRequest.photoGPSCoordinates = memory.photoGPSCoordinates;
        apiRequest.detectedPeople = memory.detectedPeople;
      }

      if (memory.type === 'video') {
        apiRequest.videoUrl = uploadedMediaUrl;
        apiRequest.videoThumbnail = memory.videoThumbnail;
        apiRequest.videoDate = memory.videoDate?.toISOString();
        apiRequest.videoLocation = memory.videoLocation;
        apiRequest.videoGPSCoordinates = memory.videoGPSCoordinates;
        apiRequest.videoPeople = memory.videoPeople;
      }

      if (memory.type === 'voice') {
        apiRequest.audioUrl = uploadedMediaUrl;
        apiRequest.transcript = memory.transcript;
        apiRequest.originalText = memory.originalText;
        apiRequest.voiceLanguage = memory.voiceLanguage;
        apiRequest.englishTranslation = memory.englishTranslation;
        apiRequest.voiceVisualReference = memory.voiceVisualReference;
      }

      if (memory.type === 'document') {
        apiRequest.documentUrl = uploadedMediaUrl;
        apiRequest.documentType = memory.documentType;
        apiRequest.documentFileName = memory.documentFileName;
        apiRequest.documentScannedText = memory.documentScannedText;
        apiRequest.documentScanLanguage = memory.documentScanLanguage;
      }

      console.log('📡 Creating memory with fields:', Object.keys(apiRequest));
      console.log('📡 API request details:', {
        type: apiRequest.type,
        hasPhotoUrl: !!apiRequest.photoUrl,
        hasVideoUrl: !!apiRequest.videoUrl,
        hasAudioUrl: !!apiRequest.audioUrl,
        category: apiRequest.category,
        tags: apiRequest.tags
      });
      
      const response = await apiClient.createMemory(apiRequest);
      
      if (response.success && response.memory) {
        console.log('✅ Memory created successfully:', {
          id: response.memory.id,
          type: response.memory.type,
          hasPhotoUrl: !!response.memory.photoUrl,
          hasVideoUrl: !!response.memory.videoUrl
        });
        
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
        
        // Phase 5: Broadcast memory creation to other clients
        if (realtimeConnected && user) {
          await realtimeSync.broadcastMemoryUpdate({
            action: 'create',
            memoryId: newMemory.id,
            connectionId,
            memory: response.memory,
            userId: user.id,
          });
          console.log('📡 Memory update broadcasted to connected users');
        }

        // Send iMessage-style push notification to partner
        if (partnerProfile && user) {
          try {
            console.log('📱 Starting notification flow...', {
              hasPartnerProfile: !!partnerProfile,
              hasUser: !!user,
              userName: user.name,
              userType,
              activeStorytellerId,
              activeLegacyKeeperId,
              connectionsCount: connections.length,
            });

            const { notifyNewMemory } = await import('../utils/notificationService');
            
            let previewText = memory.content || '';
            if (memory.type === 'photo') {
              previewText = memory.photoCaption || 'Sent a photo';
            } else if (memory.type === 'video') {
              previewText = 'Sent a video';
            } else if (memory.type === 'voice') {
              previewText = memory.englishTranslation || 'Sent a voice note';
            } else if (memory.type === 'document') {
              previewText = memory.documentFileName || 'Sent a document';
            }

            // Get partner's userId from the connection
            const connectionRecord = connections.find(c => 
              (userType === 'keeper' && c.partner?.id === activeStorytellerId) ||
              (userType === 'teller' && c.partner?.id === activeLegacyKeeperId)
            );

            console.log('📱 Connection lookup:', {
              foundConnection: !!connectionRecord,
              connectionId: connectionRecord?.connection?.id,
              partnerId: connectionRecord?.partner?.id,
              partnerName: connectionRecord?.partner?.name,
              activeStorytellerId,
              activeLegacyKeeperId,
              userType,
            });

            if (connectionRecord && connectionRecord.partner) {
              const partnerUserId = connectionRecord.partner.id;

              console.log('📱 Sending notification to partner:', {
                partnerUserId,
                senderName: user.name,
                memoryType: memory.type,
                previewText,
                hasMediaUrl: !!uploadedMediaUrl,
              });

              const result = await notifyNewMemory({
                userId: partnerUserId,
                senderName: user.name || 'Someone',
                memoryType: memory.type as any,
                memoryId: newMemory.id,
                previewText,
                mediaUrl: uploadedMediaUrl,
              });

              console.log('📱 Push notification result:', result);
            } else {
              console.warn('📱 No connection found - cannot send notification');
            }
          } catch (notifError) {
            console.error('❌ Failed to send push notification:', notifError);
            console.error('   Error details:', {
              message: notifError instanceof Error ? notifError.message : String(notifError),
              stack: notifError instanceof Error ? notifError.stack : undefined,
            });
            // Don't block memory creation if notification fails
          }
        } else {
          console.log('📱 Skipping notification:', {
            hasPartnerProfile: !!partnerProfile,
            hasUser: !!user,
          });
        }
        
        // Show success toast
        toast.success(`Memory added successfully!`, { id: toastId });
      } else {
        console.error('❌ Failed to create memory:', response.error);
        // Show error toast
        toast.error(`Failed to add memory: ${response.error}`, { id: toastId });
      }
    } catch (error) {
      console.error('❌ Failed to create memory:', error);
      // Show error toast
      toast.error(`Failed to add memory: ${error instanceof Error ? error.message : 'Network error. Please check your connection.'}`, { id: toastId });
    }
  };
  
  const handleSwitchStoryteller = async (storytellerId: string) => {
    const storyteller = storytellers.find((s) => s.id === storytellerId);
    if (storyteller) {
      setActiveStorytellerId(storytellerId);
      setPartnerProfile({
        id: storyteller.id,
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
        id: legacyKeeper.id,
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

  const handleEditMemory = async (memoryId: string, updates: Partial<Memory>) => {
    try {
      console.log('📡 Updating memory via API...', memoryId);
      
      // Call API to update memory
      const response = await apiClient.updateMemory(memoryId, {
        note: updates.note,
        timestamp: updates.timestamp?.toISOString(),
        location: updates.location,
        tags: updates.tags,
      });
      
      if (response.success && response.memory) {
        console.log('✅ Memory updated successfully:', memoryId);
        
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
        
        // Phase 5: Broadcast memory update to other clients
        if (realtimeConnected && user && connectionId) {
          await realtimeSync.broadcastMemoryUpdate({
            action: 'update',
            memoryId,
            connectionId,
            memory: response.memory,
            userId: user.id,
          });
          console.log('📡 Memory update broadcasted');
        }
      } else {
        console.error('❌ Failed to update memory:', response.error);
        // TODO: Show error toast to user
      }
    } catch (error) {
      console.error('❌ Failed to update memory:', error);
      // TODO: Show error toast to user
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      console.log('📡 Deleting memory via API...', memoryId);
      
      // Call API to delete memory
      const response = await apiClient.deleteMemory(memoryId);
      
      if (response.success) {
        console.log('✅ Memory deleted successfully:', memoryId);
        
        // Show success toast
        toast.success('Memory deleted successfully');
        
        // Remove from local state
        setMemories((prev) => {
          const filtered = prev.filter((memory) => memory.id !== memoryId);
          console.log(`🗑️ Removed from memories: ${prev.length} -> ${filtered.length}`);
          return filtered;
        });
        
        // Remove from memories by connection
        const connectionId = userType === 'keeper' 
          ? activeStorytellerId 
          : activeLegacyKeeperId;
        
        if (userType === 'keeper' && connectionId) {
          setMemoriesByStoryteller((prev) => {
            const updated = {
              ...prev,
              [connectionId]: (prev[connectionId] || []).filter(
                (memory) => memory.id !== memoryId
              ),
            };
            console.log(`🗑️ Removed from storyteller memories for ${connectionId}`);
            return updated;
          });
        }
        
        if (userType === 'teller' && connectionId) {
          setMemoriesByLegacyKeeper((prev) => {
            const updated = {
              ...prev,
              [connectionId]: (prev[connectionId] || []).filter(
                (memory) => memory.id !== memoryId
              ),
            };
            console.log(`🗑️ Removed from legacy keeper memories for ${connectionId}`);
            return updated;
          });
        }
        
        // Phase 5: Broadcast memory deletion to other clients
        if (realtimeConnected && user && connectionId) {
          await realtimeSync.broadcastMemoryUpdate({
            action: 'delete',
            memoryId,
            connectionId,
            userId: user.id,
          });
          console.log('📡 Memory deletion broadcasted');
        }
      } else {
        console.error('❌ Failed to delete memory:', response.error);
        toast.error(`Failed to delete memory: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete memory:', error);
      toast.error('Failed to delete memory. Please try again.');
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) {
      console.error('❌ No user profile found');
      return;
    }

    try {
      console.log('📡 Updating profile via API...');
      
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
        console.log('✅ Profile updated successfully');
        
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
      } else {
        console.error('❌ Failed to update profile:', response.error);
        // TODO: Show error toast to user
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      // TODO: Show error toast to user
    }
  };

  /**
   * Phase 2c Part 1: Create Invitation
   * Creates a new invitation and sends SMS to the partner
   */
  const handleCreateInvitation = async (
    partnerName: string,
    partnerRelationship: string,
    phoneNumber: string
  ) => {
    try {
      console.log('📡 Creating invitation via API...');
      
      // Call API to create invitation
      const response = await apiClient.createInvitation({
        partnerName,
        partnerRelationship,
        phoneNumber,
      });
      
      if (response.success && response.invitation) {
        console.log('✅ Invitation created:', response.invitation.id);
        console.log('📱 SMS sent to:', phoneNumber);
        
        // Reload connections to show pending invitation
        await loadConnectionsFromAPI();
        
        return { 
          success: true, 
          invitationId: response.invitation.id,
          message: 'Invitation sent successfully!' 
        };
      } else {
        console.error('❌ Failed to create invitation:', response.error);
        return { 
          success: false, 
          error: response.error || 'Failed to create invitation' 
        };
      }
    } catch (error) {
      console.error('❌ Failed to create invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create invitation' 
      };
    }
  };

  /**
   * Phase 2c Part 2: Accept Invitation
   * Accepts an invitation using the invitation code
   */
  const handleAcceptInvitation = async (invitationCode: string) => {
    try {
      console.log('📡 Accepting invitation via API...', invitationCode);
      
      // Call API to accept invitation
      const response = await apiClient.acceptInvitation({
        code: invitationCode,
      });
      
      if (response.success) {
        console.log('✅ Invitation accepted successfully');
        
        // Reload connections to show new active connection
        await loadConnectionsFromAPI();
        
        return { 
          success: true,
          message: 'Connection established successfully!' 
        };
      } else {
        console.error('❌ Failed to accept invitation:', response.error);
        return { 
          success: false, 
          error: response.error || 'Failed to accept invitation' 
        };
      }
    } catch (error) {
      console.error('❌ Failed to accept invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to accept invitation' 
      };
    }
  };

  const renderCurrentScreen = () => {
    // Show loading screen while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground" style={{ fontFamily: 'Inter' }}>Loading...</p>
          </div>
        </div>
      );
    }

    // Prevent authenticated users from accessing signup/onboarding screens
    if (isAuthenticated && ['signup', 'userType', 'keeperOnboarding', 'tellerOnboarding'].includes(currentScreen)) {
      console.log('⚠️ Authenticated user tried to access signup flow, redirecting to dashboard');
      setCurrentScreen('dashboard');
      return null;
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} onLogin={handleWelcomeLogin} />;
      case 'login':
        return (
          <LoginScreen
            onSuccess={handleLoginSuccess}
            onSignUpClick={() => setCurrentScreen('userType')}
            onBack={() => setCurrentScreen('welcome')}
          />
        );
      case 'signup':
        return (
          <SignUpInitialScreen
            onComplete={handleSignUpComplete}
            onLoginClick={() => setCurrentScreen('login')}
            onBack={() => setCurrentScreen('userType')}
            userType={userType!}
          />
        );
      case 'userType':
        return <UserTypeSelection onSelect={handleUserTypeSelect} />;
      case 'keeperOnboarding':
        return (
          <KeeperOnboarding
            onComplete={handleOnboardingComplete}
            onBack={() => setCurrentScreen('signup')}
            isLoading={isSigningUp}
            error={signupError}
          />
        );
      case 'tellerOnboarding':
        return (
          <TellerOnboarding
            onComplete={handleOnboardingComplete}
            onBack={() => setCurrentScreen('signup')}
            isLoading={isSigningUp}
            error={signupError}
          />
        );
      case 'dashboard':
        // Only render Dashboard if user data is ready
        // partnerProfile can be null (will show "not connected" state)
        if (!userType || !userProfile) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground" style={{ fontFamily: 'Inter' }}>Loading your profile...</p>
              </div>
            </div>
          );
        }
        
        return (
          <Dashboard
            userType={userType}
            userProfile={userProfile}
            partnerProfile={partnerProfile}
            memories={memories}
            onAddMemory={handleAddMemory}
            isConnected={isConnected}
            storytellers={storytellers}
            activeStorytellerId={activeStorytellerId}
            onSwitchStoryteller={handleSwitchStoryteller}
            legacyKeepers={legacyKeepers}
            activeLegacyKeeperId={activeLegacyKeeperId}
            onSwitchLegacyKeeper={handleSwitchLegacyKeeper}
            displayLanguage={displayLanguage}
            onDisplayLanguageChange={setDisplayLanguage}
            onEditMemory={handleEditMemory}
            onDeleteMemory={handleDeleteMemory}
            onUpdateProfile={handleUpdateProfile}
            onCreateInvitation={handleCreateInvitation}
            onAcceptInvitation={handleAcceptInvitation}
            presences={presences}
            realtimeConnected={realtimeConnected}
          />
        );
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} onLogin={handleWelcomeLogin} />;
    }
  };

  return (
    <>
      {renderCurrentScreen()}
      
      {/* Notification Onboarding Dialog - Shows on first login */}
      {user && (
        <NotificationOnboardingDialog
          open={showNotificationOnboarding}
          onOpenChange={setShowNotificationOnboarding}
          userId={user.id}
          userName={partnerProfile?.name || 'your family member'}
        />
      )}
    </>
  );
}