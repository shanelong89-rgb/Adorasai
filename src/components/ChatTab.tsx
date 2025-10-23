import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Memory, UserProfile, UserType } from '../App';
import { Send, Camera, Mic, Paperclip, Play, Pause, Smile, Plus, Languages, Video, BookOpen, MessageSquarePlus, X, Volume2, FileText, Quote, File, ScanText, Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu';
import { extractPhotoMetadata, extractVideoMetadata, extractVideoCreationDate } from '../utils/exifExtractor';
import { scanDocument, detectLanguage } from '../utils/documentScanner';
import { SpeechTranscriber, TranscriptionResult, detectLanguageFromText, translateToEnglish } from '../utils/speechTranscription';
import { AudioRecorder } from '../utils/audioRecorder';
import { AudioTranscriber } from '../utils/audioTranscriber';

// Natural language date parsing function
function parseChronologicalDate(content: string, currentAge: number = 20, partnerBirthday?: Date): Date | null {
  const currentYear = new Date().getFullYear();
  const lowerContent = content.toLowerCase();
  
  // Pattern: "X years ago" or "X year ago"
  const yearsAgoMatch = lowerContent.match(/(\d+)\s+years?\s+ago/);
  if (yearsAgoMatch) {
    const yearsAgo = parseInt(yearsAgoMatch[1]);
    const year = currentYear - yearsAgo;
    return new Date(year, 0, 1);
  }
  
  // Pattern: "when you were X" or "when I was X" or "at age X" or "X years old"
  const ageMatch = lowerContent.match(/(?:when (?:you|i|he|she) (?:were|was)|at age|was about)\s+(\d+)|(\d+)\s+years?\s+old/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1] || ageMatch[2]);
    
    // If the text says "you were X", use partner's birthday; otherwise use current user's age
    let referenceAge = currentAge;
    if (lowerContent.includes('you were') || lowerContent.includes('you was')) {
      // Calculate partner's current age from their birthday
      if (partnerBirthday) {
        const birthYear = partnerBirthday.getFullYear();
        referenceAge = currentYear - birthYear;
      }
    }
    
    const yearDiff = referenceAge - age;
    const year = currentYear - yearDiff;
    
    // Check for season clues to set month
    let month = 0; // Default to January
    if (lowerContent.includes('spring')) {
      month = 3; // April
    } else if (lowerContent.includes('summer')) {
      month = 6; // July
    } else if (lowerContent.includes('fall') || lowerContent.includes('autumn')) {
      month = 9; // October
    } else if (lowerContent.includes('winter')) {
      month = 11; // December
    }
    
    return new Date(year, month, 15); // Use middle of month
  }
  
  // Pattern: "back in YYYY" or "in YYYY"
  const yearMatch = lowerContent.match(/(?:back in|in)\s+(19\d{2}|20\d{2})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    
    // Check for season clues
    let month = 0;
    if (lowerContent.includes('spring')) {
      month = 3;
    } else if (lowerContent.includes('summer')) {
      month = 6;
    } else if (lowerContent.includes('fall') || lowerContent.includes('autumn')) {
      month = 9;
    } else if (lowerContent.includes('winter')) {
      month = 11;
    }
    
    return new Date(year, month, 15);
  }
  
  // Pattern: "YYYY" as standalone year (e.g., "1995 was amazing")
  const standaloneYearMatch = lowerContent.match(/\b(19\d{2}|20\d{2})\b/);
  if (standaloneYearMatch) {
    const year = parseInt(standaloneYearMatch[1]);
    
    // Check for season clues
    let month = 0;
    if (lowerContent.includes('spring')) {
      month = 3;
    } else if (lowerContent.includes('summer')) {
      month = 6;
    } else if (lowerContent.includes('fall') || lowerContent.includes('autumn')) {
      month = 9;
    } else if (lowerContent.includes('winter')) {
      month = 11;
    }
    
    return new Date(year, month, 15);
  }
  
  return null;
}

interface ChatTabProps {
  userType: UserType;
  userProfile: UserProfile;
  partnerProfile: UserProfile;
  memories: Memory[];
  onAddMemory: (memory: Omit<Memory, 'id' | 'timestamp'>) => void;
  onEditMemory?: (memoryId: string, updates: Partial<Memory>) => void;
  activePrompt?: string | null;
  onClearPrompt?: () => void;
}

