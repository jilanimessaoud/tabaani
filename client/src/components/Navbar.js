import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Container, Image, Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logo, setLogo] = useState('/logo.jpeg');
  const [siteName, setSiteName] = useState('Tabaani');
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    fetchLogo();
    // Refresh logo every 30 seconds to catch updates
    const interval = setInterval(() => {
      fetchLogo();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await api.get('/api/config/public');
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
      // Update site name from footer config
      if (response.data.footer && response.data.footer.siteName) {
        setSiteName(response.data.footer.siteName);
      } else {
        setSiteName('Tabaani');
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      // Fallback to default logo and name on error
      setLogo('/logo.jpeg');
      setSiteName('Tabaani');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm fixed-top" style={{ zIndex: 1030 }}>
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Image 
            src={logo} 
            alt="Tabaani Logo" 
            className="logo-image me-2" 
            style={{ maxHeight: '50px', width: 'auto' }} 
          />
          <span className="fw-bold">{siteName}</span>
        </BootstrapNavbar.Brand>
          
          {/* Search Bar - between website name and sections */}
          <Form onSubmit={handleSearch} className="d-none d-md-flex mx-3" style={{ flex: '1', maxWidth: '400px' }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: '20px 0 0 20px' }}
              />
              <Button 
                variant="primary" 
                type="submit"
                style={{ borderRadius: '0 20px 20px 0' }}
              >
                🔍 {t('search')}
              </Button>
            </InputGroup>
          </Form>

          {/* Language Selector */}
          <Dropdown className="me-3">
            <Dropdown.Toggle 
              variant="outline-secondary" 
              size="sm"
              className="d-flex align-items-center language-selector-btn"
              id="language-dropdown"
            >
              <i className="bi  me-2"></i>
              <img 
                src={language === 'fr' 
                  ? 'https://flagcdn.com/w20/fr.png' 
                  : language === 'en'
                  ? 'https://flagcdn.com/w20/gb.png'
                  : 'https://flagcdn.com/w20/sa.png'} 
                alt={language === 'fr' ? 'France' : language === 'en' ? 'United Kingdom' : 'Saudi Arabia'}
                className="flag-icon me-2"
                style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
              />
              <span className="d-none d-md-inline language-code">
                {language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'AR'}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="language-dropdown-menu">
              <Dropdown.Item 
                onClick={() => changeLanguage('fr')}
                active={language === 'fr'}
                className="d-flex align-items-center"
              >
                <img 
                  src="https://flagcdn.com/w20/fr.png" 
                  alt="France"
                  className="flag-icon me-2"
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <span>{t('french')}</span>
                {language === 'fr' && <i className="bi bi-check2 ms-auto"></i>}
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => changeLanguage('en')}
                active={language === 'en'}
                className="d-flex align-items-center"
              >
                <img 
                  src="https://flagcdn.com/w20/gb.png" 
                  alt="United Kingdom"
                  className="flag-icon me-2"
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <span>{t('english')}</span>
                {language === 'en' && <i className="bi bi-check2 ms-auto"></i>}
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => changeLanguage('ar')}
                active={language === 'ar'}
                className="d-flex align-items-center"
              >
                <img 
                  src="https://flagcdn.com/w20/sa.png" 
                  alt="Saudi Arabia"
                  className="flag-icon me-2"
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <span>{t('arabic')}</span>
                {language === 'ar' && <i className="bi bi-check2 ms-auto"></i>}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Theme Toggle */}
          <Button 
            variant={darkMode ? "warning" : "dark"}
            size="sm" 
            className="me-3 d-flex align-items-center"
            onClick={toggleDarkMode}
            title={darkMode ? t('lightMode') : t('darkMode')}
          >
            <i className={`bi bi-${darkMode ? 'sun' : 'moon-fill'} me-2`}></i>
            <span className="d-none d-md-inline">{darkMode ? t('light') : t('dark')}</span>
          </Button>

          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            {/* Search Bar for mobile */}
            <Form onSubmit={handleSearch} className="d-md-none mb-3 px-3">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '20px 0 0 20px' }}
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  style={{ borderRadius: '0 20px 20px 0' }}
                >
                  🔍 {t('search')}
                </Button>
              </InputGroup>
            </Form>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
  );
};

export default Navbar;

