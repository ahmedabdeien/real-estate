import express from "express";
import { getSettings, upsertSetting, bulkUpsertSettings } from "../controllers/settings.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);
router.post("/", authenticate, authorize("admin"), upsertSetting);
router.post("/bulk", authenticate, authorize("admin"), bulkUpsertSettings);

export default router;
