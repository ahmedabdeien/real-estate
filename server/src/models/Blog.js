const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, trim: true },
  excerpt:     { type: String, trim: true },
  content:     { type: String, default: '' },
  coverImage:  { type: String, default: '' },
  category:    { type: String, default: 'عام' },
  tags:        [{ type: String }],
  status:      { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date },
  views:       { type: Number, default: 0 },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seoTitle:    { type: String },
  seoDesc:     { type: String },
}, { timestamps: true });

blogSchema.index({ companyId: 1, slug: 1 }, { unique: true });
blogSchema.index({ companyId: 1, status: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
