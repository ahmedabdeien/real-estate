import Career from "../models/career.model.js";

export const getCareers = async (req, res) => {
  try {
    const { published } = req.query;
    const query = {};
    if (published !== undefined) query.published = published === "true";
    const careers = await Career.find(query).sort({ createdAt: -1 });
    res.json({ success: true, careers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ success: false, message: "الوظيفة غير موجودة" });
    res.json({ success: true, career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCareer = async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(201).json({ success: true, career });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!career) return res.status(404).json({ success: false, message: "الوظيفة غير موجودة" });
    res.json({ success: true, career });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteCareer = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الوظيفة" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
