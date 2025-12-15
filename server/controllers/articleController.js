const path = require('path');
const fs = require('fs');
const Article = require('../models/Article');

// Helper function to shift orders when inserting at a specific position
async function shiftOrdersForInsertion(insertOrder) {
  try {
    // Find all articles with order >= insertOrder
    const articlesToShift = await Article.find({ order: { $gte: insertOrder } });
    
    // Increment their orders by 1
    for (const article of articlesToShift) {
      article.order = article.order + 1;
      await article.save();
    }
  } catch (error) {
    console.error('Error shifting orders:', error);
    throw error;
  }
}

// Helper function to shift orders when updating to a new position
async function shiftOrdersForUpdate(articleId, oldOrder, newOrder) {
  try {
    if (oldOrder === newOrder) {
      return; // No shift needed
    }

    if (newOrder > oldOrder) {
      // Moving down: decrement orders between oldOrder and newOrder
      await Article.updateMany(
        { 
          _id: { $ne: articleId },
          order: { $gt: oldOrder, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else {
      // Moving up: increment orders between newOrder and oldOrder
      await Article.updateMany(
        { 
          _id: { $ne: articleId },
          order: { $gte: newOrder, $lt: oldOrder }
        },
        { $inc: { order: 1 } }
      );
    }
  } catch (error) {
    console.error('Error shifting orders for update:', error);
    throw error;
  }
}

// Get all articles (public - only published)
exports.getPublicArticles = async (req, res) => {
  try {
    const { section, hashtag } = req.query;
    const query = { published: true };
    
    if (section && section !== 'all') {
      query.section = section;
    }
    
    if (hashtag) {
      query.hashtags = { $in: [new RegExp(hashtag, 'i')] };
    }
    
    const articles = await Article.find(query)
      .sort({ order: 1, createdAt: -1 }); // Sort by order ascending, then newest first
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all articles (admin - all articles)
exports.getAllArticles = async (req, res) => {
  try {
    const { section, title, hashtag } = req.query;
    const query = {};
    
    if (section && section !== 'all') {
      query.section = section;
    }
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    if (hashtag) {
      query.hashtags = { $in: [new RegExp(hashtag, 'i')] };
    }
    
    const articles = await Article.find(query)
      .sort({ order: 1, createdAt: -1 }); // Sort by order ascending (0 first, then 1, 2, etc.)
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single article
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create article
exports.createArticle = async (req, res) => {
  try {
    const { title, content, section, videoType, videoUrl, published, featured, order, contentBlocks, hashtags, source, facebookPostId } = req.body;
    
    // Get images from 'images' field (main article images)
    const imagePaths = req.files
      ?.filter(file => file.fieldname === 'images' && file.mimetype.startsWith('image/'))
      .map(file => `/media_content/uploads/${file.filename}`) || [];
    
    // Get video from 'video' field (main article video)
    const videoFile = req.files?.find(file => file.fieldname === 'video' && file.mimetype.startsWith('video/'));
    
    // Debug: Log all uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Uploaded files:', req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename, mimetype: f.mimetype })));
      console.log('Main images paths:', imagePaths);
      if (videoFile) console.log('Video file:', videoFile.filename);
    }

    // Parse hashtags
    let hashtagsArray = [];
    if (hashtags) {
      if (typeof hashtags === 'string') {
        hashtagsArray = hashtags.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
      } else if (Array.isArray(hashtags)) {
        hashtagsArray = hashtags.map(tag => String(tag).trim().replace('#', '')).filter(tag => tag.length > 0);
      }
    }

    // Determine the order for the new article
    let articleOrder = 0; // Default to 0
    if (order !== undefined && order !== null && order !== '') {
      articleOrder = parseInt(order);
    }

    // Shift existing orders if inserting at 0 or any position
    if (articleOrder >= 0) {
      await shiftOrdersForInsertion(articleOrder);
    }

    // Normalize section name (lowercase, trim)
    const normalizedSection = section ? section.trim().toLowerCase() : 'autre';
    
    const articleData = {
      title,
      content,
      section: normalizedSection, // Accept any section name
      images: imagePaths,
      published: published === 'true' || published === true,
      featured: featured === 'true' || featured === true,
      order: articleOrder,
      hashtags: hashtagsArray,
      source: source || 'manual',
      facebookPostId: facebookPostId || null
    };

    // Handle content blocks
    if (contentBlocks) {
      try {
        const blocks = typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : contentBlocks;
        if (Array.isArray(blocks) && blocks.length > 0) {
          articleData.contentBlocks = blocks.map((block, index) => {
            let mediaUrl = block.mediaUrl || '';
            
            // Check if this block has an uploaded file
            if (mediaUrl.startsWith('__UPLOADED_IMAGE_') || mediaUrl.startsWith('__UPLOADED_VIDEO_')) {
              // Extract block index from placeholder
              const blockIndex = parseInt(mediaUrl.match(/\d+/)?.[0] || index);
              const isImage = mediaUrl.includes('IMAGE');
              
              // Find the corresponding uploaded file
              const fileFieldName = isImage ? `contentBlockImage_${blockIndex}` : `contentBlockVideo_${blockIndex}`;
              const uploadedFile = req.files?.find(file => file.fieldname === fileFieldName);
              
              if (uploadedFile) {
                // Replace placeholder with actual file path
                mediaUrl = `/media_content/uploads/${uploadedFile.filename}`;
                console.log(`Update - Content block ${index}: Found uploaded file ${fileFieldName}, saved as ${mediaUrl}`);
              } else {
                // If file not found, log for debugging
                console.warn(`Update - Content block ${index}: File not found for fieldname ${fileFieldName}. Available files:`, 
                  req.files?.map(f => f.fieldname) || []);
                mediaUrl = '';
              }
            }
            
            return {
              type: block.type,
              content: block.content || '',
              mediaUrl: mediaUrl,
              mediaType: block.mediaType || '',
              order: block.order !== undefined ? block.order : index
            };
          });
        }
      } catch (e) {
        console.error('Error parsing contentBlocks:', e);
      }
    }

    if (videoType === 'file' && videoFile) {
      articleData.video = {
        type: 'file',
        url: `/media_content/uploads/${videoFile.filename}`
      };
    } else if (videoType && videoUrl) {
      articleData.video = {
        type: videoType,
        url: videoUrl
      };
    }

    const article = new Article(articleData);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const { title, content, section, videoType, videoUrl, published, featured, order, existingImages, contentBlocks, hashtags, source, facebookPostId } = req.body;
    
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Get new images from 'images' field (main article images)
    const newImagePaths = req.files
      ?.filter(file => file.fieldname === 'images' && file.mimetype.startsWith('image/'))
      .map(file => `/media_content/uploads/${file.filename}`) || [];
    
    // Get video from 'video' field (main article video)
    const videoFile = req.files?.find(file => file.fieldname === 'video' && file.mimetype.startsWith('video/'));
    
    // Debug: Log all uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Update - Uploaded files:', req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename, mimetype: f.mimetype })));
      console.log('Update - New images paths:', newImagePaths);
      if (videoFile) console.log('Update - Video file:', videoFile.filename);
    }

    // Update basic fields
    const oldOrder = article.order;
    
    article.title = title || article.title;
    article.content = content || article.content;
    // Normalize section name (lowercase, trim) - accept any section name
    if (section !== undefined) {
      article.section = section ? section.trim().toLowerCase() : 'autre';
    }
    article.published = published === 'true' || published === true || published === false ? published === 'true' || published === true : article.published;
    article.featured = featured === 'true' || featured === true || featured === false ? featured === 'true' || featured === true : article.featured;
    
    // Handle order update with shifting
    if (order !== undefined && order !== null && order !== '') {
      const newOrder = parseInt(order);
      if (newOrder !== oldOrder) {
        // Shift orders if the order is changing
        await shiftOrdersForUpdate(article._id, oldOrder, newOrder);
        article.order = newOrder;
      }
    }

    // Handle hashtags
    if (hashtags !== undefined) {
      if (typeof hashtags === 'string') {
        article.hashtags = hashtags.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag.length > 0);
      } else if (Array.isArray(hashtags)) {
        article.hashtags = hashtags.map(tag => String(tag).trim().replace('#', '')).filter(tag => tag.length > 0);
      }
    }

    if (source) article.source = source;
    if (facebookPostId !== undefined) article.facebookPostId = facebookPostId;

    // Handle content blocks
    if (contentBlocks !== undefined) {
      try {
        const blocks = typeof contentBlocks === 'string' ? JSON.parse(contentBlocks) : contentBlocks;
        if (Array.isArray(blocks) && blocks.length > 0) {
          article.contentBlocks = blocks.map((block, index) => {
            let mediaUrl = block.mediaUrl || '';
            
            // Check if this block has an uploaded file
            if (mediaUrl.startsWith('__UPLOADED_IMAGE_') || mediaUrl.startsWith('__UPLOADED_VIDEO_')) {
              // Extract block index from placeholder
              const blockIndex = parseInt(mediaUrl.match(/\d+/)?.[0] || index);
              const isImage = mediaUrl.includes('IMAGE');
              
              // Find the corresponding uploaded file
              const fileFieldName = isImage ? `contentBlockImage_${blockIndex}` : `contentBlockVideo_${blockIndex}`;
              const uploadedFile = req.files?.find(file => file.fieldname === fileFieldName);
              
              if (uploadedFile) {
                // Replace placeholder with actual file path
                mediaUrl = `/media_content/uploads/${uploadedFile.filename}`;
                console.log(`Update - Content block ${index}: Found uploaded file ${fileFieldName}, saved as ${mediaUrl}`);
              } else {
                // If file not found, log for debugging
                console.warn(`Update - Content block ${index}: File not found for fieldname ${fileFieldName}. Available files:`, 
                  req.files?.map(f => f.fieldname) || []);
                mediaUrl = '';
              }
            }
            
            return {
              type: block.type,
              content: block.content || '',
              mediaUrl: mediaUrl,
              mediaType: block.mediaType || '',
              order: block.order !== undefined ? block.order : index
            };
          });
        } else {
          article.contentBlocks = [];
        }
      } catch (e) {
        console.error('Error parsing contentBlocks:', e);
      }
    }

    // Handle images - keep existing ones that are still in the list, add new ones
    if (existingImages) {
      const existingImagesArray = Array.isArray(existingImages) ? existingImages : [existingImages];
      article.images = [...existingImagesArray, ...newImagePaths];
    } else {
      article.images = [...article.images, ...newImagePaths];
    }

    // Handle video
    if (videoType === 'file' && videoFile) {
      // Delete old video file if it exists
      if (article.video?.type === 'file' && article.video.url) {
        const oldVideoPath = path.join(__dirname, '..', article.video.url);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
      article.video = {
        type: 'file',
        url: `/media_content/uploads/${videoFile.filename}`
      };
    } else if (videoType && videoUrl) {
      // Delete old video file if switching from file to URL
      if (article.video?.type === 'file' && article.video.url) {
        const oldVideoPath = path.join(__dirname, '..', article.video.url);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
      article.video = {
        type: videoType,
        url: videoUrl
      };
    } else if (videoType === '') {
      // Clear video if type is empty
      if (article.video?.type === 'file' && article.video.url) {
        const oldVideoPath = path.join(__dirname, '..', article.video.url);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
      article.video = {
        type: null,
        url: null
      };
    }

    await article.save();
    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Delete associated files
    article.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    if (article.video?.type === 'file' && article.video.url) {
      const videoPath = path.join(__dirname, '..', article.video.url);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

