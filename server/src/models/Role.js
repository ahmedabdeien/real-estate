const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  isSystem: { type: Boolean, default: false },
  permissions: [{ type: String }],
  description: { type: String },
}, { timestamps: true });

roleSchema.index({ name: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
