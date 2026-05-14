import Notification from "../models/notification.model.js";

// Helper: create a notification (used by other controllers)
export async function createNotification({ userId, type, title, body = "", link = "", createdBy }) {
  try {
    await Notification.create({ userId, type, title, body, link, createdBy });
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
}

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("createdBy", "name avatar");
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "الإشعار غير موجود" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
