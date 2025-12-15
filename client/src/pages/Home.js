import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ArticleListItem from '../components/ArticleListItem';
import TopAdvertisement from '../components/TopAdvertisement';
import ProfessionalPagination from '../components/ProfessionalPagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [sections, setSections] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const { t } = useLanguage();

  useEffect(() => {
    // Check for search query from URL
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
    fetchData();
    setCurrentPage(1); // Reset to first page when data changes
  }, [searchParams]);

  useEffect(() => {
    // Filter articles when search query changes
    filterArticles();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchQuery, allArticles]);

  const fetchData = async () => {
    try {
      const [sectionsRes, articlesRes] = await Promise.all([
        api.get('/api/sections/public'),
        api.get('/api/articles/public')
      ]);
      
      const sortedSections = sectionsRes.data
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order);
      
      setSections(sortedSections);
      
      // Sort articles by order first, then by newest (createdAt descending)
      const sortedArticles = articlesRes.data.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order; // Sort by order ascending
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Then by newest first
      });
      setAllArticles(sortedArticles);
      setFeaturedArticles(sortedArticles.filter(a => a.featured).slice(0, 6));
      setDisplayedArticles(sortedArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };


  const filterArticles = () => {
    let filtered = [...allArticles];

    // Search in title, content, and hashtags
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(queryLower);
        const contentMatch = article.content.toLowerCase().includes(queryLower);
        const hashtagMatch = article.hashtags && article.hashtags.some(tag =>
          tag.toLowerCase().includes(queryLower.replace('#', ''))
        );
        return titleMatch || contentMatch || hashtagMatch;
      });
    }

    // Set featured articles (first 6 featured)
    setFeaturedArticles(filtered.filter(a => a.featured).slice(0, 6));
    // Set all displayed articles (all posts from main page)
    setDisplayedArticles(filtered);
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = displayedArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(displayedArticles.length / articlesPerPage);

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

  return (
    <div className="main-content">
      <Container>
        {/* Top Advertisement */}
        <div className="mb-4">
          <TopAdvertisement />
        </div>

        {displayedArticles.length > 0 ? (
          <section className="mb-5 fade-in">
            <h2 className="section-title mb-4">
              {searchQuery ? t('searchResults') : t('latestNews')}
            </h2>
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
          </section>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">{t('noArticlesFound')}</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Home;

