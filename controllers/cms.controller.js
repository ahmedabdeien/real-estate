import Page from '../models/page.model.js';
import Blog from '../models/blog.model.js';
import { errorHandler } from '../Utils/error.js';

// Static Pages
export const createPage = async (req, res, next) => {
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
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
    if (req.user.role !== 'Admin') return next(errorHandler(403, 'Unauthorized'));
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
