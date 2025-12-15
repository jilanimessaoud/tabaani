import React, { useState, useEffect } from 'react';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Advertisement = ({ singleAd = null }) => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const response = await api.get('/api/ads/public');
      const activeAds = response.data.filter(ad => ad.active);
      setAds(activeAds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setLoading(false);
    }
  };

  // If singleAd is provided, use it directly, otherwise fetch all ads
  useEffect(() => {
    if (singleAd) {
      setAds([singleAd]);
      setLoading(false);
    } else {
      fetchAds();
    }
  }, [singleAd]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 5000); // Change ad every 5 seconds

      return () => clearInterval(interval);
    } else if (ads.length === 1) {
      setCurrentIndex(0);
    }
  }, [ads.length]);

  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return null;
  }

  if (ads.length === 0) {
    return null; // Don't show anything if no ads
  }

  return (
    <div className="ad-container">
      {ads.map((ad, index) => (
        <div
          key={ad._id}
          className={`ad-item ${index === currentIndex ? 'active' : ''}`}
          onClick={() => {
            if (ad.link) {
              window.open(ad.link, '_blank', 'noopener,noreferrer');
            }
          }}
          style={{ cursor: ad.link ? 'pointer' : 'default' }}
        >
          {ad.type === 'image' ? (
            <img
              src={ad.url.startsWith('http') ? ad.url : `${API_BASE_URL}${ad.url}`}
              alt={ad.title || 'Advertisement'}
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src={ad.url.startsWith('http') ? ad.url : `${API_BASE_URL}${ad.url}`}
                type={ad.videoType || 'video/mp4'}
              />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ))}
      {ads.length > 1 && (
        <div className="ad-indicators">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`ad-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Advertisement;

