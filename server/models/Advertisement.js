const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  videoType: {
    type: String,
    default: 'video/mp4'
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    default: null // Optional link when ad is clicked
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Advertisement', advertisementSchema);

