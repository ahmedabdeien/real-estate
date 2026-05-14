import express from "express";
import { getTasks, createTask, updateTask, deleteTask, getTaskUsers } from "../controllers/task.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Roles that can access tasks at all
const taskRoles    = ["admin", "supervisor", "manager", "employee", "sales"];
// Roles that can create / delete tasks
const manageRoles  = ["admin", "supervisor", "manager"];

router.get("/users", authenticate, authorize(...manageRoles), getTaskUsers);
router.get("/",      authenticate, authorize(...taskRoles),   getTasks);
router.post("/",     authenticate, authorize(...manageRoles), createTask);
router.put("/:id",   authenticate, authorize(...taskRoles),   updateTask);
router.delete("/:id",authenticate, authorize(...manageRoles), deleteTask);

export default router;
