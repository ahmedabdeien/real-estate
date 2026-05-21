import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Lazy-load controller so Baileys doesn't crash the server on startup
const ctrl = () => import("../controllers/whatsapp.controller.js");

router.get("/status",      authenticate, authorize("admin"), async (req, res) => (await ctrl()).waStatus(req, res));
router.get("/events",      authenticate, authorize("admin"), async (req, res) => (await ctrl()).waEvents(req, res));
router.post("/connect",    authenticate, authorize("admin"), async (req, res) => (await ctrl()).waConnect(req, res));
router.post("/disconnect", authenticate, authorize("admin"), async (req, res) => (await ctrl()).waDisconnect(req, res));
router.post("/test",       authenticate, authorize("admin"), async (req, res) => (await ctrl()).waTest(req, res));

export default router;
