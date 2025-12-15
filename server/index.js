const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');
const initDatabase = require('./config/initDatabase');

const app = express();

// Connect to MongoDB and initialize
(async () => {
  try {
    await connectDB();
    // Initialize database collections and default data
    await initDatabase();
  } catch (error) {
    console.error('Database connection/initialization error:', error.message);
    // Continue even if initialization fails (collections might already exist)
  }
})();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files from media_content directory
app.use('/media_content', express.static(path.join(__dirname, 'media_content')));
// Keep backward compatibility with /uploads
app.use('/uploads', express.static(path.join(__dirname, 'media_content', 'uploads')));
// Serve logo from server if not in client public folder
app.use('/logo.jpeg', express.static(path.join(__dirname, '..', 'logo.jpeg')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/config', require('./routes/config'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/facebook', require('./routes/facebook'));
app.use('/api/ads', require('./routes/ads'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

