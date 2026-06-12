const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('role').populate('companyId');
    if (!user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'الحساب موقوف' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صالح' });
  }
};

exports.superAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'هذا الإجراء مخصص للمشرف العام فقط' });
  }
  next();
};

exports.hasPermission = (...permissions) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next();
  const userPerms = req.user?.role?.permissions || [];
  const hasAll = permissions.every(p => userPerms.includes(p));
  if (!hasAll) return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لهذا الإجراء' });
  next();
};

/* يكفي امتلاك صلاحية واحدة من القائمة — يُستخدم للتوافق بين
   صلاحيات الشركة وصلاحيات المحتوى (مثل pages.update أو theme.update) */
exports.hasAnyPermission = (...permissions) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next();
  const userPerms = req.user?.role?.permissions || [];
  const hasOne = permissions.some(p => userPerms.includes(p));
  if (!hasOne) return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لهذا الإجراء' });
  next();
};
