import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseInvoices,
  createPurchaseInvoice,
  updatePurchaseInvoice,
} from "../controllers/purchasing.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET: admin OR accounts OR purchasing OR warehouse
const authorizeRead = (req, res, next) => {
  const u = req.user;
  const allowed =
    u.role === "admin" ||
    u.department === "accounts" ||
    u.department === "purchasing" ||
    u.department === "warehouse";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// POST/PUT: admin OR purchasing
const authorizeWrite = (req, res, next) => {
  const u = req.user;
  const allowed = u.role === "admin" || u.department === "purchasing";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// Suppliers
router.get("/suppliers",        authenticate, authorizeRead,  getSuppliers);
router.post("/suppliers",       authenticate, authorizeWrite, createSupplier);
router.put("/suppliers/:id",    authenticate, authorizeWrite, updateSupplier);

// Purchase Orders
router.get("/orders",            authenticate, authorizeRead,  getPurchaseOrders);
router.post("/orders",           authenticate, authorizeWrite, createPurchaseOrder);
router.get("/orders/:id",        authenticate, authorizeRead,  getPurchaseOrder);
router.put("/orders/:id",        authenticate, authorizeWrite, updatePurchaseOrder);
router.put("/orders/:id/receive", authenticate, authorizeWrite, receivePurchaseOrder);
router.put("/orders/:id/cancel",  authenticate, authorizeWrite, cancelPurchaseOrder);

// Purchase Invoices
router.get("/invoices",       authenticate, authorizeRead,  getPurchaseInvoices);
router.post("/invoices",      authenticate, authorizeWrite, createPurchaseInvoice);
router.put("/invoices/:id",   authenticate, authorizeWrite, updatePurchaseInvoice);

export default router;
