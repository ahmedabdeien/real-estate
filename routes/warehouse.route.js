import express from "express";
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
  createCategory,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  getInventoryBalance,
  createTransaction,
  getTransactions,
} from "../controllers/warehouse.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Middleware: admin OR department=accounts OR warehouse OR purchasing
const authorizeRead = (req, res, next) => {
  const u = req.user;
  const allowed =
    u.role === "admin" ||
    u.department === "accounts" ||
    u.department === "warehouse" ||
    u.department === "purchasing";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// Middleware: admin OR department=warehouse
const authorizeWrite = (req, res, next) => {
  const u = req.user;
  const allowed = u.role === "admin" || u.department === "warehouse";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

// Items
router.get("/items",        authenticate, authorizeRead,  getItems);
router.post("/items",       authenticate, authorizeWrite, createItem);
router.get("/items/:id",    authenticate, authorizeRead,  getItem);
router.put("/items/:id",    authenticate, authorizeWrite, updateItem);
router.delete("/items/:id", authenticate, authorizeWrite, deleteItem);

// Categories
router.get("/categories",  authenticate, authorizeRead,  getCategories);
router.post("/categories", authenticate, authorizeWrite, createCategory);

// Warehouses
router.get("/warehouses",        authenticate, authorizeRead,  getWarehouses);
router.post("/warehouses",       authenticate, authorizeWrite, createWarehouse);
router.put("/warehouses/:id",    authenticate, authorizeWrite, updateWarehouse);

// Inventory
router.get("/inventory/balance", authenticate, authorizeRead,  getInventoryBalance);
router.post("/transactions",     authenticate, authorizeWrite, createTransaction);
router.get("/transactions",      authenticate, authorizeRead,  getTransactions);

export default router;
