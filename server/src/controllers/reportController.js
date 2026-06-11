const Contract   = require('../models/Contract');
const Payment    = require('../models/Payment');
const Expense    = require('../models/Expense');
const Customer   = require('../models/Customer');
const Unit       = require('../models/Unit');
const Property   = require('../models/Property');
const Invoice    = require('../models/Invoice');
const { sendSuccess, sendError } = require('../utils/response');

exports.getDashboard = async (req, res) => {
  try {
    const cId = req.tenantId;

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalProperties, totalUnits, availableUnits, soldUnits, reservedUnits,
      totalCustomers, activeContracts, draftContracts,
      totalRevenue, totalExpenses,
      monthRevenue, monthExpenses,
      recentContracts, recentCustomers,
      overdueInstallments, upcomingInstallments,
    ] = await Promise.all([
      Property.countDocuments({ companyId: cId }),
      Unit.countDocuments({ companyId: cId }),
      Unit.countDocuments({ companyId: cId, status: 'available' }),
      Unit.countDocuments({ companyId: cId, status: 'sold' }),
      Unit.countDocuments({ companyId: cId, status: 'reserved' }),
      Customer.countDocuments({ companyId: cId }),
      Contract.countDocuments({ companyId: cId, status: 'active' }),
      Contract.countDocuments({ companyId: cId, status: 'draft' }),
      Payment.aggregate([
        { $match: { companyId: cId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { companyId: cId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { companyId: cId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { companyId: cId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Contract.find({ companyId: cId })
        .sort('-createdAt').limit(6)
        .populate('customerId', 'name phone')
        .populate('unitId', 'unitNumber floor')
        .populate('propertyId', 'name'),
      Customer.find({ companyId: cId }).sort('-createdAt').limit(5).select('name phone createdAt'),
      // overdue installments
      Contract.aggregate([
        { $match: { companyId: cId, status: 'active' } },
        { $unwind: '$installments' },
        { $match: { 'installments.status': { $in: ['pending', 'partial'] }, 'installments.dueDate': { $lt: now } } },
        { $count: 'total' },
      ]),
      // upcoming installments (next 30 days)
      Contract.aggregate([
        { $match: { companyId: cId, status: 'active' } },
        { $unwind: '$installments' },
        { $match: { 'installments.status': { $in: ['pending', 'partial'] }, 'installments.dueDate': { $gte: now, $lte: new Date(now.getTime() + 30 * 86400000) } } },
        { $sort: { 'installments.dueDate': 1 } },
        { $limit: 8 },
        { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $lookup: { from: 'units',     localField: 'unitId',     foreignField: '_id', as: 'unit'     } },
        { $project: {
          contractNumber: 1,
          'installments.dueDate': 1,
          'installments.amount': 1,
          'installments.paidAmount': 1,
          'customer.name': 1,
          'unit.unitNumber': 1,
        }},
      ]),
    ]);

    // monthly revenue (last 12 months)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // monthly expenses (last 12 months)
    const monthlyExpenses = await Expense.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // unit status breakdown
    const unitsByProperty = await Unit.aggregate([
      { $match: { companyId: cId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // top properties by revenue
    const topProperties = await Payment.aggregate([
      { $match: { companyId: cId } },
      { $lookup: { from: 'contracts', localField: 'contractId', foreignField: '_id', as: 'contract' } },
      { $unwind: { path: '$contract', preserveNullAndEmpty: true } },
      { $lookup: { from: 'properties', localField: 'contract.propertyId', foreignField: '_id', as: 'property' } },
      { $unwind: { path: '$property', preserveNullAndEmpty: true } },
      { $group: { _id: '$property._id', name: { $first: '$property.name' }, revenue: { $sum: '$amount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    sendSuccess(res, {
      properties: totalProperties,
      units: { total: totalUnits, available: availableUnits, sold: soldUnits, reserved: reservedUnits },
      customers: totalCustomers,
      activeContracts,
      draftContracts,
      revenue: totalRevenue[0]?.total || 0,
      expenses: totalExpenses[0]?.total || 0,
      netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      thisMonthRevenue: monthRevenue[0]?.total || 0,
      thisMonthExpenses: monthExpenses[0]?.total || 0,
      overdueCount: overdueInstallments[0]?.total || 0,
      monthlyRevenue,
      monthlyExpenses,
      unitsByProperty,
      recentContracts,
      recentCustomers,
      upcomingInstallments,
      topProperties,
    });
  } catch (err) {
    sendError(res, err.message);
  }
};

exports.getFinancialReport = async (req, res) => {
  try {
    const cId = req.tenantId;
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(endDate);

    const paymentFilter = { companyId: cId };
    const expenseFilter = { companyId: cId };
    if (startDate || endDate) { paymentFilter.date = dateFilter; expenseFilter.date = dateFilter; }

    const [payments, expenses] = await Promise.all([
      Payment.find(paymentFilter)
        .populate('customerId', 'name')
        .populate('invoiceId', 'invoiceNumber')
        .populate('contractId', 'contractNumber'),
      Expense.find(expenseFilter),
    ]);

    const totalRevenue  = payments.reduce((s, p) => s + p.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // group by month
    const byMonth = {};
    payments.forEach(p => {
      const key = `${p.date?.getFullYear()}-${String(p.date?.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + p.amount;
    });

    // expense by category
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    sendSuccess(res, {
      payments, expenses,
      totalRevenue, totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      revenueByMonth: byMonth,
      expenseByCategory: byCategory,
    });
  } catch (err) {
    sendError(res, err.message);
  }
};

exports.getInstallmentsReport = async (req, res) => {
  try {
    const cId  = req.tenantId;
    const { status, days } = req.query;

    const now = new Date();
    let dateFilter = {};
    if (days) {
      dateFilter = { $lte: new Date(now.getTime() + Number(days) * 86400000) };
    }

    const pipeline = [
      { $match: { companyId: cId, status: 'active' } },
      { $unwind: '$installments' },
    ];

    if (status === 'overdue') {
      pipeline.push({ $match: { 'installments.status': { $in: ['pending', 'partial'] }, 'installments.dueDate': { $lt: now } } });
    } else if (status === 'upcoming') {
      pipeline.push({ $match: { 'installments.status': { $in: ['pending', 'partial'] }, 'installments.dueDate': { $gte: now, ...dateFilter } } });
    } else if (status) {
      pipeline.push({ $match: { 'installments.status': status } });
    }

    pipeline.push(
      { $sort: { 'installments.dueDate': 1 } },
      { $limit: 100 },
      { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $lookup: { from: 'units',     localField: 'unitId',     foreignField: '_id', as: 'unit'     } },
      { $lookup: { from: 'properties',localField: 'propertyId', foreignField: '_id', as: 'property' } },
      { $project: {
        contractNumber: 1,
        'installments': 1,
        'customer.name': 1, 'customer.phone': 1,
        'unit.unitNumber': 1,
        'property.name': 1,
      }},
    );

    const results = await Contract.aggregate(pipeline);
    sendSuccess(res, results);
  } catch (err) {
    sendError(res, err.message);
  }
};
