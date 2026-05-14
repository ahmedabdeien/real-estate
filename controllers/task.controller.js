import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

const populate = [
  { path: "assignedTo", select: "name avatar role department" },
  { path: "createdBy",  select: "name avatar role department" },
];

// ─── Visibility helpers ───────────────────────────────────────────────────────
// admin / supervisor  → see everything
// manager             → see their department only
// employee / sales    → see tasks they are assigned to
function buildFilter(user) {
  const { role, _id, department } = user;
  if (role === "admin" || role === "supervisor") return {};
  if (role === "manager")   return { department };
  return { assignedTo: _id }; // employee / sales
}

// manager can only create tasks for their department
function validateDeptAccess(user, department) {
  if (user.role === "admin" || user.role === "supervisor") return true;
  if (user.role === "manager") return user.department === department;
  return false;
}

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const filter = buildFilter(req.user);
    const tasks = await Task.find(filter).populate(populate).sort({ dueDate: 1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, notes, department } = req.body;

    if (!validateDeptAccess(req.user, department)) {
      return res.status(403).json({ success: false, message: "لا يمكنك إنشاء مهمة لقسم آخر" });
    }

    const task = await Task.create({
      title, description,
      assignedTo: assignedTo || [],
      dueDate, priority, notes,
      department,
      createdBy: req.user._id,
    });
    const populated = await Task.findById(task._id).populate(populate);

    // Send notifications to all assigned users
    const assignedIds = assignedTo || [];
    for (const uid of assignedIds) {
      await createNotification({
        userId: uid,
        type: "task_assigned",
        title: "تم تعيين مهمة جديدة لك",
        body: task.title,
        link: "/tasks",
        createdBy: req.user._id,
      });
    }

    res.status(201).json({ success: true, task: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const { role } = req.user;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "المهمة غير موجودة" });

    // employee/sales: only status + notes
    const updates = (role === "employee" || role === "sales")
      ? { status: req.body.status, notes: req.body.notes }
      : req.body;

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(populate);
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المهمة" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tasks/users — list users for assignment dropdown
// admin/supervisor → all active users
// manager          → users in their department
export const getTaskUsers = async (req, res) => {
  try {
    const { role, department } = req.user;
    const filter = {
      isActive: true,
      role: { $in: ["admin", "supervisor", "manager", "employee", "sales"] },
    };
    if (role === "manager") {
      filter.department = department;
    }
    const users = await User.find(filter)
      .select("name avatar role department")
      .sort({ department: 1, name: 1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
