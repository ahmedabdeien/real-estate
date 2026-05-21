import express from "express";
import { getUnits, getUnit, createUnit, updateUnit, deleteUnit, toggleVisibility, hideAllByProject } from "../controllers/unit.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getUnits);
router.get("/:id", getUnit);
router.post("/", authenticate, authorize("admin", "sales"), createUnit);
router.put("/:id", authenticate, authorize("admin", "sales"), updateUnit);
router.delete("/:id", authenticate, authorize("admin"), deleteUnit);
router.patch("/:id/toggle-visibility", authenticate, authorize("admin", "sales", "supervisor", "manager"), toggleVisibility);
router.patch("/project/:projectId/visibility", authenticate, authorize("admin", "sales", "supervisor", "manager"), hideAllByProject);

export default router;
