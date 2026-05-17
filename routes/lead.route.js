import express from "express";
import { getLeads, getLead, createLead, updateLead, deleteLead, getLeadStats } from "../controllers/lead.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth.js";

const router = express.Router();

// Allow admin/supervisor (see all) | sales role | marketing dept (see own only)
const authorizeLeads = (req, res, next) => {
  const u = req.user;
  const allowed =
    ["admin", "supervisor"].includes(u.role) ||
    u.role === "sales" ||
    u.department === "marketing";
  if (!allowed) return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
  next();
};

router.get("/stats",  authenticate, authorize("admin", "supervisor"), getLeadStats);
router.get("/",       authenticate, authorizeLeads, getLeads);
router.get("/:id",    authenticate, authorizeLeads, getLead);
// POST is public (website contact forms) but also used by staff — optionalAuthenticate sets req.user if logged in
router.post("/",      optionalAuthenticate, createLead);
router.put("/:id",    authenticate, authorizeLeads, updateLead);
router.delete("/:id", authenticate, authorize("admin"), deleteLead);

export default router;
