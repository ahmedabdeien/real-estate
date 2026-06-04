import express from "express";
import {
  getMedia,
  uploadMedia,
  deleteMedia,
  getCloudinaryUsage,
  bulkDeleteMedia,
  renameMedia,
  updateMedia,
  getFolders,
} from "../controllers/media.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/folders", authenticate, getFolders);
router.get("/cloudinary-usage", authenticate, getCloudinaryUsage);
router.get("/", authenticate, getMedia);
router.post("/", authenticate, uploadMedia);
router.post("/bulk-delete", authenticate, authorize("admin"), bulkDeleteMedia);
router.put("/:id/rename", authenticate, authorize("admin"), renameMedia);
router.put("/:id", authenticate, authorize("admin"), updateMedia);
router.delete("/:id", authenticate, authorize("admin"), deleteMedia);

export default router;
