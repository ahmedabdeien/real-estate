import express from "express";
import {
  createApplication,
  getApplicationsByCareer,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/jobApplication.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createApplication);
router.get("/career/:careerId", authenticate, authorize("admin"), getApplicationsByCareer);
router.patch("/:id/status", authenticate, authorize("admin"), updateApplicationStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteApplication);

export default router;
