import RecurringTransaction from "../models/recurringTransaction.model.js";
import Ledger from "../models/accounting.model.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function calcNextRun(frequency, dayOfMonth) {
  const now = new Date();
  let next = new Date(now);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      next.setHours(8, 0, 0, 0);
      break;
    case "monthly": {
      const day = Math.min(dayOfMonth || 1, 28);
      next.setDate(1); // go to 1st to avoid overflow
      next.setMonth(next.getMonth() + 1);
      next.setDate(day);
      next.setHours(8, 0, 0, 0);
      break;
    }
    case "yearly": {
      const day = Math.min(dayOfMonth || 1, 28);
      next.setFullYear(next.getFullYear() + 1);
      next.setDate(day);
      next.setHours(8, 0, 0, 0);
      break;
    }
    default:
      next.setDate(next.getDate() + 1);
  }
  return next;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getAll = async (req, res) => {
  try {
    const { ledgerId, sheetId } = req.query;
    const filter = {};
    if (ledgerId) filter.ledgerId = ledgerId;
    if (sheetId)  filter.sheetId  = sheetId;
    const list = await RecurringTransaction.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { ledgerId, sheetId, name, frequency, dayOfMonth, columns } = req.body;
    if (!ledgerId || !sheetId || !name) {
      return res.status(400).json({ message: "ledgerId, sheetId, name are required" });
    }
    const nextRunAt = calcNextRun(frequency, dayOfMonth);
    const rec = await RecurringTransaction.create({
      ledgerId, sheetId, name, frequency, dayOfMonth,
      columns: columns || {},
      nextRunAt,
      createdBy: req.user?._id,
    });
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const rec = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, nextRunAt: calcNextRun(req.body.frequency, req.body.dayOfMonth) },
      { new: true }
    );
    if (!rec) return res.status(404).json({ message: "Not found" });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await RecurringTransaction.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggle = async (req, res) => {
  try {
    const rec = await RecurringTransaction.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: "Not found" });
    rec.isActive = !rec.isActive;
    await rec.save();
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Run Now (force) ───────────────────────────────────────────────────────────

export const runNow = async (req, res) => {
  try {
    const rec = await RecurringTransaction.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: "Not found" });

    const ledger = await Ledger.findById(rec.ledgerId);
    if (!ledger) return res.status(404).json({ message: "Ledger not found" });

    const sheet = ledger.sheets.id(rec.sheetId);
    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    const cells = Object.fromEntries(rec.columns || new Map());
    // Auto-set today for date columns
    sheet.columns.forEach((col) => {
      if (col.type === "date" && !cells[col.key]) {
        cells[col.key] = new Date().toISOString().split("T")[0];
      }
    });

    const newRow = { cells, order: sheet.rows.length };
    sheet.rows.push(newRow);
    rec.lastRunAt = new Date();
    rec.nextRunAt = calcNextRun(rec.frequency, rec.dayOfMonth);

    await ledger.save();
    await rec.save();

    const addedRow = sheet.rows[sheet.rows.length - 1];
    res.json({ row: addedRow, rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Cron processor ───────────────────────────────────────────────────────────

export const processRecurring = async () => {
  try {
    const now = new Date();
    const due = await RecurringTransaction.find({
      isActive: true,
      nextRunAt: { $lte: now },
    });

    let processed = 0;
    for (const rec of due) {
      try {
        const ledger = await Ledger.findById(rec.ledgerId);
        if (!ledger) continue;
        const sheet = ledger.sheets.id(rec.sheetId);
        if (!sheet) continue;

        const cells = Object.fromEntries(rec.columns || new Map());
        sheet.columns.forEach((col) => {
          if (col.type === "date" && !cells[col.key]) {
            cells[col.key] = new Date().toISOString().split("T")[0];
          }
        });

        sheet.rows.push({ cells, order: sheet.rows.length });
        rec.lastRunAt = now;
        rec.nextRunAt = calcNextRun(rec.frequency, rec.dayOfMonth);

        await ledger.save();
        await rec.save();
        processed++;
      } catch (inner) {
        console.error("[RecurringCron] failed for", rec._id, inner.message);
      }
    }
    if (processed > 0) console.log(`[RecurringCron] Created ${processed} rows`);
  } catch (err) {
    console.error("[RecurringCron] processRecurring error:", err.message);
  }
};
