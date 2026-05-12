import express from "express";
import { getContent, getAllContent, upsertContent } from "../controllers/content.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllContent);
router.get("/:section", getContent);
router.put("/:section", authenticate, authorize("admin"), upsertContent);

export default router;
