import express from "express";
import { getRoles, getRole, createRole, updateRole, deleteRole } from "../controllers/roleConfig.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/",     authenticate, getRoles);
router.get("/:id",  authenticate, getRole);
router.post("/",    authenticate, authorize("admin"), createRole);
router.put("/:id",  authenticate, authorize("admin"), updateRole);
router.delete("/:id", authenticate, authorize("admin"), deleteRole);

export default router;
