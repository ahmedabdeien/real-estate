const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue'], default: 'pending' },
  paidAt: { type: Date },
  notes: { type: String },
});

const contractSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  contractNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { type: String, enum: ['sale', 'rent'], required: true },
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled', 'terminated'], default: 'draft' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  totalPrice: { type: Number, required: true },
  downPayment: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  installmentCount: { type: Number, default: 1 },
  installments: [installmentSchema],
  paymentMethod: { type: String, enum: ['cash', 'installments', 'mortgage', 'check'], default: 'cash' },
  notes: { type: String },
  documents: [{ url: String, name: String }],
  signedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

contractSchema.index({ companyId: 1, contractNumber: 1 }, { unique: true });

module.exports = mongoose.model('Contract', contractSchema);
