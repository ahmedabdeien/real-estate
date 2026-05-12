import express from "express";
import { getActivities } from "../controllers/activity.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getActivities);

export default router;
