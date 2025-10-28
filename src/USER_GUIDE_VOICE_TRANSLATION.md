# User Guide: Voice Memo Translation & Document Text Extraction

## Quick Start Guide for New AI Features

### 🎤 Voice Memo Translation

#### Step 1: Record a Voice Memo
1. Open the **Chat** tab
2. Click the **microphone button** to start recording
3. Speak your message (in any language)
4. Click the **stop button** when finished
5. Your voice memo appears in the chat

#### Step 2: Add a Transcript (Manual)
1. Open the **Media Library** tab
2. **Long-press** (mobile) or **click the edit button** (desktop) on your voice memo
3. In the edit dialog, find the "Voice Transcription" section
4. Enter the transcript in the "Original Transcription" field
5. Optionally set the "Language" (e.g., "Spanish", "Cantonese", "French")
6. Click **Save**

#### Step 3: Translate to English (AI-Powered!) ✨
1. Go back to the **Chat** tab
2. **Right-click** (or long-press on mobile) on your voice memo
3. Select **"Translate to English"** from the context menu
4. Wait a moment while Groq AI translates your text
5. The translation appears automatically!

#### Step 4: Toggle Between Original and Translation
- Right-click the voice memo again
- Select **"Show Translation"** or **"Hide Translation"** to toggle
- Both the original transcript and translation are saved

---

### 📄 Document Text Extraction

#### Step 1: Upload a Document
1. Open the **Chat** tab  
2. Click the **paperclip button** → **"Document"**
3. Select a document file (PDF, image of text, scanned document, etc.)
4. The document appears in the chat with file info

#### Step 2: Extract Text with AI ✨
1. Open the **Media Library** tab
2. **Long-press** (mobile) or **click the edit button** (desktop) on your document
3. In the edit dialog, find the **"Extract Text with AI"** button
4. Click it and wait while Groq AI Vision extracts the text
5. Extracted text appears in the "Scanned Text" field
6. Click **Save**

#### Step 3: View Extracted Text
- The scanned text now shows in both:
  - **Chat tab** (expandable text preview below document)
  - **Media Library tab** (full text in the preview card)

---

## Tips & Tricks

### Voice Memos
- ✅ **Multiple Languages**: Transcribe in any language, then translate to English
- ✅ **Cached Translations**: Once translated, the translation is saved forever
- ✅ **Quick Toggle**: Easily switch between original and translation in chat
- 💡 **Pro Tip**: Add context in the "Notes" field (e.g., "Mom's recipe in Cantonese")

### Documents
- ✅ **Works with Images**: Take a photo of a handwritten note and extract the text
- ✅ **Preserves Formatting**: AI tries to maintain original structure
- ✅ **Searchable**: Extracted text makes documents searchable in Media Library
- 💡 **Pro Tip**: Works best with clear, high-quality images

---

## Context Menu Quick Reference

### Voice Memo Context Menu (Right-click)
- 📝 **Show Transcription** - Toggle transcript visibility
- 🌐 **Translate to English** - AI-powered translation (appears after transcript is added)
- ▶️ **Play** - Play the audio
- 💬 **Quote in Message** - Insert transcript into message input

### Document in Chat
- No context menu yet (coming soon!)
- Use Media Library edit dialog for all document actions

---

## Requirements

### For Voice Translation
- ✅ Voice memo must have a transcript (manual entry)
- ✅ Groq API key must be configured (admin setting)
- ✅ Internet connection required

### For Document OCR
- ✅ Document must be an image (PDF, JPG, PNG, etc.)
- ✅ Groq API key must be configured (admin setting)
- ✅ Internet connection required

---

## Troubleshooting

### "AI not configured" Error
**Problem**: Groq API key hasn't been set up  
**Solution**: Contact your admin to configure the `GROQ_API_KEY` environment variable

### Translation Not Working
**Problem**: No transcript exists  
**Solution**: First add a manual transcript in Media Library edit dialog

### Document Text Extraction Poor Quality
**Problem**: Image is blurry or text is too small  
**Solution**: Try uploading a higher quality image or zoomed-in photo

### Translation Shows Wrong Language
**Problem**: Language field is incorrect or not set  
**Solution**: Edit the voice memo and update the "Language" field, then translate again

---

## Privacy & Performance

- 🔒 **Privacy**: All translations are processed through Groq AI (no data is stored by Groq)
- ⚡ **Speed**: Groq AI is ultra-fast (especially in Hong Kong region)
- 💾 **Storage**: Translations are saved to your Adoras account for offline access
- 🌐 **Offline**: Once translated, you can view translations offline

---

## What's Next?

### Coming Soon
- 🎯 Auto-transcription using Groq Whisper (no manual entry needed!)
- 🎯 Translate to languages other than English
- 🎯 Batch translate multiple voice memos
- 🎯 Document preview with PDF rendering

---

## Support

If you encounter any issues:
1. Check that you have internet connection
2. Verify Groq API key is configured (admin)
3. Try refreshing the page
4. Check browser console for detailed error messages

---

**Last Updated**: January 24, 2025  
**Version**: 1.0 with Groq AI Integration
