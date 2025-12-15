import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image } from 'react-bootstrap';
import api from '../services/api';
import { isArabic, getTextDirection } from '../utils/languageDetection';
import { useLanguage } from '../context/LanguageContext';
import { formatDateByLanguage } from '../utils/dateFormatter';
import LoadingSpinner from '../components/LoadingSpinner';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRTL, setIsRTL] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/api/articles/${id}`);
      const articleData = response.data;
      setArticle(articleData);
      
      // Detect if article is in Arabic
      const contentIsArabic = isArabic(articleData.content || articleData.title);
      setIsRTL(contentIsArabic);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching article:', error);
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (video) => {
    if (!video || !video.url) return null;
    
    if (video.type === 'youtube') {
      const videoId = video.url.includes('youtu.be/')
        ? video.url.split('youtu.be/')[1].split('?')[0]
        : video.url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    if (video.type === 'facebook') {
      // Facebook video embed URL format
      // Extract post ID or use full URL
      let videoUrl = video.url;
      
      // If it's a Facebook post URL, convert to embed format
      if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.com')) {
        // Use Facebook's video embed plugin
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560&height=315`;
      }
      
      return videoUrl;
    }
    
    if (video.type === 'file') {
      return video.url.startsWith('http') ? video.url : `http://localhost:5000${video.url}`;
    }
    
    return null;
  };

  const renderContentBlocks = () => {
    if (!article.contentBlocks || article.contentBlocks.length === 0) {
      // Fallback to old content format
      return (
        <div className="article-content" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      );
    }

    // Sort blocks by order
    const sortedBlocks = [...article.contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div className="article-content" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
        {sortedBlocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <div key={index} className="mb-4">
                {block.content.split('\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          } else if (block.type === 'image') {
            // Handle both external URLs and local file paths
            let imageUrl = block.mediaUrl || '';
            if (imageUrl) {
              // If it's an external URL (http/https), use it directly
              if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                // It's a local file path, prepend API URL
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                imageUrl = `${API_BASE_URL}${imageUrl}`;
              }
            }
            
            if (!imageUrl) return null;
            
            return (
              <div key={index} className="mb-4">
                <Image
                  src={imageUrl}
                  fluid
                  className="mb-3 article-content-image"
                  alt={`${article.title} - Image ${index + 1}`}
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            );
          } else if (block.type === 'video') {
            const video = {
              type: block.mediaType,
              url: block.mediaUrl
            };
            const videoEmbedUrl = getVideoEmbedUrl(video);
            
            if (videoEmbedUrl) {
              return (
                <div key={index} className="mb-4">
                  {block.mediaType === 'file' ? (
                    <video controls style={{ width: '100%' }}>
                      <source src={videoEmbedUrl} />
                      {t('videoNotSupported')}
                    </video>
                  ) : (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                      <iframe
                        src={videoEmbedUrl}
                        title={article.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="main-content">
        <LoadingSpinner message={t('loading')} />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container className="main-content">
        <div className="text-center">
          <h2>{t('articleNotFound')}</h2>
          <Link to="/">{t('goBackHome')}</Link>
        </div>
      </Container>
    );
  }

  // Get standalone images and videos (for backward compatibility and bottom display)
  const standaloneImages = article.images || [];
  const standaloneVideo = article.video;

  const articleStyle = {
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };

  return (
    <div className="main-content">
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            <div className="article-detail-container fade-in" style={articleStyle}>
            {article.section && (() => {
              const translationKey = `section${article.section.charAt(0).toUpperCase() + article.section.slice(1)}`;
              const translatedSectionName = t(translationKey);
              const displaySectionName = translatedSectionName !== translationKey 
                ? translatedSectionName 
                : article.section.charAt(0).toUpperCase() + article.section.slice(1);
              return (
                <Link 
                  to={`/section/${article.section}`} 
                  className="text-decoration-none mb-4 d-inline-flex align-items-center article-back-link"
                >
                  <i className={`bi bi-arrow-${isRTL ? 'right' : 'left'} me-2`}></i>
                  {t('backTo')} {displaySectionName}
                </Link>
              );
            })()}
            
            <div className="article-detail-header">
              <h1 className="article-detail-title mb-3">
                {article.title}
              </h1>
              
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <small className="text-muted d-flex align-items-center">
                  <i className="bi bi-calendar3 me-2"></i>
                  {t('publishedOn')} {formatDateByLanguage(article.createdAt, 'dd MMMM yyyy', language)}
                </small>
                {article.section && (() => {
                  const translationKey = `section${article.section.charAt(0).toUpperCase() + article.section.slice(1)}`;
                  const translatedSectionName = t(translationKey);
                  const displaySectionName = translatedSectionName !== translationKey 
                    ? translatedSectionName 
                    : article.section.charAt(0).toUpperCase() + article.section.slice(1);
                  return (
                    <span className="badge bg-primary">
                      {displaySectionName}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Article Content First */}
            {renderContentBlocks()}

            {/* Media at Bottom */}
            {standaloneImages.length > 0 && (
              <div className="mt-5 pt-4 border-top">
                <h5 className="mb-4 d-flex align-items-center">
                  <i className="bi bi-images me-2"></i>
                  {t('gallery')}
                </h5>
                <Row>
                  {standaloneImages.map((img, index) => (
                    <Col key={index} md={6} className="mb-3">
                      <Image
                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                        fluid
                        className="rounded shadow-sm"
                        alt={`${article.title} - Image ${index + 1}`}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {standaloneVideo && standaloneVideo.type && (
              <div className="mt-5 pt-4 border-top">
                <h5 className="mb-4 d-flex align-items-center">
                  <i className="bi bi-play-circle me-2"></i>
                  {t('video')}
                </h5>
                {(() => {
                  const videoEmbedUrl = getVideoEmbedUrl(standaloneVideo);
                  if (!videoEmbedUrl) return null;
                  
                  return standaloneVideo.type === 'file' ? (
                    <video controls style={{ width: '100%' }}>
                      <source src={videoEmbedUrl} />
                      {t('videoNotSupported')}
                    </video>
                  ) : (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                      <iframe
                        src={videoEmbedUrl}
                        title={article.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                })()}
              </div>
            )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ArticleDetail;
