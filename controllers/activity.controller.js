import Activity from "../models/activity.model.js";

// GET /api/activity — paginated list (admin only)
export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const [activities, total] = await Promise.all([
      Activity.find()
        .populate("user", "name avatar role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit)),
      Activity.countDocuments(),
    ]);
    res.json({ success: true, activities, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper — call from other controllers to log an activity (non-blocking)
export const logActivity = ({ userId, action, entity = "", entityId = "", entityName = "", details = "", ip = "" }) => {
  Activity.create({ user: userId, action, entity, entityId, entityName, details, ip }).catch(() => {});
};
