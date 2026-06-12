const ThemeSettings = require('../models/ThemeSettings');
const { success, error } = require('../utils/response');

const isPlatformScope = (req) =>
  req.user?.isSuperAdmin || req.user?.role?.scope === 'platform';

exports.getTheme = async (req, res) => {
  try {
    const companyId = isPlatformScope(req) ? (req.query.companyId || null) : req.tenantId;
    let theme = await ThemeSettings.findOne({ companyId });
    if (!theme) theme = await ThemeSettings.create({ companyId });
    return success(res, theme);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const companyId = isPlatformScope(req) ? (req.body.companyId || null) : req.tenantId;
    const theme = await ThemeSettings.findOneAndUpdate(
      { companyId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    return success(res, theme, 'تم تحديث الثيم بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
