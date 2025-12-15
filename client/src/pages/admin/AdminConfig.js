import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Nav, Alert, Form, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const DraggableSection = ({ section, index, moveSection, toggleVisibility }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'section',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSection(draggedItem.index, index);
        draggedItem.index = index;
      }
    }
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="draggable-section-item"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>{section.name.charAt(0).toUpperCase() + section.name.slice(1)}</strong>
          <span className="ms-2 text-muted">(Order: {section.order})</span>
        </div>
        <div>
          <input
            type="checkbox"
            checked={section.visible}
            onChange={toggleVisibility}
            className="me-2"
          />
          <span className="text-muted">Visible</span>
        </div>
      </div>
    </div>
  );
};

const AdminConfig = () => {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [footerConfig, setFooterConfig] = useState({
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
      tiktok: ''
    },
    contactEmails: {
      contact: '',
      pub: '',
      recrutement: ''
    },
    siteName: 'Tabaani'
  });
  const [logo, setLogo] = useState('/logo.jpeg');
  const [logoPreview, setLogoPreview] = useState('/logo.jpeg');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/api/config');
      setConfig(response.data.active);
      setSections(response.data.active?.layout?.sections || []);
      if (response.data.active?.footer) {
        setFooterConfig(response.data.active.footer);
      }
      if (response.data.active?.logo) {
        setLogo(response.data.active.logo);
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        setLogoPreview(response.data.active.logo.startsWith('http') 
          ? response.data.active.logo 
          : `${API_BASE_URL}${response.data.active.logo}`);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching config:', error);
      setLoading(false);
    }
  };

  const moveSection = (dragIndex, hoverIndex) => {
    const newSections = [...sections];
    const draggedSection = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);
    
    // Update order
    newSections.forEach((section, index) => {
      section.order = index;
    });
    
    setSections(newSections);
  };

  const toggleVisibility = (index) => {
    const newSections = [...sections];
    newSections[index].visible = !newSections[index].visible;
    setSections(newSections);
  };

  const handleSavePreview = async () => {
    try {
      await api.post('/api/config/preview', {
        layout: { sections }
      });
      setMessage('Preview saved! You can now preview it before publishing.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving preview');
      console.error(error);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post('/api/config/publish');
      setMessage('Configuration published successfully!');
      fetchConfig();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error publishing configuration');
      console.error(error);
    }
  };

  const handleSaveFooter = async () => {
    try {
      setMessage('Saving configuration...');
      const formData = new FormData();
      formData.append('layout', JSON.stringify({ sections }));
      formData.append('footer', JSON.stringify(footerConfig));
      
      // If logo file is selected, append it
      const logoInput = document.getElementById('logo-upload');
      if (logoInput && logoInput.files[0]) {
        formData.append('logo', logoInput.files[0]);
        console.log('Logo file selected:', logoInput.files[0].name);
      }
      
      const response = await api.put('/api/config', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Config saved successfully:', response.data);
      setMessage('Configuration saved successfully!');
      
      // Refresh config to get updated logo and footer
      await fetchConfig();
      
      // Clear logo input after successful save
      if (logoInput) {
        logoInput.value = '';
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage(`Error saving configuration: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="admin-config-container" style={{ minHeight: '100vh' }}>
        <Nav className="bg-dark text-white p-3 admin-config-nav">
          <Nav.Item className="me-auto">
            <Nav.Link className="text-white" onClick={() => navigate('/admin')}>
              Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Button 
              variant={darkMode ? "warning" : "dark"}
              size="sm" 
              className="me-2 d-flex align-items-center"
              onClick={toggleDarkMode}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              <i className={`bi bi-${darkMode ? 'sun' : 'moon-fill'} me-2`}></i>
              <span className="d-none d-md-inline">{darkMode ? 'Clair' : 'Sombre'}</span>
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className="text-white" onClick={handleLogout}>
              Logout
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Container className="py-5">
          <h1 className="mb-4">Website Configuration</h1>
          
          {message && (
            <Alert variant={message.includes('Error') ? 'danger' : 'success'} dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          <Card className="mb-4">
            <Card.Header>
              <h5>Drag and Drop to Reorder Sections</h5>
            </Card.Header>
            <Card.Body>
              {sections.map((section, index) => (
                <DraggableSection
                  key={section.name}
                  section={section}
                  index={index}
                  moveSection={moveSection}
                  toggleVisibility={() => toggleVisibility(index)}
                />
              ))}
            </Card.Body>
          </Card>

          <Tabs defaultActiveKey="sections" className="mb-4">
            <Tab eventKey="sections" title="Sections">
              <div className="d-flex gap-2 mt-3">
                <Button variant="primary" onClick={handleSavePreview}>
                  Save Preview
                </Button>
                <Button variant="success" onClick={handlePublish}>
                  Publish Changes
                </Button>
                <Button variant="info" onClick={() => window.open('/', '_blank')}>
                  Voir le Site
                </Button>
              </div>
            </Tab>
            
            <Tab eventKey="footer" title="Footer & Social Links">
              <Card className="mt-3">
                <Card.Header>
                  <h5>Footer Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Website Logo</Form.Label>
                          <Form.Control
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="mb-2"
                          />
                          {logoPreview && (
                            <div className="mt-2">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                style={{ maxHeight: '100px', width: 'auto', borderRadius: '8px', border: '1px solid #ddd' }}
                              />
                              <p className="text-muted small mt-2">Current logo preview</p>
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Site Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={footerConfig.siteName}
                            onChange={(e) => setFooterConfig({ ...footerConfig, siteName: e.target.value })}
                            placeholder="Tabaani"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h6 className="mt-4 mb-3">Social Media Links</h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="bi bi-facebook me-2"></i>Facebook</Form.Label>
                          <Form.Control
                            type="url"
                            value={footerConfig.socialLinks.facebook}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              socialLinks: { ...footerConfig.socialLinks, facebook: e.target.value }
                            })}
                            placeholder="https://facebook.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="bi bi-instagram me-2"></i>Instagram</Form.Label>
                          <Form.Control
                            type="url"
                            value={footerConfig.socialLinks.instagram}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              socialLinks: { ...footerConfig.socialLinks, instagram: e.target.value }
                            })}
                            placeholder="https://instagram.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="bi bi-youtube me-2"></i>YouTube</Form.Label>
                          <Form.Control
                            type="url"
                            value={footerConfig.socialLinks.youtube}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              socialLinks: { ...footerConfig.socialLinks, youtube: e.target.value }
                            })}
                            placeholder="https://youtube.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="bi bi-twitter-x me-2"></i>Twitter/X</Form.Label>
                          <Form.Control
                            type="url"
                            value={footerConfig.socialLinks.twitter}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              socialLinks: { ...footerConfig.socialLinks, twitter: e.target.value }
                            })}
                            placeholder="https://twitter.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><i className="bi bi-tiktok me-2"></i>TikTok</Form.Label>
                          <Form.Control
                            type="url"
                            value={footerConfig.socialLinks.tiktok}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              socialLinks: { ...footerConfig.socialLinks, tiktok: e.target.value }
                            })}
                            placeholder="https://tiktok.com/..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h6 className="mt-4 mb-3">Contact Emails</h6>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contact Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={footerConfig.contactEmails.contact}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              contactEmails: { ...footerConfig.contactEmails, contact: e.target.value }
                            })}
                            placeholder="contact@example.com"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Publicity Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={footerConfig.contactEmails.pub}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              contactEmails: { ...footerConfig.contactEmails, pub: e.target.value }
                            })}
                            placeholder="pub@example.com"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Recruitment Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={footerConfig.contactEmails.recrutement}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              contactEmails: { ...footerConfig.contactEmails, recrutement: e.target.value }
                            })}
                            placeholder="recrutement@example.com"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button variant="primary" onClick={handleSaveFooter}>
                      Save Footer Configuration
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Container>
      </div>
    </DndProvider>
  );
};

export default AdminConfig;

