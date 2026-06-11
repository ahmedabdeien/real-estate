const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  avatar: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  isSuperAdmin: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastSeen: { type: Date },
  isOnline: { type: Boolean, default: false },
  passwordChangedAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
