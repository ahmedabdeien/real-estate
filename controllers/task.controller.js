import Task from "../models/task.model.js";
import User from "../models/user.model.js";

const populate = [
  { path: "assignedTo", select: "name avatar role" },
  { path: "createdBy",  select: "name avatar role" },
];

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const filter = role === "employee" ? { assignedTo: _id } : {};
    const tasks = await Task.find(filter).populate(populate).sort({ dueDate: 1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, notes } = req.body;
    const task = await Task.create({
      title, description,
      assignedTo: assignedTo || [],
      dueDate, priority, notes,
      createdBy: req.user._id,
    });
    const populated = await Task.findById(task._id).populate(populate);
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

    const updates = role === "employee"
      ? { status: req.body.status, notes: req.body.notes }           // employee: status + notes only
      : req.body;                                                      // admin/manager: full edit

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

// GET /api/tasks/users — for assignment dropdown
export const getTaskUsers = async (req, res) => {
  try {
    const users = await User.find({
      isActive: true,
      role: { $in: ["admin", "manager", "employee", "sales"] },
    }).select("name avatar role").sort({ name: 1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
