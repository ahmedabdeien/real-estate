import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAccounts, createAccount, updateAccount, deleteAccount,
  getJournalEntries, createJournalEntry, postEntry, reverseEntry, deleteEntry,
  getTrialBalance, getIncomeStatement, getBalanceSheet, getAccountLedger, getDashboard,
} from "../controllers/advanced-accounting.controller.js";

const router = express.Router();
router.use(authenticate);

// ── Accounts ──────────────────────────────────────────────────────────────────
router.get  ("/accounts",           getAccounts);
router.post ("/accounts",           createAccount);
router.put  ("/accounts/:id",       updateAccount);
router.delete("/accounts/:id",      deleteAccount);

// ── Journal Entries ───────────────────────────────────────────────────────────
router.get  ("/journal",                  getJournalEntries);
router.post ("/journal",                  createJournalEntry);
router.put  ("/journal/:id/post",         postEntry);
router.put  ("/journal/:id/reverse",      reverseEntry);
router.delete("/journal/:id",             deleteEntry);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get("/reports/trial-balance",      getTrialBalance);
router.get("/reports/income-statement",   getIncomeStatement);
router.get("/reports/balance-sheet",      getBalanceSheet);
router.get("/reports/account-ledger/:accountId", getAccountLedger);
router.get("/reports/dashboard",          getDashboard);

export default router;
