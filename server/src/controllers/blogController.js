const Blog = require('../models/Blog');
const { success, paginated, error } = require('../utils/response');

const slugify = (text) =>
  text.toLowerCase().trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getTenantId = (req) => req.tenantId || req.user?._id;

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const filter = { companyId: getTenantId(req) };
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (search)   filter.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags:    { $in: [new RegExp(search, 'i')] } },
    ];

    const [blogs, total] = await Promise.all([
      Blog.find(filter).populate('author', 'name').sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);
    return paginated(res, blogs, total, page, limit);
  } catch (err) { return error(res, err.message); }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, companyId: getTenantId(req) }).populate('author', 'name');
    if (!blog) return error(res, 'المقال غير موجود', 404);
    return success(res, blog);
  } catch (err) { return error(res, err.message); }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, companyId: req.tenantId, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');
    if (!blog) return error(res, 'المقال غير موجود', 404);
    return success(res, blog);
  } catch (err) { return error(res, err.message); }
};

exports.createBlog = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { title, ...rest } = req.body;
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.exists({ companyId: tenantId, slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    const blog = await Blog.create({
      ...rest, title, slug,
      companyId: tenantId,
      author: req.user._id,
      publishedAt: rest.status === 'published' ? new Date() : null,
    });
    return success(res, blog, 'تم إنشاء المقال بنجاح', 201);
  } catch (err) { return error(res, err.message); }
};

exports.updateBlog = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const update = { ...req.body };
    if (update.status === 'published') {
      const existing = await Blog.findById(req.params.id);
      if (existing && existing.status !== 'published') update.publishedAt = new Date();
    }
    if (update.title) update.slug = slugify(update.title);
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, companyId: tenantId },
      update, { new: true }
    );
    if (!blog) return error(res, 'المقال غير موجود', 404);
    return success(res, blog, 'تم تحديث المقال');
  } catch (err) { return error(res, err.message); }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, companyId: getTenantId(req) });
    if (!blog) return error(res, 'المقال غير موجود', 404);
    return success(res, null, 'تم حذف المقال');
  } catch (err) { return error(res, err.message); }
};

exports.getPublicBlogs = async (req, res) => {
  try {
    const { companyId, page = 1, limit = 10, category } = req.query;
    if (!companyId) return error(res, 'companyId مطلوب', 400);
    const filter = { companyId, status: 'published' };
    if (category) filter.category = category;
    const [blogs, total] = await Promise.all([
      Blog.find(filter).select('-content').populate('author', 'name')
        .sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);
    return paginated(res, blogs, total, page, limit);
  } catch (err) { return error(res, err.message); }
};
