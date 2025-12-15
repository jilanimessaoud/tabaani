const path = require('path');
const fs = require('fs');
const Advertisement = require('../models/Advertisement');

// Get all active advertisements (public)
exports.getPublicAds = async (req, res) => {
  try {
    const ads = await Advertisement.find({ active: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(ads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all advertisements (admin)
exports.getAllAds = async (req, res) => {
  try {
    const ads = await Advertisement.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(ads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single advertisement
exports.getAdById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create advertisement
exports.createAd = async (req, res) => {
  try {
    const { title, type, videoType, active, order, link } = req.body;
    
    let adUrl = '';
    
    if (type === 'image') {
      const imageFile = Array.isArray(req.files) 
        ? req.files.find(file => file.mimetype.startsWith('image/'))
        : (req.files && req.files.mimetype && req.files.mimetype.startsWith('image/') ? req.files : null);
      if (!imageFile) {
        return res.status(400).json({ message: 'Image file is required for image type' });
      }
      adUrl = `/media_content/uploads/${imageFile.filename}`;
    } else if (type === 'video') {
      const videoFile = Array.isArray(req.files)
        ? req.files.find(file => file.mimetype.startsWith('video/'))
        : (req.files && req.files.mimetype && req.files.mimetype.startsWith('video/') ? req.files : null);
      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required for video type' });
      }
      adUrl = `/media_content/uploads/${videoFile.filename}`;
    } else {
      return res.status(400).json({ message: 'Invalid ad type' });
    }

    const ad = new Advertisement({
      title,
      type,
      url: adUrl,
      videoType: videoType || 'video/mp4',
      active: active === 'true' || active === true,
      order: order ? parseInt(order) : 0,
      link: link || null
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update advertisement
exports.updateAd = async (req, res) => {
  try {
    const { title, type, videoType, active, order, link } = req.body;
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    if (title) ad.title = title;
    if (type) ad.type = type;
    if (videoType) ad.videoType = videoType;
    if (active !== undefined) ad.active = active === 'true' || active === true;
    if (order !== undefined) ad.order = parseInt(order);
    if (link !== undefined) ad.link = link;

    // Handle file upload if new file is provided
    const files = Array.isArray(req.files) ? req.files : (req.files ? [req.files] : []);
    if (files.length > 0) {
      // Delete old file
      if (ad.url) {
        const oldFilePath = path.join(__dirname, '..', ad.url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      if (ad.type === 'image') {
        const imageFile = files.find(file => file.mimetype && file.mimetype.startsWith('image/'));
        if (imageFile) {
          ad.url = `/media_content/uploads/${imageFile.filename}`;
        }
      } else if (ad.type === 'video') {
        const videoFile = files.find(file => file.mimetype && file.mimetype.startsWith('video/'));
        if (videoFile) {
          ad.url = `/media_content/uploads/${videoFile.filename}`;
        }
      }
    }

    await ad.save();
    res.json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete advertisement
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    // Delete associated file
    if (ad.url) {
      const filePath = path.join(__dirname, '..', ad.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ad.deleteOne();
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

