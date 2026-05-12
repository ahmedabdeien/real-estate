import express from "express";
import { getUsers, getUser, createUser, updateUser, deleteUser, updateProfile } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getUsers);
router.get("/:id", authenticate, authorize("admin"), getUser);
router.post("/", authenticate, authorize("admin"), createUser);
router.put("/profile", authenticate, updateProfile);
router.put("/:id", authenticate, authorize("admin"), updateUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default router;
