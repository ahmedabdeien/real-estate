const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getInvoices = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Invoice.find(filter), req.query)
      .search(['invoiceNumber'])
      .filter()
      .sort()
      .paginate();
    const [invoices, total] = await Promise.all([
      features.query.populate('customerId', 'name phone').populate('unitId', 'unitNumber'),
      Invoice.countDocuments(filter),
    ]);
    return paginated(res, invoices, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('customerId').populate('unitId').populate('contractId').populate('createdBy', 'name');
    if (!invoice) return error(res, 'الفاتورة غير موجودة', 404);
    return success(res, invoice);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const count = await Invoice.countDocuments({ companyId: req.tenantId });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const { subtotal, taxRate = 0, discount = 0 } = req.body;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    const invoice = await Invoice.create({
      ...req.body, invoiceNumber, taxAmount, total,
      balance: total, companyId: req.tenantId, createdBy: req.user._id,
    });
    return success(res, invoice, 'تم إنشاء الفاتورة بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId },
      req.body, { new: true }
    );
    if (!invoice) return error(res, 'الفاتورة غير موجودة', 404);
    return success(res, invoice, 'تم تحديث الفاتورة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!invoice) return error(res, 'الفاتورة غير موجودة', 404);
    return success(res, null, 'تم حذف الفاتورة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
