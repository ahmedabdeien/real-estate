import JobApplication from "../models/jobApplication.model.js";

export const createApplication = async (req, res) => {
  try {
    const { career, name, phone, email, cv_link } = req.body;
    if (!career || !name || !phone || !email)
      return res.status(400).json({ success: false, message: "بيانات ناقصة" });
    const app = await JobApplication.create({ career, name, phone, email, cv_link });
    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApplicationsByCareer = async (req, res) => {
  try {
    const apps = await JobApplication.find({ career: req.params.careerId }).sort({ createdAt: -1 });
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const app = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!app) return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
