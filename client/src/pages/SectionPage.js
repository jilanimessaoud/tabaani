import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import api from '../services/api';
import ArticleListItem from '../components/ArticleListItem';
import TopAdvertisement from '../components/TopAdvertisement';
import ProfessionalPagination from '../components/ProfessionalPagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const SectionPage = () => {
  const { sectionName } = useParams();
  const [articles, setArticles] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
    setCurrentPage(1); // Reset to first page when section changes
  }, [sectionName]);

  const fetchData = async () => {
    try {
      const [sectionsRes, articlesRes] = await Promise.all([
        api.get('/api/sections/public'),
        api.get('/api/articles/public') // Fetch all articles like the main page
      ]);
      
      const foundSection = sectionsRes.data.find(s => s.name === sectionName);
      setSection(foundSection);
      
      // Filter articles to show:
      // 1. Articles that belong to this section
      // 2. All articles from main page (so they appear in their section too)
      const sectionArticles = articlesRes.data.filter(article => 
        article.section === sectionName
      );
      
      setArticles(sectionArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };


  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container className="main-content">
        <LoadingSpinner message={t('loadingArticles')} />
      </Container>
    );
  }

  if (!section) {
    return (
      <Container className="main-content">
        <div className="text-center">
          <h2>{t('sectionNotFound')}</h2>
        </div>
      </Container>
    );
  }

  // Function to get translated section name
  const getTranslatedSectionName = (sectionName) => {
    const translationKey = `section${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : null;
  };

  const translatedSectionName = getTranslatedSectionName(section.name);
  const displaySectionName = translatedSectionName || section.title;

  return (
    <div className="main-content">
      <Container>
        <div className="section-header mb-4 fade-in">
          <h1>{displaySectionName}</h1>
          {section.description && <p className="mb-0">{section.description}</p>}
        </div>

        {/* Top Advertisement */}
        <div className="mb-4">
          <TopAdvertisement />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-5 fade-in">
            <p className="text-muted">{t('noArticlesInSection')}</p>
          </div>
        ) : (
          <>
            <div className="articles-list">
              {currentArticles.map((article, index) => (
                <div key={article._id} style={{ animationDelay: `${index * 0.1}s` }} className="fade-in">
                  <ArticleListItem article={article} />
                </div>
              ))}
            </div>
            
            {/* Professional Pagination */}
            <ProfessionalPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </div>
  );
};

export default SectionPage;

