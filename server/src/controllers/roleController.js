const Role = require('../models/Role');
const PERMISSIONS = require('../constants/permissions');
const { success, error } = require('../utils/response');

exports.getRoles = async (req, res) => {
  try {
    const filter = req.user.isSuperAdmin
      ? req.query.companyId ? { companyId: req.query.companyId } : {}
      : { companyId: req.tenantId };
    const roles = await Role.find(filter);
    return success(res, roles);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getPermissions = async (req, res) => {
  const grouped = PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});
  return success(res, grouped);
};

exports.createRole = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!req.user.isSuperAdmin) data.companyId = req.tenantId;
    const role = await Role.create(data);
    return success(res, role, 'تم إنشاء الدور بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return error(res, 'الدور غير موجود', 404);
    if (role.isSystem) return error(res, 'لا يمكن تعديل الأدوار الأساسية', 400);
    Object.assign(role, req.body);
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
    if (role.isSystem) return error(res, 'لا يمكن حذف الأدوار الأساسية', 400);
    await role.deleteOne();
    return success(res, null, 'تم حذف الدور بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
