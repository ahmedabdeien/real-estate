import Project from "../models/project.model.js";
import Unit from "../models/unit.model.js";
import Lead from "../models/lead.model.js";
import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProjects,
      totalUnits,
      availableUnits,
      soldUnits,
      reservedUnits,
      totalLeads,
      newLeads,
      totalBlogs,
      totalUsers,
    ] = await Promise.all([
      Project.countDocuments(),
      Unit.countDocuments(),
      Unit.countDocuments({ status: "available" }),
      Unit.countDocuments({ status: "sold" }),
      Unit.countDocuments({ status: "reserved" }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Blog.countDocuments({ status: "published" }),
      User.countDocuments(),
    ]);

    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("interestedProject", "name");

    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const unitsByStatus = { available: availableUnits, sold: soldUnits, reserved: reservedUnits };

    res.json({
      success: true,
      stats: {
        totalProjects,
        totalUnits,
        unitsByStatus,
        totalLeads,
        newLeads,
        totalBlogs,
        totalUsers,
      },
      recentLeads,
      leadsByStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
