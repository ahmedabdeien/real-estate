const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unitNumber: { type: String, required: true },
  floor: { type: Number },
  building: { type: String },
  type: { type: String, enum: ['apartment', 'studio', 'villa', 'duplex', 'penthouse', 'shop', 'office', 'warehouse', 'land'], required: true },
  status: { type: String, enum: ['available', 'reserved', 'sold', 'rented', 'maintenance'], default: 'available' },
  area: { type: Number, required: true },
  rooms: { type: Number },
  bathrooms: { type: Number },
  price: { type: Number, required: true },
  pricePerMeter: { type: Number },
  finishingType: { type: String, enum: ['raw', 'semi_finished', 'fully_finished', 'super_lux'], default: 'raw' },
  direction: { type: String },
  description: { type: String },
  images: [{ type: String }],
  features: [{ type: String }],
  currentCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  currentContract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

unitSchema.index({ companyId: 1, propertyId: 1, unitNumber: 1 }, { unique: true });

module.exports = mongoose.model('Unit', unitSchema);
