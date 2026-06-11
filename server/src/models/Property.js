const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String },
  type: { type: String, enum: ['residential', 'commercial', 'mixed', 'land', 'villa', 'compound'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'completed', 'under_construction'], default: 'active' },
  location: {
    address: { type: String },
    city: { type: String },
    district: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  description: { type: String },
  images: [{ type: String }],
  totalUnits: { type: Number, default: 0 },
  availableUnits: { type: Number, default: 0 },
  soldUnits: { type: Number, default: 0 },
  reservedUnits: { type: Number, default: 0 },
  totalArea: { type: Number },
  completionDate: { type: Date },
  developer: { type: String },
  amenities: [{ type: String }],
  documents: [{ url: String, name: String, type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
