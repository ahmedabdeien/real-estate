const Property = require('../models/Property');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getProperties = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Property.find(filter), req.query)
      .search(['name', 'code', 'location.city', 'location.address'])
      .filter()
      .sort()
      .paginate();
    const [properties, total] = await Promise.all([
      features.query,
      Property.countDocuments(filter),
    ]);
    return paginated(res, properties, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, companyId: req.tenantId });
    if (!property) return error(res, 'المشروع غير موجود', 404);
    return success(res, property);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create({ ...req.body, companyId: req.tenantId, createdBy: req.user._id });
    return success(res, property, 'تم إنشاء المشروع بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!property) return error(res, 'المشروع غير موجود', 404);
    return success(res, property, 'تم تحديث المشروع بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!property) return error(res, 'المشروع غير موجود', 404);
    return success(res, null, 'تم حذف المشروع بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
