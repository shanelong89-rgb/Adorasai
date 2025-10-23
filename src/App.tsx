import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UserTypeSelection } from './components/UserTypeSelection';
import { KeeperOnboarding } from './components/KeeperOnboarding';
import { TellerOnboarding } from './components/TellerOnboarding';
import { Dashboard } from './components/Dashboard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';

export type UserType = 'keeper' | 'teller' | null;

export type AppLanguage = 'english' | 'spanish' | 'french' | 'chinese' | 'korean' | 'japanese';

export interface UserProfile {
  name: string;
  age?: number;
  relationship: string;
  bio: string;
  photo?: string;
  inviteCode?: string;
  email?: string;
  birthday?: Date;
  phoneNumber?: string;
  appLanguage?: AppLanguage;
}

export interface Storyteller {
  id: string;
  name: string;
  relationship: string;
  bio: string;
  photo?: string;
  isConnected: boolean;
}

export interface LegacyKeeper {
  id: string;
  name: string;
  relationship: string;
  bio: string;
  photo?: string;
  isConnected: boolean;
}

export interface Memory {
  id: string;
  type: 'text' | 'photo' | 'voice' | 'video' | 'document';
  content: string;
  sender: 'keeper' | 'teller';
  timestamp: Date;
  category?: string;
  estimatedDate?: string;
  tags: string[];
  transcript?: string;
  originalText?: string;
  promptQuestion?: string;
  conversationContext?: string; // Recent chat messages for date context extraction
  voiceLanguage?: string; // Language of the voice memo (e.g., "Spanish", "English")
  voiceLanguageCode?: string; // Language code (e.g., "es", "en")
  transcriptionShown?: boolean; // Whether transcription is visible
  translationShown?: boolean; // Whether English translation is visible
  englishTranslation?: string; // English translation of the transcript
  isPlaying?: boolean; // Whether voice is currently playing
  audioUrl?: string; // Base64 data URL for audio storage
  audioBlob?: string; // Blob URL for audio playback
  notes?: string; // Admin notes added by Legacy Keeper
  location?: string; // Location where memory was created
  photoUrl?: string; // URL or data URL for photo
  photoDate?: Date; // Date extracted from photo EXIF data
  photoLocation?: string; // Location extracted from photo EXIF GPS data (city, country format)
  photoGPSCoordinates?: { latitude: number; longitude: number }; // Raw GPS coordinates from photo
  detectedPeople?: string[]; // Names of people detected in photo
  detectedFaces?: number; // Number of faces detected
  videoUrl?: string; // URL or data URL for video
  videoDate?: Date; // Date extracted from video metadata
  videoLocation?: string; // Location extracted from video GPS data (city, country format)
  videoGPSCoordinates?: { latitude: number; longitude: number }; // Raw GPS coordinates from video
  videoPeople?: string[]; // Names of people detected in video
  videoFaces?: number; // Number of faces detected in video
  voiceVisualReference?: string; // Photo URL as visual reference for voice memo
  documentUrl?: string; // URL or data URL for document
  documentType?: string; // File type (pdf, docx, xlsx, pptx, jpg, png)
  documentFileName?: string; // Original filename
  documentScannedText?: string; // OCR/extracted text from document
  documentPageCount?: number; // Number of pages (for PDFs/Office docs)
  documentScanLanguage?: string; // Detected language of scanned text
}

