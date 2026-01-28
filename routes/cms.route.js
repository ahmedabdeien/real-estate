import express from 'express';
import {
    createPage, getPages, updatePage, deletePage,
    createBlog, getBlogs, updateBlogStatus, updateBlog, deleteBlog,
    getMessages, deleteMessage
} from '../controllers/cms.controller.js';
import { verifyToken } from '../Utils/verifyUser.js';

const router = express.Router();

// Static Pages
router.post('/pages', verifyToken, createPage);
router.get('/pages', getPages);
router.put('/pages/:id', verifyToken, updatePage);
router.delete('/pages/:id', verifyToken, deletePage);

// Blogs
router.post('/blogs', verifyToken, createBlog);
router.get('/blogs', verifyToken, getBlogs);
router.put('/blogs/:id/status', verifyToken, updateBlogStatus);
router.put('/blogs/:id', verifyToken, updateBlog);
router.delete('/blogs/:id', verifyToken, deleteBlog);

// Messages
router.get('/messages', verifyToken, getMessages);
router.delete('/messages/:id', verifyToken, deleteMessage);

export default router;
