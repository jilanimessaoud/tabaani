import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the button
    if (e.target.closest('.btn')) {
      return;
    }
    setIsClicked(true);
    setTimeout(() => {
      navigate(`/article/${article._id}`);
    }, 200);
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
      let videoUrl = video.url;
      if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.com')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560&height=315`;
      }
      return videoUrl;
    }
    
    if (video.type === 'file') {
      return video.url.startsWith('http') ? video.url : `http://localhost:5000${video.url}`;
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
  
  const firstImage = article.images && article.images.length > 0 ? article.images[0] : null;

  return (
    <Card 
      className={`h-100 mb-4 article-card ${isClicked ? 'clicked' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Show video if available (even if there are images) */}
      {videoEmbedUrl && (
        <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#000' }}>
          {isFileVideo ? (
            <video 
              controls 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              src={videoEmbedUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={videoEmbedUrl}
              title={article.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}
      {/* Show image only if no video */}
      {!videoEmbedUrl && firstImage && (
        <Card.Img
          variant="top"
          src={firstImage.startsWith('http') ? firstImage : `http://localhost:5000${firstImage}`}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{article.title}</Card.Title>
        <Card.Text className="text-muted" style={{ flex: 1 }}>
          {article.content.length > 150 ? article.content.substring(0, 150) + '...' : article.content}
        </Card.Text>
        <div className="mt-auto">
          <small className="text-muted">
            {format(new Date(article.createdAt), 'MMM dd, yyyy')}
          </small>
          <Button
            as={Link}
            to={`/article/${article._id}`}
            variant="primary"
            className="ms-2"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            Read More
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;

