import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Button, 
  Nav, 
  Table, 
  Form, 
  Modal, 
  Alert,
  Badge,
  Image
} from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const AdminAds = () => {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    videoType: 'video/mp4',
    active: true,
    order: 0,
    link: ''
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.get('/api/ads');
      setAds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setMessage('Error fetching advertisements');
      setMessageType('danger');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      type: 'image',
      videoType: 'video/mp4',
      active: true,
      order: ads.length > 0 ? Math.max(...ads.map(a => a.order)) + 1 : 0,
      link: ''
    });
    setFile(null);
    setPreview(null);
    setShowAddModal(true);
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type,
      videoType: ad.videoType || 'video/mp4',
      active: ad.active,
      order: ad.order,
      link: ad.link || ''
    });
    setFile(null);
    setPreview(ad.url.startsWith('http') ? ad.url : `http://localhost:5000${ad.url}`);
    setShowEditModal(true);
  };

  const handleDelete = (ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!formData.title.trim()) {
      setMessage('Title is required');
      setMessageType('danger');
      return;
    }

    if (!file) {
      setMessage('Please select a file');
      setMessageType('danger');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('videoType', formData.videoType);
      formDataToSend.append('active', formData.active);
      formDataToSend.append('order', formData.order);
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }
      formDataToSend.append('file', file);

      await api.post('/api/ads', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Advertisement added successfully');
      setMessageType('success');
      setShowAddModal(false);
      fetchAds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding advertisement');
      setMessageType('danger');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.title.trim()) {
      setMessage('Title is required');
      setMessageType('danger');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('videoType', formData.videoType);
      formDataToSend.append('active', formData.active);
      formDataToSend.append('order', formData.order);
      if (formData.link) {
        formDataToSend.append('link', formData.link);
      }
      if (file) {
        formDataToSend.append('file', file);
      }

      await api.put(`/api/ads/${selectedAd._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Advertisement updated successfully');
      setMessageType('success');
      setShowEditModal(false);
      setSelectedAd(null);
      fetchAds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating advertisement');
      setMessageType('danger');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/ads/${selectedAd._id}`);
      setMessage('Advertisement deleted successfully');
      setMessageType('success');
      setShowDeleteModal(false);
      setSelectedAd(null);
      fetchAds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting advertisement');
      setMessageType('danger');
      setTimeout(() => setMessage(''), 5000);
    }
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
    <div className="admin-ads-container" style={{ minHeight: '100vh' }}>
      <Nav className="bg-dark text-white p-3 admin-ads-nav">
        <Nav.Item className="me-auto">
          <Nav.Link className="text-white" href="/" target="_blank">
            View Website
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
          <Nav.Link className="text-white" onClick={() => navigate('/admin')}>
            Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="text-white" onClick={handleLogout}>
            Logout
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Manage Advertisements</h1>
          <Button variant="primary" onClick={handleAdd}>
            + Add Advertisement
          </Button>
        </div>

        {message && (
          <Alert variant={messageType} dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Title</th>
                  <th style={{ width: '7%' }}>Type</th>
                  <th style={{ width: '35%' }}>Preview</th>
                  <th style={{ width: '7%' }}>Active</th>
                  <th style={{ width: '7%' }}>Order</th>
                  <th style={{ width: '12%' }}>Link</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No advertisements found. Click "Add Advertisement" to create one.
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad._id}>
                      <td>{ad.title}</td>
                      <td>
                        <Badge bg={ad.type === 'image' ? 'info' : 'primary'}>
                          {ad.type}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ 
                          width: '400px', 
                          height: '300px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '0.375rem',
                          padding: '10px',
                          overflow: 'hidden'
                        }}>
                          {ad.type === 'image' ? (
                            <Image
                              src={ad.url.startsWith('http') ? ad.url : `http://localhost:5000${ad.url}`}
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <video 
                              src={ad.url.startsWith('http') ? ad.url : `http://localhost:5000${ad.url}`}
                              controls
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%',
                                width: 'auto',
                                height: 'auto',
                                display: 'block'
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={ad.active ? 'text-success' : 'text-muted'}>
                          {ad.active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td>{ad.order}</td>
                      <td>
                        {ad.link ? (
                          <a href={ad.link} target="_blank" rel="noopener noreferrer">
                            {ad.link.substring(0, 30)}...
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(ad)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(ad)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add Advertisement Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Advertisement</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAdd}>
          <Modal.Body>
            {message && <Alert variant={messageType}>{message}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter advertisement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setFile(null);
                  setPreview(null);
                }}
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>File *</Form.Label>
              <Form.Control
                type="file"
                accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                required
              />
              {preview && (
                <div className="mt-2" style={{ 
                  width: '100%', 
                  minHeight: '400px', 
                  maxHeight: '500px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '0.375rem', 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa',
                  overflow: 'hidden'
                }}>
                  {formData.type === 'image' ? (
                    <Image 
                      src={preview} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }} 
                    />
                  ) : (
                    <video 
                      src={preview} 
                      controls 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        display: 'block'
                      }} 
                    />
                  )}
                </div>
              )}
            </Form.Group>

            {formData.type === 'video' && (
              <Form.Group className="mb-3">
                <Form.Label>Video Type</Form.Label>
                <Form.Select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                >
                  <option value="video/mp4">MP4</option>
                  <option value="video/webm">WebM</option>
                  <option value="video/ogg">OGG</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Link (Optional)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <Form.Text className="text-muted">URL to redirect when ad is clicked</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Advertisement
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Advertisement Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Advertisement</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            {message && <Alert variant={messageType}>{message}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setFile(null);
                }}
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>File (Optional - leave empty to keep current)</Form.Label>
              <Form.Control
                type="file"
                accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
              />
              {preview && (
                <div className="mt-2" style={{ 
                  width: '100%', 
                  minHeight: '400px', 
                  maxHeight: '500px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '0.375rem', 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa',
                  overflow: 'hidden'
                }}>
                  {formData.type === 'image' ? (
                    <Image 
                      src={preview} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                      }} 
                    />
                  ) : (
                    <video 
                      src={preview} 
                      controls 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        display: 'block'
                      }} 
                    />
                  )}
                </div>
              )}
            </Form.Group>

            {formData.type === 'video' && (
              <Form.Group className="mb-3">
                <Form.Label>Video Type</Form.Label>
                <Form.Select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                >
                  <option value="video/mp4">MP4</option>
                  <option value="video/webm">WebM</option>
                  <option value="video/ogg">OGG</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Link (Optional)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Advertisement
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Advertisement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the advertisement <strong>"{selectedAd?.title}"</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAds;

