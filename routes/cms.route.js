import express from 'express';
import {
    createPage, getPages, updatePage,
    createBlog, getBlogs, updateBlogStatus
} from '../controllers/cms.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

// Static Pages
router.post('/pages', verifyToken, createPage);
router.get('/pages', getPages);
router.put('/pages/:id', verifyToken, updatePage);

// Blogs
router.post('/blogs', verifyToken, createBlog);
router.get('/blogs', verifyToken, getBlogs); // verifyToken is optional for public viewing, but useful for role checks
router.put('/blogs/:id/status', verifyToken, updateBlogStatus);

export default router;
