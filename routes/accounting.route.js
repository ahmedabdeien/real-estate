import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import {
  getLedgers, getLedger, createLedger, updateLedger, deleteLedger,
  addSheet, updateSheet, deleteSheet,
  addRow, updateRow, deleteRow, bulkDeleteRows, restoreRow,
  getAuditLog,
  getDeletedLedgers, restoreLedger, permanentDeleteLedger,
} from "../controllers/accounting.controller.js";

const router = express.Router();

// ── Extra rate limiting for accounting routes ─────────────────────────────────
// Max 60 requests per minute per IP
const accountingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: "طلبات كثيرة، حاول بعد دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Security middleware ───────────────────────────────────────────────────────
// Adds extra security headers to all accounting responses
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Accounting-Protected", "true");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  next();
};

// ── Apply middleware ──────────────────────────────────────────────────────────
router.use(accountingLimiter);
router.use(securityHeaders);
router.use(authenticate);

// ── Audit Log ─────────────────────────────────────────────────────────────────
router.get("/audit-log", getAuditLog);

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

const ledgerValidation = [
  body("name").trim().notEmpty().withMessage("الاسم مطلوب").isLength({ max: 200 }).withMessage("الاسم طويل جداً"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("الوصف طويل جداً"),
  body("color").optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage("لون غير صحيح"),
  validate,
];

const sheetValidation = [
  body("name").trim().notEmpty().withMessage("اسم الجدول مطلوب").isLength({ max: 200 }).withMessage("اسم الجدول طويل جداً"),
  validate,
];

// ── Ledgers ───────────────────────────────────────────────────────────────────
router.get("/trash",         getDeletedLedgers);
router.get("/",              getLedgers);
router.get("/:id",           getLedger);
router.post("/",               ledgerValidation, createLedger);
router.put("/:id",             ledgerValidation, updateLedger);
router.put("/:id/restore",     restoreLedger);
router.delete("/:id/permanent", permanentDeleteLedger);
router.delete("/:id",          deleteLedger);

// ── Sheets ────────────────────────────────────────────────────────────────────
router.post("/:id/sheets",             sheetValidation, addSheet);
router.put("/:id/sheets/:sheetId",     updateSheet);
router.delete("/:id/sheets/:sheetId",  deleteSheet);

// ── Rows (bulk-delete MUST come before :rowId to avoid route conflict) ────────
router.post("/:id/sheets/:sheetId/rows/bulk-delete",        bulkDeleteRows);
router.post("/:id/sheets/:sheetId/rows",                    addRow);
router.put("/:id/sheets/:sheetId/rows/:rowId/restore",      restoreRow);
router.put("/:id/sheets/:sheetId/rows/:rowId",              updateRow);
router.delete("/:id/sheets/:sheetId/rows/:rowId",           deleteRow);

export default router;
