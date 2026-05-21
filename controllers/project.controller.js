import Project from "../models/project.model.js";
import Unit from "../models/unit.model.js";
import slugify from "../Utils/slugify.js";
import { logActivity } from "./activity.controller.js";

export const getProjects = async (req, res) => {
  try {
    const { status, featured, published, page = 1, limit = 12, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;
    if (published !== undefined) query.published = published === "true";
    if (search) query["name.ar"] = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Project.countDocuments(query),
    ]);
    res.json({ success: true, projects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ success: false, message: "المشروع غير موجود" });
    const units = await Unit.find({ project: project._id, published: true, isVisible: true });
    res.json({ success: true, project, units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const body = req.body;
    if (!body.slug) body.slug = slugify(body.name?.ar || body.name?.en || "project");
    const project = await Project.create(body);
    logActivity({ userId: req.user._id, action: "create", entity: "project", entityId: project._id, entityName: project.name?.ar || project.name?.en });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ success: false, message: "المشروع غير موجود" });
    logActivity({ userId: req.user._id, action: "update", entity: "project", entityId: project._id, entityName: project.name?.ar || project.name?.en });
    res.json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/projects/reorder  — save manual drag-and-drop order
export const reorderProjects = async (req, res) => {
  try {
    const { order } = req.body; // [{ _id, order }, ...]
    if (!Array.isArray(order)) return res.status(400).json({ success: false, message: "order مطلوب" });
    await Promise.all(
      order.map(({ _id, order: o }) => Project.findByIdAndUpdate(_id, { order: Number(o) }))
    );
    res.json({ success: true, message: "تم حفظ الترتيب" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    await Project.findByIdAndDelete(req.params.id);
    logActivity({ userId: req.user._id, action: "delete", entity: "project", entityId: req.params.id, entityName: project?.name?.ar || project?.name?.en });
    res.json({ success: true, message: "تم حذف المشروع" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
