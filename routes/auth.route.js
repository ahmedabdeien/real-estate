import express from "express"
import { google, logout, signin, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signUp",signup);
router.post("/signin",signin);
router.post('/google', google);
router.get("/logout",logout)


export default router;
