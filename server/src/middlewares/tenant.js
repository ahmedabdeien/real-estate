exports.tenantScope = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    /* السوبر أدمن يعمل في سياق المنصة (null) دائماً —
       ولا يدخل سياق شركة إلا بطلب صريح عبر companyId.
       (الرجوع لـ companyId الحساب كان يسبب تداخل المنصة مع الشركة) */
    req.tenantId = req.query.companyId || req.body.companyId || null;
  } else {
    req.tenantId = req.user?.companyId?._id || req.user?.companyId;
  }
  next();
};
