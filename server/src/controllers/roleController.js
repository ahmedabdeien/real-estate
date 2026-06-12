const Role = require('../models/Role');
const User = require('../models/User');
const PERMISSIONS = require('../constants/permissions');
const PLATFORM_PERMISSIONS = require('../constants/platformPermissions');
const { success, error } = require('../utils/response');

/* عزل كامل:
   - مستخدم شركة: يرى ويدير أدوار شركته فقط (scope: company)
   - سوبر أدمن بدون companyId: يدير أدوار المنصة (scope: platform)
   - سوبر أدمن مع ?companyId: يطّلع على أدوار شركة محددة */

exports.getRoles = async (req, res) => {
  try {
    let filter;
    if (req.user.isSuperAdmin) {
      filter = req.query.companyId
        ? { companyId: req.query.companyId }
        : { scope: 'platform', companyId: null };
    } else {
      filter = { companyId: req.tenantId };
    }
    const roles = await Role.find(filter).sort('-isSystem createdAt');

    // عدد المستخدمين المرتبطين بكل دور
    const counts = await User.aggregate([
      { $match: { role: { $in: roles.map(r => r._id) } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));
    const data = roles.map(r => ({ ...r.toObject(), usersCount: countMap[String(r._id)] || 0 }));

    return success(res, data);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getPermissions = async (req, res) => {
  // السوبر أدمن في وضع المنصة يرى صلاحيات المنصة، غير ذلك صلاحيات الشركة
  const list = (req.user.isSuperAdmin && !req.query.companyId)
    ? PLATFORM_PERMISSIONS
    : PERMISSIONS;
  const grouped = list.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
  return success(res, grouped);
};

exports.createRole = async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.isSystem; // لا يُنشأ دور نظام من الـ API

    if (req.user.isSuperAdmin) {
      if (data.companyId) {
        data.scope = 'company';
      } else {
        data.companyId = null;
        data.scope = 'platform';
      }
    } else {
      data.companyId = req.tenantId;
      data.scope = 'company';
    }

    const role = await Role.create(data);
    return success(res, role, 'تم إنشاء الدور بنجاح', 201);
  } catch (err) {
    if (err.code === 11000) return error(res, 'يوجد دور بنفس الاسم بالفعل', 400);
    return error(res, err.message);
  }
};

/* تحقق الملكية قبل التعديل/الحذف */
const canManage = (user, tenantId, role) => {
  if (user.isSuperAdmin) return true;
  return role.companyId && String(role.companyId) === String(tenantId);
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return error(res, 'الدور غير موجود', 404);
    if (!canManage(req.user, req.tenantId, role)) return error(res, 'غير مصرح لك بإدارة هذا الدور', 403);
    if (role.isSystem) return error(res, 'لا يمكن تعديل الأدوار الأساسية', 400);

    const data = { ...req.body };
    delete data.isSystem;
    delete data.companyId; // لا يُنقل دور بين الشركات
    delete data.scope;

    Object.assign(role, data);
    await role.save();
    return success(res, role, 'تم تحديث الدور بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return error(res, 'الدور غير موجود', 404);
    if (!canManage(req.user, req.tenantId, role)) return error(res, 'غير مصرح لك بإدارة هذا الدور', 403);
    if (role.isSystem) return error(res, 'لا يمكن حذف الأدوار الأساسية', 400);

    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) return error(res, `لا يمكن الحذف — ${usersWithRole} مستخدم مرتبط بهذا الدور`, 400);

    await role.deleteOne();
    return success(res, null, 'تم حذف الدور بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

/* نسخ دور (داخل نفس النطاق) */
exports.duplicateRole = async (req, res) => {
  try {
    const src = await Role.findById(req.params.id);
    if (!src) return error(res, 'الدور غير موجود', 404);
    if (!canManage(req.user, req.tenantId, src)) return error(res, 'غير مصرح لك', 403);

    const copy = await Role.create({
      name: `${src.name}-copy-${Date.now().toString(36)}`,
      label: `${src.label} (نسخة)`,
      companyId: src.companyId,
      scope: src.scope,
      permissions: src.permissions,
      description: src.description,
      color: src.color,
      isSystem: false,
    });
    return success(res, copy, 'تم نسخ الدور', 201);
  } catch (err) {
    return error(res, err.message);
  }
};
