import express from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/project.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProject);
router.post("/", authenticate, authorize("admin", "sales"), createProject);
router.put("/:id", authenticate, authorize("admin", "sales"), updateProject);
router.delete("/:id", authenticate, authorize("admin"), deleteProject);

export default router;
