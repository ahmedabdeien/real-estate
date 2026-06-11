const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getPayments = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Payment.find(filter), req.query)
      .search(['receiptNumber', 'reference'])
      .filter()
      .sort()
      .paginate();
    const [payments, total] = await Promise.all([
      features.query.populate('customerId', 'name phone').populate('invoiceId', 'invoiceNumber'),
      Payment.countDocuments(filter),
    ]);
    return paginated(res, payments, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createPayment = async (req, res) => {
  try {
    const count = await Payment.countDocuments({ companyId: req.tenantId });
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const payment = await Payment.create({
      ...req.body, receiptNumber, companyId: req.tenantId, createdBy: req.user._id,
    });

    if (req.body.invoiceId) {
      const invoice = await Invoice.findById(req.body.invoiceId);
      if (invoice) {
        invoice.paidAmount = (invoice.paidAmount || 0) + req.body.amount;
        invoice.balance = invoice.total - invoice.paidAmount;
        invoice.status = invoice.balance <= 0 ? 'paid' : 'partial';
        await invoice.save();
      }
    }

    await Customer.findByIdAndUpdate(req.body.customerId, { $inc: { totalPaid: req.body.amount } });

    return success(res, payment, 'تم تسجيل الدفعة بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!payment) return error(res, 'الدفعة غير موجودة', 404);
    return success(res, null, 'تم حذف الدفعة بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
