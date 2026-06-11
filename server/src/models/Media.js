const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  url:         { type: String, required: true },
  publicId:    { type: String },
  originalName:{ type: String },
  mimeType:    { type: String },
  size:        { type: Number },
  width:       { type: Number },
  height:      { type: Number },
  folder:      { type: String, default: 'general' },
  tags:        [String],
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
