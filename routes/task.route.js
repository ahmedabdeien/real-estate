import express from "express";
import { getTasks, createTask, updateTask, deleteTask, getTaskUsers } from "../controllers/task.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// All task roles
const taskRoles = ["admin", "manager", "employee", "sales"];
const managerRoles = ["admin", "manager"];

router.get("/users", authenticate, authorize(...managerRoles), getTaskUsers);
router.get("/",      authenticate, authorize(...taskRoles),    getTasks);
router.post("/",     authenticate, authorize(...managerRoles), createTask);
router.put("/:id",   authenticate, authorize(...taskRoles),    updateTask);
router.delete("/:id",authenticate, authorize(...managerRoles), deleteTask);

export default router;
