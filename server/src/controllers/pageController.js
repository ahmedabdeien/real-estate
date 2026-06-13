const Page = require('../models/Page');
const { success, error } = require('../utils/response');

exports.getPages = async (req, res) => {
  try {
    const { type, isPublished } = req.query;
    const filter = { companyId: req.tenantId };
    if (type) filter.type = type;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    const pages = await Page.find(filter).select('-craftJson').sort({ updatedAt: -1 });
    return success(res, pages);
  } catch (err) { return error(res, err.message); }
};

exports.getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, companyId: req.tenantId });
    if (!page) return error(res, 'الصفحة غير موجودة', 404);
    return success(res, page);
  } catch (err) { return error(res, err.message); }
};

// Public — no auth: serves published pages to site visitors
exports.getPublicPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true }).sort({ updatedAt: -1 });
    if (!page) return error(res, 'الصفحة غير موجودة', 404);
    return success(res, page);
  } catch (err) { return error(res, err.message); }
};

// Public — no auth: nav pages (showInNav + published)
exports.getNavPages = async (req, res) => {
  try {
    const pages = await Page.find({ isPublished: true, 'settings.showInNav': true })
      .select('title slug settings.navOrder')
      .sort({ 'settings.navOrder': 1, updatedAt: -1 });
    return success(res, pages);
  } catch (err) { return error(res, err.message); }
};

exports.createPage = async (req, res) => {
  try {
    const { title, slug, type, craftJson, isPublished, seo, settings } = req.body;
    if (!title || !slug) return error(res, 'العنوان والرابط مطلوبان', 400);
    const exists = await Page.findOne({ companyId: req.tenantId, slug });
    if (exists) return error(res, 'هذا الرابط مستخدم بالفعل', 400);
    const page = await Page.create({ companyId: req.tenantId, title, slug, type, craftJson, isPublished, seo, settings });
    return success(res, page, 'تم إنشاء الصفحة', 201);
  } catch (err) { return error(res, err.message); }
};

exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, companyId: req.tenantId });
    if (!page) return error(res, 'الصفحة غير موجودة', 404);
    const { title, slug, craftJson, isPublished, seo, type, settings } = req.body;
    if (slug && slug !== page.slug) {
      const exists = await Page.findOne({ companyId: req.tenantId, slug, _id: { $ne: page._id } });
      if (exists) return error(res, 'هذا الرابط مستخدم بالفعل', 400);
    }
    if (title !== undefined) page.title = title;
    if (slug !== undefined) page.slug = slug;
    if (type !== undefined) page.type = type;
    if (craftJson !== undefined) page.craftJson = craftJson;
    if (isPublished !== undefined) page.isPublished = isPublished;
    if (seo !== undefined) page.seo = seo;
    if (settings !== undefined) page.settings = { ...(page.settings || {}), ...settings };
    await page.save();
    return success(res, page);
  } catch (err) { return error(res, err.message); }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!page) return error(res, 'الصفحة غير موجودة', 404);
    return success(res, { message: 'تم الحذف' });
  } catch (err) { return error(res, err.message); }
};
