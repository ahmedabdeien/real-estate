import express from "express";
import { getActivities, deleteActivity, deleteAllActivities } from "../controllers/activity.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getActivities);
router.delete("/all", authenticate, authorize("admin"), deleteAllActivities);
router.delete("/:id", authenticate, authorize("admin"), deleteActivity);

export default router;
