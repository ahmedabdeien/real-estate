const Notification = require('../models/Notification');
const { success, error } = require('../utils/response');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return success(res, { notifications, unreadCount });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return success(res, null, 'تم تحديد الكل كمقروء');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return success(res, null, 'تم حذف الإشعار');
  } catch (err) {
    return error(res, err.message);
  }
};