export type DisplayLanguage = 'english' | 'french' | 'chinese' | 'korean' | 'japanese' | 'all';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'userType' | 'keeperOnboarding' | 'tellerOnboarding' | 'dashboard'>('welcome');
  const [userType, setUserType] = useState<UserType>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

  const handleWelcomeNext = () => {
    setCurrentScreen('userType');
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === 'keeper') {
      setCurrentScreen('keeperOnboarding');
    } else {
      setCurrentScreen('tellerOnboarding');
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentScreen('dashboard');
    
    // Simulate connection and mock storytellers
    if (userType === 'keeper') {
      // Use storyteller info from onboarding if provided
      const storytellerFromOnboarding = profile.storytellerInfo;
      
      const mockStorytellers: Storyteller[] = [
        storytellerFromOnboarding && storytellerFromOnboarding.name ? {
          id: 'primary',
          name: storytellerFromOnboarding.name,
          relationship: storytellerFromOnboarding.relationship || 'Family',
          bio: storytellerFromOnboarding.bio || '',
          photo: storytellerFromOnboarding.photo,
          isConnected: false // Not connected yet, waiting for invitation acceptance
        } : {
          id: 'dad',
          name: 'Dad',
          relationship: 'Father',
          bio: 'Your father who loves telling stories about his childhood',
          isConnected: true
        },
        {
          id: 'grandma',
          name: 'Grandma',
          relationship: 'Grandmother',
          bio: 'Your grandmother with endless wisdom and family stories',
          isConnected: true
        }
      ];
      
      setStorytellers(mockStorytellers);
      setActiveStorytellerId(storytellerFromOnboarding && storytellerFromOnboarding.name ? 'primary' : 'dad');
      
      // Add sample voice message with Chinese to English translation
      const sampleVoiceMessage: Memory = {
        id: 'sample-voice-1',
        type: 'voice',
        content: '9\"',
        sender: 'teller',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        category: 'Voice',
        tags: ['voice', 'translation'],
        originalText: '行，搞了你们搞个 high manager，有没有回复你呀？',
        transcript: 'Alright, let\'s get a high-ranking manager involved. Has anyone responded to you yet?'
      };
      
      const dadMemory: Memory = {
        id: 'dad-message-1',
        type: 'text',
        content: 'Hey kiddo! Remember that time we went fishing?',
        sender: 'teller',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        category: 'Chat',
        tags: ['chat', 'memory']
      };
      
      const primaryId = storytellerFromOnboarding && storytellerFromOnboarding.name ? 'primary' : 'dad';
      
      setMemoriesByStoryteller({
        'primary': storytellerFromOnboarding && storytellerFromOnboarding.name ? [] : [sampleVoiceMessage],
        'dad': [dadMemory],
        'grandma': []
      });
      
      setMemories(primaryId === 'primary' ? [] : [sampleVoiceMessage]);
      setPartnerProfile({
        name: storytellerFromOnboarding && storytellerFromOnboarding.name ? storytellerFromOnboarding.name : 'Dad',
        relationship: storytellerFromOnboarding && storytellerFromOnboarding.relationship ? storytellerFromOnboarding.relationship : 'Father',
        bio: storytellerFromOnboarding && storytellerFromOnboarding.bio ? storytellerFromOnboarding.bio : 'Your father who loves telling stories about his childhood',
        photo: storytellerFromOnboarding && storytellerFromOnboarding.photo ? storytellerFromOnboarding.photo : '/api/placeholder/100/100',
        birthday: storytellerFromOnboarding && storytellerFromOnboarding.birthday ? storytellerFromOnboarding.birthday : new Date(1962, 0, 1) // Default to Jan 1, 1962 if not provided
      });
    } else {
      // Mock Legacy Keepers for parent/storyteller view
      const mockLegacyKeepers: LegacyKeeper[] = [
        {
          id: 'alex',
          name: 'Alex',
          relationship: 'Son',
          bio: 'College student studying computer science',
          photo: '/api/placeholder/100/100',
          isConnected: true
        },
        {
          id: 'sarah',
          name: 'Sarah',
          relationship: 'Daughter',
          bio: 'High school senior, loves photography',
          photo: '/api/placeholder/100/100',
          isConnected: true
        },
        {
          id: 'michael',
          name: 'Michael',
          relationship: 'Son',
          bio: 'Working as a software engineer in Seattle',
          photo: '/api/placeholder/100/100',
          isConnected: false
        }
      ];
      
      setLegacyKeepers(mockLegacyKeepers);
      setActiveLegacyKeeperId('alex');
      
      setPartnerProfile({
        name: 'Alex',
        age: 23,
        relationship: 'Son',
        bio: 'College student studying computer science',
        photo: '/api/placeholder/100/100'
      });
      
      // Add sample voice message for elder view
      const alexVoiceMessage: Memory = {
        id: 'sample-voice-1',
        type: 'voice',
        content: '9\"',
        sender: 'keeper',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        category: 'Voice',
        tags: ['voice', 'translation'],
        originalText: '行，搞了你们搞个 high manager，有没有回复你呀？',
        transcript: 'Alright, let\'s get a high-ranking manager involved. Has anyone responded to you yet?'
      };
      
      const sarahTextMessage: Memory = {
        id: 'sarah-message-1',
        type: 'text',
        content: 'Mom! I just got accepted to NYU!',
        sender: 'keeper',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        category: 'Chat',
        tags: ['chat', 'milestone']
      };
      
      setMemoriesByLegacyKeeper({
        'alex': [alexVoiceMessage],
        'sarah': [sarahTextMessage],
        'michael': []
      });
      
      setMemories([alexVoiceMessage]);
    }
    setIsConnected(true);
  };

  const handleAddMemory = (memory: Omit<Memory, 'id' | 'timestamp'>) => {
    console.log('📝 App.tsx - Adding new memory:', {
      type: memory.type,
      photoLocation: memory.photoLocation,
      videoLocation: memory.videoLocation,
      hasPhotoGPS: !!memory.photoGPSCoordinates,
      hasVideoGPS: !!memory.videoGPSCoordinates
    });
    
    const newMemory: Memory = {
      ...memory,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    console.log('✅ Created memory with ID:', newMemory.id);
    if (newMemory.type === 'video' && newMemory.videoLocation) {
      console.log('✅ Video memory has location:', newMemory.videoLocation);
    }
    if (newMemory.type === 'photo' && newMemory.photoLocation) {
      console.log('✅ Photo memory has location:', newMemory.photoLocation);
    }
    setMemories(prev => [...prev, newMemory]);
    
    // Also update storyteller-specific memories if in child mode
    if (userType === 'keeper' && activeStorytellerId) {
      setMemoriesByStoryteller(prev => ({
        ...prev,
        [activeStorytellerId]: [...(prev[activeStorytellerId] || []), newMemory]
      }));
    }
    
    // Also update legacy keeper-specific memories if in parent mode
    if (userType === 'teller' && activeLegacyKeeperId) {
      setMemoriesByLegacyKeeper(prev => ({
        ...prev,
        [activeLegacyKeeperId]: [...(prev[activeLegacyKeeperId] || []), newMemory]
      }));
    }
  };
  
  const handleSwitchStoryteller = (storytellerId: string) => {
    const storyteller = storytellers.find(s => s.id === storytellerId);
    if (storyteller) {
      setActiveStorytellerId(storytellerId);
      setPartnerProfile({
        name: storyteller.name,
        relationship: storyteller.relationship,
        bio: storyteller.bio,
        photo: storyteller.photo
      });
      setMemories(memoriesByStoryteller[storytellerId] || []);
      setIsConnected(storyteller.isConnected);
    }
  };
  
  const handleSwitchLegacyKeeper = (legacyKeeperId: string) => {
    const legacyKeeper = legacyKeepers.find(lk => lk.id === legacyKeeperId);
    if (legacyKeeper) {
      setActiveLegacyKeeperId(legacyKeeperId);
      setPartnerProfile({
        name: legacyKeeper.name,
        relationship: legacyKeeper.relationship,
        bio: legacyKeeper.bio,
        photo: legacyKeeper.photo
      });
      setMemories(memoriesByLegacyKeeper[legacyKeeperId] || []);
      setIsConnected(legacyKeeper.isConnected);
    }
  };

  const handleEditMemory = (memoryId: string, updates: Partial<Memory>) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId ? { ...memory, ...updates } : memory
    ));
    
    // Also update storyteller-specific memories if in child mode
    if (userType === 'keeper' && activeStorytellerId) {
      setMemoriesByStoryteller(prev => ({
        ...prev,
        [activeStorytellerId]: (prev[activeStorytellerId] || []).map(memory =>
          memory.id === memoryId ? { ...memory, ...updates } : memory
        )
      }));
    }
    
    // Also update legacy keeper-specific memories if in parent mode
    if (userType === 'teller' && activeLegacyKeeperId) {
      setMemoriesByLegacyKeeper(prev => ({
        ...prev,
        [activeLegacyKeeperId]: (prev[activeLegacyKeeperId] || []).map(memory =>
          memory.id === memoryId ? { ...memory, ...updates } : memory
        )
      }));
    }
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== memoryId));
    
    // Also update storyteller-specific memories if in child mode
    if (userType === 'keeper' && activeStorytellerId) {
      setMemoriesByStoryteller(prev => ({
        ...prev,
        [activeStorytellerId]: (prev[activeStorytellerId] || []).filter(memory => memory.id !== memoryId)
      }));
    }
    
    // Also update legacy keeper-specific memories if in parent mode
    if (userType === 'teller' && activeLegacyKeeperId) {
      setMemoriesByLegacyKeeper(prev => ({
        ...prev,
        [activeLegacyKeeperId]: (prev[activeLegacyKeeperId] || []).filter(memory => memory.id !== memoryId)
      }));
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} />;
      case 'userType':
        return <UserTypeSelection onSelect={handleUserTypeSelect} />;
      case 'keeperOnboarding':
        return (
          <KeeperOnboarding
            onComplete={handleOnboardingComplete}
            onBack={() => setCurrentScreen('userType')}
          />
        );
      case 'tellerOnboarding':
        return (
          <TellerOnboarding
            onComplete={handleOnboardingComplete}
            onBack={() => setCurrentScreen('userType')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            userType={userType!}
            userProfile={userProfile!}
            partnerProfile={partnerProfile!}
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
          />
        );
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentScreen()}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </div>
  );
}