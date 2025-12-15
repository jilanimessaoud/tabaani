import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// Format date based on language
export const formatDateByLanguage = (date, formatStr, language) => {
  const dateObj = new Date(date);
  
  if (language === 'ar') {
    // For Arabic, use native JavaScript Intl API
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    if (formatStr.includes('MMM')) {
      options.month = 'short';
    }
    if (formatStr.includes('dd')) {
      options.day = '2-digit';
    }
    if (formatStr.includes('HH') || formatStr.includes('hh')) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('ar-TN', options);
  }
  
  // For French and English, use date-fns
  const locale = language === 'en' ? enUS : fr;
  return format(dateObj, formatStr, { locale });
};


