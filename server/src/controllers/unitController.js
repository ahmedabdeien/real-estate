const Unit = require('../models/Unit');
const Property = require('../models/Property');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getUnits = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    const features = new APIFeatures(Unit.find(filter), req.query)
      .search(['unitNumber', 'building'])
      .filter()
      .sort()
      .paginate();
    const [units, total] = await Promise.all([
      features.query.populate('propertyId', 'name').populate('currentCustomer', 'name phone'),
      Unit.countDocuments(filter),
    ]);
    return paginated(res, units, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getUnit = async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('propertyId').populate('currentCustomer').populate('currentContract');
    if (!unit) return error(res, 'الوحدة غير موجودة', 404);
    return success(res, unit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createUnit = async (req, res) => {
  try {
    const unit = await Unit.create({ ...req.body, companyId: req.tenantId, createdBy: req.user._id });
    await Property.findByIdAndUpdate(unit.propertyId, { $inc: { totalUnits: 1, availableUnits: 1 } });
    return success(res, unit, 'تم إنشاء الوحدة بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!unit) return error(res, 'الوحدة غير موجودة', 404);
    return success(res, unit, 'تم تحديث الوحدة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!unit) return error(res, 'الوحدة غير موجودة', 404);
    return success(res, null, 'تم حذف الوحدة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
