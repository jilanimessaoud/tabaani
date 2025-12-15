// Detect if text is Arabic
export const isArabic = (text) => {
  if (!text) return false;
  // Arabic Unicode range: \u0600-\u06FF
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// Detect language of text
export const detectLanguage = (text) => {
  if (!text) return 'unknown';
  
  const arabicCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  
  if (totalChars === 0) return 'unknown';
  
  const arabicRatio = arabicCount / totalChars;
  
  if (arabicRatio > 0.3) {
    return 'ar';
  }
  
  // Simple detection for French vs English
  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'un', 'une', 'dans', 'pour', 'avec', 'sur', 'par'];
  const englishWords = ['the', 'and', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const lowerText = text.toLowerCase();
  const frenchMatches = frenchWords.filter(word => lowerText.includes(word)).length;
  const englishMatches = englishWords.filter(word => lowerText.includes(word)).length;
  
  if (frenchMatches > englishMatches) {
    return 'fr';
  } else if (englishMatches > frenchMatches) {
    return 'en';
  }
  
  return 'fr'; // Default to French
};

// Get text direction based on language
export const getTextDirection = (text) => {
  return isArabic(text) ? 'rtl' : 'ltr';
};

