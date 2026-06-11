const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  receiptNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'bank_transfer', 'check', 'card', 'online'], required: true },
  date: { type: Date, required: true, default: Date.now },
  reference: { type: String },
  bankName: { type: String },
  checkNumber: { type: String },
  notes: { type: String },
  attachments: [{ url: String, name: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.index({ companyId: 1, receiptNumber: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
