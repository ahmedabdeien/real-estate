const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  type: { type: String, enum: ['sale', 'receipt', 'refund', 'expense'], default: 'sale' },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], default: 'draft' },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number,
    total: Number,
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number },
  notes: { type: String },
  qrCode: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
