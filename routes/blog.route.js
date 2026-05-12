import express from "express";
import { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } from "../controllers/blog.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/:slug", getBlog);
router.post("/", authenticate, authorize("admin", "sales"), createBlog);
router.put("/:id", authenticate, authorize("admin", "sales"), updateBlog);
router.delete("/:id", authenticate, authorize("admin"), deleteBlog);

export default router;
