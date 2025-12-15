import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TopAdvertisement = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.get('/api/ads/public');
      const activeAds = response.data
        .filter(ad => ad.active)
        .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order
      setAds(activeAds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ads.length === 0) return;

    const currentAd = ads[currentIndex];
    if (!currentAd) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (currentAd.type === 'image') {
      // For images, show for 10 seconds
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 10000); // 10 seconds
    } else if (currentAd.type === 'video') {
      // For videos, wait until video ends
      const video = videoRef.current;
      if (video) {
        // Reset video to start
        video.currentTime = 0;
        video.load();
        
        const handleVideoEnd = () => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        };

        const handleVideoError = () => {
          // If video fails, move to next ad after a short delay
          setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
          }, 2000);
        };

        video.addEventListener('ended', handleVideoEnd);
        video.addEventListener('error', handleVideoError);

        // Try to play the video
        video.play().catch((error) => {
          console.error('Error playing video:', error);
          handleVideoError();
        });

        return () => {
          video.removeEventListener('ended', handleVideoEnd);
          video.removeEventListener('error', handleVideoError);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ads, currentIndex]);

  const handleAdClick = (ad) => {
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <div 
      className="top-ad-container"
      onClick={() => handleAdClick(currentAd)}
      style={{ cursor: currentAd.link ? 'pointer' : 'default' }}
    >
      <div className="ad-border-wrapper">
      {currentAd.type === 'image' ? (
        <img
          src={currentAd.url.startsWith('http') ? currentAd.url : `${API_BASE_URL}${currentAd.url}`}
          alt={currentAd.title || 'Advertisement'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source
            src={currentAd.url.startsWith('http') ? currentAd.url : `${API_BASE_URL}${currentAd.url}`}
            type={currentAd.videoType || 'video/mp4'}
          />
          Your browser does not support the video tag.
        </video>
      )}
      {ads.length > 1 && (
        <div className="top-ad-indicators">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`top-ad-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default TopAdvertisement;

