const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  expenseNumber: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'check', 'card'], default: 'cash' },
  vendor: { type: String },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  reference: { type: String },
  attachments: [{ url: String, name: String }],
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
