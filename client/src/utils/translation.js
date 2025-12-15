// Import detectLanguage from languageDetection
import { detectLanguage } from './languageDetection';

// Simple translation service using Google Translate API (free tier)
// For production, you might want to use a paid service or implement caching

const TRANSLATE_API_URL = 'https://translate.googleapis.com/translate_a/single';

export const translateText = async (text, targetLang = 'en', sourceLang = 'auto') => {
  try {
    // Use Google Translate API (free, but rate-limited)
    const response = await fetch(
      `${TRANSLATE_API_URL}?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    
    // Extract translated text from response
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0].map(item => item[0]).join('');
    }
    
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

export const translateArticle = async (article, targetLang) => {
  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      translateText(article.title, targetLang),
      translateText(article.content, targetLang)
    ]);
    
    return {
      ...article,
      title: translatedTitle,
      content: translatedContent,
      translated: true,
      originalLanguage: detectLanguage(article.content)
    };
  } catch (error) {
    console.error('Article translation error:', error);
    return article;
  }
};

