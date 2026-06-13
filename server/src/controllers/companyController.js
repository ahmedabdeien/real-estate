const Company = require('../models/Company');
const ThemeSettings = require('../models/ThemeSettings');
const User = require('../models/User');
const Role = require('../models/Role');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');
const generateToken = require('../utils/generateToken');
const PERMISSIONS = require('../constants/permissions');

exports.getCompanies = async (req, res) => {
  try {
    const features = new APIFeatures(Company.find(), req.query)
      .search(['name', 'email', 'slug'])
      .filter()
      .sort()
      .paginate();
    const [companies, total] = await Promise.all([
      features.query.populate('plan'),
      Company.countDocuments(),
    ]);
    return paginated(res, companies, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('plan theme');
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    return success(res, company);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, email, slug, adminName, adminEmail, adminPassword, ...rest } = req.body;

    const existing = await Company.findOne({ $or: [{ slug }, { email }] });
    if (existing) return error(res, 'الشركة أو البريد الإلكتروني موجود مسبقاً', 400);

    const company = await Company.create({ name, email, slug, ...rest });

    const theme = await ThemeSettings.create({ companyId: company._id });
    company.theme = theme._id;
    await company.save();

    const all = PERMISSIONS.map(p => p.name);
    const perms = (modules) => all.filter(p => modules.some(m => p.startsWith(m + '.')));

    const defaultRoles = [
      {
        name: 'company_admin',
        label: 'مدير الشركة',
        color: '#da1f27',
        description: 'صلاحيات كاملة على جميع أقسام الشركة',
        permissions: all,
      },
      {
        name: 'sales_manager',
        label: 'مدير المبيعات',
        color: '#009756',
        description: 'إدارة المشاريع والوحدات والعملاء والعقود والأقساط والتقارير',
        permissions: perms([
          'properties', 'units', 'customers',
          'contracts', 'installments', 'invoices', 'payments',
          'tasks', 'notifications', 'reports', 'documents', 'media',
        ]),
      },
      {
        name: 'accountant',
        label: 'المحاسب',
        color: '#2563eb',
        description: 'العقود والأقساط والفواتير والمدفوعات والمصروفات والتقارير المالية',
        permissions: perms([
          'contracts', 'installments', 'invoices', 'payments', 'expenses',
          'reports', 'documents', 'customers', 'notifications',
        ]),
      },
      {
        name: 'sales_rep',
        label: 'مندوب المبيعات',
        color: '#fbb140',
        description: 'عرض المشاريع والوحدات وإدارة العملاء والمهام',
        permissions: perms(['customers', 'tasks', 'notifications']).concat(
          all.filter(p => ['properties.view', 'units.view', 'contracts.view', 'installments.view', 'invoices.view', 'documents.view', 'media.view'].includes(p))
        ),
      },
      {
        name: 'marketing_manager',
        label: 'مدير التسويق',
        color: '#7c3aed',
        description: 'مكتبة الصور وصفحات الموقع والعملاء والإشعارات',
        permissions: perms(['media', 'notifications', 'tasks']).concat(
          all.filter(p => ['properties.view', 'units.view', 'customers.view', 'customers.create', 'customers.update', 'reports.view'].includes(p))
        ),
      },
      {
        name: 'hr_admin',
        label: 'المشرف الإداري',
        color: '#0d9488',
        description: 'إدارة المستخدمين والأدوار والإعدادات والوثائق وسجل العمليات',
        permissions: perms(['users', 'tasks', 'documents', 'notifications']).concat(
          all.filter(p => ['roles.view', 'settings.view', 'settings.update', 'audit.view', 'activity.view', 'reports.view'].includes(p))
        ),
      },
    ];

    const createdRoles = {};
    for (const r of defaultRoles) {
      const role = await Role.create({ ...r, companyId: company._id, scope: 'company', isSystem: true });
      createdRoles[r.name] = role._id;
    }

    await User.create({
      name: adminName || name,
      email: adminEmail || email,
      password: adminPassword || 'Admin@123',
      companyId: company._id,
      role: createdRoles['company_admin'],
    });

    return success(res, company, 'تم إنشاء الشركة بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    return success(res, company, 'تم تحديث الشركة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    return success(res, null, 'تم حذف الشركة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.impersonateCompany = async (req, res) => {
  try {
    const admin = await User.findOne({ companyId: req.params.id, isSuperAdmin: false })
      .populate('role').populate('companyId');
    if (!admin) return error(res, 'لم يتم العثور على مدير للشركة', 404);
    const token = generateToken(admin._id);
    return success(res, { token, user: admin }, 'تم الدخول كمدير الشركة');
  } catch (err) {
    return error(res, err.message);
  }
};
