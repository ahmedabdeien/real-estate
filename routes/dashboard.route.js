import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticate, authorize("admin", "sales"), getDashboardStats);

export default router;
