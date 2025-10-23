import Tesseract from 'tesseract.js';

export interface ScanResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
}

/**
 * Extract text from an image or document using OCR
 */
export async function scanDocument(file: File, fullScan: boolean = false): Promise<ScanResult> {
  try {
    // For image files (JPG, PNG) - use Tesseract OCR
    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
      const result = await Tesseract.recognize(
        file,
        'eng+spa+fra+deu+ita+por+chi_sim+chi_tra+jpn+kor+ara+rus+hin', // Multi-language support
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
          // Enhanced OCR settings for better accuracy
          tessedit_pageseg_mode: fullScan ? Tesseract.PSM.AUTO : Tesseract.PSM.SPARSE_TEXT,
          tessedit_char_whitelist: undefined, // Allow all characters
        }
      );

      const text = result.data.text.trim();
      const confidence = result.data.confidence;
      
      return {
        text: text || 'No text detected in image',
        confidence: confidence,
        language: detectLanguage(text),
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length
      };
    }

    // For PDF files - extract text directly (PDFs may contain text layers)
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await extractPDFText(file);
    }

    // For Office files (DOCX, XLSX, PPTX) - these require server-side processing
    // For now, we'll indicate they need extraction
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileExt)) {
      return {
        text: `Document uploaded: ${file.name}\n\nThis ${fileExt.toUpperCase()} file has been stored. Text extraction for Office documents requires server-side processing.\n\nYou can add notes about this document in the Media Library.`,
        confidence: 100,
        language: 'English',
        wordCount: 0
      };
    }

    // Fallback
    return {
      text: 'Unable to extract text from this file type',
      confidence: 0,
      language: 'Unknown',
      wordCount: 0
    };

  } catch (error) {
    console.error('Error scanning document:', error);
    return {
      text: `Error scanning document: ${file.name}\n\nThe document has been uploaded and stored. You can add notes about it in the Media Library.`,
      confidence: 0,
      language: 'Unknown',
      wordCount: 0
    };
  }
}

/**
 * Extract text from PDF files using a lightweight approach
 */
async function extractPDFText(file: File): Promise<ScanResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in chunks to avoid stack overflow
    const chunkSize = 10000;
    let text = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      text += String.fromCharCode(...chunk);
    }
    
    // Extract text content between parentheses (common PDF text encoding)
    const textContent: string[] = [];
    
    // Method 1: Extract text from Tj operators
    const tjMatches = text.match(/\(([^)]*)\)\s*Tj/g);
    if (tjMatches) {
      tjMatches.forEach(match => {
        const extracted = match.match(/\(([^)]*)\)/)?.[1];
        if (extracted) {
          // Decode PDF escape sequences
          const decoded = extracted
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          textContent.push(decoded);
        }
      });
    }
    
    // Method 2: Extract text from TJ operators (array format)
    const tjArrayMatches = text.match(/\[([^\]]*)\]\s*TJ/g);
    if (tjArrayMatches) {
      tjArrayMatches.forEach(match => {
        const innerContent = match.match(/\[([^\]]*)\]/)?.[1];
        if (innerContent) {
          const strings = innerContent.match(/\(([^)]*)\)/g);
          if (strings) {
            strings.forEach(str => {
              const extracted = str.match(/\(([^)]*)\)/)?.[1];
              if (extracted) {
                const decoded = extracted
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '\r')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\(/g, '(')
                  .replace(/\\\)/g, ')')
                  .replace(/\\\\/g, '\\');
                textContent.push(decoded);
              }
            });
          }
        }
      });
    }
    
    // Join all extracted text
    const extractedText = textContent
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (extractedText && extractedText.length > 10) {
      return {
        text: extractedText,
        confidence: 75,
        language: detectLanguage(extractedText),
        wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length
      };
    }
    
    // Fallback for image-based PDFs or protected PDFs
    return {
      text: `PDF document uploaded: ${file.name}\n\nThis PDF may be image-based or protected. The document has been stored and you can add notes about it in the Media Library.\n\nFor better text extraction from image-based PDFs, try converting individual pages to images first.`,
      confidence: 50,
      language: 'English',
      wordCount: 0
    };

  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return {
      text: `PDF document uploaded: ${file.name}\n\nThe document has been stored. You can add notes about it in the Media Library.`,
      confidence: 50,
      language: 'English',
      wordCount: 0
    };
  }
}

/**
 * Detect language from text (simple heuristic)
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 10) return 'English';
  
  // Check for non-Latin scripts first
  if (/[\u4e00-\u9fa5]/.test(text)) return 'Chinese';
  if (/[\u0400-\u04FF]/.test(text)) return 'Russian';
  if (/[\u0600-\u06FF]/.test(text)) return 'Arabic';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'Japanese';
  if (/[\uAC00-\uD7AF]/.test(text)) return 'Korean';
  
  // Check for common Spanish/French words
  const lowerText = text.toLowerCase();
  const spanishWords = /\b(el|la|los|las|un|una|de|del|en|que|es|por|para|con|este|esta)\b/gi;
  const frenchWords = /\b(le|la|les|un|une|de|du|des|en|est|pour|dans|avec|ce|cette)\b/gi;
  const germanWords = /\b(der|die|das|den|dem|des|ein|eine|und|ist|von|zu|mit)\b/gi;
  
  const spanishMatches = (lowerText.match(spanishWords) || []).length;
  const frenchMatches = (lowerText.match(frenchWords) || []).length;
  const germanMatches = (lowerText.match(germanWords) || []).length;
  
  if (spanishMatches > 3 && spanishMatches > frenchMatches) return 'Spanish';
  if (frenchMatches > 3) return 'French';
  if (germanMatches > 3) return 'German';
  
  return 'English';
}

/**
 * Get file type icon and color
 */
export function getFileTypeInfo(fileExtension: string): { icon: string; color: string; bgColor: string } {
  const ext = fileExtension.toLowerCase();
  
  const typeMap: Record<string, { icon: string; color: string; bgColor: string }> = {
    pdf: { icon: '📄', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
    doc: { icon: '📝', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
    docx: { icon: '📝', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
    xls: { icon: '📊', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
    xlsx: { icon: '📊', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
    ppt: { icon: '📽️', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
    pptx: { icon: '📽️', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
    jpg: { icon: '🖼️', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-300' },
    jpeg: { icon: '🖼️', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-300' },
    png: { icon: '🖼️', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-300' },
  };
  
  return typeMap[ext] || { icon: '📎', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300' };
}