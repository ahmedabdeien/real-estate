import express from "express";
import { getLeads, getLead, createLead, updateLead, deleteLead, getLeadStats } from "../controllers/lead.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticate, authorize("admin", "sales"), getLeadStats);
router.get("/", authenticate, authorize("admin", "sales"), getLeads);
router.get("/:id", authenticate, authorize("admin", "sales"), getLead);
router.post("/", createLead);
router.put("/:id", authenticate, authorize("admin", "sales"), updateLead);
router.delete("/:id", authenticate, authorize("admin"), deleteLead);

export default router;
