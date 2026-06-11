const AuditLog = require('../models/AuditLog');

const ACTION_LABELS = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  view:   'عرض',
  login:  'تسجيل دخول',
  logout: 'تسجيل خروج',
  export: 'تصدير',
  import: 'استيراد',
};

const MODULE_LABELS = {
  properties: 'المشاريع',
  units:      'الوحدات',
  customers:  'العملاء',
  contracts:  'العقود',
  invoices:   'الفواتير',
  payments:   'المدفوعات',
  expenses:   'المصروفات',
  users:      'المستخدمين',
  roles:      'الأدوار',
  companies:  'الشركات',
  settings:   'الإعدادات',
  theme:      'المظهر',
  reports:    'التقارير',
  documents:  'المستندات',
  installments: 'الأقساط',
  plans:      'خطط الاشتراك',
  auth:       'المصادقة',
};

/**
 * Middleware factory for audit logging.
 * @param {string} module   - e.g. 'contracts'
 * @param {string} action   - e.g. 'create' | 'update' | 'delete'
 * @param {Function} [getResource] - optional fn(req) => Promise<{name, before}>
 */
exports.logAction = (module, action, getResource = null) =>
  async (req, res, next) => {
    let before = null;
    let resourceName = null;

    // Capture "before" state for updates and deletes
    if ((action === 'update' || action === 'delete') && getResource) {
      try {
        const result = await getResource(req);
        before = result?.before || null;
        resourceName = result?.name || null;
      } catch (_) {}
    }

    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          const moduleLabel = MODULE_LABELS[module] || module;
          const actionLabel = ACTION_LABELS[action] || action;

          // Build human-readable description
          let description = `${actionLabel} ${moduleLabel}`;
          if (resourceName) description += ` — ${resourceName}`;

          // Capture "after" state from res.locals if controller set it
          const after = res.locals.resourceAfter || null;

          // Compute diff for updates
          let diff = null;
          if (action === 'update' && before && after) {
            diff = computeDiff(before, after);
          }

          await AuditLog.create({
            companyId:    req.tenantId || req.user.companyId || null,
            userId:       req.user._id,
            action,
            module,
            resourceId:   req.params.id || res.locals.resourceId || null,
            resourceType: module,
            resourceName: resourceName || res.locals.resourceName || null,
            description,
            before,
            after,
            diff,
            ip:        req.ip,
            userAgent: req.headers['user-agent'],
          });
        } catch (_) {}
      }
    });

    next();
  };

/**
 * Compare two plain objects and return only changed fields.
 */
function computeDiff(before, after) {
  const changes = {};
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const skip = ['__v', 'updatedAt', 'createdAt'];
  for (const k of allKeys) {
    if (skip.includes(k)) continue;
    const bVal = JSON.stringify(before[k]);
    const aVal = JSON.stringify(after[k]);
    if (bVal !== aVal) {
      changes[k] = { from: before[k], to: after[k] };
    }
  }
  return Object.keys(changes).length ? changes : null;
}
