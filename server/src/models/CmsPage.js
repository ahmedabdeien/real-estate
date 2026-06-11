const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  key:     { type: String, required: true },
  type:    { type: String, enum: ['hero', 'features', 'stats', 'pricing', 'testimonials', 'faq', 'cta', 'custom'], default: 'custom' },
  title:   { type: String, default: '' },
  subtitle:{ type: String, default: '' },
  body:    { type: String, default: '' },
  items:   [{ type: mongoose.Schema.Types.Mixed }],
  visible: { type: Boolean, default: true },
  order:   { type: Number, default: 0 },
}, { _id: false });

const cmsPageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  pageKey:   { type: String, required: true },  // 'landing', 'about', 'contact', etc.
  title:     { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDesc:  { type: String, default: '' },
  sections:  [sectionSchema],
  published: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

cmsPageSchema.index({ companyId: 1, pageKey: 1 }, { unique: true });

module.exports = mongoose.model('CmsPage', cmsPageSchema);
