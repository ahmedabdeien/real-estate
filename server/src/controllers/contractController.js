const Contract = require('../models/Contract');
const Unit = require('../models/Unit');
const Customer = require('../models/Customer');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

const generateInstallments = (totalAmount, count, startDate, frequency = 'monthly') => {
  const installments = [];
  const amount = Math.round(totalAmount / count);
  for (let i = 0; i < count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    installments.push({ dueDate, amount: i === count - 1 ? totalAmount - amount * (count - 1) : amount, paidAmount: 0, status: 'pending' });
  }
  return installments;
};

exports.getContracts = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Contract.find(filter), req.query)
      .search(['contractNumber'])
      .filter()
      .sort()
      .paginate();
    const [contracts, total] = await Promise.all([
      features.query.populate('customerId', 'name phone').populate('unitId', 'unitNumber').populate('propertyId', 'name'),
      Contract.countDocuments(filter),
    ]);
    return paginated(res, contracts, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('customerId').populate('unitId').populate('propertyId').populate('createdBy', 'name');
    if (!contract) return error(res, 'العقد غير موجود', 404);
    return success(res, contract);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createContract = async (req, res) => {
  try {
    const { totalPrice, downPayment = 0, installmentCount = 1, startDate, ...rest } = req.body;
    const remaining = totalPrice - downPayment;
    const installments = installmentCount > 1
      ? generateInstallments(remaining, installmentCount, new Date(startDate))
      : [{ dueDate: new Date(startDate), amount: remaining, paidAmount: 0, status: 'pending' }];

    const count = await Contract.countDocuments({ companyId: req.tenantId });
    const contractNumber = `CNT-${Date.now()}-${count + 1}`;

    const contract = await Contract.create({
      ...rest, totalPrice, downPayment, remainingAmount: remaining,
      installmentCount, installments, startDate, contractNumber,
      companyId: req.tenantId, createdBy: req.user._id,
    });

    await Unit.findByIdAndUpdate(rest.unitId, { status: 'reserved', currentCustomer: rest.customerId, currentContract: contract._id });
    await Customer.findByIdAndUpdate(rest.customerId, { $inc: { totalPurchases: totalPrice } });

    return success(res, contract, 'تم إنشاء العقد بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body, { new: true }
    );
    if (!contract) return error(res, 'العقد غير موجود', 404);
    return success(res, contract, 'تم تحديث العقد بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateInstallment = async (req, res) => {
  try {
    const { id, instId } = req.params;
    const contract = await Contract.findOne({ _id: id, companyId: req.tenantId });
    if (!contract) return error(res, 'العقد غير موجود', 404);
    const inst = contract.installments.id(instId);
    if (!inst) return error(res, 'القسط غير موجود', 404);
    Object.assign(inst, req.body);
    if (req.body.status === 'paid' && !inst.paidAt) inst.paidAt = new Date();
    if (req.body.status === 'paid') inst.paidAmount = inst.amount;
    await contract.save();
    return success(res, contract, 'تم تحديث القسط بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!contract) return error(res, 'العقد غير موجود', 404);
    await Unit.findByIdAndUpdate(contract.unitId, { status: 'available', currentCustomer: null, currentContract: null });
    return success(res, null, 'تم حذف العقد بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
