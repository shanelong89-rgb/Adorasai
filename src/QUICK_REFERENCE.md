# Quick Reference: AI Features

## 🎤 Voice Translation

### In Chat Tab (Right-click voice memo):
```
📝 Show Transcription     - Toggle transcript visibility
🌐 Translate to English   - AI translation (Groq)
▶️ Play                   - Play audio
💬 Quote in Message       - Insert into message
```

### In Media Library (Edit dialog):
```
Original Transcription → Manual entry
Language → Set voice language  
English Translation → Auto-filled by AI
```

---

## 📄 Document Text Extraction

### In Chat Tab:
- Documents show with file info automatically
- Scanned text appears below (if extracted)

### In Media Library (Edit dialog):
```
[Extract Text with AI] → Groq AI Vision OCR
Scanned Text → Shows extracted text
Save → Updates everywhere
```

---

## 🔧 API Endpoints

```bash
# Translate Text
POST /make-server-deded1eb/ai/translate-text
Body: { text, sourceLanguage?, targetLanguage? }

# Extract Document Text  
POST /make-server-deded1eb/ai/extract-document-text
Body: { imageUrl }

# Check AI Status
GET /make-server-deded1eb/ai/status
```

---

## ⚡ Quick Workflow

### Translate Voice Memo:
1. Right-click → "Translate to English" ✨
2. Done! (< 1 second)

### Extract Document Text:
1. Media Library → Edit
2. "Extract Text with AI" ✨
3. Save (< 2 seconds)

---

## 💡 Pro Tips

- Translation is cached forever (no re-translation needed)
- Toggle between original and translation anytime
- Works best with clear, high-quality document images
- All features work offline once processed

---

**Need Help?** See USER_GUIDE_VOICE_TRANSLATION.md
