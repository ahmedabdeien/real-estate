const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getUsers = async (req, res) => {
  try {
    // عزل: السوبر أدمن بدون فلتر يرى فريق المنصة فقط — مع ?companyId يرى مستخدمي شركة محددة
    const filter = req.user.isSuperAdmin
      ? (req.query.companyId ? { companyId: req.query.companyId } : { companyId: null })
      : { companyId: req.tenantId };
    const features = new APIFeatures(User.find(filter), req.query)
      .search(['name', 'email', 'phone'])
      .filter()
      .sort()
      .paginate();
    const [users, total] = await Promise.all([
      features.query.populate('role', 'name label').populate('companyId', 'name'),
      User.countDocuments(filter),
    ]);
    return paginated(res, users, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role').populate('companyId');
    if (!user) return error(res, 'المستخدم غير موجود', 404);
    return success(res, user);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createUser = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!req.user.isSuperAdmin) data.companyId = req.tenantId;
    const user = await User.create(data);
    const populated = await User.findById(user._id).populate('role').populate('companyId');
    return success(res, populated, 'تم إنشاء المستخدم بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('role');
    if (!user) return error(res, 'المستخدم غير موجود', 404);
    return success(res, user, 'تم تحديث المستخدم بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return error(res, 'لا يمكنك حذف حسابك', 400);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return error(res, 'المستخدم غير موجود', 404);
    return success(res, null, 'تم حذف المستخدم بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true }).populate('role');
    return success(res, user, 'تم تحديث الملف الشخصي بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
