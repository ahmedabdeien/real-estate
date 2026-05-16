import Media from "../models/media.model.js";

// GET /api/media — list all media
export const getMedia = async (req, res) => {
  try {
    const { folder, page = 1, limit = 24 } = req.query;
    const query = {};
    if (folder) query.folder = folder;
    const skip = (page - 1) * limit;
    const [media, total] = await Promise.all([
      Media.find(query).populate("uploadedBy", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Media.countDocuments(query),
    ]);
    res.json({ success: true, media, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/media — save record after Firebase Storage upload
export const uploadMedia = async (req, res) => {
  try {
    const { url, publicId, name, type, size, folder } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "URL مطلوب" });
    const media = await Media.create({
      url, publicId, name, type, size: size || 0,
      folder: folder || "general",
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, media });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/media/cloudinary-usage — fetch usage stats from Cloudinary
export const getCloudinaryUsage = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false });

    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const count = await Media.countDocuments();
      return res.json({ success: true, estimated: true, count, message: "بيانات تقديرية — لم يتم إعداد Cloudinary API" });
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await response.json();

    res.json({
      success: true,
      usage: {
        storage_used: data.storage?.usage || 0,
        storage_limit: data.storage?.limit || 25 * 1024 * 1024 * 1024,
        bandwidth_used: data.bandwidth?.usage || 0,
        credits_used: data.credits?.usage || 0,
        credits_limit: data.credits?.limit || 25,
        transformations: data.transformations?.usage || 0,
        media_count: data.resources?.usage || 0,
      },
    });
  } catch (err) {
    res.json({ success: true, estimated: true, message: "تعذر جلب بيانات Cloudinary" });
  }
};

// DELETE /api/media/:id — remove from DB (Firebase file deleted on frontend)
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "الملف غير موجود" });
    await Media.findByIdAndDelete(req.params.id);
    // Return publicId so frontend can delete from Firebase Storage
    res.json({ success: true, message: "تم حذف الملف", publicId: media.publicId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