export function ChatTab({ 
  userType, 
  userProfile, 
  partnerProfile, 
  memories, 
  onAddMemory,
  onEditMemory,
  activePrompt,
  onClearPrompt
}: ChatTabProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [currentPromptContext, setCurrentPromptContext] = useState<string | null>(null);
  const [showPastPromptsSheet, setShowPastPromptsSheet] = useState(false);
  const [transcribingDocId, setTranscribingDocId] = useState<string | null>(null);
  const [voiceStates, setVoiceStates] = useState<{[key: string]: {
    isPlaying: boolean;
    transcriptionShown: boolean;
    translationShown: boolean;
  }}>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [transcribingMemoryId, setTranscribingMemoryId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micPermissionStatus, setMicPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTogglingRef = useRef(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePromptRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});
  
  // Audio recording refs
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({});
  const speechTranscriberRef = useRef<SpeechTranscriber | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const detectedLanguageRef = useRef<{ code: string; name: string }>({ code: 'en-US', name: 'English (US)' });
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const emojis = ['😊', '😂', '❤️', '👍', '🙏', '😍', '🎉', '😢', '😮', '🤔', '👏', '🌟', '💯', '🔥', '✨', '🎈', '🌸', '🌺', '🎂', '🎁', '📷', '🎵', '☀️', '🌙'];

  // Track the current prompt context - persists even after activePrompt is cleared
  useEffect(() => {
    if (activePrompt) {
      setCurrentPromptContext(activePrompt);
      // Note: Scroll behavior is now handled in the scroll effects section below (lines 1103+)
    }
  }, [activePrompt]);

  // Check microphone permission status on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setMicPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          });
        }
      } catch (error) {
        // Permissions API not supported, will check on first use
        console.log('Permissions API not supported');
      }
    };
    
    checkMicPermission();
  }, []);

  // Get all unique past prompts from memories
  const pastPrompts = React.useMemo(() => {
    const uniquePrompts = new Map<string, Date>();
    memories
      .filter(m => m.promptQuestion)
      .forEach(m => {
        if (!uniquePrompts.has(m.promptQuestion!)) {
          uniquePrompts.set(m.promptQuestion!, m.timestamp);
        } else {
          const existingDate = uniquePrompts.get(m.promptQuestion!)!;
          if (m.timestamp > existingDate) {
            uniquePrompts.set(m.promptQuestion!, m.timestamp);
          }
        }
      });
    
    return Array.from(uniquePrompts.entries())
      .map(([question, timestamp]) => ({ question, timestamp }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [memories]);

  const handleSelectPastPrompt = (promptQuestion: string) => {
    setCurrentPromptContext(promptQuestion);
    setShowPastPromptsSheet(false);
    toast.success('Replying to previous prompt');
  };

  const handleClearPromptContext = () => {
    setCurrentPromptContext(null);
    toast.success('Cleared prompt context');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onAddMemory({
        type: 'text',
        content: message.trim(),
        sender: userType as 'keeper' | 'teller',
        category: 'Chat',
        tags: currentPromptContext ? ['prompt', 'response', 'message', 'text'] : ['chat', 'message', 'text'],
        promptQuestion: currentPromptContext || undefined
      });
      setMessage('');
      if (activePrompt && onClearPrompt) {
        onClearPrompt();
      }
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a data URL for the photo preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target?.result as string;
        
        // Extract real EXIF metadata from the photo
        const metadata = await extractPhotoMetadata(file);
        
        // Generate suggested tags based on context
        const suggestedTags = ['family', 'memory'];
        if (currentPromptContext) suggestedTags.push('prompt-response');
        if (metadata.location) suggestedTags.push('travel');
        
        // Capture recent conversation context (last 5 text messages)
        const recentTextMessages = memories
          .filter(m => m.type === 'text')
          .slice(-5)
          .map(m => m.content)
          .join(' ');
        
        // Try to estimate photo date if not available from EXIF
        let estimatedPhotoDate = metadata.date;
        if (!estimatedPhotoDate && recentTextMessages) {
          const parsedDate = parseChronologicalDate(recentTextMessages, userProfile.age, partnerProfile.birthday);
          if (parsedDate) {
            estimatedPhotoDate = parsedDate;
            console.log('📅 Estimated photo date from chat context:', parsedDate);
          }
        }
        if (!estimatedPhotoDate && currentPromptContext) {
          const parsedDate = parseChronologicalDate(currentPromptContext, userProfile.age, partnerProfile.birthday);
          if (parsedDate) {
            estimatedPhotoDate = parsedDate;
            console.log('📅 Estimated photo date from prompt:', parsedDate);
          }
        }
        
        // Automatically add photo with extracted metadata
        onAddMemory({
          type: 'photo',
          content: `Photo: ${file.name}`,
          sender: userType as 'keeper' | 'teller',
          category: 'Photos',
          tags: suggestedTags,
          promptQuestion: currentPromptContext || undefined,
          conversationContext: recentTextMessages || undefined,
          photoUrl: photoUrl,
          photoDate: estimatedPhotoDate || undefined,
          photoLocation: metadata.location || undefined,
          photoGPSCoordinates: metadata.gpsCoordinates || undefined,
          detectedPeople: undefined, // Face detection would require additional AI service
          detectedFaces: 0
        });
        
        toast.success('Photo shared!');
        if (activePrompt && onClearPrompt) {
          onClearPrompt();
        }
      };
      reader.readAsDataURL(file);
      
      // Reset the input so the same file can be uploaded again if needed
      event.target.value = '';
    }
    // Close the upload menu
    setShowUploadMenu(false);
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Process all selected files
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      
      if (isVideo) {
        // Create a blob URL for the video preview (works better than data URL for videos)
        const videoUrl = URL.createObjectURL(file);
        
        // Extract video metadata including GPS and creation date
        const videoMetadata = await extractVideoMetadata(file);
        console.log('📹 Video metadata - location:', videoMetadata.location, 'date:', videoMetadata.date);
        
        // Generate suggested tags based on context
        const suggestedTags = ['video', 'memory'];
        if (currentPromptContext) suggestedTags.push('prompt-response');
        if (videoMetadata.location) suggestedTags.push('travel');
        
        console.log('📹 Creating video memory with location:', videoMetadata.location);
        // Automatically add video with extracted metadata
        onAddMemory({
          type: 'video',
          content: `Video: ${file.name}`,
          sender: userType as 'keeper' | 'teller',
          category: 'Video',
          tags: suggestedTags,
          promptQuestion: currentPromptContext || undefined,
          videoUrl: videoUrl,
          videoDate: videoMetadata.date || undefined,
          videoLocation: videoMetadata.location || undefined,
          videoGPSCoordinates: videoMetadata.gpsCoordinates || undefined,
          videoPeople: undefined, // Face detection would require additional AI service
          videoFaces: 0
        });
      } else {
        // Handle non-video files (photos) - create blob URL for preview
        const photoUrl = URL.createObjectURL(file);
        
        // Extract real EXIF metadata from the photo
        const metadata = await extractPhotoMetadata(file);
        console.log('📸 Photo metadata - location:', metadata.location, 'date:', metadata.date);
        
        // Generate suggested tags based on context
        const suggestedTags = ['family', 'memory'];
        if (currentPromptContext) suggestedTags.push('prompt-response');
        if (metadata.location) suggestedTags.push('travel');
        
        // Capture recent conversation context (last 5 text messages)
        const recentTextMessages = memories
          .filter(m => m.type === 'text')
          .slice(-5)
          .map(m => m.content)
          .join(' ');
        
        // Try to estimate photo date if not available from EXIF
        let estimatedPhotoDate = metadata.date;
        if (!estimatedPhotoDate && recentTextMessages) {
          const parsedDate = parseChronologicalDate(recentTextMessages, userProfile.age, partnerProfile.birthday);
          if (parsedDate) {
            estimatedPhotoDate = parsedDate;
            console.log('📅 Estimated photo date from chat context:', parsedDate);
          }
        }
        if (!estimatedPhotoDate && currentPromptContext) {
          const parsedDate = parseChronologicalDate(currentPromptContext, userProfile.age, partnerProfile.birthday);
          if (parsedDate) {
            estimatedPhotoDate = parsedDate;
            console.log('📅 Estimated photo date from prompt:', parsedDate);
          }
        }
        
        console.log('📸 Creating photo memory with location:', metadata.location);
        onAddMemory({
          type: 'photo',
          content: `Photo: ${file.name}`,
          sender: userType as 'keeper' | 'teller',
          category: 'Photos',
          tags: suggestedTags,
          promptQuestion: currentPromptContext || undefined,
          conversationContext: recentTextMessages || undefined,
          photoUrl: photoUrl,
          photoDate: estimatedPhotoDate || undefined,
          photoLocation: metadata.location || undefined,
          photoGPSCoordinates: metadata.gpsCoordinates || undefined,
          detectedPeople: undefined, // Face detection would require additional AI service
          detectedFaces: 0
        });
      }
    }
    
    // Show appropriate success message
    const fileCount = files.length;
    if (fileCount === 1) {
      const isVideo = files[0].type.startsWith('video/');
      toast.success(isVideo ? 'Video shared!' : 'Photo shared!');
    } else {
      toast.success(`${fileCount} files shared!`);
    }
    
    if (activePrompt && onClearPrompt) {
      onClearPrompt();
    }
    
    // Close the upload menu
    setShowUploadMenu(false);
    
    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Close the upload menu immediately
    setShowUploadMenu(false);

    // Show processing toast
    const toastId = toast.loading('Scanning document...');

    for (const file of Array.from(files)) {
      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        // Scan the document using OCR
        const scanResult = await scanDocument(file);
        
        // Estimate page count based on file size (rough estimate)
        const estimatedPages = Math.max(1, Math.ceil(file.size / (1024 * 50))); // ~50KB per page
        
        // Generate tags based on file type
        const suggestedTags = ['document', 'scanned'];
        if (currentPromptContext) suggestedTags.push('prompt-response');
        if (fileExtension === 'pdf') suggestedTags.push('pdf');
        if (['doc', 'docx'].includes(fileExtension)) suggestedTags.push('word', 'journal');
        if (['xls', 'xlsx'].includes(fileExtension)) suggestedTags.push('excel', 'records');
        if (['ppt', 'pptx'].includes(fileExtension)) suggestedTags.push('powerpoint', 'presentation');
        if (['jpg', 'jpeg', 'png'].includes(fileExtension)) suggestedTags.push('scanned-image', 'photo');
        
        // Read file as data URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const documentUrl = e.target?.result as string;
          
          onAddMemory({
            type: 'document',
            content: `Document: ${file.name}`,
            sender: userType as 'keeper' | 'teller',
            category: 'Documents',
            tags: suggestedTags,
            promptQuestion: currentPromptContext || undefined,
            documentUrl: documentUrl,
            documentType: fileExtension,
            documentFileName: file.name,
            documentScannedText: scanResult.text,
            documentPageCount: estimatedPages,
            documentScanLanguage: scanResult.language
          });
          
          // Update toast with success
          toast.success(`Document scanned! Found ${scanResult.wordCount} words`, { id: toastId });
        };
        
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('Error processing document:', error);
        toast.error('Failed to scan document', { id: toastId });
      }
    }
    
    if (activePrompt && onClearPrompt) {
      onClearPrompt();
    }
    
    event.target.value = '';
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleRecording = async () => {
    // Prevent multiple simultaneous toggle attempts
    if (isTogglingRef.current) {
      console.log('⚠️ Already toggling recording, ignoring...');
      return;
    }
    
    isTogglingRef.current = true;
    const wasRecording = isRecording; // Track if we're stopping or starting
    
    try {
      if (isRecording) {
        // Stop recording and transcription
        console.log('🛑 Stopping recording...');
      
      // Capture the recording time BEFORE clearing the timer
      const savedRecordingTime = recordingTime;
      console.log('⏱️ Captured recording time:', savedRecordingTime, 'seconds');
      
      setIsRecording(false);
      setIsTranscribing(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Stop speech recognition first
      if (speechTranscriberRef.current) {
        console.log('🛑 Stopping speech recognition...');
        try {
          speechTranscriberRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
      
      // Stop MediaRecorder - iOS Safari needs special handling
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('🛑 Stopping MediaRecorder, state:', mediaRecorderRef.current.state);
        try {
          // Store the saved recording time for the onstop handler to access
          (mediaRecorderRef.current as any).savedDuration = savedRecordingTime;
          
          // Request final data before stopping for iOS compatibility
          if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.requestData();
          }
          mediaRecorderRef.current.stop();
          console.log('✅ MediaRecorder stop called');
        } catch (error) {
          console.error('❌ Error stopping MediaRecorder:', error);
        }
      }
      
      // Stop media stream tracks after a short delay to ensure onstop fires
      setTimeout(() => {
        if (mediaStreamRef.current) {
          console.log('🛑 Stopping media stream tracks...');
          mediaStreamRef.current.getTracks().forEach(track => {
            console.log('Stopping track:', track.kind, track.label);
            track.stop();
          });
          mediaStreamRef.current = null;
        }
        // Reset toggling flag after cleanup is complete
        // Add a small delay to ensure the stream is fully released
        setTimeout(() => {
          isTogglingRef.current = false;
          console.log('✅ Recording stopped and cleaned up');
        }, 50);
      }, 100);
      
    } else {
      // Start recording and transcription
      try {
        // IMPORTANT: Clean up any existing streams first to avoid permission conflicts
        if (mediaStreamRef.current) {
          console.log('🧹 Cleaning up existing stream before new recording...');
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        
        console.log('🎤 Requesting microphone access...');
        
        // Request microphone permission FIRST before starting speech recognition
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        
        console.log('✅ Microphone access granted');
        mediaStreamRef.current = stream;
        setMicPermissionStatus('granted');
        
        // NOW that we have permission, check if speech recognition is supported
        const speechSupported = SpeechTranscriber.isSupported();
        
        if (speechSupported) {
          console.log('🗣️ Starting speech recognition...');
          // Initialize speech transcriber
          if (!speechTranscriberRef.current) {
            speechTranscriberRef.current = new SpeechTranscriber();
          }
          
          finalTranscriptRef.current = '';
          setLiveTranscript('');
          
          // Set up transcription callbacks
          speechTranscriberRef.current.onTranscript((result: TranscriptionResult) => {
            setLiveTranscript(result.transcript);
            if (result.isFinal) {
              finalTranscriptRef.current = result.transcript;
              detectedLanguageRef.current = {
                code: result.languageCode,
                name: result.language
              };
            }
          });
          
          speechTranscriberRef.current.onError((error: string) => {
            console.error('Transcription error:', error);
            // Only show toast for non-permission errors (permission errors already handled above)
            if (!error.includes('permission') && !error.includes('not-allowed')) {
              toast.error(error);
            }
          });
          
          speechTranscriberRef.current.onEnd(() => {
            console.log('Transcription ended');
            setIsTranscribing(false);
          });
          
          // Start transcription
          try {
            speechTranscriberRef.current.start({
              language: 'en-US', // Can be changed to auto-detect or user preference
              continuous: true,
              interimResults: true
            });
            setIsTranscribing(true);
            console.log('✅ Speech recognition started');
          } catch (error) {
            console.error('Error starting speech recognition:', error);
            // Don't show error for speech recognition - recording will still work
          }
        }
        
        // Create MediaRecorder with the best available format
        let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
        
        // Try different formats for iPhone compatibility
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            options = { mimeType: 'audio/ogg' };
          } else {
            options = {}; // Use default
          }
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          console.log('📦 Audio data available:', event.data.size, 'bytes');
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          console.log('🛑 MediaRecorder stopped, chunks:', audioChunksRef.current.length);
          
          if (audioChunksRef.current.length === 0) {
            console.warn('⚠️ No audio chunks recorded');
            toast.error('No audio recorded. Please try again.');
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          console.log('✅ Created audio blob:', audioBlob.size, 'bytes');
          
          // Get the duration from the saved property
          const duration = (mediaRecorder as any).savedDuration || 0;
          console.log('⏱️ Using saved duration:', duration, 'seconds');
          setRecordingTime(0);
          
          // Create a URL for the audio blob
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Get final transcript (empty string if nothing was transcribed)
          const finalTranscript = finalTranscriptRef.current || liveTranscript || '';
          const detectedLang = detectedLanguageRef.current || { code: 'en-US', name: 'English (US)' };
          console.log('📝 Final transcript:', finalTranscript || '(no transcript)');
          
          // Detect language if not already detected and we have a transcript
          if (finalTranscript && (!detectedLang.code || detectedLang.code === 'en-US')) {
            const langDetection = detectLanguageFromText(finalTranscript);
            detectedLang.code = langDetection.code;
            detectedLang.name = langDetection.name;
          }
          
          // Generate translation if not in English
          let englishTranslation: string | undefined;
          if (!detectedLang.code.startsWith('en') && finalTranscript) {
            try {
              englishTranslation = await translateToEnglish(finalTranscript, detectedLang.code);
            } catch (error) {
              console.error('Translation error:', error);
            }
          }
          
          // Convert blob to base64 for storage
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            console.log('✅ Saved voice memo successfully');
            
            onAddMemory({
              type: 'voice',
              content: `Voice memo (${duration}s)`,
              sender: userType as 'keeper' | 'teller',
              category: 'Voice',
              tags: currentPromptContext ? ['voice', 'prompt', 'response', 'audio'] : ['voice', 'audio'],
              transcript: finalTranscript || undefined, // Only set if we have a real transcript
              englishTranslation: englishTranslation,
              voiceLanguage: finalTranscript ? detectedLang.name : undefined,
              voiceLanguageCode: finalTranscript ? detectedLang.code : undefined,
              transcriptionShown: false,
              translationShown: false,
              promptQuestion: currentPromptContext || undefined,
              audioUrl: base64Audio,
              audioBlob: audioUrl
            });
            
            toast.success('Voice memo sent!');
            if (activePrompt && onClearPrompt) {
              onClearPrompt();
            }
            
            // Reset transcript
            setLiveTranscript('');
            finalTranscriptRef.current = '';
          };
          
          reader.onerror = (error) => {
            console.error('❌ Error reading audio blob:', error);
            toast.error('Failed to save voice memo');
          };
          
          reader.readAsDataURL(audioBlob);
          
          audioChunksRef.current = [];
        };
        
        mediaRecorder.onerror = (event: any) => {
          console.error('❌ MediaRecorder error:', event.error);
          toast.error('Recording error occurred');
        };
        
        // iOS Safari works better with timeslice - request data every 100ms
        console.log('🎙️ Starting MediaRecorder with timeslice for iOS compatibility');
        mediaRecorder.start(100);
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 120) { // Auto-stop after 2 minutes
              toggleRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
        
        toast.success(speechSupported ? 'Recording with live transcription' : 'Recording started');
        
      } catch (error) {
        console.error('🎤 Microphone permission error:', error);
        
        // Stop any ongoing transcription attempt
        if (speechTranscriberRef.current) {
          try {
            speechTranscriberRef.current.abort();
          } catch (e) {
            // Ignore abort errors
          }
        }
        
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            setMicPermissionStatus('denied');
            
            // Provide device-specific instructions
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
            
            if (isIOS || isSafari) {
              toast.error('Microphone Access Denied\n\nTo enable:\n1. Open Settings app\n2. Scroll to Safari\n3. Tap Microphone\n4. Allow for this site', {
                duration: 10000,
                className: 'text-sm whitespace-pre-line'
              });
            } else {
              toast.error('Microphone Access Denied\n\nTo enable:\nClick the 🔒 or ⓘ icon in the address bar, then allow microphone access.', {
                duration: 8000,
                className: 'text-sm whitespace-pre-line'
              });
            }
          } else if (error.name === 'NotFoundError') {
            toast.error('No microphone detected. Please connect a microphone and try again.', {
              duration: 5000
            });
          } else if (error.name === 'NotReadableError') {
            toast.error('Microphone is being used by another app. Please close other apps and try again.', {
              duration: 6000
            });
          } else {
            toast.error('Unable to access microphone. Please check your device settings.', {
              duration: 5000
            });
          }
        } else {
          toast.error('Failed to start recording. Please check microphone permissions and try again.', {
            duration: 5000
          });
        }
        
        setIsRecording(false);
        setIsTranscribing(false);
        
        // Clean up all resources if there was an error
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        if (mediaRecorderRef.current) {
          try {
            if (mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
          } catch (e) {
            console.log('MediaRecorder already stopped');
          }
          mediaRecorderRef.current = null;
        }
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingTime(0);
      }
    }
    } finally {
      // Reset the toggling flag only for start operations
      // Stop operations reset in the setTimeout to avoid interrupting cleanup
      if (!wasRecording) {
        isTogglingRef.current = false;
      }
    }
  };

  // Voice memo interaction handlers
  const handleTogglePlay = (memoryId: string) => {
    const audioElement = audioRefs.current[memoryId];
    const memory = memories.find(m => m.id === memoryId);
    
    if (!audioElement || !memory) return;
    
    const isCurrentlyPlaying = voiceStates[memoryId]?.isPlaying;
    
    if (isCurrentlyPlaying) {
      // Pause the audio
      audioElement.pause();
      setVoiceStates(prev => ({
        ...prev,
        [memoryId]: {
          ...prev[memoryId],
          isPlaying: false
        }
      }));
      toast.success('Paused');
    } else {
      // Play the audio
      // If audio source exists (from real recording)
      if (memory.audioBlob || memory.audioUrl) {
        audioElement.src = memory.audioBlob || memory.audioUrl || '';
        audioElement.play().then(() => {
          setVoiceStates(prev => ({
            ...prev,
            [memoryId]: {
              ...prev[memoryId],
              isPlaying: true
            }
          }));
          toast.success('Playing voice memo');
        }).catch((error) => {
          console.error('Error playing audio:', error);
          toast.error('Failed to play audio');
        });
      } else {
        // For demo voice memos without real audio, just show playing state
        setVoiceStates(prev => ({
          ...prev,
          [memoryId]: {
            ...prev[memoryId],
            isPlaying: true
          }
        }));
        toast.success('Playing voice memo');
        
        // Auto "stop" after content duration (simulate playback)
        setTimeout(() => {
          setVoiceStates(prev => ({
            ...prev,
            [memoryId]: {
              ...prev[memoryId],
              isPlaying: false
            }
          }));
        }, 3000);
      }
    }
  };

  const handleToggleTranscription = async (memoryId: string) => {
    const memory = memories.find(m => m.id === memoryId);
    if (!memory) return;

    // If memory already has a transcript, just toggle visibility
    if (memory.transcript) {
      setVoiceStates(prev => ({
        ...prev,
        [memoryId]: {
          ...prev[memoryId],
          transcriptionShown: !prev[memoryId]?.transcriptionShown,
          translationShown: false // Reset translation when toggling transcription
        }
      }));
      return;
    }

    // If no transcript exists, start transcription
    await handleTranscribeAudio(memoryId);
  };

  const handleToggleTranslation = (memoryId: string) => {
    setVoiceStates(prev => ({
      ...prev,
      [memoryId]: {
        ...prev[memoryId],
        translationShown: !prev[memoryId]?.translationShown
      }
    }));
  };

  const handleTranscribeAudio = async (memoryId: string) => {
    const memory = memories.find(m => m.id === memoryId);
    if (!memory || !memory.audioUrl) {
      toast.error('Audio not available for transcription');
      return;
    }

    if (transcribingMemoryId) {
      toast.error('Already transcribing another audio');
      return;
    }

    setTranscribingMemoryId(memoryId);
    toast.loading('Transcribing audio...', { id: 'transcribe' });

    try {
      const transcriber = new AudioTranscriber();
      
      let transcript = '';
      let detectedLanguage = { code: 'en-US', name: 'English (US)' };
      
      try {
        const result = await transcriber.transcribe(memory.audioUrl, 'en-US');
        transcript = result.transcript;
        
        if (!transcript) {
          const manualTranscript = await transcriber.requestManualTranscription();
          if (manualTranscript) {
            transcript = manualTranscript;
            detectedLanguage = detectLanguageFromText(transcript);
          } else {
            throw new Error('Transcription cancelled');
          }
        }
      } catch (autoError) {
        console.error('Auto-transcription failed:', autoError);
        
        const manualTranscript = await transcriber.requestManualTranscription();
        if (manualTranscript) {
          transcript = manualTranscript;
          detectedLanguage = detectLanguageFromText(transcript);
        } else {
          throw new Error('Transcription cancelled');
        }
      }

      let englishTranslation = undefined;
      if (detectedLanguage.code !== 'en-US' && detectedLanguage.code !== 'en-GB') {
        englishTranslation = await translateToEnglish(transcript, detectedLanguage.code);
      }

      if (onEditMemory && transcript) {
        onEditMemory(memoryId, {
          transcript: transcript,
          voiceLanguage: detectedLanguage.name,
          voiceLanguageCode: detectedLanguage.code,
          englishTranslation: englishTranslation
        });

        setVoiceStates(prev => ({
          ...prev,
          [memoryId]: {
            ...prev[memoryId],
            transcriptionShown: true,
            translationShown: false
          }
        }));

        toast.success('Audio transcribed successfully', { id: 'transcribe' });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
      if (!errorMessage.includes('cancelled')) {
        toast.error(errorMessage, { id: 'transcribe' });
      } else {
        toast.dismiss('transcribe');
      }
    } finally {
      setTranscribingMemoryId(null);
    }
  };

  const handleQuoteVoice = (memory: Memory) => {
    const quoteText = memory.transcript || memory.content;
    setMessage(`> ${quoteText}\\n\\n`);
    messageInputRef.current?.focus();
    toast.success('Voice memo quoted');
  };

  // Video interaction handler
  const handleVideoClick = (memoryId: string) => {
    const videoElement = videoRefs.current[memoryId];
    if (!videoElement) return;

    if (playingVideoId === memoryId) {
      // Pause the video
      videoElement.pause();
      setPlayingVideoId(null);
    } else {
      // Pause any currently playing video
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]?.pause();
      }
      // Play this video
      videoElement.play();
      setPlayingVideoId(memoryId);
    }
  };

  const chatMessages = memories.filter(m => {
    const isRelevantCategory = m.category === 'Chat' || m.category === 'Photos' || m.category === 'Voice' || m.category === 'Video' || m.category === 'Documents' || m.category === 'Prompt' || m.category === 'Prompts';
    // Filter out the initial prompt question messages (where content equals promptQuestion)
    // These are shown in the header instead of as chat bubbles
    const isInitialPromptMessage = m.promptQuestion && m.content === m.promptQuestion && m.tags.includes('question');
    return isRelevantCategory && !isInitialPromptMessage;
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef<number>(0);
  const hasScrolledInitiallyRef = useRef<boolean>(false);
  
  // Initial mount: scroll to top if there's an activePrompt, otherwise scroll to bottom
  useEffect(() => {
    if (!hasScrolledInitiallyRef.current) {
      const timer = setTimeout(() => {
        if (activePrompt || currentPromptContext) {
          // Scroll to top to show the prompt banner
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } else if (chatMessages.length > 0) {
          // Has messages but no active prompt, scroll to latest message
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        }
        // Set initial count and mark as scrolled
        prevMessageCountRef.current = chatMessages.length;
        hasScrolledInitiallyRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activePrompt, currentPromptContext, chatMessages.length]);

  // When activePrompt changes: scroll to top to show the prompt banner
  useEffect(() => {
    if (activePrompt && hasScrolledInitiallyRef.current) {
      const timer = setTimeout(() => {
        // Scroll to absolute top to show the activePrompt banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activePrompt]);

  // When messages change: only scroll to bottom if NEW messages were added
  useEffect(() => {
    if (hasScrolledInitiallyRef.current) {
      // Only scroll to bottom if messages increased (new message added)
      // Always scroll to show the complete message including timestamp
      if (chatMessages.length > prevMessageCountRef.current) {
        // Use a slight delay to ensure the message is fully rendered
        const timer = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Update the count
        prevMessageCountRef.current = chatMessages.length;
        return () => clearTimeout(timer);
      }
    }
  }, [chatMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (memory: Memory) => {
    const isOwnMessage = memory.sender === userType;
    const senderProfile = isOwnMessage ? userProfile : partnerProfile;

    return (
      <div key={memory.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
        <div className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''} max-w-[85%]`}>
          <Avatar className={`w-8 h-8 ring-2 ring-border flex-shrink-0 mt-0.5 ${isOwnMessage ? 'mr-0.5' : 'ml-0.5'}`}>
            <AvatarImage src={senderProfile.photo} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{senderProfile.name[0]}</AvatarFallback>
          </Avatar>
          <div className={`space-y-2 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col min-w-0 flex-1`}>
            <div className={`px-3 py-2.5 rounded-2xl shadow-sm overflow-hidden ${
              isOwnMessage 
                ? 'bg-[rgb(241,241,241)] text-black rounded-br-md' 
                : 'bg-white text-black border border-border rounded-bl-md'
            }`} style={{ overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>
              {memory.type === 'text' && (
                <p className="text-sm leading-relaxed text-black whitespace-pre-wrap" style={{ overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>{memory.content}</p>
              )}
              {memory.type === 'photo' && (
                <div className="space-y-2">
                  {memory.photoUrl ? (
                    <div className="max-w-sm">
                      <img 
                        src={memory.photoUrl} 
                        alt={memory.content}
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-32 bg-muted rounded-xl flex items-center justify-center border border-border">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs opacity-75 text-black">{memory.content}</p>
                  {(memory.photoLocation || memory.detectedPeople || memory.photoDate) && (
                    <div className="space-y-1 pt-1">
                      {memory.photoLocation && (
                        <Badge variant="outline" className="text-xs mr-1">
                          📍 {memory.photoLocation}
                        </Badge>
                      )}
                      {memory.photoDate && (
                        <Badge variant="outline" className="text-xs mr-1">
                          📅 {memory.photoDate.toLocaleDateString()}
                        </Badge>
                      )}
                      {memory.detectedPeople && memory.detectedPeople.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          👥 {memory.detectedPeople.join(', ')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
              {memory.type === 'voice' && (
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="space-y-2 min-w-[200px] cursor-pointer select-none">
                      {/* Hidden audio element for playback */}
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[memory.id] = el;
                        }}
                        onEnded={() => {
                          setVoiceStates(prev => ({
                            ...prev,
                            [memory.id]: {
                              ...prev[memory.id],
                              isPlaying: false
                            }
                          }));
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant={isOwnMessage ? "secondary" : "outline"} 
                          className="rounded-full w-9 h-9 p-0 bg-[rgb(236,240,226)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlay(memory.id);
                          }}
                        >
                          {voiceStates[memory.id]?.isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className="text-sm text-black">{memory.content}</p>
                          {memory.voiceLanguage && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {memory.voiceLanguage}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      {!memory.transcript && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTranscription(memory.id);
                            }}
                            disabled={transcribingMemoryId === memory.id}
                          >
                            <FileText className="w-3 h-3 mr-1.5" />
                            {transcribingMemoryId === memory.id ? 'Transcribing...' : 'Tap to Transcribe'}
                          </Button>
                        </div>
                      )}
                      {voiceStates[memory.id]?.transcriptionShown && memory.transcript && (
                        <div className="space-y-2 pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-black/60">Transcription</span>
                            {memory.englishTranslation && memory.voiceLanguageCode !== 'en' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTranslation(memory.id);
                                }}
                              >
                                <Languages className="w-3 h-3 mr-1" />
                                {voiceStates[memory.id]?.translationShown ? 'Show Original' : 'Translate'}
                              </Button>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-black">
                            {voiceStates[memory.id]?.translationShown && memory.englishTranslation 
                              ? memory.englishTranslation 
                              : memory.transcript}
                          </p>
                          {voiceStates[memory.id]?.translationShown && (
                            <div className="flex items-center space-x-1 text-xs text-black/60 pt-1">
                              <Languages className="w-3 h-3" />
                              <span>Translated to English by Adoras</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-56">
                    <ContextMenuItem onClick={() => handleToggleTranscription(memory.id)}>
                      <FileText className="w-4 h-4 mr-2" />
                      {transcribingMemoryId === memory.id 
                        ? 'Transcribing...' 
                        : memory.transcript
                          ? (voiceStates[memory.id]?.transcriptionShown ? 'Hide Transcription' : 'Show Transcription')
                          : 'Transcribe Audio'}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleTogglePlay(memory.id)}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      {voiceStates[memory.id]?.isPlaying ? 'Pause' : 'Play'}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleQuoteVoice(memory)}>
                      <Quote className="w-4 h-4 mr-2" />
                      Quote in Message
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
              {memory.type === 'video' && (
                <div className="space-y-2">
                  {memory.videoUrl ? (
                    <div 
                      className="relative w-full max-w-sm rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => handleVideoClick(memory.id)}
                    >
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[memory.id] = el;
                        }}
                        src={memory.videoUrl}
                        className="w-full h-auto rounded-lg"
                        onEnded={() => setPlayingVideoId(null)}
                      />
                      {/* Play/Pause Overlay */}
                      {playingVideoId !== memory.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-black ml-0.5" />
                          </div>
                        </div>
                      )}
                      {playingVideoId === memory.id && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                            <Pause className="w-6 h-6 text-black" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-48 h-32 bg-muted rounded-xl flex items-center justify-center border border-border">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs opacity-75 text-black">{memory.content}</p>
                  {(memory.videoLocation || memory.videoPeople || memory.videoDate) && (
                    <div className="space-y-1 pt-1">
                      {memory.videoLocation && (
                        <Badge variant="outline" className="text-xs mr-1">
                          📍 {memory.videoLocation}
                        </Badge>
                      )}
                      {memory.videoDate && (
                        <Badge variant="outline" className="text-xs mr-1">
                          📅 {memory.videoDate.toLocaleDateString()}
                        </Badge>
                      )}
                      {memory.videoPeople && memory.videoPeople.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          👥 {memory.videoPeople.join(', ')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
              {memory.type === 'document' && (
                <div className="space-y-3 w-full max-w-[280px] sm:min-w-[250px]">
                  {/* Document Preview */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <File className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-black mb-1 break-words">
                          {memory.documentFileName || memory.content}
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {memory.documentType && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-100 border-blue-300 text-blue-700 uppercase">
                              {memory.documentType}
                            </Badge>
                          )}
                          {memory.documentPageCount && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {memory.documentPageCount} {memory.documentPageCount === 1 ? 'page' : 'pages'}
                            </Badge>
                          )}
                          {memory.documentScanLanguage && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-100 border-green-300 text-green-700">
                              <Languages className="w-3 h-3 mr-1" />
                              {memory.documentScanLanguage}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scanned Text */}
                  {memory.documentScannedText && (
                    <div className="border-t border-border/30 pt-2 sm:pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <ScanText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          <span className="text-[10px] sm:text-xs font-medium text-black/70">Scanned Text</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {memory.documentScannedText.split(' ').length} words
                        </Badge>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
                        <p className="text-[10px] sm:text-xs leading-relaxed text-black/80 whitespace-pre-wrap break-words">
                          {memory.documentScannedText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 px-2">
              <span className="text-xs text-muted-foreground">
                {formatTime(memory.timestamp)}
              </span>
              {memory.category && memory.category !== 'Chat' && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  {memory.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Hidden file inputs - always in DOM so they can be triggered from anywhere */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept=".mp4,.mov,.mkv,.avi,.m4v,.wmv,video/mp4,video/quicktime,video/x-matroska,video/x-msvideo,video/x-m4v,video/x-ms-wmv"
        onChange={handleMediaUpload}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,.mp4,.mov,.mkv,.avi,.m4v,.wmv,video/mp4,video/quicktime,video/x-matroska,video/x-msvideo,video/x-m4v,video/x-ms-wmv"
        onChange={handleMediaUpload}
        multiple
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleDocumentUpload}
        multiple
        className="hidden"
      />
      
      {/* Current Prompt Context Indicator (when replying to a past prompt) */}
      {currentPromptContext && !activePrompt && (
        <div className="bg-gradient-to-br from-[rgb(245,249,233)] to-[rgb(235,244,218)] border-b border-primary/20 p-3 shadow-sm flex-shrink-0">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MessageSquarePlus className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-semibold text-primary" style={{ fontFamily: 'Archivo' }}>Replying to Prompt</h4>
              </div>
              <p className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>
                {currentPromptContext}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearPromptContext}
              className="flex-shrink-0 h-7 w-7 hover:bg-primary/10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}

      {/* Active Prompt Helper */}
      {activePrompt && (
        <div ref={activePromptRef} className="bg-gradient-to-br from-[rgb(245,249,233)] to-[rgb(235,244,218)] border-b border-primary/20 p-4 shadow-sm animate-fade-in flex-shrink-0">
          <div className="flex items-start justify-between space-x-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-primary" style={{ fontFamily: 'Archivo' }}>
                  {userType === 'keeper' ? 'Prompt Sent' : 'Share Your Story'}
                </h4>
              </div>
              <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter' }}>
                {activePrompt}
              </p>
              {userType === 'keeper' && (
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                  Waiting for Storyteller's response... You can add your own thoughts below.
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearPrompt}
              className="flex-shrink-0 h-8 w-8 hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 rotate-45 text-muted-foreground" />
            </Button>
          </div>
          
          {/* Action Buttons - Only for Storytellers (Tellers) */}
          {userType === 'teller' && (
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-auto py-4 bg-white hover:bg-primary/5 border-primary/20 hover:border-primary/40 transition-all"
                onClick={() => {
                  // Focus on the text input and scroll it into view (triggers mobile keyboard)
                  messageInputRef.current?.focus();
                  messageInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <Send className="w-5 h-5 mb-2 text-primary" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>Type</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-auto py-4 bg-white hover:bg-primary/5 border-primary/20 hover:border-primary/40 transition-all"
                onClick={toggleRecording}
              >
                <Mic className="w-5 h-5 mb-2 text-primary" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>Voice Memo</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-auto py-4 bg-white hover:bg-primary/5 border-primary/20 hover:border-primary/40 transition-all"
                onClick={() => {
                  // Use imageInputRef which accepts both images and videos
                  imageInputRef.current?.click();
                }}
              >
                <Camera className="w-5 h-5 mb-2 text-primary" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>Photo/Video</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Messages Area - Add bottom padding for fixed input */}
      <ScrollArea className={`flex-1 px-3 pb-20 ${activePrompt || currentPromptContext ? 'pt-4' : 'pt-0'}`}>
        <div className="space-y-4 max-w-full">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-4xl">💬</div>
              <h3 className="font-semibold">Start the conversation</h3>
              <p className="text-sm text-muted-foreground">
                Send a message, photo, or voice memo to begin sharing memories
              </p>
            </div>
          ) : (
            chatMessages.map((message, index) => {
              const prevMessage = index > 0 ? chatMessages[index - 1] : null;
              // Show prompt header when a new prompt question appears
              // This displays for BOTH Legacy Keepers and Storytellers so everyone knows the topic
              const showPromptHeader = message.promptQuestion && 
                (!prevMessage || prevMessage.promptQuestion !== message.promptQuestion);
              
              return (
                <React.Fragment key={message.id}>
                  {showPromptHeader && (
                    <div className="bg-gradient-to-br from-[rgb(245,249,233)] to-[rgb(235,244,218)] border border-primary/20 rounded-lg p-3 mb-4 shadow-sm animate-fade-in mx-1">
                      <div className="flex items-start space-x-2">
                        <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h4 className="text-sm font-semibold text-primary mb-1" style={{ fontFamily: 'Archivo' }}>
                            {userType === 'keeper' ? 'Memory Prompt' : 'Story Prompt'}
                          </h4>
                          <p className="text-sm font-medium text-foreground break-words" style={{ fontFamily: 'Inter' }}>
                            {message.promptQuestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {renderMessage(message)}
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area - Fixed to bottom of screen */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        {/* Recording Indicator */}
        {isRecording && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording... {recordingTime}s</span>
            </div>
          </div>
        )}

        <div className="bg-card/95 backdrop-blur-sm p-3 max-w-[1400px] mx-auto">
        {/* Past Prompts Button - Top Row */}
        {pastPrompts.length > 0 && !currentPromptContext && !activePrompt && (
          <div className="mb-2">
            <Sheet open={showPastPromptsSheet} onOpenChange={setShowPastPromptsSheet}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 mr-2 text-primary" />
                  Reply to Previous Prompt
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle style={{ fontFamily: 'Archivo' }}>Reply to Previous Prompt</SheetTitle>
                  <SheetDescription>
                    Select a previous prompt to continue adding memories to that conversation
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(80vh-120px)] mt-4">
                  <div className="space-y-2 pr-4">
                    {pastPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full h-auto p-4 text-left flex flex-col items-start hover:bg-primary/5 hover:border-primary/40 transition-all"
                        onClick={() => handleSelectPastPrompt(prompt.question)}
                      >
                        <div className="flex items-start space-x-2 w-full">
                          <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1 text-left" style={{ fontFamily: 'Inter' }}>
                              {prompt.question}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last response: {prompt.timestamp.toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <Badge variant="secondary" className="text-xs mt-2">
                              {memories.filter(m => m.promptQuestion === prompt.question).length} responses
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Live Transcription Display */}
        {isRecording && isTranscribing && liveTranscript && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200/50 px-4 py-3 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-red-700" style={{ fontFamily: 'Inter' }}>
                  Recording • {recordingTime}s
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: 'Inter' }}>
                  Live Transcription:
                </p>
                <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: 'Inter' }}>
                  {liveTranscript}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4">
          {/* Voice Recording Button - Left */}
          <TooltipProvider>
            <Tooltip open={micPermissionStatus === 'denied' ? undefined : false}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={`rounded-full w-9 h-9 sm:w-11 sm:h-11 hover:bg-muted flex-shrink-0 ${isRecording ? 'text-red-500 bg-red-50' : ''}`}
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </TooltipTrigger>
              {micPermissionStatus === 'denied' && (
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p>Microphone access denied. Click to see instructions.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Message Input - Center */}
          <div className="flex-1 relative">
            <Input
              ref={messageInputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                currentPromptContext 
                  ? (userType === 'keeper' ? "Add your thoughts..." : "Share your story...") 
                  : "Type a message..."
              }
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isRecording}
              className="border border-border/50 bg-white rounded-lg pl-3 sm:pl-4 pr-10 sm:pr-11 py-2 text-sm sm:text-base focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/70"
            />
            {message.trim() && (
              <Button
                size="icon"
                onClick={handleSendMessage}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>

          {/* Emoji Picker - Right */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isRecording}
                className="rounded-full w-9 h-9 sm:w-11 sm:h-11 hover:bg-muted flex-shrink-0"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 sm:w-80 p-3 sm:p-4" align="end">
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-xl sm:text-2xl hover:bg-muted rounded p-1.5 sm:p-2 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Media Button - Right */}
          <Popover open={showUploadMenu} onOpenChange={setShowUploadMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isRecording}
                className="rounded-full w-9 h-9 sm:w-11 sm:h-11 hover:bg-muted flex-shrink-0"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => documentInputRef.current?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Document/Scan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        </div>
      </div>
    </div>
  );
}