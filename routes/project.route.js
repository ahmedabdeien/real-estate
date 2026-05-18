import express from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject, reorderProjects } from "../controllers/project.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProject);
router.put("/reorder", authenticate, authorize("admin", "sales"), reorderProjects);
router.post("/", authenticate, authorize("admin", "sales"), createProject);
router.put("/:id", authenticate, authorize("admin", "sales"), updateProject);
router.delete("/:id", authenticate, authorize("admin"), deleteProject);

export default router;
