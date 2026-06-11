const AuditLog = require('../models/AuditLog');
const { paginated, error } = require('../utils/response');

exports.getAuditLogs = async (req, res) => {
  try {
    const isSuperAdmin = req.user?.isSuperAdmin;
    const base = isSuperAdmin ? {} : { companyId: req.tenantId };

    const {
      page = 1, limit = 30,
      module, action, userId,
      from, to, search,
      companyId: qCompany,
    } = req.query;

    const filter = { ...base };
    if (module)   filter.module = module;
    if (action)   filter.action = action;
    if (userId)   filter.userId = userId;
    if (isSuperAdmin && qCompany) filter.companyId = qCompany;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23,59,59,999));
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email avatar')
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return paginated(res, logs, total, Number(page), Number(limit));
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAuditStats = async (req, res) => {
  try {
    const base = req.user?.isSuperAdmin ? {} : { companyId: req.tenantId };

    const [byModule, byAction, byUser] = await Promise.all([
      AuditLog.aggregate([
        { $match: base },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      AuditLog.aggregate([
        { $match: base },
        { $group: { _id: '$action', count: { $sum: 1 } } },
      ]),
      AuditLog.aggregate([
        { $match: base },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { count: 1, 'user.name': 1, 'user.email': 1 } },
      ]),
    ]);

    return res.json({ success: true, data: { byModule, byAction, byUser } });
  } catch (err) {
    return error(res, err.message);
  }
};
