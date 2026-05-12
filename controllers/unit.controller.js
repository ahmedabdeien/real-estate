import Unit from "../models/unit.model.js";

export const getUnits = async (req, res) => {
  try {
    const { project, status, type, page = 1, limit = 12 } = req.query;
    const query = {};
    if (project) query.project = project;
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [units, total] = await Promise.all([
      Unit.find(query).populate("project", "name slug").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Unit.countDocuments(query),
    ]);
    res.json({ success: true, units, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate("project", "name slug coverImage");
    if (!unit) return res.status(404).json({ success: false, message: "الوحدة غير موجودة" });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUnit = async (req, res) => {
  try {
    const unit = await Unit.create(req.body);
    res.status(201).json({ success: true, unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: "الوحدة غير موجودة" });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الوحدة" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
