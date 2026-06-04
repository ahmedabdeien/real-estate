import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getBudgets, getBudget, createBudget, updateBudget, deleteBudget } from "../controllers/budget.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/",        getBudgets);
router.get("/:id",     getBudget);
router.post("/",       createBudget);
router.put("/:id",     updateBudget);
router.delete("/:id",  deleteBudget);

export default router;
