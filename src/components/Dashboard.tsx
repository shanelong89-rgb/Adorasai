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
import { Menu, Zap, MessageCircle, Image, User, Check, UserPlus, Bell, Shield, Database, HelpCircle, LogOut } from 'lucide-react';
import adorasLogo from 'figma:asset/c0ceb92d68e5b47f201fa6ace32aa529988746ee.png';
import { useAuth } from '../utils/api/AuthContext';
import type { PresenceState } from '../utils/realtimeSync';
import { useTranslation } from '../utils/i18n';
import { NotificationMiniBadge } from './NotificationBadge';
import { showNativeNotificationBanner } from '../utils/notificationService';

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
  onAcceptInvitation?: (invitationCode: string) => Promise<{ success: boolean; message?: string; error?: string }>;
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
  onAcceptInvitation
}: DashboardProps) {
  const { signout } = useAuth();
  const { t } = useTranslation(userProfile.appLanguage || 'english');
  const [activeTab, setActiveTab] = useState('prompts');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);
  const [showStorageData, setShowStorageData] = useState(false);
  const [showHelpFeedback, setShowHelpFeedback] = useState(false);
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef(0);
  const [lastChatReadTimestamp, setLastChatReadTimestamp] = useState<number>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`lastChatRead_${userProfile.id}`);
    return stored ? parseInt(stored) : Date.now();
  });

  // Refs for tab content containers to handle scrolling
  const promptsContainerRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Calculate unread message count (messages from partner since last read)
  const unreadMessageCount = React.useMemo(() => {
    if (!partnerProfile) return 0;
    
    return memories.filter(memory => {
      // Only count messages (text or voice messages) from partner
      const isFromPartner = memory.senderId === partnerProfile.id;
      const isMessage = memory.type === 'text' || memory.type === 'voice';
      const isUnread = memory.timestamp.getTime() > lastChatReadTimestamp;
      
      return isFromPartner && isMessage && isUnread;
    }).length;
  }, [memories, partnerProfile, lastChatReadTimestamp]);

  // Update document title with unread count
  useEffect(() => {
    if (unreadMessageCount > 0 && activeTab !== 'chat') {
      document.title = `(${unreadMessageCount}) Adoras`;
    } else {
      document.title = 'Adoras';
    }
  }, [unreadMessageCount, activeTab]);

  // Track previous memory count to detect new messages
  const prevMemoryCountRef = useRef(memories.length);
  
  useEffect(() => {
    // Check if a new message was added (not just initial load)
    if (memories.length > prevMemoryCountRef.current && prevMemoryCountRef.current > 0) {
      const newMemory = memories[memories.length - 1];
      
      // Only notify if:
      // 1. It's from partner
      // 2. It's a message (text or voice)
      // 3. User is not currently on chat tab
      if (
        partnerProfile &&
        newMemory.senderId === partnerProfile.id &&
        (newMemory.type === 'text' || newMemory.type === 'voice') &&
        activeTab !== 'chat'
      ) {
        // Show iOS native notification banner (like iMessage)
        const messagePreview = newMemory.type === 'voice' 
          ? '🎤 Voice message' 
          : newMemory.content.substring(0, 100);
        
        showNativeNotificationBanner(
          partnerProfile.name,
          messagePreview,
          {
            icon: partnerProfile.photo || '/apple-touch-icon.png',
            tag: `message_${newMemory.id}`,
            data: {
              memoryId: newMemory.id,
              senderId: newMemory.senderId,
              type: 'message',
            },
            onClick: () => {
              // Navigate to chat tab when notification is clicked
              setActiveTab('chat');
            },
          }
        );

        // Play subtle notification sound
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

        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 100, 50]);
        }
      }
    }
    
    prevMemoryCountRef.current = memories.length;
  }, [memories, partnerProfile, activeTab]);

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
    
    // Mark messages as read when switching to chat tab
    if (newTab === 'chat') {
      const now = Date.now();
      setLastChatReadTimestamp(now);
      localStorage.setItem(`lastChatRead_${userProfile.id}`, now.toString());
    }
    
    // Auto-scroll behavior on tab change
    // Prompts and Media tabs: scroll to top
    // Chat tab: stays at latest message (bottom) - handled by ChatTab component
    if (newTab === 'prompts') {
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
      <div className="fixed inset-0 -top-20 bg-background -z-10"></div>
      
      <div className="min-h-screen bg-transparent animate-fade-in max-w-[1400px] mx-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-[20px]">
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
                <SheetContent className="bg-[#36453B] flex flex-col py-4 sm:py-6">
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
                    <div className="pb-2 sm:pb-3 border-b border-[#ECF0E2]/20">
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

                    {userType === 'child' && storytellers.length > 0 && (
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
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <p className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Archivo' }}>{storyteller.name}</p>
                                  {activeStorytellerId === storyteller.id && (
                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-[#ECF0E2] truncate" style={{ fontFamily: 'Inter' }}>
                                  {storyteller.relationship}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {userType === 'teller' && legacyKeepers.length > 0 && (
                      <div className="space-y-1.5 sm:space-y-2 pb-2 sm:pb-3 border-b border-[#ECF0E2]/20">
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
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <p className="font-medium text-white text-sm sm:text-base truncate" style={{ fontFamily: 'Archivo' }}>{legacyKeeper.name}</p>
                                  {activeLegacyKeeperId === legacyKeeper.id && (
                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-[#ECF0E2] truncate" style={{ fontFamily: 'Inter' }}>
                                  {legacyKeeper.relationship}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Menu Items - Compressed */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-[#F1F1F1] h-9 sm:h-10 text-sm"
                        onClick={() => {
                          // Handle invite friend
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
            <div className="grid w-full grid-cols-3 p-1 sm:p-1.5 h-11 sm:h-12">
              <button
                onClick={() => handleTabChange('prompts')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2 ${
                  activeTab === 'prompts' ? 'bg-primary text-primary-foreground' : ''
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('prompts')}</span>
              </button>
              <button
                onClick={() => handleTabChange('chat')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2 relative ${
                  activeTab === 'chat' ? 'bg-primary text-primary-foreground' : ''
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('chat')}</span>
                {unreadMessageCount > 0 && activeTab !== 'chat' && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold bg-red-500 text-white rounded-full border-2 border-background animate-pulse">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('media')}
                className={`flex items-center justify-center space-x-1 sm:space-x-2 rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2 ${
                  activeTab === 'media' ? 'bg-primary text-primary-foreground' : ''
                }`}
                style={{ fontFamily: 'Inter' }}
              >
                <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('mediaLibrary')}</span>
              </button>
            </div>
          </div>
        </div>
        {/* End Unified Header + Tabs Sticky Container */}

        {/* Tab Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'prompts' && (
            <div className="m-0 pt-0 px-2 pb-3 sm:px-4 sm:pb-4 flex-1">
              <PromptsTab 
                userType={userType}
                partnerName={partnerProfile?.name}
                onAddMemory={onAddMemory}
                memories={memories}
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
                memories={memories}
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
              />
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="m-0 pt-4 px-2 pb-3 sm:px-4 sm:pb-4 flex-1">
              <MediaLibraryTab 
                memories={memories}
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
          onAcceptInvitation={onAcceptInvitation}
        />
      </div>
    </>
  );
}