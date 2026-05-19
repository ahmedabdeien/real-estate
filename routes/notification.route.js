import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/unread-count", authenticate, getUnreadCount);
router.get("/", authenticate, getNotifications);
router.put("/read-all", authenticate, markAllRead);
router.put("/:id/read", authenticate, markRead);
router.delete("/clear-all", authenticate, clearAllNotifications);
router.delete("/:id", authenticate, deleteNotification);

export default router;
