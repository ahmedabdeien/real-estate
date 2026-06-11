const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/response');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'البريد الإلكتروني وكلمة المرور مطلوبان', 400);

    const user = await User.findOne({ email }).select('+password').populate('role').populate({ path: 'companyId', populate: { path: 'plan' } });
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'بيانات الدخول غير صحيحة', 401);
    }
    if (user.status !== 'active') return error(res, 'الحساب موقوف، تواصل مع الإدارة', 403);

    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

    return success(res, { token, user: userData }, 'تم تسجيل الدخول بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role').populate({ path: 'companyId', populate: { path: 'plan' } });
    return success(res, user);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    return success(res, null, 'تم تسجيل الخروج بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return error(res, 'كلمة المرور الحالية غير صحيحة', 400);
    }
    user.password = newPassword;
    await user.save();
    return success(res, null, 'تم تغيير كلمة المرور بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
