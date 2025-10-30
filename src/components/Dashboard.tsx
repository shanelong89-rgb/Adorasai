import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PromptsTab } from './PromptsTab';
import { ChatTab } from './ChatTab';
import { MediaLibraryTab } from './MediaLibraryTab';
import { AccountSettings } from './AccountSettings';
import { Notifications } from './Notifications';
import { PrivacySecurity } from './PrivacySecurity';
import { StorageData } from './StorageData';
import { HelpFeedback } from './HelpFeedback';
import { InvitationDialog } from './InvitationDialog';
import { InvitationManagement } from './InvitationManagement';
import { KeeperConnections } from './KeeperConnections';
import { TellerConnections } from './TellerConnections';
import { PresenceIndicator, PresenceDot, ConnectionStatus } from './PresenceIndicator';
import { SafariInstallBanner } from './SafariInstallBanner';
import { UserProfile, Memory, UserType, Storyteller, LegacyKeeper, DisplayLanguage } from '../App';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Menu, Zap, MessageCircle, Image, User, Check, UserPlus, Bell, Shield, Database, HelpCircle, LogOut, List, Users } from 'lucide-react';
import { useAuth } from '../utils/api/AuthContext';
import type { PresenceState } from '../utils/realtimeSync';
import { useTranslation } from '../utils/i18n';
import { NotificationMiniBadge } from './NotificationBadge';
import { apiClient } from '../utils/api/client';
import { showNativeNotificationBanner } from '../utils/notificationService';
import { InAppToastContainer, useInAppToasts } from './InAppToast';

