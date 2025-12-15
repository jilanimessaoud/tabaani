import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { isArabic, getTextDirection } from '../utils/languageDetection';
import { formatDateByLanguage } from '../utils/dateFormatter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ArticleListItem = ({ article }) => {
  const { language, t } = useLanguage();
  const [isRTL, setIsRTL] = useState(false);
  const [excerpt, setExcerpt] = useState('');

  useEffect(() => {
    // Detect if article content is Arabic
    const contentIsArabic = isArabic(article.content || article.title);
    setIsRTL(contentIsArabic);
    
    // Set excerpt from content blocks or regular content
    let contentText = '';
    
    if (article.contentBlocks && article.contentBlocks.length > 0) {
      // Extract text from content blocks
      const textBlocks = article.contentBlocks
        .filter(block => block.type === 'text' && block.content)
        .map(block => block.content)
        .join(' ');
      contentText = textBlocks || article.content || '';
    } else {
      contentText = article.content || '';
    }
    
    // Set excerpt (first 250 characters)
    if (contentText.length > 250) {
      setExcerpt(contentText.substring(0, 250).trim() + '...');
    } else {
      setExcerpt(contentText);
    }
  }, [article]);
  const getVideoEmbedUrl = (video) => {
    if (!video || !video.url) return null;
    
    if (video.type === 'youtube') {
      const videoId = video.url.includes('youtu.be/')
        ? video.url.split('youtu.be/')[1].split('?')[0]
        : video.url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    if (video.type === 'facebook') {
      let videoUrl = video.url;
      if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.com')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560&height=315`;
      }
      return videoUrl;
    }
    
    if (video.type === 'file') {
      return video.url.startsWith('http') ? video.url : `${API_BASE_URL}${video.url}`;
    }
    
    return null;
  };

  // Get video from article.video field
  const mainVideo = article.video ? {
    type: article.video.type,
    url: article.video.url
  } : null;

  // Get first video from contentBlocks
  const getFirstVideoFromBlocks = () => {
    if (!article.contentBlocks || article.contentBlocks.length === 0) return null;
    
    const videoBlock = article.contentBlocks.find(block => block.type === 'video' && block.mediaUrl);
    if (videoBlock) {
      return {
        type: videoBlock.mediaType,
        url: videoBlock.mediaUrl
      };
    }
    return null;
  };

  // Prioritize video from contentBlocks, then from article.video
  const videoToShow = getFirstVideoFromBlocks() || mainVideo;
  const videoEmbedUrl = videoToShow ? getVideoEmbedUrl(videoToShow) : null;
  const isFileVideo = videoToShow && videoToShow.type === 'file';
  
  // Get first image from article.images or from contentBlocks
  const getFirstImage = () => {
    // First, try to get from article.images
    if (article.images && article.images.length > 0) {
      return article.images[0];
    }
    
    // Then, try to get from contentBlocks
    if (article.contentBlocks && article.contentBlocks.length > 0) {
      const imageBlock = article.contentBlocks.find(block => block.type === 'image' && block.mediaUrl);
      if (imageBlock && imageBlock.mediaUrl) {
        return imageBlock.mediaUrl;
      }
    }
    
    return null;
  };
  
  const firstImage = getFirstImage();

  const articleStyle = {
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };

  // Check if article has an image
  const hasImage = firstImage || videoEmbedUrl;
  
  // Get section title (translated)
  const getSectionTitle = () => {
    if (!article.section) return null;
    const translationKey = `section${article.section.charAt(0).toUpperCase() + article.section.slice(1)}`;
    const translated = t(translationKey);
    // If translation exists and is different from the key, use it
    // Otherwise, capitalize first letter as fallback
    return translated !== translationKey ? translated : article.section.charAt(0).toUpperCase() + article.section.slice(1);
  };

  return (
    <Link to={`/article/${article._id}`} className="article-list-item-link">
      <div className="article-list-item" style={articleStyle}>
        <div className="article-list-content">
          {/* Green section badge - only show if article has image */}
          {hasImage && article.section && (
            <div className="article-section-badge-green">
              {getSectionTitle()}
            </div>
          )}
          
          <h3 className="article-list-title">
            {article.title}
          </h3>
          
          <p className="article-list-excerpt">
            {excerpt}
          </p>
          
          {/* Read more link - smaller style */}
          {(article.content && article.content.length > 250) || 
           (article.contentBlocks && article.contentBlocks.some(block => block.type === 'text' && block.content && block.content.length > 0)) ? (
            <span className="read-more-link-small">
              {t('readMore')}
              <i className={`bi bi-arrow-${isRTL ? 'left' : 'right'} ms-1`}></i>
            </span>
          ) : null}
        </div>
        
        {/* Image on the right */}
        {hasImage && (
          <div className="article-list-media">
            {videoEmbedUrl ? (
              isFileVideo ? (
                <video 
                  controls 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  src={videoEmbedUrl}
                >
                  {t('videoNotSupported')}
                </video>
              ) : (
                <iframe
                  src={videoEmbedUrl}
                  title={article.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : firstImage ? (
              <img
                src={firstImage.startsWith('http') ? firstImage : `${API_BASE_URL}${firstImage}`}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Try to load from content blocks if main image fails
                  console.error('Failed to load image:', firstImage);
                  e.target.style.display = 'none';
                }}
                loading="lazy"
              />
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ArticleListItem;


