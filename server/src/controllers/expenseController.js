const Expense = require('../models/Expense');
const APIFeatures = require('../utils/apiFeatures');
const { success, paginated, error } = require('../utils/response');

exports.getExpenses = async (req, res) => {
  try {
    const filter = { companyId: req.tenantId };
    const features = new APIFeatures(Expense.find(filter), req.query)
      .search(['expenseNumber', 'description', 'vendor'])
      .filter()
      .sort()
      .paginate();
    const [expenses, total] = await Promise.all([
      features.query,
      Expense.countDocuments(filter),
    ]);
    return paginated(res, expenses, total, features.page, features.limit);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.createExpense = async (req, res) => {
  try {
    const count = await Expense.countDocuments({ companyId: req.tenantId });
    const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const expense = await Expense.create({ ...req.body, expenseNumber, companyId: req.tenantId, createdBy: req.user._id });
    return success(res, expense, 'تم إنشاء المصروف بنجاح', 201);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, companyId: req.tenantId }, req.body, { new: true }
    );
    if (!expense) return error(res, 'المصروف غير موجود', 404);
    return success(res, expense, 'تم تحديث المصروف بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, companyId: req.tenantId });
    if (!expense) return error(res, 'المصروف غير موجود', 404);
    return success(res, null, 'تم حذف المصروف بنجاح');
  } catch (err) {
    return error(res, err.message);
  }
};
