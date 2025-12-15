import React, { createContext, useState, useContext, useEffect } from 'react';
import { t } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'fr'
    const savedLang = localStorage.getItem('appLanguage') || 'fr';
    // Allow 'fr', 'en', or 'ar'
    return (savedLang === 'fr' || savedLang === 'en' || savedLang === 'ar') ? savedLang : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    // Set HTML lang attribute
    document.documentElement.lang = language;
    // Set direction: RTL for Arabic, LTR for others
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const getText = (texts) => {
    return texts[language] || texts.fr || texts.en || Object.values(texts)[0];
  };

  // Translation function
  const translate = (key) => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, getText, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

