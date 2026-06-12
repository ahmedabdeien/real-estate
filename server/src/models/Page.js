const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title:       { type: String, required: true },
  slug:        { type: String, required: true },
  type:        { type: String, enum: ['landing', 'about', 'contact', 'features', 'pricing', 'custom'], default: 'custom' },
  craftJson:   { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  seo: {
    title:       String,
    description: String,
    keywords:    String,
    ogImage:     String,
    noIndex:     { type: Boolean, default: false },
  },
  settings: {
    bgColor:   { type: String, default: '#ffffff' },
    maxWidth:  { type: String, enum: ['full', 'boxed'], default: 'full' },
    direction: { type: String, enum: ['rtl', 'ltr'], default: 'rtl' },
    customCss: String,
    showInNav: { type: Boolean, default: false },
  },
}, { timestamps: true });

pageSchema.index({ companyId: 1, slug: 1 }, { unique: true });
pageSchema.index({ companyId: 1, isPublished: 1 });

module.exports = mongoose.model('Page', pageSchema);
