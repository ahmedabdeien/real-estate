import express from "express";
import { getCareers, getCareer, createCareer, updateCareer, deleteCareer } from "../controllers/career.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCareers);
router.get("/:id", getCareer);
router.post("/", authenticate, authorize("admin"), createCareer);
router.put("/:id", authenticate, authorize("admin"), updateCareer);
router.delete("/:id", authenticate, authorize("admin"), deleteCareer);

export default router;
