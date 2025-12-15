import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Alert, Form } from 'react-bootstrap';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '../../services/api';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import '../../styles/AdminArticles.css';

const DraggableArticleRow = ({ article, index, moveArticle, section, displayIndex }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'article',
    item: { index, articleId: article._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'article',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveArticle(draggedItem.index, index, section);
        draggedItem.index = index;
      }
    }
  });

  const handleOrderChange = async (newOrder) => {
    try {
      const formData = new FormData();
      formData.append('title', article.title || '');
      formData.append('content', article.content || '');
      formData.append('section', article.section || '');
      formData.append('published', article.published || false);
      formData.append('featured', article.featured || false);
      formData.append('order', newOrder);
      formData.append('hashtags', article.hashtags ? article.hashtags.join(', ') : '');
      formData.append('source', article.source || 'manual');
      formData.append('facebookPostId', article.facebookPostId || '');
      formData.append('contentBlocks', JSON.stringify(article.contentBlocks || []));

      await api.put(`/api/articles/${article._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <tr
      ref={(node) => drag(drop(node))}
      className="order-table-row"
      style={{ 
        opacity: isDragging ? 0.5 : 1, 
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s ease'
      }}
    >
      <td className="text-center">
        <Badge bg="secondary" className="order-badge">
          #{displayIndex !== undefined ? displayIndex : index + 1}
        </Badge>
        <div className="drag-handle">
          <i className="bi bi-grip-vertical text-muted"></i>
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center">
          <strong className="article-title">{article.title}</strong>
          {article.featured && (
            <Badge bg="warning" className="ms-2">
              <i className="bi bi-star-fill me-1"></i>
              En vedette
            </Badge>
          )}
        </div>
        {article.section && (
          <small className="text-muted d-block mt-1">
            Section: {article.section}
          </small>
        )}
      </td>
      <td className="text-center">
        <Badge 
          bg={article.published ? 'success' : 'warning'} 
          className="status-badge"
        >
          <i className={`bi bi-${article.published ? 'check-circle' : 'clock'} me-1`}></i>
          {article.published ? 'Publié' : 'Brouillon'}
        </Badge>
      </td>
      <td className="text-center">
        <Form.Control
          type="number"
          value={article.order !== undefined ? article.order : 0}
          onChange={(e) => handleOrderChange(parseInt(e.target.value) || 0)}
          className="order-input"
          size="sm"
          min="0"
        />
      </td>
    </tr>
  );
};

const ArticleOrderManager = ({ articles, onUpdate }) => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    // Fetch sections dynamically
    const fetchSections = async () => {
      try {
        const response = await api.get('/api/sections');
        setSections(response.data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    if (!articles || !Array.isArray(articles)) {
      setFilteredArticles([]);
      return;
    }
    
    if (selectedSection === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(a => a && a.section === selectedSection));
    }
    setCurrentPage(1); // Reset to first page when section changes
  }, [articles, selectedSection]);

  const moveArticle = async (dragIndex, hoverIndex, section) => {
    if (!filteredArticles || filteredArticles.length === 0) return;
    
    // Get all articles for the section, sorted by order
    const sectionArticles = [...filteredArticles]
      .filter(a => a)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (dragIndex < 0 || dragIndex >= sectionArticles.length || hoverIndex < 0 || hoverIndex >= sectionArticles.length) {
      return;
    }
    
    const draggedArticle = sectionArticles[dragIndex];
    if (!draggedArticle) return;
    
    // Remove from old position and insert at new position
    sectionArticles.splice(dragIndex, 1);
    sectionArticles.splice(hoverIndex, 0, draggedArticle);

    // Update orders - assign sequential orders starting from 0
    const updatePromises = sectionArticles.map((article, index) => {
      const newOrder = index;
      return updateArticleOrder(article._id, article.order, newOrder);
    });

    await Promise.all(updatePromises);
    setSuccess('Ordre mis à jour avec succès!');
    setTimeout(() => {
      setSuccess('');
      if (onUpdate) onUpdate();
    }, 1500);
  };

  const updateArticleOrder = async (articleId, oldOrder, newOrder) => {
    try {
      const article = articles.find(a => a._id === articleId);
      if (!article) return;

      // Only update if order actually changed
      if (oldOrder === newOrder) return;

      const formData = new FormData();
      formData.append('title', article.title || '');
      formData.append('content', article.content || '');
      formData.append('section', article.section || '');
      formData.append('published', article.published || false);
      formData.append('featured', article.featured || false);
      formData.append('order', newOrder);
      formData.append('hashtags', article.hashtags ? article.hashtags.join(', ') : '');
      formData.append('source', article.source || 'manual');
      formData.append('facebookPostId', article.facebookPostId || '');
      formData.append('contentBlocks', JSON.stringify(article.contentBlocks || []));

      await api.put(`/api/articles/${articleId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Calculate pagination
  const sortedArticles = filteredArticles
    .filter(a => a)
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order ascending (0 first)
  
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(sortedArticles.length / articlesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container fluid className="px-0">
        {success && (
          <Alert variant="success" className="order-alert" dismissible onClose={() => setSuccess('')}>
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}
        
        <Card className="order-manager-card mb-4">
          <Card.Header className="order-manager-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  <i className="bi bi-arrow-up-down me-2"></i>
                  Gérer l'ordre des articles
                </h5>
                <small className="text-muted">
                  Glissez-déposez pour réorganiser les articles. Les articles sont ordonnés par leur valeur d'ordre (0 apparaît en premier).
                </small>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <Form.Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="order-section-select"
                style={{ maxWidth: '300px' }}
              >
                <option value="all">Toutes les sections</option>
                {sections.map((section) => (
                  <option key={section._id} value={section.name}>
                    {section.title} {section.visible ? '' : '(Cachée)'}
                  </option>
                ))}
              </Form.Select>
            </div>

            {sortedArticles.length > 0 ? (
              <>
                <div className="order-info mb-3">
                  <Badge bg="info" className="me-2">
                    Total: {sortedArticles.length} article{sortedArticles.length > 1 ? 's' : ''}
                  </Badge>
                  <Badge bg="secondary">
                    Page {currentPage} sur {totalPages}
                  </Badge>
                </div>

                <div className="table-responsive">
                  <Table className="order-table" striped hover>
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }} className="text-center">
                          <i className="bi bi-grip-vertical me-1"></i>
                          Position
                        </th>
                        <th>Titre</th>
                        <th style={{ width: '120px' }} className="text-center">Statut</th>
                        <th style={{ width: '150px' }} className="text-center">Valeur d'ordre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentArticles.map((article, index) => {
                        // Calculate actual position in full list
                        const actualIndex = indexOfFirstArticle + index;
                        return (
                          <DraggableArticleRow
                            key={article._id}
                            article={article}
                            index={actualIndex}
                            moveArticle={moveArticle}
                            section={selectedSection}
                            displayIndex={actualIndex + 1}
                          />
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 d-flex justify-content-center">
                    <ProfessionalPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="text-muted mt-3">Aucun article trouvé</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </DndProvider>
  );
};

export default ArticleOrderManager;

