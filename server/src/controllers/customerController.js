const Customer = require('../models/Customer');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getCustomers = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Customer.find(filter), req.query)
      .search(['name', 'email', 'phone', 'nationalId'])
      .filter()
      .sort()
      .paginate();
    const [customers, total] = await Promise.all([
      features.query.populate('assignedTo', 'name'),
      Customer.countDocuments(filter),
    ]);
    return paginated(res, customers, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('assignedTo', 'name');
    if (!customer) return error(res, 'العميل غير موجود', 404);
    return success(res, customer);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, companyId: req.tenantId, createdBy: req.user._id });
    return success(res, customer, 'تم إنشاء العميل بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return error(res, 'العميل غير موجود', 404);
    return success(res, customer, 'تم تحديث العميل بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!customer) return error(res, 'العميل غير موجود', 404);
    return success(res, null, 'تم حذف العميل بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
