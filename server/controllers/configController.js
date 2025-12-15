const WebsiteConfig = require('../models/WebsiteConfig');

// Get website config (public - only active config)
exports.getPublicConfig = async (req, res) => {
  try {
    let config = await WebsiteConfig.findOne({ isPreview: false });
    if (!config) {
      config = await WebsiteConfig.create({
        layout: {
          sections: [
            { name: 'tourism', order: 0, visible: true },
            { name: 'culture', order: 1, visible: true },
            { name: 'environment', order: 2, visible: true },
            { name: 'autre', order: 3, visible: true }
          ]
        }
      });
    }
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get website config (admin - can see preview)
exports.getConfig = async (req, res) => {
  try {
    let config = await WebsiteConfig.findOne({ isPreview: false });
    const previewConfig = await WebsiteConfig.findOne({ isPreview: true });
    
    if (!config) {
      config = await WebsiteConfig.create({
        layout: {
          sections: [
            { name: 'tourism', order: 0, visible: true },
            { name: 'culture', order: 1, visible: true },
            { name: 'environment', order: 2, visible: true },
            { name: 'autre', order: 3, visible: true }
          ]
        }
      });
    }

    res.json({
      active: config,
      preview: previewConfig
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save preview config
exports.savePreview = async (req, res) => {
  try {
    const { layout } = req.body;
    
    // Delete existing preview
    await WebsiteConfig.deleteOne({ isPreview: true });
    
    // Create new preview
    const previewConfig = await WebsiteConfig.create({
      layout,
      isPreview: true
    });
    
    res.json(previewConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Publish preview config (make it active)
exports.publishConfig = async (req, res) => {
  try {
    const previewConfig = await WebsiteConfig.findOne({ isPreview: true });
    
    if (!previewConfig) {
      return res.status(404).json({ message: 'No preview config found' });
    }

    // Delete old active config
    await WebsiteConfig.deleteOne({ isPreview: false });
    
    // Make preview the active config
    previewConfig.isPreview = false;
    await previewConfig.save();
    
    res.json({ message: 'Config published successfully', config: previewConfig });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update active config directly
exports.updateConfig = async (req, res) => {
  try {
    // Parse JSON strings from FormData
    let layout = null;
    let footer = null;
    
    if (req.body.layout) {
      try {
        layout = typeof req.body.layout === 'string' ? JSON.parse(req.body.layout) : req.body.layout;
      } catch (e) {
        console.error('Error parsing layout:', e);
      }
    }
    
    if (req.body.footer) {
      try {
        footer = typeof req.body.footer === 'string' ? JSON.parse(req.body.footer) : req.body.footer;
      } catch (e) {
        console.error('Error parsing footer:', e);
      }
    }
    
    let config = await WebsiteConfig.findOne({ isPreview: false });
    
    if (!config) {
      // Create new config
      const configData = { isPreview: false };
      if (layout) configData.layout = layout;
      if (footer) configData.footer = footer;
      if (req.file) configData.logo = `/media_content/uploads/${req.file.filename}`;
      config = await WebsiteConfig.create(configData);
    } else {
      // Update existing config
      if (layout) {
        config.layout = layout;
      }
      if (footer) {
        config.footer = footer;
      }
      
      // Handle logo upload
      if (req.file) {
        config.logo = `/media_content/uploads/${req.file.filename}`;
        console.log('Logo updated:', config.logo);
      }
      
      await config.save();
    }
    
    console.log('Config updated successfully');
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

