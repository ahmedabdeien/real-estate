import express from "express";
import { getMedia, uploadMedia, deleteMedia, getCloudinaryUsage } from "../controllers/media.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getMedia);
router.get("/cloudinary-usage", authenticate, getCloudinaryUsage);
router.post("/", authenticate, uploadMedia);
router.delete("/:id", authenticate, authorize("admin"), deleteMedia);

export default router;
