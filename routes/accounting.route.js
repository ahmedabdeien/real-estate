import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import {
  getLedgers, getLedger, createLedger, updateLedger, deleteLedger,
  addSheet, updateSheet, deleteSheet,
  addRow, updateRow, deleteRow, bulkDeleteRows,
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

// ── Ledgers ───────────────────────────────────────────────────────────────────
router.get("/",        getLedgers);
router.get("/:id",     getLedger);
router.post("/",       createLedger);
router.put("/:id",     updateLedger);
router.delete("/:id",  deleteLedger);

// ── Sheets ────────────────────────────────────────────────────────────────────
router.post("/:id/sheets",             addSheet);
router.put("/:id/sheets/:sheetId",     updateSheet);
router.delete("/:id/sheets/:sheetId",  deleteSheet);

// ── Rows (bulk-delete MUST come before :rowId to avoid route conflict) ────────
router.post("/:id/sheets/:sheetId/rows/bulk-delete",  bulkDeleteRows);
router.post("/:id/sheets/:sheetId/rows",              addRow);
router.put("/:id/sheets/:sheetId/rows/:rowId",        updateRow);
router.delete("/:id/sheets/:sheetId/rows/:rowId",     deleteRow);

export default router;
