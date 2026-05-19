import RoleConfig from "../models/roleConfig.model.js";

const DEFAULT_ROLES = [
  { roleKey: "admin",       label: "مدير عام",            isSystem: true,  allowedPages: ["*"] },
  { roleKey: "supervisor",  label: "مشرف عام",            isSystem: true,  allowedPages: ["notifications","projects","units","leads","client-reg","blogs","tasks","profile","changelog"] },
  { roleKey: "manager",     label: "مدير قسم",            isSystem: true,  allowedPages: ["notifications","tasks","profile","changelog"] },
  { roleKey: "employee",    label: "موظف",                isSystem: true,  allowedPages: ["notifications","tasks","profile","changelog"] },
  { roleKey: "sales",       label: "مبيعات",              isSystem: true,  allowedPages: ["notifications","projects","units","leads","client-reg","blogs","tasks","profile","changelog"] },
  { roleKey: "viewer",      label: "مشاهد",               isSystem: true,  allowedPages: [] },
  {
    roleKey: "branch_accounts_beni_suef",
    label: "محاسب فرع بني سويف",
    branch: "بني سويف",
    isSystem: false,
    allowedPages: ["notifications","tasks","accounting","accounting-beni-suef","accounting-records","accounting-records-beni-suef","profile","changelog"],
  },
];

export const seedDefaultRoles = async () => {
  try {
    for (const role of DEFAULT_ROLES) {
      await RoleConfig.updateOne(
        { roleKey: role.roleKey },
        { $setOnInsert: role },
        { upsert: true }
      );
    }
    console.log("Default roles seeded");
  } catch (err) {
    console.error("Failed to seed roles:", err.message);
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await RoleConfig.find().populate("createdBy", "name").sort({ isSystem: -1, createdAt: 1 });
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const role = await RoleConfig.findById(req.params.id).populate("createdBy", "name");
    if (!role) return res.status(404).json({ success: false, message: "الدور غير موجود" });
    res.json({ success: true, role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { roleKey, label, branch, allowedPages } = req.body;
    if (!roleKey || !label) {
      return res.status(400).json({ success: false, message: "مفتاح الدور والاسم مطلوبان" });
    }
    const exists = await RoleConfig.findOne({ roleKey });
    if (exists) return res.status(400).json({ success: false, message: "مفتاح الدور مستخدم بالفعل" });

    const role = await RoleConfig.create({
      roleKey,
      label,
      branch: branch || "",
      allowedPages: allowedPages || [],
      isSystem: false,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await RoleConfig.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "الدور غير موجود" });

    const { roleKey, label, branch, allowedPages, isActive } = req.body;

    // Can't change roleKey for system roles
    if (role.isSystem && roleKey && roleKey !== role.roleKey) {
      return res.status(400).json({ success: false, message: "لا يمكن تغيير مفتاح الأدوار الأساسية" });
    }

    if (!role.isSystem && roleKey) {
      // Check uniqueness for non-system roles
      const exists = await RoleConfig.findOne({ roleKey, _id: { $ne: role._id } });
      if (exists) return res.status(400).json({ success: false, message: "مفتاح الدور مستخدم بالفعل" });
      role.roleKey = roleKey;
    }

    if (label !== undefined) role.label = label;
    if (branch !== undefined) role.branch = branch;
    if (allowedPages !== undefined) role.allowedPages = allowedPages;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();
    res.json({ success: true, role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await RoleConfig.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "الدور غير موجود" });
    if (role.isSystem) return res.status(400).json({ success: false, message: "لا يمكن حذف الأدوار الأساسية" });

    await role.deleteOne();
    res.json({ success: true, message: "تم حذف الدور" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
