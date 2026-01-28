import express from "express";
import { google, logout, signin, signup } from "../controllers/auth.controller.js";
import { check } from "express-validator";

const router = express.Router();

router.post("/signUp", [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
], signup);

router.post("/signin", [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], signin);

router.post('/google', google);
router.get("/logout", logout);


export default router;
