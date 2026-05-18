import express from "express";
import { chat, analyzeData } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All AI routes require authentication
router.post("/chat",         authenticate, chat);
router.post("/analyze-data", authenticate, analyzeData);

export default router;
