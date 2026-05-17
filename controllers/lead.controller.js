import Lead from "../models/lead.model.js";
import { logActivity } from "./activity.controller.js";

export const getLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    // Non-admin/non-supervisor users see only their own leads
    if (req.user && !["admin", "supervisor"].includes(req.user.role)) {
      query.createdBy = req.user._id;
    }

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("interestedProject", "name")
        .populate("assignedTo", "name")
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(query),
    ]);
    res.json({ success: true, leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("interestedProject", "name")
      .populate("assignedTo", "name email");
    if (!lead) return res.status(404).json({ success: false, message: "العميل غير موجود" });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLead = async (req, res) => {
  try {
    const leadData = { ...req.body };
    if (req.user) leadData.createdBy = req.user._id;
    const lead = await Lead.create(leadData);
    if (req.user) logActivity({ userId: req.user._id, action: "create", entity: "lead", entityId: lead._id, entityName: lead.name });

    // Notify all admin & supervisor users of new lead
    try {
      const User = (await import("../models/user.model.js")).default;
      const Notification = (await import("../models/notification.model.js")).default;
      const admins = await User.find({ role: { $in: ["admin", "supervisor"] } }).select("_id");
      const notifications = admins.map(a => ({
        userId: a._id,
        type: "new_lead",
        title: "عميل محتمل جديد",
        body: `${lead.name || "عميل جديد"} — ${lead.phone || ""}`,
        link: "/admin/leads",
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    } catch (_) {}

    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "العميل غير موجود" });
    if (req.user) logActivity({ userId: req.user._id, action: "update", entity: "lead", entityId: lead._id, entityName: lead.name, details: req.body.status ? `الحالة: ${req.body.status}` : "" });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    await Lead.findByIdAndDelete(req.params.id);
    if (req.user) logActivity({ userId: req.user._id, action: "delete", entity: "lead", entityId: req.params.id, entityName: lead?.name });
    res.json({ success: true, message: "تم حذف العميل" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
