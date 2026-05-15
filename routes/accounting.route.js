import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getLedgers, getLedger, createLedger, updateLedger, deleteLedger,
  addSheet, updateSheet, deleteSheet,
  addRow, updateRow, deleteRow, bulkDeleteRows,
} from "../controllers/accounting.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Ledgers
router.get("/",          getLedgers);
router.get("/:id",       getLedger);
router.post("/",         createLedger);
router.put("/:id",       updateLedger);
router.delete("/:id",    deleteLedger);

// Sheets
router.post("/:id/sheets",              addSheet);
router.put("/:id/sheets/:sheetId",      updateSheet);
router.delete("/:id/sheets/:sheetId",   deleteSheet);

// Rows
router.post("/:id/sheets/:sheetId/rows",                    addRow);
router.put("/:id/sheets/:sheetId/rows/:rowId",              updateRow);
router.delete("/:id/sheets/:sheetId/rows/:rowId",           deleteRow);
router.post("/:id/sheets/:sheetId/rows/bulk-delete",        bulkDeleteRows);

export default router;
