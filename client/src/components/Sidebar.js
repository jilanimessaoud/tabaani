import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const [sections, setSections] = useState([]);
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/api/sections/public');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Function to get translated section name
  const getTranslatedSectionName = (section, sectionTitle) => {
    // First, try to get translation from translations.js (for predefined sections)
    const translationKey = `section${section.name.charAt(0).toUpperCase() + section.name.slice(1)}`;
    const translated = t(translationKey);
    
    // If translation exists and is different from the key, use it
    if (translated !== translationKey) {
      return translated;
    }
    
    // For new sections, use multilingual titles if available
    if (language === 'fr' && section.titleFr) {
      return section.titleFr;
    }
    if (language === 'en' && section.titleEn) {
      return section.titleEn;
    }
    if (language === 'ar' && section.titleAr) {
      return section.titleAr;
    }
    
    // Fallback to default title
    return sectionTitle;
  };

  return (
    <div className="sidebar">
      <Link 
        to="/" 
        className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        {t('home')}
      </Link>
      {sections
        .filter(section => section.visible)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const displayName = getTranslatedSectionName(section, section.title);
          return (
            <Link
              key={section.name}
              to={`/section/${section.name}`}
              className={`sidebar-item ${
                location.pathname === `/section/${section.name}` ? 'active' : ''
              }`}
            >
              {displayName}
            </Link>
          );
        })}
    </div>
  );
};

export default Sidebar;

