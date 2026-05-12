import express from "express";
import { register, login, googleLogin, logout, me, updateProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.put("/profile", authenticate, updateProfile);

export default router;
