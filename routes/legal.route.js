import express from "express";
import {
  getCases,
  getCase,
  createCase,
  updateCase,
  closeCase,
  getContracts,
  getContract,
  createContract,
  updateContract,
  getConsultations,
  createConsultation,
  answerConsultation,
  getLegalStats,
} from "../controllers/legal.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET: admin OR accounts OR legal
const authorizeRead = (req, res, next) => {
  const u = req.user;
  const allowed =
    u.role === "admin" ||
    u.department === "accounts" ||
    u.department === "legal";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// POST/PUT: admin OR legal
const authorizeWrite = (req, res, next) => {
  const u = req.user;
  const allowed = u.role === "admin" || u.department === "legal";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// Stats
router.get("/stats", authenticate, authorizeRead, getLegalStats);

// Cases
router.get("/cases",           authenticate, authorizeRead,  getCases);
router.post("/cases",          authenticate, authorizeWrite, createCase);
router.get("/cases/:id",       authenticate, authorizeRead,  getCase);
router.put("/cases/:id",       authenticate, authorizeWrite, updateCase);
router.put("/cases/:id/close", authenticate, authorizeWrite, closeCase);

// Contracts
router.get("/contracts",     authenticate, authorizeRead,  getContracts);
router.post("/contracts",    authenticate, authorizeWrite, createContract);
router.get("/contracts/:id", authenticate, authorizeRead,  getContract);
router.put("/contracts/:id", authenticate, authorizeWrite, updateContract);

// Consultations
router.get("/consultations",              authenticate, authorizeRead,  getConsultations);
router.post("/consultations",             authenticate, authorizeWrite, createConsultation);
router.put("/consultations/:id/answer",   authenticate, authorizeWrite, answerConsultation);

export default router;
