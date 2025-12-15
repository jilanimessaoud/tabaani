const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  contentBlocks: [{
    type: {
      type: String,
      enum: ['text', 'image', 'video'],
      required: true
    },
    content: String, // For text blocks
    mediaUrl: String, // For image/video blocks
    mediaType: String, // For video: 'file', 'youtube', 'facebook'
    order: Number
  }],
  section: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: 'autre'
  },
  hashtags: [{
    type: String,
    trim: true,
    default: []
  }],
  source: {
    type: String,
    enum: ['manual', 'facebook'],
    default: 'manual'
  },
  facebookPostId: {
    type: String,
    default: null
  },
  images: [{
    type: String, // URL or file path
    default: []
  }],
  video: {
    type: {
      type: String,
      enum: ['file', 'youtube', 'facebook', null],
      default: null
    },
    url: {
      type: String,
      default: null
    }
  },
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);

