const Document = require('../models/Document');
const { success, paginated, error } = require('../utils/response');

exports.getDocuments = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const { page = 1, limit = 20, type, relatedTo, relatedId, search } = req.query;

    if (type)      filter.type = type;
    if (relatedTo) filter.relatedTo = relatedTo;
    if (relatedId) filter.relatedId = relatedId;
    if (search)    filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total] = await Promise.all([
      Document.find(filter)
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Document.countDocuments(filter),
    ]);
    return paginated(res, docs, total, Number(page), Number(limit));
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('uploadedBy', 'name email');
    if (!doc) return error(res, 'المستند غير موجود', 404);
    return success(res, doc);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createDocument = async (req, res) => {
  try {
    const doc = await Document.create({ ...req.body, companyId: req.tenantId, uploadedBy: req.user._id });
    res.locals.resourceAfter = doc.toObject();
    return success(res, doc, 'تم رفع المستند بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body,
      { new: true }
    );
    if (!doc) return error(res, 'المستند غير موجود', 404);
    res.locals.resourceAfter = doc.toObject();
    return success(res, doc, 'تم تحديث المستند بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!doc) return error(res, 'المستند غير موجود', 404);
    return success(res, null, 'تم حذف المستند بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
