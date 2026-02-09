import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [footerConfig, setFooterConfig] = useState(null);
  const [logo, setLogo] = useState('/logo.jpeg');
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchFooterConfig();
    // Update date every minute
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    // Refresh footer config every 30 seconds to catch updates
    const configInterval = setInterval(() => {
      fetchFooterConfig();
    }, 30000);
    return () => {
      clearInterval(dateInterval);
      clearInterval(configInterval);
    };
  }, []);

  const fetchFooterConfig = async () => {
    try {
      const response = await api.get('/api/config/public');
      setFooterConfig(response.data.footer || {});
      if (response.data.logo) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const logoUrl = response.data.logo.startsWith('http') 
          ? response.data.logo 
          : `${API_BASE_URL}${response.data.logo}`;
        // Add timestamp to force refresh if logo changed
        setLogo(`${logoUrl}?t=${Date.now()}`);
      } else {
        // Fallback to default logo
        setLogo('/logo.jpeg');
      }
    } catch (error) {
      console.error('Error fetching footer config:', error);
      // Fallback to default logo on error
      setLogo('/logo.jpeg');
    }
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const locale = language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, options);
  };

  const socialLinks = footerConfig?.socialLinks || {};
  const contactEmails = footerConfig?.contactEmails || {};
  const siteName = footerConfig?.siteName || 'Tabaani';
  
  // Get type label in current language
  const getTypeLabel = (type) => {
    if (language === 'ar') {
      switch(type) {
        case 'contact': return 'اتصال';
        case 'recrutement': return 'توظيف';
        case 'pub': return 'إعلان';
        default: return type;
      }
    } else if (language === 'en') {
      switch(type) {
        case 'contact': return 'Contact';
        case 'recrutement': return 'Recruitment';
        case 'pub': return 'Advertising';
        default: return type;
      }
    } else {
      // Default to French
      switch(type) {
        case 'contact': return 'Contact';
        case 'recrutement': return 'Recrutement';
        case 'pub': return 'Publicité';
        default: return type;
      }
    }
  };

  return (
    <footer className="professional-footer">
      <Container>
        <div className="footer-content-new">
          {/* Logo */}
          <div className="footer-logo-section">
            <img 
              src={logo} 
              alt={siteName}
              className="footer-logo"
            />
            <h3 className="footer-site-name">{siteName}</h3>
          </div>

          {/* Social Media Icons */}
          <div className="footer-social-icons">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-facebook" title="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-youtube" title="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-tiktok" title="TikTok">
                <i className="bi bi-tiktok"></i>
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-instagram" title="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-twitter" title="X (Twitter)">
                <i className="bi bi-twitter-x"></i>
              </a>
            )}
          </div>

          {/* Current Date */}
          <div className="footer-date-section">
            <i className="bi bi-calendar3 me-2"></i>
            <span>{formatDate(currentDate)}</span>
          </div>

          {/* Contact Emails */}
          {(contactEmails.contact || contactEmails.recrutement || contactEmails.pub) && (
            <div className="footer-contact-section">
              <div className="footer-emails">
                {contactEmails.contact && (
                  <a href={`mailto:${contactEmails.contact}`} className="footer-email" title={getTypeLabel('contact')}>
                    <span className="footer-email-type">[{getTypeLabel('contact')}]</span> {contactEmails.contact}
                  </a>
                )}
                {contactEmails.recrutement && (
                  <a href={`mailto:${contactEmails.recrutement}`} className="footer-email" title={getTypeLabel('recrutement')}>
                    <span className="footer-email-type">[{getTypeLabel('recrutement')}]</span> {contactEmails.recrutement}
                  </a>
                )}
                {contactEmails.pub && (
                  <a href={`mailto:${contactEmails.pub}`} className="footer-email" title={getTypeLabel('pub')}>
                    <span className="footer-email-type">[{getTypeLabel('pub')}]</span> {contactEmails.pub}
                  </a>
                )}
              </div>
              <i className="bi bi-envelope footer-email-icon"></i>
            </div>
          )}

          {/* Copyright and Powered By */}
          <div className="footer-copyright-section">
            <div className="footer-copyright-row">
              <p className="footer-copyright-text">
                ©{currentYear} {siteName} {t('allRightsReserved')}
              </p>
              <p className="footer-powered-text">
                Powered by Naviris Tech +216 90131297 Naviristech@gmail.com
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

