import Ledger from "../models/accounting.model.js";

const ALLOWED_ROLES = ["admin", "accounts"];

function canAccess(user) {
  return user.role === "admin" || user.department === "accounts";
}

// ─── Ledgers ────────────────────────────────────────────────────────────────

export const getLedgers = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const ledgers = await Ledger.find({ isArchived: false })
      .select("name description branch color icon createdAt createdBy")
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json({ success: true, ledgers });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل تحميل السجلات" });
  }
};

export const getLedger = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const ledger = await Ledger.findById(req.params.id).populate("createdBy", "name");
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    res.json({ success: true, ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل تحميل السجل" });
  }
};

export const createLedger = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { name, description, branch, color, icon } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "الاسم مطلوب" });
    const ledger = await Ledger.create({
      name: name.trim(),
      description: description || "",
      branch: branch || "main",
      color: color || "#2d5d89",
      icon: icon || "📒",
      createdBy: req.user._id,
      sheets: [],
    });
    res.status(201).json({ success: true, ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل إنشاء السجل" });
  }
};

export const updateLedger = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { name, description, branch, color, icon } = req.body;
    const ledger = await Ledger.findByIdAndUpdate(
      req.params.id,
      { name, description, branch, color, icon },
      { new: true, runValidators: true }
    );
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    res.json({ success: true, ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل تحديث السجل" });
  }
};

export const deleteLedger = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    await Ledger.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: "تم أرشفة السجل" });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل حذف السجل" });
  }
};

// ─── Sheets ─────────────────────────────────────────────────────────────────

export const addSheet = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { name, columns } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "اسم الجدول مطلوب" });
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });

    const sheet = {
      name: name.trim(),
      columns: columns || [
        { key: "col1", label: "البيان",  type: "text",     width: 200 },
        { key: "col2", label: "المبلغ",  type: "currency", width: 150 },
        { key: "col3", label: "التاريخ", type: "date",     width: 140 },
        { key: "col4", label: "ملاحظات", type: "text",     width: 200 },
      ],
      rows: [],
      order: ledger.sheets.length,
    };

    ledger.sheets.push(sheet);
    await ledger.save();
    const newSheet = ledger.sheets[ledger.sheets.length - 1];
    res.status(201).json({ success: true, sheet: newSheet });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل إضافة الجدول" });
  }
};

export const updateSheet = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { name, columns } = req.body;
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    const sheet = ledger.sheets.id(req.params.sheetId);
    if (!sheet) return res.status(404).json({ success: false, message: "الجدول غير موجود" });
    if (name) sheet.name = name;
    if (columns) sheet.columns = columns;
    await ledger.save();
    res.json({ success: true, sheet });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل تحديث الجدول" });
  }
};

export const deleteSheet = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    ledger.sheets = ledger.sheets.filter((s) => s._id.toString() !== req.params.sheetId);
    await ledger.save();
    res.json({ success: true, message: "تم حذف الجدول" });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل حذف الجدول" });
  }
};

// ─── Rows ────────────────────────────────────────────────────────────────────

export const addRow = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { cells } = req.body;
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    const sheet = ledger.sheets.id(req.params.sheetId);
    if (!sheet) return res.status(404).json({ success: false, message: "الجدول غير موجود" });
    const row = { cells: cells || {}, order: sheet.rows.length };
    sheet.rows.push(row);
    await ledger.save();
    const newRow = sheet.rows[sheet.rows.length - 1];
    res.status(201).json({ success: true, row: newRow });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل إضافة السطر" });
  }
};

export const updateRow = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { cells } = req.body;
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    const sheet = ledger.sheets.id(req.params.sheetId);
    if (!sheet) return res.status(404).json({ success: false, message: "الجدول غير موجود" });
    const row = sheet.rows.id(req.params.rowId);
    if (!row) return res.status(404).json({ success: false, message: "السطر غير موجود" });
    if (cells) row.cells = new Map(Object.entries(cells));
    await ledger.save();
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل تحديث السطر" });
  }
};

export const deleteRow = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    const sheet = ledger.sheets.id(req.params.sheetId);
    if (!sheet) return res.status(404).json({ success: false, message: "الجدول غير موجود" });
    sheet.rows = sheet.rows.filter((r) => r._id.toString() !== req.params.rowId);
    await ledger.save();
    res.json({ success: true, message: "تم حذف السطر" });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل حذف السطر" });
  }
};

export const bulkDeleteRows = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false, message: "غير مصرح" });
    const { rowIds } = req.body;
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "السجل غير موجود" });
    const sheet = ledger.sheets.id(req.params.sheetId);
    if (!sheet) return res.status(404).json({ success: false, message: "الجدول غير موجود" });
    sheet.rows = sheet.rows.filter((r) => !rowIds.includes(r._id.toString()));
    await ledger.save();
    res.json({ success: true, message: "تم حذف الصفوف" });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل حذف الصفوف" });
  }
};
