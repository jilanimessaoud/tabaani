const mongoose = require('mongoose');

const websiteConfigSchema = new mongoose.Schema({
  layout: {
    type: Object,
    default: {
      sections: [
        { name: 'tourism', order: 0, visible: true },
        { name: 'culture', order: 1, visible: true },
        { name: 'environment', order: 2, visible: true },
        { name: 'autre', order: 3, visible: true }
      ]
    }
  },
  preview: {
    type: Object,
    default: null
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  footer: {
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      tiktok: { type: String, default: '' }
    },
    contactEmails: {
      contact: { type: String, default: '' },
      pub: { type: String, default: '' },
      recrutement: { type: String, default: '' }
    },
    siteName: { type: String, default: 'Tabaani' }
  },
  logo: { type: String, default: '/logo.jpeg' }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebsiteConfig', websiteConfigSchema);

