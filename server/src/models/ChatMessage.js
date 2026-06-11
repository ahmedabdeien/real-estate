const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  attachments: [{ url: String, name: String, type: String }],
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
