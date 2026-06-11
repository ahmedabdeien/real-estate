const mongoose = require('mongoose');

// Available modules / features that can be gated per plan
const ALL_MODULES = [
  'properties', 'units', 'contracts', 'installments',
  'accounting', 'reports', 'advanced_reports', 'export',
  'whatsapp', 'tasks', 'activity', 'notifications',
  'media', 'roles', 'api', 'theme', 'warehouse',
  'multi_branch', 'purchasing',
];

const planSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  nameAr:       { type: String },
  label:        { type: String, required: true },
  description:  { type: String },
  price:        { type: Number, required: true },
  priceYearly:  { type: Number },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  maxUsers:     { type: Number, default: 5 },
  maxProperties:{ type: Number, default: 10 },
  maxUnits:     { type: Number, default: 100 },
  modules:      [{ type: String, enum: ALL_MODULES }],
  features:     [{ type: String }],
  isActive:     { type: Boolean, default: true },
  isPopular:    { type: Boolean, default: false },
  sortOrder:    { type: Number, default: 0 },
}, { timestamps: true });

planSchema.statics.ALL_MODULES = ALL_MODULES;

module.exports = mongoose.model('SubscriptionPlan', planSchema);
