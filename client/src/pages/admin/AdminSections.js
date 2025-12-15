import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Nav, 
  Table, 
  Form, 
  Modal, 
  Alert 
} from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const AdminSections = () => {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    titleFr: '',
    titleEn: '',
    titleAr: '',
    description: '',
    order: 0,
    visible: true
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/api/sections');
      setSections(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error fetching sections');
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
      name: '',
      title: '',
      titleFr: '',
      titleEn: '',
      titleAr: '',
      description: '',
      order: sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 0,
      visible: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (section) => {
    setSelectedSection(section);
    setFormData({
      name: section.name,
      title: section.title,
      titleFr: section.titleFr || '',
      titleEn: section.titleEn || '',
      titleAr: section.titleAr || '',
      description: section.description || '',
      order: section.order,
      visible: section.visible
    });
    setShowEditModal(true);
  };

  const handleDelete = (section) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sections', formData);
      setMessage('Section added successfully');
      setMessageType('success');
      setShowAddModal(false);
      fetchSections();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding section');
      setMessageType('danger');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/sections/${selectedSection._id}`, formData);
      setMessage('Section updated successfully');
      setMessageType('success');
      setShowEditModal(false);
      setSelectedSection(null);
      fetchSections();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating section');
      setMessageType('danger');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/sections/${selectedSection._id}`);
      setMessage('Section deleted successfully');
      setMessageType('success');
      setShowDeleteModal(false);
      setSelectedSection(null);
      fetchSections();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting section');
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
    <div className="admin-sections-container" style={{ minHeight: '100vh' }}>
      <Nav className="bg-dark text-white p-3 admin-sections-nav">
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
          <h1>Manage Sections</h1>
          <Button variant="primary" onClick={handleAdd}>
            + Add Section
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
                  <th>Name</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Visible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No sections found. Click "Add Section" to create one.
                    </td>
                  </tr>
                ) : (
                  sections.map((section) => (
                    <tr key={section._id}>
                      <td>{section.name}</td>
                      <td>{section.title}</td>
                      <td>{section.description || '-'}</td>
                      <td>{section.order}</td>
                      <td>
                        <span className={section.visible ? 'text-success' : 'text-muted'}>
                          {section.visible ? '✓ Visible' : '✗ Hidden'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(section)}
                        >
                          Edit
                        </Button>
                        {section.name !== 'autre' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(section)}
                          >
                            Delete
                          </Button>
                        )}
                        {section.name === 'autre' && (
                          <span className="text-muted small">Cannot delete</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add Section Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitAdd}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name (URL-friendly, lowercase, no spaces)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., technology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <Form.Text className="text-muted">
                This will be used in the URL: /section/{formData.name || 'name'}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (Default)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Technology"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Form.Text className="text-muted">This will be used if translations are not provided</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (French) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Technologie"
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (English) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Technology"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (Arabic) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., التكنولوجيا"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Section description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <Form.Text className="text-muted">
                The order will be automatically adjusted. The "Other" section will always be last.
              </Form.Text>
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Section
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Section</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name (URL-friendly, lowercase, no spaces)</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <Form.Text className="text-muted">
                This will be used in the URL: /section/{formData.name || 'name'}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (Default)</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Form.Text className="text-muted">This will be used if translations are not provided</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (French) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Technologie"
                value={formData.titleFr}
                onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (English) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Technology"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (Arabic) - Optional</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., التكنولوجيا"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
                disabled={formData.name === 'autre'}
              />
              {formData.name === 'autre' ? (
                <Form.Text className="text-muted">
                  The "Other" section order cannot be changed. It will always be the last section.
                </Form.Text>
              ) : (
                <Form.Text className="text-muted">
                  The order will be automatically adjusted. The "Other" section will always be last.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Section
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the section <strong>"{selectedSection?.title}"</strong>?</p>
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

export default AdminSections;


