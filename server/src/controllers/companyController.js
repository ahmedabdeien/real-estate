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

    const adminRole = await Role.create({
      name: 'company_admin',
      label: 'مدير الشركة',
      companyId: company._id,
      isSystem: true,
      permissions: PERMISSIONS.map(p => p.name),
    });

    await User.create({
      name: adminName || name,
      email: adminEmail || email,
      password: adminPassword || 'Admin@123',
      companyId: company._id,
      role: adminRole._id,
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
