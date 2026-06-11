const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String },
  phone: { type: String, required: true },
  phone2: { type: String },
  nationalId: { type: String },
  passportNumber: { type: String },
  nationality: { type: String, default: 'مصري' },
  address: { type: String },
  city: { type: String },
  type: { type: String, enum: ['individual', 'company'], default: 'individual' },
  companyName: { type: String },
  taxNumber: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
  source: { type: String, enum: ['walk_in', 'referral', 'online', 'social_media', 'other'], default: 'walk_in' },
  notes: { type: String },
  documents: [{ url: String, name: String, type: String }],
  totalPurchases: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
