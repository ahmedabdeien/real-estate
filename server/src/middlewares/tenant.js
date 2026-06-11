exports.tenantScope = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    // Super admin can scope to a specific company via query param,
    // or fall back to their own companyId (so they can manage their own data)
    req.tenantId = req.query.companyId
      || req.body.companyId
      || req.user?.companyId?._id
      || req.user?.companyId
      || null;
  } else {
    req.tenantId = req.user?.companyId?._id || req.user?.companyId;
  }
  next();
};
