import Page from '../models/page.model.js';
import Blog from '../models/blog.model.js';
// Messages (Contact Form Submissions)
import Contact from '../models/contact.model.js';

export const getMessages = async (req, res, next) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Sales')) {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        // Fetch all contact form submissions
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json('Message deleted');
    } catch (error) {
        next(error);
    }
};

// Static Pages
export const createPage = async (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        const newPage = new Page({ ...req.body, lastUpdatedBy: req.user.id });
        const savedPage = await newPage.save();
        res.status(201).json(savedPage);
    } catch (error) {
        next(error);
    }
};

export const getPages = async (req, res, next) => {
    try {
        const pages = await Page.find();
        res.status(200).json(pages);
    } catch (error) {
        next(error);
    }
};

export const updatePage = async (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        const updatedPage = await Page.findByIdAndUpdate(
            req.params.id,
            { $set: req.body, lastUpdatedBy: req.user.id },
            { new: true }
        );
        res.status(200).json(updatedPage);
    } catch (error) {
        next(error);
    }
};

// Blogs
export const createBlog = async (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'BlogWriter') {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        const newBlog = new Blog({ ...req.body, author: req.user.id });
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        next(error);
    }
};

export const getBlogs = async (req, res, next) => {
    try {
        const { status, featured } = req.query;
        const query = {
            ...(status && { status }),
            ...(featured && { featured: featured === 'true' }),
        };
        if (req.user?.role !== 'Admin' && !status) {
            query.status = 'Published';
        }
        const blogs = await Blog.find(query).populate('author', 'name avatar').sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        next(error);
    }
};

export const updateBlogStatus = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status, featured: req.body.featured } },
            { new: true }
        );
        res.status(200).json(updatedBlog);
    } catch (error) {
        next(error);
    }
};

// Deletion
export const deletePage = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        await Page.findByIdAndDelete(req.params.id);
        res.status(200).json('Page has been deleted');
    } catch (error) {
        next(error);
    }
};

export const deleteBlog = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json('Blog has been deleted');
    } catch (error) {
        next(error);
    }
};

export const updateBlog = async (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'BlogWriter') return next(errorHandler(403, 'Unauthorized'));
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedBlog);
    } catch (error) {
        next(error);
    }
};
