const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:      { type: String, required: true },
  title:     { type: String, required: true },
  message:   { type: String },
  body:      { type: String },
  link:      { type: String },
  isRead:    { type: Boolean, default: false },
  isSystem:  { type: Boolean, default: false },
  data:      { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ companyId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
