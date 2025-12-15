import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';
const logoImage = '/logo.jpeg';

const PreviewHome = () => {
  const [sections, setSections] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch preview config sections
      const configRes = await api.get('/api/config');
      const previewConfig = configRes.data.preview || configRes.data.active;
      const previewSections = previewConfig?.layout?.sections || [];
      
      // Fetch sections with titles
      const sectionsRes = await api.get('/api/sections/public');
      const allSections = sectionsRes.data;
      
      // Merge preview order with section data
      const sortedSections = previewSections
        .map(previewSection => {
          const sectionData = allSections.find(s => s.name === previewSection.name);
          return sectionData ? { ...sectionData, ...previewSection } : null;
        })
        .filter(s => s && s.visible)
        .sort((a, b) => a.order - b.order);
      
      setSections(sortedSections);
      
      // Fetch featured articles
      const articlesRes = await api.get('/api/articles/public?featured=true');
      setFeaturedArticles(articlesRes.data.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="main-content">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="main-content">
      <Container>
        <div className="logo-container">
          <img src={logoImage} alt="Tabaani Logo" className="logo-image" />
        </div>

        {featuredArticles.length > 0 && (
          <section className="mb-5">
            <h2 className="text-center mb-4">Featured Articles</h2>
            <Row>
              {featuredArticles.map((article) => (
                <Col key={article._id} md={6} lg={4}>
                  <ArticleCard article={article} />
                </Col>
              ))}
            </Row>
          </section>
        )}

        <section>
          <h2 className="text-center mb-4">Sections</h2>
          <Row>
            {sections.map((section) => (
              <Col key={section.name} md={6} lg={3} className="mb-4">
                <Card as={Link} to={`/section/${section.name}`} className="h-100 text-decoration-none">
                  <Card.Body className="text-center">
                    <Card.Title>{section.title}</Card.Title>
                    {section.description && (
                      <Card.Text className="text-muted">{section.description}</Card.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default PreviewHome;