interface DashboardProps {
  userType: UserType;
  userProfile: UserProfile;
  partnerProfile: UserProfile | null; // Allow null for "not connected" state
  memories: Memory[];
  onAddMemory: (memory: Omit<Memory, 'id' | 'timestamp'>) => void;
  isConnected: boolean;
  storytellers?: Storyteller[];
  activeStorytellerId?: string;
  onSwitchStoryteller?: (storytellerId: string) => void;
  legacyKeepers?: LegacyKeeper[];
  activeLegacyKeeperId?: string;
  onSwitchLegacyKeeper?: (legacyKeeperId: string) => void;
  displayLanguage: DisplayLanguage;
  onDisplayLanguageChange: (language: DisplayLanguage) => void;
  onEditMemory?: (memoryId: string, updates: Partial<Memory>) => void;
  onDeleteMemory?: (memoryId: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onCreateInvitation?: (partnerName: string, partnerRelationship: string, phoneNumber: string) => Promise<{ success: boolean; invitationId?: string; message?: string; error?: string }>;
  onConnectViaEmail?: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onAcceptInvitation?: (invitationCode: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  memoriesByStoryteller?: Record<string, Memory[]>;
  memoriesByLegacyKeeper?: Record<string, Memory[]>;
  presences?: Record<string, PresenceState>;
  realtimeConnected?: boolean;
}

export function Dashboard({ 
  userType, 
  userProfile, 
  partnerProfile, 
  memories, 
  onAddMemory,
  isConnected,
  storytellers = [],
  activeStorytellerId,
  onSwitchStoryteller,
  legacyKeepers = [],
  activeLegacyKeeperId,
  onSwitchLegacyKeeper,
  displayLanguage,
  onDisplayLanguageChange,
  onEditMemory,
  onDeleteMemory,
  onUpdateProfile,
  onCreateInvitation,
  onConnectViaEmail,
  onAcceptInvitation,
  memoriesByStoryteller = {},
  memoriesByLegacyKeeper = {}
}: DashboardProps) {
  const { signout } = useAuth();
  const { t } = useTranslation(userProfile.appLanguage || 'english');
  const { toasts, showToast, closeToast } = useInAppToasts();
  const [activeTab, setActiveTab] = useState('prompts');
  const [shouldScrollChatToBottom, setShouldScrollChatToBottom] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);
  const [showStorageData, setShowStorageData] = useState(false);
  const [showHelpFeedback, setShowHelpFeedback] = useState(false);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [showInvitationManagement, setShowInvitationManagement] = useState(false);
  const [showKeeperConnections, setShowKeeperConnections] = useState(false);
  const [showTellerConnections, setShowTellerConnections] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef(0);
  const [lastChatReadTimestamp, setLastChatReadTimestamp] = useState<number>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`lastChatRead_${userProfile.id}`);
    return stored ? parseInt(stored) : Date.now();
  });

  // DEFENSIVE: Validate that memories match the active connection
  // This prevents chat mixing if AppContent sends wrong data
  const validatedMemories = React.useMemo(() => {
    const activeConnectionId = userType === 'keeper' ? activeStorytellerId : activeLegacyKeeperId;
    const expectedMemories = userType === 'keeper' 
      ? (memoriesByStoryteller[activeConnectionId] || [])
      : (memoriesByLegacyKeeper[activeConnectionId] || []);
    
    // Compare memory arrays by IDs to detect mismatches
    const memoriesIds = memories.map(m => m.id).sort().join(',');
    const expectedIds = expectedMemories.map(m => m.id).sort().join(',');
    
    if (memoriesIds !== expectedIds) {
      // MISMATCH DETECTED - This can happen during state transitions
      // Only warn if it's been more than 2 seconds since last state change
      const timeSinceChange = Date.now() - (window._lastMemoryStateChange || 0);
      const shouldWarn = timeSinceChange > 2000;
      
      if (shouldWarn && expectedMemories.length > 0) {
        // Only warn if we have expected memories (not during initial load)
        console.warn(`⚠️ MEMORY MISMATCH DETECTED!`, {
          activeConnectionId,
          memoriesCount: memories.length,
          expectedCount: expectedMemories.length,
          timeSinceChange: `${timeSinceChange}ms`
        });
      }
      
      // If we have expected memories, use those; otherwise use global
      return expectedMemories.length > 0 ? expectedMemories : memories;
    }
    
    return memories;
  }, [memories, userType, activeStorytellerId, activeLegacyKeeperId, memoriesByStoryteller, memoriesByLegacyKeeper]);

  // Refs for tab content containers to handle scrolling
  const promptsContainerRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Calculate unread message count per connection for sidebar badges
  const getUnreadCountForConnection = React.useCallback((connectionId: string) => {
    // Get the last read timestamp for this specific connection
    const stored = localStorage.getItem(`lastChatRead_${userProfile.id}_${connectionId}`);
    const connectionLastRead = stored ? parseInt(stored) : 0;
    
    // Get memories for this specific connection
    const connectionMemories = userType === 'keeper' 
      ? (memoriesByStoryteller[connectionId] || [])
      : (memoriesByLegacyKeeper[connectionId] || []);
    
    const unreadCount = connectionMemories.filter(memory => {
      // Check if this message is from the partner (not from the current user)
      const isFromPartner = memory.sender !== userType;
      const isMessage = memory.type === 'text' || memory.type === 'voice';
      const isUnread = memory.timestamp.getTime() > connectionLastRead;
      
      return isFromPartner && isMessage && isUnread;
    }).length;
    
    // DEBUG: Log details for troubleshooting
    if (connectionMemories.length > 0) {
      console.log(`🔔 Notification check for connection ${connectionId}:`, {
        totalMemories: connectionMemories.length,
        lastReadTimestamp: new Date(connectionLastRead).toISOString(),
        unreadCount,
        recentMessages: connectionMemories.slice(-3).map(m => ({
          type: m.type,
          sender: m.sender,
          timestamp: m.timestamp.toISOString(),
          isFromPartner: m.sender !== userType,
          isUnread: m.timestamp.getTime() > connectionLastRead,
        })),
      });
    }
    
    return unreadCount;
  }, [userProfile.id, userType, memoriesByStoryteller, memoriesByLegacyKeeper]);

  // Calculate unread message count across ALL connections for Chat tab badge
  const unreadMessageCount = React.useMemo(() => {
    let totalUnread = 0;
    
    // Get all connections based on user type
    const allConnectionIds = userType === 'keeper' 
      ? Object.keys(memoriesByStoryteller)
      : Object.keys(memoriesByLegacyKeeper);
    
    // Sum up unread counts from all connections
    allConnectionIds.forEach(connectionId => {
      totalUnread += getUnreadCountForConnection(connectionId);
    });
    
    console.log(`📊 Total unread messages across all connections: ${totalUnread}`);
    
    return totalUnread;
  }, [userType, memoriesByStoryteller, memoriesByLegacyKeeper, getUnreadCountForConnection]);

  // Load pending connection requests count
  const loadPendingRequestsCount = React.useCallback(async () => {
    try {
      const response = await apiClient.getConnectionRequests();
      if (response.success && response.receivedRequests) {
        const pending = response.receivedRequests.filter((r: any) => r.status === 'pending');
        setPendingRequestsCount(pending.length);
      }
    } catch (error) {
      // Silently handle connection request errors - this is a non-critical feature
      // User can still manually check in Settings > Connections
      console.log('ℹ️ Connection requests check skipped (server may be slow or unavailable)');
    }
  }, []);

  useEffect(() => {
    loadPendingRequestsCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingRequestsCount, 30000);
    return () => clearInterval(interval);
  }, [loadPendingRequestsCount]);

  // Update document title with unread count
  useEffect(() => {
    if (unreadMessageCount > 0 && activeTab !== 'chat') {
      document.title = `(${unreadMessageCount}) Adoras`;
    } else {
      document.title = 'Adoras';
    }
  }, [unreadMessageCount, activeTab]);

  // Mark messages as read after viewing chat tab for 2 seconds
  useEffect(() => {
    if (activeTab === 'chat') {
      const timer = setTimeout(() => {
        const now = Date.now();
        setLastChatReadTimestamp(now);
        localStorage.setItem(`lastChatRead_${userProfile.id}`, now.toString());
        
        // Also mark messages as read for the currently active connection
        const activeConnectionId = userType === 'keeper' ? activeStorytellerId : activeLegacyKeeperId;
        if (activeConnectionId) {
          localStorage.setItem(`lastChatRead_${userProfile.id}_${activeConnectionId}`, now.toString());
          console.log(`✅ Marked messages as read for connection: ${activeConnectionId}`);
        }
      }, 2000); // 2 second delay to let user see notification badge first
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, userProfile.id, userType, activeStorytellerId, activeLegacyKeeperId]);

  // Track previous memory IDs to detect truly NEW messages (not just re-renders)
  const prevMemoryIdsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    // Get current memory IDs
    const currentMemoryIds = new Set(validatedMemories.map(m => m.id));
    
    // Find NEW memories that weren't in the previous set
    const newMemories = validatedMemories.filter(m => 
      !prevMemoryIdsRef.current.has(m.id) &&
      // Only consider messages from the last 10 seconds as "new"
      // This prevents old messages from triggering notifications during initial load/refresh
      m.timestamp.getTime() > (Date.now() - 10000)
    );
    
    // Update the ref for next comparison
    prevMemoryIdsRef.current = currentMemoryIds;
    
    // Process each truly new memory
    newMemories.forEach(newMemory => {
      console.log(`🆕 Detected truly NEW memory:`, {
        id: newMemory.id,
        type: newMemory.type,
        sender: newMemory.sender,
        timestamp: newMemory.timestamp.toISOString(),
        age: Date.now() - newMemory.timestamp.getTime(),
      });
      
      // Skip if this is not from partner
      if (!partnerProfile || newMemory.sender === userType) {
        console.log('   ℹ️ Skipping notification - message from self');
        return;
      }
      
      // Skip if not a relevant message type
      if (newMemory.type !== 'text' && newMemory.type !== 'voice') {
        console.log('   ℹ️ Skipping notification - not a text/voice message');
        return;
      }
      
      // Throttle notifications to prevent spam (max 1 per second)
      const now = Date.now();
      if (now - lastNotificationTimeRef.current < 1000) {
        console.log('   ⏱️ Throttling notification - too soon after last notification');
        return;
      }
      lastNotificationTimeRef.current = now;
      
      // Check if this is a prompt from keeper to teller
      const isPrompt = newMemory.promptQuestion && 
                      newMemory.category === 'Prompts' && 
                      newMemory.tags?.includes('prompt');
      
      // Auto-set activePrompt for tellers when they receive a prompt from keeper
      if (isPrompt && userType === 'teller') {
        setActivePrompt(newMemory.promptQuestion || '');
        console.log('   ✅ Set active prompt for teller:', newMemory.promptQuestion);
      }
      
      // Prepare notification content
      {
        const messagePreview = isPrompt
          ? `💡 ${newMemory.promptQuestion?.substring(0, 80)}${(newMemory.promptQuestion?.length || 0) > 80 ? '...' : ''}`
          : newMemory.type === 'voice'
          ? '🎤 Voice message'
          : newMemory.content.substring(0, 100);
        
        const notificationTitle = isPrompt 
          ? `${partnerProfile.name} sent you a prompt`
          : partnerProfile.name;
        
        const notificationType: 'message' | 'prompt' = isPrompt ? 'prompt' : 'message';
        
        console.log(`   🔔 Showing notification: ${notificationTitle} - ${messagePreview}`);
        
        // If user is NOT on chat tab, show native notification banner
        if (activeTab !== 'chat') {
          showNativeNotificationBanner(
            notificationTitle,
            messagePreview,
            {
              icon: partnerProfile.photo || '/apple-touch-icon.png',
              tag: `message_${newMemory.id}`,
              data: {
                memoryId: newMemory.id,
                sender: newMemory.sender,
                type: isPrompt ? 'prompt' : 'message',
              },
              onClick: () => {
                // Navigate to chat tab when notification is clicked
                setActiveTab('chat');
                // Trigger scroll to bottom to show new message
                setShouldScrollChatToBottom(true);
                // If it's a prompt, set it as the active prompt
                if (isPrompt && newMemory.promptQuestion) {
                  setActivePrompt(newMemory.promptQuestion);
                }
              },
            }
          );
        } else {
          // If user IS on chat tab, show in-app toast notification
          // This ensures prompts and messages are always visible even when already on chat
          showToast({
            type: notificationType,
            title: notificationTitle,
            body: messagePreview,
            avatar: partnerProfile.photo || '/apple-touch-icon.png',
            onClick: () => {
              // Trigger scroll to bottom to see the new message
              setShouldScrollChatToBottom(true);
              // If it's a prompt, ensure it's set as active prompt
              if (isPrompt && newMemory.promptQuestion) {
                setActivePrompt(newMemory.promptQuestion);
              }
            },
          });
        }

        // Play subtle notification sound (for both cases)
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        } catch (error) {
          console.log('Could not play notification sound:', error);
        }

        // Vibrate if supported (for both cases)
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 100, 50]);
        }
      }
    });
  }, [validatedMemories, partnerProfile, activeTab, userType, showToast]);

  // Initial scroll to top on mount (for Prompts tab after onboarding)
  useEffect(() => {
    // Scroll to top immediately on mount to ensure Prompts tab starts at top
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Scroll detection - ULTRA-RESPONSIVE
  // Chat tab relies EXCLUSIVELY on ChatTab's internal scroll detection
  // This window scroll handler is ONLY for Prompts/Media tabs
  useEffect(() => {
    const handleScroll = () => {
      // Chat tab: Do NOT interfere - let ChatTab handle scroll detection
      if (activeTab === 'chat') {
        return; // ChatTab will call onScrollUp/onScrollDown to control header
      }
      
      // For Prompts/Media tabs - always show header
      setShowHeader(true);
    };

    // Touch event handlers for iOS/mobile - ONLY FOR PROMPTS/MEDIA TABS
    // Chat tab uses internal ScrollArea, so window touch events don't apply
    const handleTouchStart = (e: TouchEvent) => {
      // Skip in Chat tab - ChatTab handles its own touch detection
      if (activeTab === 'chat') return;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Skip in Chat tab - ChatTab handles its own touch detection
      if (activeTab === 'chat') return;
      
      // For Prompts/Media tabs, always show header on touch
      setShowHeader(true);
    };

    // Direct event listeners without throttling for maximum responsiveness
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeTab]);

  // Handle tab changes and auto-scroll
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Always show header when switching tabs
    setShowHeader(true);
    
    // Note: Messages will be marked as read only when user is actively viewing them in ChatTab
    // Don't mark as read immediately when switching tabs - let user see the notification first
    
    // Auto-scroll behavior on tab change
    // Prompts and Media tabs: scroll to top
    // Chat tab: scroll to bottom to see latest messages
    if (newTab === 'chat') {
      // Trigger scroll to bottom when switching to chat
      setShouldScrollChatToBottom(true);
    } else if (newTab === 'prompts') {
      // Scroll to absolute top to ensure Today's Prompt is fully visible
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Also scroll the document element to ensure we're at the very top
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 150);
    } else if (newTab === 'media') {
      // Scroll to absolute top to ensure search box is visible
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Also scroll the document element to ensure we're at the very top
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 150);
    }
  };

  const handleNavigateToChat = (prompt: string) => {
    setActivePrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <>
      {/* Extended background container that goes behind notch */}
      <div className="fixed inset-0 -top-20 -z-10" style={{ backgroundColor: 'rgb(245, 249, 233)' }}></div>
      
      <div className="min-h-screen bg-transparent animate-fade-in" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Safari Install Banner - Shows on iOS Safari when not installed */}
        <SafariInstallBanner />
        
        {/* Unified Header + Tabs Sticky Container */}
        <div 
          className={`sticky z-50 transition-transform duration-100 ease-out ${
            showHeader ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ top: 'env(safe-area-inset-top)' }}
        >
          {/* Modern Header */}
          <div className="bg-card/80 backdrop-blur-md border-b border-border/20">
          <div className="flex items-center justify-between px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-4 sm:py-5 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 sm:space-x-5 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 sm:ring-3 ring-primary/15 shadow-md">
                  <AvatarImage src={partnerProfile?.photo} />
                  <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-medium" style={{ fontFamily: 'Archivo' }}>
                    {partnerProfile?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                {isConnected && (
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#6EDB3F] rounded-full border-2 sm:border-3 border-white shadow-sm"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-medium truncate" style={{ fontFamily: 'Archivo', letterSpacing: '-0.05em', marginTop: '-2px' }}>
                  {partnerProfile?.name || 'Not Connected'}
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-3 mt-0.5 sm:mt-1">
                  <Badge 
                    variant={isConnected ? "default" : "secondary"} 
                    className={`text-[10px] sm:text-xs font-medium ${isConnected ? 'bg-primary/15 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}
                    style={{ fontFamily: 'Inter' }}
                  >
                    {isConnected ? t('connected') : t('notConnected')}
                  </Badge>
                  <span className="text-[10px] sm:text-xs text-muted-foreground max-w-[60px] sm:max-w-[80px] leading-tight truncate" style={{ fontFamily: 'Inter', letterSpacing: '-0.04em' }}>
                    {memories.length} {t('memories')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 sm:w-12 sm:h-12 hover:bg-primary/5">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-[#36453B] flex flex-col py-4 sm:py-6 border-l-0">
                  {/* Compressed Header */}
                  <SheetHeader className="flex-shrink-0 px-4 sm:px-6 mb-3 sm:mb-4">
                    <SheetTitle className="text-white text-base sm:text-lg" style={{ fontFamily: 'Archivo', letterSpacing: '-0.05em' }}>Menu</SheetTitle>
                    <SheetDescription className="text-[#ECF0E2] text-xs sm:text-sm">
                      Settings & connected users
                    </SheetDescription>
                  </SheetHeader>
                  
                  {/* Compressed content - no scrolling, fits on screen */}
                  <div className="flex-1 px-4 sm:px-6 space-y-3 sm:space-y-4">
                    {/* User Account Section */}
                    <div className="pb-2 sm:pb-3 border-b" style={{ borderColor: 'rgba(54, 69, 59, 0.3)' }}>
                      <button
                        onClick={() => {
                          setShowAccountSettings(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white/20">
                          <AvatarImage src={userProfile.photo} />
                          <AvatarFallback className="bg-[#F1F1F1] text-[#36453B] text-sm" style={{ fontFamily: 'Archivo' }}>
                            {userProfile.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Archivo' }}>
                            {userProfile.name}
                          </p>
                          <p className="text-xs sm:text-sm text-[#ECF0E2] truncate" style={{ fontFamily: 'Inter' }}>
                            {userProfile.relationship}
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#ECF0E2]/70 flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Inter' }}>
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            View Settings
                          </p>
                        </div>
                      </button>
                    </div>

                    {userType === 'keeper' && storytellers.length > 0 && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <h3 className="text-xs sm:text-sm font-medium text-[#ECF0E2] px-1" style={{ fontFamily: 'Inter' }}>
                          Switch Storyteller
                        </h3>
                        <div className="space-y-1 sm:space-y-1.5">
                          {storytellers.map((storyteller) => (
                            <button
                              key={storyteller.id}
                              onClick={() => {
                                onSwitchStoryteller?.(storyteller.id);
                                setIsMenuOpen(false);
                                // Mark messages as read for this connection when switching to them
                                const now = Date.now();
                                localStorage.setItem(`lastChatRead_${userProfile.id}_${storyteller.id}`, now.toString());
                                // Update the main chat read timestamp too
                                setLastChatReadTimestamp(now);
                                localStorage.setItem(`lastChatRead_${userProfile.id}`, now.toString());
                              }}
                              className={`w-full flex items-center space-x-2 sm:space-x-2.5 p-2 sm:p-2.5 rounded-lg transition-colors ${
                                activeStorytellerId === storyteller.id
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              <div className="relative">
                                <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                                  <AvatarImage src={storyteller.photo} />
                                  <AvatarFallback className="bg-[#F1F1F1] text-[#36453B] text-sm" style={{ fontFamily: 'Archivo' }}>
                                    {storyteller.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {storyteller.isConnected && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#6EDB3F] rounded-full border-2 border-[#36453B]"></div>
                                )}
                                {/* Unread message badge */}
                                {getUnreadCountForConnection(storyteller.id) > 0 && (
                                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[#36453B] animate-pulse">
                                    {getUnreadCountForConnection(storyteller.id) > 9 ? '9+' : getUnreadCountForConnection(storyteller.id)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                                    <p className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Archivo' }}>{storyteller.name}</p>
                                    {activeStorytellerId === storyteller.id && (
                                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'rgb(193, 193, 165)' }} />
                                    )}
                                  </div>
                                  {getUnreadCountForConnection(storyteller.id) > 0 && (
                                    <span className="text-[10px] sm:text-xs font-medium text-white bg-red-500/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Inter' }}>
                                      {getUnreadCountForConnection(storyteller.id)} new
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-[#ECF0E2] truncate" style={{ fontFamily: 'Inter' }}>
                                  {storyteller.lastMessage || storyteller.relationship}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {userType === 'teller' && legacyKeepers.length > 0 && (
                      <div className="space-y-1.5 sm:space-y-2 pb-2 sm:pb-3 border-b" style={{ borderColor: 'rgba(54, 69, 59, 0.3)' }}>
                        <h3 className="text-xs sm:text-sm font-medium text-[#ECF0E2] px-1" style={{ fontFamily: 'Inter' }}>
                          Connected Legacy Keepers
                        </h3>
                        <div className="space-y-1 sm:space-y-1.5">
                          {legacyKeepers.map((legacyKeeper) => (
                            <button
                              key={legacyKeeper.id}
                              onClick={() => {
                                onSwitchLegacyKeeper?.(legacyKeeper.id);
                                setIsMenuOpen(false);
                                // Mark messages as read for this connection when switching to them
                                const now = Date.now();
                                localStorage.setItem(`lastChatRead_${userProfile.id}_${legacyKeeper.id}`, now.toString());
                                // Update the main chat read timestamp too
                                setLastChatReadTimestamp(now);
                                localStorage.setItem(`lastChatRead_${userProfile.id}`, now.toString());
                              }}
                              className={`w-full flex items-center space-x-2 sm:space-x-2.5 p-2 sm:p-2.5 rounded-lg transition-colors ${
                                activeLegacyKeeperId === legacyKeeper.id
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              <div className="relative">
                                <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                                  <AvatarImage src={legacyKeeper.photo} />
                                  <AvatarFallback className="bg-[#F1F1F1] text-[#36453B] text-sm" style={{ fontFamily: 'Archivo' }}>
                                    {legacyKeeper.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {legacyKeeper.isConnected && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#6EDB3F] rounded-full border-2 border-[#36453B]"></div>
                                )}
                                {/* Unread message badge */}
                                {getUnreadCountForConnection(legacyKeeper.id) > 0 && (
                                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[#36453B] animate-pulse">
                                    {getUnreadCountForConnection(legacyKeeper.id) > 9 ? '9+' : getUnreadCountForConnection(legacyKeeper.id)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                                    <p className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Archivo' }}>{legacyKeeper.name}</p>
                                    {activeLegacyKeeperId === legacyKeeper.id && (
                                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'rgb(193, 193, 165)' }} />
                                    )}
                                  </div>
                                  {getUnreadCountForConnection(legacyKeeper.id) > 0 && (
                                    <span className="text-[10px] sm:text-xs font-medium text-white bg-red-500/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Inter' }}>
                                      {getUnreadCountForConnection(legacyKeeper.id)} new
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-[#ECF0E2] truncate" style={{ fontFamily: 'Inter' }}>
                                  {legacyKeeper.lastMessage || legacyKeeper.relationship}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Menu Items - Compressed */}
                    <div className="space-y-0.5 sm:space-y-1">
                      {/* Keepers: Create Invitation + Manage Invitations + Connections */}
                      {userType === 'keeper' && (
                        <>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowInvitationDialog(true);
                            }}
                          >
                            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            {t('createInvitation')}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                            onClick={() => {
                              setShowInvitationManagement(true);
                              setIsMenuOpen(false);
                            }}
                          >
                            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Manage Invitations
                          </Button>

                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm relative"
                            onClick={() => {
                              setShowKeeperConnections(true);
                              setIsMenuOpen(false);
                            }}
                          >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Connections
                            {pendingRequestsCount > 0 && (
                              <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                              </span>
                            )}
                          </Button>
                        </>
                      )}

                      {/* Tellers: Unified Connections Page (Requests + Active) */}
                      {userType === 'teller' && (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm relative"
                          onClick={() => {
                            setShowTellerConnections(true);
                            setIsMenuOpen(false);
                          }}
                        >
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                          Connections
                          {pendingRequestsCount > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                              {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                            </span>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          setShowNotifications(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        {t('notifications')}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          setShowPrivacySecurity(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        {t('privacy')}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          setShowStorageData(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        {t('storageData')}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          setShowHelpFeedback(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        {t('help')}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          signout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          </div>

          {/* Tab Navigation Bar */}
          <div className="bg-card/80 backdrop-blur-md border-b border-border/20">
            <div className="grid grid-cols-3 gap-1.5 p-2 sm:p-2.5 max-w-4xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16">
              <button
                onClick={() => handleTabChange('prompts')}
                className={`flex items-center justify-center gap-2 rounded-lg transition-all duration-200 py-2.5 sm:py-3 text-sm font-semibold ${
                  activeTab === 'prompts' ? 'shadow-sm' : 'hover:bg-muted/50'
                }`}
                style={{ 
                  fontFamily: 'Inter',
                  ...(activeTab === 'prompts' ? { backgroundColor: 'rgb(54, 69, 59)', color: 'rgb(255, 255, 255)' } : {})
                }}
              >
                <Zap className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{t('prompts')}</span>
              </button>
              <button
                onClick={() => handleTabChange('chat')}
                className={`flex items-center justify-center gap-2 rounded-lg transition-all duration-200 py-2.5 sm:py-3 text-sm font-semibold relative ${
                  activeTab === 'chat' ? 'shadow-sm' : 'hover:bg-muted/50'
                }`}
                style={{ 
                  fontFamily: 'Inter',
                  ...(activeTab === 'chat' ? { backgroundColor: 'rgb(54, 69, 59)', color: 'rgb(255, 255, 255)' } : {})
                }}
              >
                <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{t('chat')}</span>
                {unreadMessageCount > 0 && activeTab !== 'chat' && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-background animate-pulse">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('media')}
                className={`flex items-center justify-center gap-2 rounded-lg transition-all duration-200 py-2.5 sm:py-3 text-sm font-semibold ${
                  activeTab === 'media' ? 'shadow-sm' : 'hover:bg-muted/50'
                }`}
                style={{ 
                  fontFamily: 'Inter',
                  ...(activeTab === 'media' ? { backgroundColor: 'rgb(54, 69, 59)', color: 'rgb(255, 255, 255)' } : {})
                }}
              >
                <Image className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{t('mediaLibrary')}</span>
              </button>
            </div>
          </div>
        </div>
        {/* End Unified Header + Tabs Sticky Container */}

        {/* Tab Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'prompts' && (
            <div className="pt-4 px-4 pb-6 sm:pt-6 sm:px-6 sm:pb-8 flex-1">
              <PromptsTab 
                userType={userType}
                partnerName={partnerProfile?.name}
                onAddMemory={onAddMemory}
                memories={validatedMemories}
                onNavigateToChat={handleNavigateToChat}
              />
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="m-0 p-0 flex-1 flex flex-col">
              <ChatTab 
                userType={userType}
                userProfile={userProfile}
                partnerProfile={partnerProfile}
                memories={validatedMemories}
                onAddMemory={onAddMemory}
                activePrompt={activePrompt}
                onClearPrompt={() => setActivePrompt(null)}
                onEditMemory={onEditMemory}
                onDeleteMemory={onDeleteMemory}
                onScrollUp={() => {
                  setShowHeader(true);
                }}
                onScrollDown={() => {
                  setShowHeader(false);
                }}
                shouldScrollToBottom={shouldScrollChatToBottom}
                onScrollToBottomComplete={() => setShouldScrollChatToBottom(false)}
              />
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="pt-4 px-4 pb-6 sm:pt-6 sm:px-6 sm:pb-8 flex-1">
              <MediaLibraryTab 
                memories={validatedMemories}
                userType={userType}
                userAge={userProfile.age || 20}
                partnerBirthday={partnerProfile?.birthday}
                onEditMemory={onEditMemory}
                onDeleteMemory={onDeleteMemory}
              />
            </div>
          )}
        </div>


        {/* Account Settings Dialog */}
        <AccountSettings
          isOpen={showAccountSettings}
          onClose={() => setShowAccountSettings(false)}
          userProfile={userProfile}
          onUpdateProfile={onUpdateProfile}
        />

        {/* Notifications Dialog */}
        <Notifications
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          userId={userProfile.id}
        />

        {/* Privacy Security Dialog */}
        <PrivacySecurity
          isOpen={showPrivacySecurity}
          onClose={() => setShowPrivacySecurity(false)}
          userProfile={userProfile}
          onUpdateProfile={onUpdateProfile}
          onLogout={signout}
        />

        {/* Storage Data Dialog */}
        <StorageData
          isOpen={showStorageData}
          onClose={() => setShowStorageData(false)}
          userId={userProfile.id}
        />

        {/* Help Feedback Dialog */}
        <HelpFeedback
          isOpen={showHelpFeedback}
          onClose={() => setShowHelpFeedback(false)}
        />

        {/* Invitation Dialog */}
        <InvitationDialog
          isOpen={showInvitationDialog}
          onClose={() => setShowInvitationDialog(false)}
          userType={userType}
          onCreateInvitation={onCreateInvitation}
          onConnectViaEmail={onConnectViaEmail}
          onAcceptInvitation={onAcceptInvitation}
        />

        {/* Invitation Management Dialog (Keepers only) */}
        {userType === 'keeper' && (
          <InvitationManagement
            isOpen={showInvitationManagement}
            onClose={() => setShowInvitationManagement(false)}
            onCreateNew={() => setShowInvitationDialog(true)}
          />
        )}

        {/* Keeper Connections (Unified Requests + Active) */}
        {userType === 'keeper' && (
          <KeeperConnections
            isOpen={showKeeperConnections}
            onClose={() => {
              setShowKeeperConnections(false);
              loadPendingRequestsCount();
            }}
            onConnectionsChanged={() => {
              // Reload the page to refresh connections
              window.location.reload();
            }}
            pendingCount={pendingRequestsCount}
          />
        )}

        {/* Teller Connections (Unified Requests + Active) */}
        <TellerConnections
          isOpen={showTellerConnections}
          onClose={() => {
            setShowTellerConnections(false);
            loadPendingRequestsCount();
          }}
          onConnectionsChanged={() => {
            // Reload the page to refresh connections
            window.location.reload();
          }}
          pendingCount={pendingRequestsCount}
        />

        {/* In-App Toast Notifications - Shows notifications even when on chat tab */}
        <InAppToastContainer
          notifications={toasts}
          onClose={closeToast}
          position="top-center"
        />
      </div>
    </>
  );
}