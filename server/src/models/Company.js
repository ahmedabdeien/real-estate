const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  logo: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String, default: 'Egypt' },
  website: { type: String },
  taxNumber: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  planExpiry: { type: Date },
  settings: {
    currency: { type: String, default: 'EGP' },
    timezone: { type: String, default: 'Africa/Cairo' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    fiscalYearStart: { type: String, default: '01/01' },
  },
  theme: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeSettings' },
  modules: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
