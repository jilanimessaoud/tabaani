import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Nav } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
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
    <div className="admin-dashboard">
      <Nav className="admin-dashboard-nav">
        <Nav.Item className="me-auto">
          <Nav.Link href="/" target="_blank">
            🌐 View Website
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
          <Nav.Link onClick={handleLogout}>
            🚪 Logout
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Container className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <h1>Dashboard</h1>
          <p>Bienvenue dans votre panneau d'administration</p>
        </div>
        
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <div className="professional-stat-card blue">
              <div className="stat-card-header">
                <h6 className="stat-card-title">Total Articles</h6>
                <div className="stat-card-icon blue">📄</div>
              </div>
              <h2 className="stat-card-value">{stats?.totalArticles || 0}</h2>
              <div className="stat-card-footer">
                Tous les articles du site
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="professional-stat-card green">
              <div className="stat-card-header">
                <h6 className="stat-card-title">Published</h6>
                <div className="stat-card-icon green">✓</div>
              </div>
              <h2 className="stat-card-value success">{stats?.publishedArticles || 0}</h2>
              <div className="stat-card-footer">
                Articles publiés
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="professional-stat-card orange">
              <div className="stat-card-header">
                <h6 className="stat-card-title">Drafts</h6>
                <div className="stat-card-icon orange">📝</div>
              </div>
              <h2 className="stat-card-value warning">{stats?.draftArticles || 0}</h2>
              <div className="stat-card-footer">
                Brouillons en attente
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="professional-stat-card purple">
              <div className="stat-card-header">
                <h6 className="stat-card-title">Sections</h6>
                <div className="stat-card-icon purple">📁</div>
              </div>
              <h2 className="stat-card-value">{stats?.sections || 0}</h2>
              <div className="stat-card-footer">
                Catégories actives
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <div className="quick-actions-card">
              <h5>Actions Rapides</h5>
              <Button 
                variant="primary" 
                className="action-button"
                onClick={() => navigate('/admin/articles')}
              >
                <span>📝 Gérer les Articles</span>
                <span className="action-button-icon">→</span>
              </Button>
              <Button 
                variant="success" 
                className="action-button"
                onClick={() => navigate('/admin/sections')}
              >
                <span>📁 Gérer les Sections</span>
                <span className="action-button-icon">→</span>
              </Button>
              <Button 
                variant="warning" 
                className="action-button"
                onClick={() => navigate('/admin/ads')}
              >
                <span>📢 Gérer les Publicités</span>
                <span className="action-button-icon">→</span>
              </Button>
              <Button 
                variant="secondary" 
                className="action-button"
                onClick={() => navigate('/admin/config')}
              >
                <span>⚙️ Configurer le Site</span>
                <span className="action-button-icon">→</span>
              </Button>
              <Button 
                variant="info" 
                className="action-button"
                onClick={() => window.open('/', '_blank')}
              >
                <span>👁️ Voir le Site</span>
                <span className="action-button-icon">→</span>
              </Button>
            </div>
          </Col>
          <Col md={6}>
            <div className="section-stats-card">
              <h5>Articles par Section</h5>
              {stats?.articlesBySection && Array.isArray(stats.articlesBySection) && stats.articlesBySection.length > 0 ? (
                stats.articlesBySection.map((item) => (
                  <div key={item._id || item.section} className="section-stat-item">
                    <span className="section-stat-name">
                      {item.sectionTitle || (item.section ? item.section.charAt(0).toUpperCase() + item.section.slice(1) : 'Unknown')}
                      {item.visible === false && <span className="text-muted ms-2" style={{ fontSize: '0.75rem' }}>(Hidden)</span>}
                    </span>
                    <span className="section-stat-count">{item.count || 0}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">Aucune donnée disponible</p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
