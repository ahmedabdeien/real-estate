import express from "express";
import { getSettings, upsertSetting, bulkUpsertSettings } from "../controllers/settings.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);
router.get("/group/:group", async (req, res) => {
  try {
    const Settings = (await import("../models/settings.model.js")).default;
    const settings = await Settings.find({ group: req.params.group });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
router.post("/", authenticate, authorize("admin"), upsertSetting);
router.post("/bulk", authenticate, authorize("admin"), bulkUpsertSettings);

export default router;
