import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { waStatus, waConnect, waDisconnect, waTest, waEvents } from "../controllers/whatsapp.controller.js";

const router = express.Router();

router.get("/status",     authenticate, authorize("admin"), waStatus);
router.get("/events",     authenticate, authorize("admin"), waEvents);
router.post("/connect",   authenticate, authorize("admin"), waConnect);
router.post("/disconnect",authenticate, authorize("admin"), waDisconnect);
router.post("/test",      authenticate, authorize("admin"), waTest);

export default router;
