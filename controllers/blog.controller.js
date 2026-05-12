import Blog from "../models/blog.model.js";
import slugify from "../Utils/slugify.js";

export const getBlogs = async (req, res) => {
  try {
    const { status, featured, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;
    if (search) query["title.ar"] = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(query).populate("author", "name avatar").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Blog.countDocuments(query),
    ]);
    res.json({ success: true, blogs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate("author", "name avatar");
    if (!blog) return res.status(404).json({ success: false, message: "المقال غير موجود" });
    blog.views += 1;
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const body = { ...req.body, author: req.user._id };
    if (!body.slug) body.slug = slugify(body.title?.ar || body.title?.en || "blog");
    const blog = await Blog.create(body);
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: "المقال غير موجود" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المقال" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
