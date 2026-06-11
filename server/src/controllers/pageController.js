const Page   = require('../models/Page');
const asyncHandler = require('../middleware/asyncHandler');

exports.getPages = asyncHandler(async (req, res) => {
  const { type, isPublished } = req.query;
  const filter = { companyId: req.companyId };
  if (type)        filter.type = type;
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  const pages = await Page.find(filter).select('-craftJson').sort({ updatedAt: -1 });
  res.json({ success: true, data: pages });
});

exports.getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ _id: req.params.id, companyId: req.companyId });
  if (!page) return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
  res.json({ success: true, data: page });
});

exports.getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ companyId: req.companyId, slug: req.params.slug, isPublished: true });
  if (!page) return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
  res.json({ success: true, data: page });
});

exports.createPage = asyncHandler(async (req, res) => {
  const { title, slug, type, craftJson, seo } = req.body;
  const exists = await Page.findOne({ companyId: req.companyId, slug });
  if (exists) return res.status(400).json({ success: false, message: 'هذا الرابط مستخدم بالفعل' });
  const page = await Page.create({ companyId: req.companyId, title, slug, type, craftJson, seo });
  res.status(201).json({ success: true, data: page });
});

exports.updatePage = asyncHandler(async (req, res) => {
  const { title, slug, craftJson, isPublished, seo, type } = req.body;
  const page = await Page.findOne({ _id: req.params.id, companyId: req.companyId });
  if (!page) return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
  if (slug && slug !== page.slug) {
    const exists = await Page.findOne({ companyId: req.companyId, slug, _id: { $ne: page._id } });
    if (exists) return res.status(400).json({ success: false, message: 'هذا الرابط مستخدم بالفعل' });
  }
  Object.assign(page, { title, slug, craftJson, isPublished, seo, type });
  await page.save();
  res.json({ success: true, data: page });
});

exports.deletePage = asyncHandler(async (req, res) => {
  await Page.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
  res.json({ success: true, message: 'تم الحذف' });
});
