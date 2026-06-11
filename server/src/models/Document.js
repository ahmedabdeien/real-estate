const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, trim: true },
  url:          { type: String, required: true },
  publicId:     { type: String },
  mimeType:     { type: String },
  size:         { type: Number },
  type:         {
    type: String,
    enum: ['contract', 'invoice', 'id', 'deed', 'permit', 'photo', 'other'],
    default: 'other',
  },
  relatedTo:    { type: String, enum: ['customer', 'unit', 'property', 'contract', 'none'], default: 'none' },
  relatedId:    { type: mongoose.Schema.Types.ObjectId },
  tags:         [String],
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

documentSchema.index({ companyId: 1, createdAt: -1 });
documentSchema.index({ companyId: 1, relatedTo: 1, relatedId: 1 });

module.exports = mongoose.model('Document', documentSchema);
