import Budget from "../models/budget.model.js";

function canAccess(user) {
  return user.role === "admin" ||
    user.department === "accounts" ||
    user.allowedPages?.includes("accounting") ||
    user.allowedPages?.includes("accounting-beni-suef");
}

export const getBudgets = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { ledgerId, branch, year } = req.query;
    const query = {};
    if (ledgerId) query.ledgerId = ledgerId;
    if (branch)   query.branch = branch;
    if (year)     query.year = parseInt(year);
    const budgets = await Budget.find(query).sort("-createdAt");
    res.json({ success: true, budgets });
  } catch {
    res.status(500).json({ success: false, message: "فشل تحميل الميزانيات" });
  }
};

export const getBudget = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: "الميزانية غير موجودة" });
    res.json({ success: true, budget });
  } catch {
    res.status(500).json({ success: false, message: "فشل تحميل الميزانية" });
  }
};

export const createBudget = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { ledgerId, sheetId, name, period, year, month, lines, branch } = req.body;
    if (!ledgerId || !name?.trim() || !year) {
      return res.status(400).json({ success: false, message: "الحقول المطلوبة: ledgerId, name, year" });
    }
    const budget = await Budget.create({
      ledgerId, sheetId: sheetId || null,
      name: name.trim(), period: period || "monthly",
      year: parseInt(year), month: month ? parseInt(month) : null,
      lines: lines || [],
      branch: branch || "main",
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, budget });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل إنشاء الميزانية" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { name, period, year, month, lines } = req.body;
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { name, period, year, month, lines },
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ success: false, message: "الميزانية غير موجودة" });
    res.json({ success: true, budget });
  } catch {
    res.status(500).json({ success: false, message: "فشل تحديث الميزانية" });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الميزانية" });
  } catch {
    res.status(500).json({ success: false, message: "فشل حذف الميزانية" });
  }
};
