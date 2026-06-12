const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  /* 3 مستويات معزولة تماماً:
     platform — أدوار المنصة (companyId: null)
     company  — أدوار الشركة (companyId مطلوب)
     page     — أدوار المحتوى/الصفحات (companyId مطلوب) */
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  scope: { type: String, enum: ['platform', 'company', 'page'], default: 'company' },
  isSystem: { type: Boolean, default: false },
  permissions: [{ type: String }],
  description: { type: String },
  color: { type: String, default: '#da1f27' },
}, { timestamps: true });

roleSchema.index({ name: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
