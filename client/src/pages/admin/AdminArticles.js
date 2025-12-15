import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Badge, Modal, Form, Nav, Alert, Row, Col, Image, Card, Tabs, Tab } from 'react-bootstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import ContentBlockEditor from '../../components/ContentBlockEditor';
import ArticleOrderManager from './ArticleOrderManager';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import '../../styles/AdminArticles.css';

const AdminArticles = () => {
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    section: 'autre',
    videoType: '',
    videoUrl: '',
    published: false,
    featured: false,
    order: 0,
    hashtags: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [useContentBlocks, setUseContentBlocks] = useState(false);
  const [contentBlockFiles, setContentBlockFiles] = useState({}); // Store files uploaded in content blocks: { blockIndex: { type: 'image'|'video', file: File } }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterHashtag, setFilterHashtag] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [sections, setSections] = useState([]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page when filters change
    try {
      const params = new URLSearchParams();
      if (filterSection && filterSection !== 'all') {
        params.append('section', filterSection);
      }
      if (filterTitle) {
        params.append('title', filterTitle);
      }
      if (filterHashtag) {
        params.append('hashtag', filterHashtag);
      }
      
      const response = await api.get(`/api/articles?${params.toString()}`);
      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  }, [filterTitle, filterHashtag, filterSection]);

  useEffect(() => {
    // Debounce filter changes
    const timer = setTimeout(() => {
      fetchArticles();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  useEffect(() => {
    // Fetch sections for dropdown
    const fetchSections = async () => {
      try {
        const response = await api.get('/api/sections');
        setSections(response.data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        section: article.section || 'autre',
        videoType: article.video?.type || '',
        videoUrl: article.video?.url || '',
        published: article.published,
        featured: article.featured,
        order: article.order !== undefined ? article.order : 0,
        hashtags: article.hashtags ? article.hashtags.join(', ') : ''
      });
      setExistingImages(article.images || []);
      setContentBlocks(article.contentBlocks || []);
      setUseContentBlocks(article.contentBlocks && article.contentBlocks.length > 0);
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        section: 'autre',
        videoType: '',
        videoUrl: '',
        published: false,
        featured: false,
        order: 0,
        hashtags: ''
      });
      setExistingImages([]);
      setContentBlocks([]);
      setUseContentBlocks(false);
    }
    setImages([]);
    setVideoFile(null);
    setContentBlockFiles({}); // Clear content block files when opening modal
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleRemoveExistingImage = (index) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newImages);
  };

  const handleRemoveNewImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!useContentBlocks && !formData.content.trim()) {
      setError('Content is required when not using content blocks');
      return;
    }

    if (useContentBlocks && contentBlocks.length === 0) {
      setError('Please add at least one content block');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      // Content is required for backward compatibility, but can be empty if using content blocks
      formDataToSend.append('content', formData.content.trim() || (useContentBlocks ? 'Content blocks mode' : ''));
      formDataToSend.append('section', formData.section || '');
      formDataToSend.append('published', formData.published);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('order', formData.order !== undefined ? formData.order : 0);
      formDataToSend.append('hashtags', formData.hashtags || '');

      // Handle content blocks
      if (useContentBlocks && contentBlocks.length > 0) {
        // Process blocks: replace uploaded files with placeholders and add files to FormData
        const processedBlocks = contentBlocks.map((block, index) => {
          const processedBlock = { ...block };
          
          // Check if this block has an uploaded file (either in block.uploadedFile or contentBlockFiles)
          const hasUploadedFile = block.uploadedFile || contentBlockFiles[index];
          
          if (hasUploadedFile) {
            // For uploaded files, we'll use a placeholder in the JSON
            // The actual file will be sent separately
            if (block.type === 'image') {
              processedBlock.mediaUrl = `__UPLOADED_IMAGE_${index}__`;
            } else if (block.type === 'video' && block.mediaType === 'file') {
              processedBlock.mediaUrl = `__UPLOADED_VIDEO_${index}__`;
            }
          } else if (block.mediaUrl && block.mediaUrl.startsWith('blob:')) {
            // Clean up preview URLs (blob URLs) - they shouldn't be saved
            processedBlock.mediaUrl = '';
          }
          
          return {
            ...processedBlock,
            order: processedBlock.order !== undefined ? processedBlock.order : index,
            // Remove uploadedFile and source fields from the JSON (they're sent separately)
            uploadedFile: undefined,
            imageSource: undefined,
            videoSource: undefined
          };
        });
        
        formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));
        
        // Append uploaded files from content blocks
        // First, add files from contentBlockFiles state
        Object.keys(contentBlockFiles).forEach(blockIndex => {
          const fileInfo = contentBlockFiles[blockIndex];
          if (fileInfo && fileInfo.file) {
            if (fileInfo.type === 'image') {
              formDataToSend.append(`contentBlockImage_${blockIndex}`, fileInfo.file);
            } else if (fileInfo.type === 'video') {
              formDataToSend.append(`contentBlockVideo_${blockIndex}`, fileInfo.file);
            }
          }
        });
        
        // Also add files directly from block.uploadedFile (in case they weren't added to contentBlockFiles)
        contentBlocks.forEach((block, index) => {
          if (block.uploadedFile) {
            if (block.type === 'image') {
              // Only add if not already in contentBlockFiles
              if (!contentBlockFiles[index] || !contentBlockFiles[index].file) {
                formDataToSend.append(`contentBlockImage_${index}`, block.uploadedFile);
              }
            } else if (block.type === 'video' && block.mediaType === 'file') {
              // Only add if not already in contentBlockFiles
              if (!contentBlockFiles[index] || !contentBlockFiles[index].file) {
                formDataToSend.append(`contentBlockVideo_${index}`, block.uploadedFile);
              }
            }
          }
        });
      } else if (!useContentBlocks) {
        // Clear content blocks if not using them
        formDataToSend.append('contentBlocks', JSON.stringify([]));
      }

      // Handle images - keep existing ones and add new ones
      if (existingImages.length > 0) {
        existingImages.forEach((img) => {
          formDataToSend.append('existingImages', img);
        });
      }

      // Add new images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Handle video
      if (formData.videoType === 'file' && videoFile) {
        formDataToSend.append('videoType', 'file');
        formDataToSend.append('video', videoFile);
      } else if (formData.videoType && formData.videoUrl) {
        formDataToSend.append('videoType', formData.videoType);
        formDataToSend.append('videoUrl', formData.videoUrl.trim());
      } else if (formData.videoType === '') {
        // Clear video if type is set to none
        formDataToSend.append('videoType', '');
        formDataToSend.append('videoUrl', '');
      }

      if (editingArticle) {
        await api.put(`/api/articles/${editingArticle._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Article updated successfully!');
      } else {
        await api.post('/api/articles', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Article created successfully!');
      }

      // Clean up blob URLs from content blocks
      contentBlocks.forEach(block => {
        if (block.mediaUrl && block.mediaUrl.startsWith('blob:')) {
          URL.revokeObjectURL(block.mediaUrl);
        }
      });
      
      setTimeout(() => {
        setShowModal(false);
        fetchArticles();
        setSuccess('');
        // Reset form and clear content block files
        setContentBlockFiles({});
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving article');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        await api.delete(`/api/articles/${id}`);
        setSuccess('Article deleted successfully!');
        fetchArticles();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error deleting article');
        console.error('Error deleting article:', error);
      }
    }
  };

  const togglePublish = async (article) => {
    try {
      const updatedArticle = { ...article, published: !article.published };
      const formDataToSend = new FormData();
      formDataToSend.append('title', updatedArticle.title);
      formDataToSend.append('content', updatedArticle.content);
      formDataToSend.append('section', updatedArticle.section || '');
      formDataToSend.append('published', updatedArticle.published);
      formDataToSend.append('featured', updatedArticle.featured);
      formDataToSend.append('order', updatedArticle.order);
      formDataToSend.append('hashtags', updatedArticle.hashtags ? updatedArticle.hashtags.join(', ') : '');

      await api.put(`/api/articles/${article._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
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
    <DndProvider backend={HTML5Backend}>
    <div className="admin-articles-container">
      <Nav className="admin-articles-nav">
        <Nav.Item className="me-auto">
          <Nav.Link onClick={() => navigate('/admin')}>
            ← Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
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

      <Container className="admin-articles-content">
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <div className="admin-articles-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Manage Articles</h1>
              <p>Create, edit, and manage your articles</p>
            </div>
            <div className="d-flex gap-2">
              <Button className="btn-create-modern" onClick={() => handleOpenModal()}>
                + Create New Article
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="filter-card-modern">
          <Card.Header>
            <strong>🔍 Filter Articles</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search by Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter title..."
                    value={filterTitle}
                    onChange={(e) => setFilterTitle(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter by Hashtag</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter hashtag (without #)..."
                    value={filterHashtag}
                    onChange={(e) => setFilterHashtag(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter by Section</Form.Label>
                  <Form.Select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                  >
                    <option value="all">All Sections</option>
                    {sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.title} {!section.visible && '(Hidden)'}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {(filterTitle || filterHashtag || filterSection !== 'all') && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setFilterTitle('');
                  setFilterHashtag('');
                  setFilterSection('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="nav-tabs-modern">
          <Tab eventKey="articles" title="Articles List">
            <div className="mt-3">

        {articles.length === 0 ? (
          <Card className="text-center p-5 empty-state-card">
            <Card.Body>
              <h4>No articles yet</h4>
              <p className="text-muted">Create your first article to get started</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Create Article
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {/* Pagination Info */}
            <div className="pagination-info mb-3">
              <span className="text-muted">
                Showing {((currentPage - 1) * articlesPerPage) + 1} to {Math.min(currentPage * articlesPerPage, articles.length)} of {articles.length} articles
              </span>
            </div>
            
            <div className="admin-articles-table-container">
              <Table striped bordered hover responsive className="admin-articles-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Media / Hashtags</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage).map((article) => (
                <tr key={article._id}>
                  <td>
                    <strong>{article.title}</strong>
                    <br />
                    <small className="text-muted">
                      {article.content && article.content.length > 0 
                        ? article.content.substring(0, 50) + '...'
                        : (article.contentBlocks && article.contentBlocks.length > 0 
                          ? `${article.contentBlocks.length} content block(s)`
                          : 'No content')}
                    </small>
                  </td>
                  <td>
                    {article.section ? (
                      <Badge bg="secondary">{article.section}</Badge>
                    ) : (
                      <span className="text-muted">No category</span>
                    )}
                    {article.source === 'facebook' && (
                      <Badge bg="primary" className="ms-1">Facebook</Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg={article.published ? 'success' : 'secondary'} className="status-badge-modern">
                      {article.published ? 'Published' : 'Draft'}
                    </Badge>
                    <Form.Check
                      type="switch"
                      id={`publish-${article._id}`}
                      checked={article.published}
                      onChange={() => togglePublish(article)}
                      className="mt-2"
                      size="sm"
                    />
                  </td>
                  <td>
                    <Badge bg={article.featured ? 'info' : 'secondary'}>
                      {article.featured ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td>
                    {article.images && article.images.length > 0 && (
                      <Badge bg="success">{article.images.length} image(s)</Badge>
                    )}
                    {article.video && article.video.type && (
                      <Badge bg="primary" className="ms-1">Video</Badge>
                    )}
                    {(!article.images || article.images.length === 0) && (!article.video || !article.video.type) && (
                      <span className="text-muted">None</span>
                    )}
                    {article.hashtags && article.hashtags.length > 0 && (
                      <div className="mt-1">
                        {article.hashtags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} bg="info" className="me-1">#{tag}</Badge>
                        ))}
                        {article.hashtags.length > 3 && (
                          <Badge bg="secondary">+{article.hashtags.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{article.order !== undefined ? article.order : 0}</td>
                  <td>
                    <div className="action-buttons-modern">
                      <button
                        className="btn-action-modern btn-edit-modern"
                        onClick={() => handleOpenModal(article)}
                        title="Edit Article"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-action-modern btn-delete-modern"
                        onClick={() => handleDelete(article._id)}
                        title="Delete Article"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Professional Pagination */}
            <ProfessionalPagination
              currentPage={currentPage}
              totalPages={Math.ceil(articles.length / articlesPerPage)}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
            </div>
          </Tab>
          <Tab eventKey="ordering" title="Manage Order">
            <div className="mt-3">
              <ArticleOrderManager articles={articles} onUpdate={fetchArticles} />
            </div>
          </Tab>
        </Tabs>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <strong>{editingArticle ? 'Edit Article' : 'Create New Article'}</strong>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Title *</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter article title"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label><strong>Content *</strong></Form.Label>
                      <Form.Check
                        type="switch"
                        id="use-blocks-switch"
                        label="Use Content Blocks (Text/Image/Video)"
                        checked={useContentBlocks}
                        onChange={(e) => setUseContentBlocks(e.target.checked)}
                      />
                    </div>
                    {useContentBlocks ? (
                      <div>
                        <Alert variant="info" className="mb-3">
                          <strong>Content Blocks Mode:</strong> Add text, images, and videos in any order. Drag blocks to reorder them.
                        </Alert>
                        <ContentBlockEditor
                          contentBlocks={contentBlocks}
                          setContentBlocks={setContentBlocks}
                          availableImages={existingImages}
                          availableVideos={[]}
                          onFileUpload={(blockIndex, file, type) => {
                            // Store the file for later upload
                            setContentBlockFiles(prev => ({
                              ...prev,
                              [blockIndex]: { type, file }
                            }));
                          }}
                        />
                        <Alert variant="info" className="mt-3">
                          <strong>Tip:</strong> Upload images in the "Pictures" section below first. Then you can select them in content blocks. Images uploaded here will be available after saving.
                        </Alert>
                      </div>
                    ) : (
                      <Form.Control
                        as="textarea"
                        rows={12}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your article content here..."
                        required
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Category *</strong></Form.Label>
                    <Form.Select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      required
                      className="form-select-modern"
                    >
                      {sections.length === 0 ? (
                        <option value="">Loading sections...</option>
                      ) : (
                        sections
                          .sort((a, b) => a.order - b.order)
                          .map((section) => (
                            <option key={section._id} value={section.name}>
                              {section.title} {!section.visible && '(Hidden)'}
                            </option>
                          ))
                      )}
                    </Form.Select>
                    <Form.Text className="text-muted">Select a category for this article. All sections are available, including hidden ones.</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Hashtags (Optional)</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.hashtags}
                      onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                      placeholder="Enter hashtags separated by commas (e.g., news, culture, event)"
                    />
                    <Form.Text className="text-muted">Separate multiple hashtags with commas. The # symbol is optional.</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Card className="mb-3">
                    <Card.Header className="bg-primary text-white">
                      <strong>Share Options</strong>
                    </Card.Header>
                    <Card.Body>
                      <Form.Check
                        type="switch"
                        id="published-switch"
                        label="Share Article (Published)"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="mb-3"
                      />
                      <small className="text-muted">
                        {formData.published 
                          ? 'Article will be visible to visitors' 
                          : 'Article will be saved as draft'}
                      </small>
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Featured</strong></Form.Label>
                    <Form.Check
                      type="switch"
                      id="featured-switch"
                      label="Feature this article"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Order</strong></Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <Form.Text className="text-muted">Default is 0 (appears first). When creating a new article with order 0, existing articles with order &gt;= 0 will be shifted up by 1.</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Pictures (Optional)</strong></Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages([...images, ...Array.from(e.target.files)])}
                    />
                    <Form.Text className="text-muted">You can select multiple images</Form.Text>
                    
                    {existingImages.length > 0 && (
                      <div className="mt-3">
                        <strong>Existing Images:</strong>
                        <Row className="mt-2">
                          {existingImages.map((img, index) => (
                            <Col key={index} xs={6} md={4} className="mb-2">
                              <div className="position-relative">
                                <Image
                                  src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                  thumbnail
                                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0"
                                  style={{ transform: 'translate(50%, -50%)' }}
                                  onClick={() => handleRemoveExistingImage(index)}
                                >
                                  ×
                                </Button>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div className="mt-3">
                        <strong>New Images to Upload:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {images.map((img, index) => (
                            <div key={index} className="position-relative">
                              <Badge bg="info" className="p-2">
                                {img.name}
                                <Button
                                  variant="link"
                                  className="text-white p-0 ms-2"
                                  style={{ textDecoration: 'none' }}
                                  onClick={() => handleRemoveNewImage(index)}
                                >
                                  ×
                                </Button>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Video (Optional)</strong></Form.Label>
                    <Form.Select
                      value={formData.videoType}
                      onChange={(e) => {
                        setFormData({ ...formData, videoType: e.target.value, videoUrl: '' });
                        setVideoFile(null);
                      }}
                    >
                      <option value="">No Video</option>
                      <option value="file">Upload Video File</option>
                      <option value="youtube">YouTube Link</option>
                      <option value="facebook">Facebook Link</option>
                    </Form.Select>

                    {formData.videoType === 'file' && (
                      <Form.Control
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        className="mt-2"
                      />
                    )}

                    {(formData.videoType === 'youtube' || formData.videoType === 'facebook') && (
                      <Form.Control
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder={
                          formData.videoType === 'youtube' 
                            ? 'https://www.youtube.com/watch?v=...' 
                            : 'Facebook video URL'
                        }
                        className="mt-2"
                      />
                    )}

                    {editingArticle && editingArticle.video && editingArticle.video.type && (
                      <Alert variant="info" className="mt-2">
                        Current video: {editingArticle.video.type}
                        {editingArticle.video.type === 'file' && (
                          <div>
                            <a href={`http://localhost:5000${editingArticle.video.url}`} target="_blank" rel="noopener noreferrer">
                              View current video
                            </a>
                          </div>
                        )}
                        {editingArticle.video.type !== 'file' && (
                          <div>
                            <a href={editingArticle.video.url} target="_blank" rel="noopener noreferrer">
                              {editingArticle.video.url}
                            </a>
                          </div>
                        )}
                      </Alert>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingArticle ? 'Update Article' : 'Create Article'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </Container>
    </div>
    </DndProvider>
  );
};

export default AdminArticles;
