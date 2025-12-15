import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Nav, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import PreviewHome from './PreviewHome';

const AdminPreview = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handlePublish = async () => {
    try {
      await api.post('/api/config/publish');
      setMessage('Configuration published successfully!');
      setTimeout(() => {
        setMessage('');
        navigate('/admin/config');
      }, 2000);
    } catch (error) {
      setMessage('Error publishing configuration');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Nav className="bg-warning text-dark p-3">
        <Nav.Item className="me-auto">
          <Nav.Link className="text-dark fw-bold">PREVIEW MODE - This is how visitors will see the website</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Button variant="success" size="sm" className="me-2" onClick={handlePublish}>
            Publish Changes
          </Button>
          <Nav.Link className="text-dark" onClick={() => navigate('/admin/config')}>
            Back to Config
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-dark" onClick={handleLogout}>
            Logout
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {message && (
        <Alert variant={message.includes('Error') ? 'danger' : 'success'} className="m-0">
          {message}
        </Alert>
      )}

      <PreviewHome />
    </div>
  );
};

export default AdminPreview;

