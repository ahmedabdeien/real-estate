const cloudinary = require('cloudinary').v2;
const Media = require('../models/Media');

const getTenantId = (req) => req.tenantId || req.user?._id;

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });

    const companyId = getTenantId(req);
    const folder = req.body.folder || 'general';

    let url, publicId, width, height;

    if (cloudinary.config().cloud_name && cloudinary.config().cloud_name !== 'your_cloud_name') {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `egyestate/${companyId || 'global'}/${folder}`,
        resource_type: 'auto',
      });
      url = result.secure_url;
      publicId = result.public_id;
      width = result.width;
      height = result.height;
    } else {
      // Fallback: store as base64 data URL (dev/no-cloudinary)
      url = `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}`;
      publicId = null;
    }

    const media = await Media.create({
      companyId,
      url,
      publicId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width,
      height,
      folder,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const companyId = getTenantId(req);
    const { folder, search, page = 1, limit = 40 } = req.query;

    const filter = { companyId };
    if (folder && folder !== 'all') filter.folder = folder;
    if (search) filter.originalName = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('uploadedBy', 'name'),
      Media.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const companyId = getTenantId(req);
    const media = await Media.findOne({ _id: req.params.id, companyId });
    if (!media) return res.status(404).json({ success: false, message: 'الملف غير موجود' });

    if (media.publicId && cloudinary.config().cloud_name !== 'your_cloud_name') {
      await cloudinary.uploader.destroy(media.publicId);
    }
    await media.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const companyId = getTenantId(req);
    const media = await Media.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { $set: { tags: req.body.tags, folder: req.body.folder } },
      { new: true }
    );
    if (!media) return res.status(404).json({ success: false, message: 'الملف غير موجود' });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
