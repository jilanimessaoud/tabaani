const mongoose = require('mongoose');
const Section = require('../models/Section');
const WebsiteConfig = require('../models/WebsiteConfig');
require('dotenv').config();

/**
 * Initialize MongoDB collections and default data
 * Can be called when already connected or will connect if needed
 */
const initDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabani';
    let shouldCloseConnection = false;
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      shouldCloseConnection = true;
      console.log('Connected to MongoDB for initialization...');
    }

    // Initialize default sections
    await initializeSections();

    // Initialize default website config
    await initializeWebsiteConfig();

    console.log('✓ Database initialization completed successfully!');
    console.log('✓ Collections ready:');
    console.log('    - admins');
    console.log('    - articles');
    console.log('    - sections');
    console.log('    - websiteconfigs');
    
    // Only close if we opened the connection
    if (shouldCloseConnection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

/**
 * Initialize default sections
 */
const initializeSections = async () => {
  try {
    const sectionsCount = await Section.countDocuments();
    
    if (sectionsCount === 0) {
      const defaultSections = [
        { 
          name: 'tourism', 
          title: 'Tourism', 
          description: 'Tourism articles and travel guides', 
          order: 0,
          visible: true
        },
        { 
          name: 'culture', 
          title: 'Culture', 
          description: 'Cultural articles and heritage', 
          order: 1,
          visible: true
        },
        { 
          name: 'environment', 
          title: 'Environment', 
          description: 'Environmental articles and sustainability', 
          order: 2,
          visible: true
        },
        { 
          name: 'autre', 
          title: 'Other', 
          description: 'Other articles and news', 
          order: 3,
          visible: true
        }
      ];

      await Section.insertMany(defaultSections);
      console.log('✓ Default sections created');
    } else {
      console.log('✓ Sections already exist');
    }
  } catch (error) {
    console.error('Error initializing sections:', error);
    throw error;
  }
};

/**
 * Initialize default website configuration
 */
const initializeWebsiteConfig = async () => {
  try {
    const configCount = await WebsiteConfig.countDocuments({ isPreview: false });
    
    if (configCount === 0) {
      const defaultConfig = {
        layout: {
          sections: [
            { name: 'tourism', order: 0, visible: true },
            { name: 'culture', order: 1, visible: true },
            { name: 'environment', order: 2, visible: true },
            { name: 'autre', order: 3, visible: true }
          ]
        },
        isPreview: false
      };

      await WebsiteConfig.create(defaultConfig);
      console.log('✓ Default website configuration created');
    } else {
      console.log('✓ Website configuration already exists');
    }
  } catch (error) {
    console.error('Error initializing website config:', error);
    throw error;
  }
};

// Run initialization if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;

