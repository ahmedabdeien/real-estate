const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:       { type: String, required: true, enum: ['create','update','delete','view','login','logout','export','import'] },
  module:       { type: String, required: true },
  resourceId:   { type: mongoose.Schema.Types.ObjectId },
  resourceType: { type: String },
  resourceName: { type: String },
  description:  { type: String },
  before:       { type: mongoose.Schema.Types.Mixed },
  after:        { type: mongoose.Schema.Types.Mixed },
  diff:         { type: mongoose.Schema.Types.Mixed },
  ip:           { type: String },
  userAgent:    { type: String },
}, { timestamps: true });

auditLogSchema.index({ companyId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
