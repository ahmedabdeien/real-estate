const Role = require('../models/Role');
const User = require('../models/User');
const PERMISSIONS = require('../constants/permissions');
const PLATFORM_PERMISSIONS = require('../constants/platformPermissions');
const PAGE_PERMISSIONS = require('../constants/pagePermissions');
const { success, error } = require('../utils/response');

/* ─── عزل صارم لـ3 مستويات لا تتداخل إطلاقاً ───
   platform — أدوار المنصة: السوبر أدمن فقط، companyId دائماً null
   company  — أدوار الشركة: داخل نطاق الشركة فقط
   page     — أدوار المحتوى/الصفحات: داخل نطاق الشركة، صلاحيات محتوى فقط */

const PERMS_BY_SCOPE = {
  platform: PLATFORM_PERMISSIONS,
  company:  PERMISSIONS,
  page:     PAGE_PERMISSIONS,
};

/* الصلاحيات المسموحة لكل نطاق — أي صلاحية خارج قائمة النطاق تُرفض،
   وهذا ما يمنع تسريب صلاحيات منصة داخل دور شركة والعكس */
const validPermsFor = (scope) =>
  new Set((PERMS_BY_SCOPE[scope] || []).map(p => p.name));

const sanitizePermissions = (scope, permissions = []) => {
  const allowed = validPermsFor(scope);
  return permissions.filter(p => allowed.has(p));
};

const isPlatformUser = (req) =>
  req.user?.isSuperAdmin || req.user?.role?.scope === 'platform';

/* النطاق المسموح طلبه لكل مستخدم */
const resolveScope = (req) => {
  const requested = req.query.scope || req.body?.scope;
  if (isPlatformUser(req)) {
    const cid = req.query.companyId || req.body?.companyId;
    if (!cid) return 'platform';
    return requested === 'page' ? 'page' : 'company';
  }
  return requested === 'page' ? 'page' : 'company';
};

exports.getRoles = async (req, res) => {
  try {
    const scope = resolveScope(req);
    let filter;
    if (isPlatformUser(req)) {
      filter = scope === 'platform'
        ? { scope: 'platform', companyId: null }
        : { scope, companyId: req.query.companyId };
    } else {
      filter = { scope, companyId: req.tenantId };
    }
    const roles = await Role.find(filter).sort('-isSystem createdAt');

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
  const scope = resolveScope(req);
  const list = PERMS_BY_SCOPE[scope] || PERMISSIONS;
  const grouped = list.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
  return success(res, grouped);
};

exports.createRole = async (req, res) => {
  try {
    const scope = resolveScope(req);
    const data = { ...req.body };
    delete data.isSystem;

    data.scope = scope;
    if (scope === 'platform') {
      data.companyId = null;
    } else if (isPlatformUser(req)) {
      data.companyId = req.body.companyId;
    } else {
      data.companyId = req.tenantId;
    }
    // فلترة الصلاحيات على نطاق الدور — لا تسريب بين المستويات
    data.permissions = sanitizePermissions(scope, data.permissions);

    const role = await Role.create(data);
    return success(res, role, 'تم إنشاء الدور بنجاح', 201);
  } catch (err) {
    if (err.code === 11000) return error(res, 'يوجد دور بنفس الاسم بالفعل', 400);
    return error(res, err.message);
  }
};

const canManage = (user, tenantId, role) => {
  if (user.isSuperAdmin || user?.role?.scope === 'platform') return true;
  if (role.scope === 'platform') return false; // أدوار المنصة لا يلمسها غير السوبر أدمن
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
    delete data.companyId; // لا نقل بين الشركات
    delete data.scope;     // لا نقل بين المستويات
    if (data.permissions) data.permissions = sanitizePermissions(role.scope, data.permissions);

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
