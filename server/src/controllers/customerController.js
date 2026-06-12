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

// ─── Pipeline stage update ───
exports.updateStage = async (req, res) => {
  try {
    const { pipelineStage } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      { pipelineStage },
      { new: true }
    );
    if (!customer) return error(res, 'العميل غير موجود', 404);
    return success(res, customer, 'تم تحديث المرحلة');
  } catch (err) {
    return error(res, err.message);
  }
};

// ─── Activities ───
exports.addActivity = async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!content) return error(res, 'المحتوى مطلوب', 400);
    const customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId });
    if (!customer) return error(res, 'العميل غير موجود', 404);
    customer.activities.unshift({ type: type || 'note', content, createdBy: req.user._id });
    await customer.save();
    await customer.populate('activities.createdBy', 'name');
    return success(res, customer.activities[0], 'تمت الإضافة', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId });
    if (!customer) return error(res, 'العميل غير موجود', 404);
    customer.activities = customer.activities.filter(a => String(a._id) !== req.params.actId);
    await customer.save();
    return success(res, null, 'تم الحذف');
  } catch (err) {
    return error(res, err.message);
  }
};

// ─── Pipeline overview — جميع العملاء مجمّعين حسب المرحلة ───
exports.getPipeline = async (req, res) => {
  try {
    const stages = ['new_lead', 'contacted', 'interested', 'negotiating', 'contracted', 'lost'];
    const customers = await Customer.find({ companyId: req.tenantId })
      .select('name phone source pipelineStage followUpDate totalBalance assignedTo createdAt')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    const grouped = Object.fromEntries(stages.map(s => [s, []]));
    customers.forEach(c => {
      const stage = c.pipelineStage || 'new_lead';
      if (grouped[stage]) grouped[stage].push(c);
    });
    return success(res, { stages, grouped, total: customers.length });
  } catch (err) {
    return error(res, err.message);
  }
};
