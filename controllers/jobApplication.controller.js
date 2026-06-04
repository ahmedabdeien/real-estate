import JobApplication from "../models/jobApplication.model.js";
import Career from "../models/career.model.js";
import Lead from "../models/lead.model.js";

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
    const careerId = req.params.careerId;

    // New applications from JobApplication collection
    const newApps = await JobApplication.find({ career: careerId }).sort({ createdAt: -1 });

    // Old applications stored in Leads (message starts with "تقديم على وظيفة:")
    // Fetch career title to match leads
    const career = await Career.findById(careerId).select("title");
    let legacyApps = [];
    if (career?.title?.ar) {
      const prefix = `تقديم على وظيفة: ${career.title.ar}`;
      const leads = await Lead.find({
        message: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
      }).sort({ createdAt: -1 });

      legacyApps = leads.map((l) => {
        // Parse cv_link from message if embedded: "... — السيرة: <url>"
        const cvMatch = l.message.match(/— السيرة: (.+)$/);
        return {
          _id: l._id,
          career: careerId,
          name: l.name,
          phone: l.phone,
          email: l.email,
          cv_link: cvMatch ? cvMatch[1].trim() : "",
          status: l.status === "new" ? "new" : "reviewed",
          createdAt: l.createdAt,
          _legacy: true,
        };
      });
    }

    const applications = [...newApps, ...legacyApps].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, applications });
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
