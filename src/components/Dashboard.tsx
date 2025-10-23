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
import { UserProfile, Memory, UserType, Storyteller, LegacyKeeper, DisplayLanguage } from '../App';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Menu, Zap, MessageCircle, Image, User, Check, UserPlus, Bell, Shield, Database, HelpCircle } from 'lucide-react';
import adorasLogo from 'figma:asset/c0ceb92d68e5b47f201fa6ace32aa529988746ee.png';

interface DashboardProps {
  userType: UserType;
  userProfile: UserProfile;
  partnerProfile: UserProfile;
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
  onUpdateProfile
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('prompts');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);
  const [showStorageData, setShowStorageData] = useState(false);
  const [showHelpFeedback, setShowHelpFeedback] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Refs for tab content containers to handle scrolling
  const promptsContainerRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Initial scroll to top on mount (for Prompts tab after onboarding)
  useEffect(() => {
    // Scroll to top immediately on mount to ensure Prompts tab starts at top
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Scroll detection for Chat tab
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only apply hide/show logic in Chat tab
      if (activeTab === 'chat') {
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          // Scrolling down - hide header
          setShowHeader(false);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up - show header immediately
          setShowHeader(true);
        }
      } else {
        // Always show header in other tabs
        setShowHeader(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Handle tab changes and auto-scroll
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Always show header when switching tabs
    setShowHeader(true);
    
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
    <div className="min-h-screen bg-background animate-fade-in max-w-[1400px] mx-auto">
      {/* Modern Header */}
      <div 
        className={`border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 border-border/20 transition-transform duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-[20px]">
          <div className="flex items-center space-x-3 sm:space-x-5 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 sm:ring-3 ring-primary/15 shadow-md">
                <AvatarImage src={partnerProfile.photo} />
                <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-medium" style={{ fontFamily: 'Archivo' }}>
                  {partnerProfile.name[0]}
                </AvatarFallback>
              </Avatar>
              {isConnected && (
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#6EDB3F] rounded-full border-2 sm:border-3 border-white shadow-sm"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-medium truncate" style={{ fontFamily: 'Archivo', letterSpacing: '-0.05em', marginTop: '-2px' }}>
                {partnerProfile.name}
              </h1>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-0.5 sm:mt-1">
                <Badge 
                  variant={isConnected ? "default" : "secondary"} 
                  className={`text-[10px] sm:text-xs font-medium ${isConnected ? 'bg-primary/15 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}
                  style={{ fontFamily: 'Inter' }}
                >
                  {isConnected ? 'Connected' : 'Waiting...'}
                </Badge>
                <span className="text-[10px] sm:text-xs text-muted-foreground max-w-[60px] sm:max-w-[80px] leading-tight truncate" style={{ fontFamily: 'Inter', letterSpacing: '-0.04em' }}>
                  {memories.length} memories
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
                      }}
                    >
                      <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Invite a Friend
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
                      Notifications
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
                      Privacy
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
                      Storage & Data
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
                      Help & Feedback
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 px-2 sm:px-4">
        <TabsList className={`grid w-full grid-cols-3 rounded-none border-b bg-background/80 backdrop-blur-sm p-1 sm:p-1.5 h-11 sm:h-12 border-border/20 sticky top-[73px] sm:top-[105px] z-40 transition-transform duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <TabsTrigger 
            value="prompts" 
            className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2"
            style={{ fontFamily: 'Inter' }}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Prompts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat"
            className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2"
            style={{ fontFamily: 'Inter' }}
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="media"
            className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm font-medium px-2"
            style={{ fontFamily: 'Inter' }}
          >
            <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Media</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="m-0 pt-0 px-3 pb-3 sm:px-4 sm:pb-4">
          <PromptsTab 
            userType={userType}
            partnerName={partnerProfile.name}
            onAddMemory={onAddMemory}
            memories={memories}
            onNavigateToChat={handleNavigateToChat}
          />
        </TabsContent>

        <TabsContent value="chat" className="m-0 p-0 h-[calc(100vh-150px)] sm:h-[calc(100vh-180px)]">
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
          />
        </TabsContent>

        <TabsContent value="media" className="m-0 pt-0 px-3 pb-3 sm:px-4 sm:pb-4">
          <MediaLibraryTab 
            memories={memories}
            userType={userType}
            userAge={userProfile.age || 20}
            partnerBirthday={partnerProfile.birthday}
            onEditMemory={onEditMemory}
            onDeleteMemory={onDeleteMemory}
          />
        </TabsContent>
      </Tabs>

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
      />

      {/* Help Feedback Dialog */}
      <HelpFeedback
        isOpen={showHelpFeedback}
        onClose={() => setShowHelpFeedback(false)}
      />
    </div>
  );
}