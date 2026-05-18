import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const PASSWORD_REGEX = /^(?=.*[A-Za-z؀-ۿ])(?=.*\d).{8,}$/;

export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, password, role, department, phone, isActive } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    if (!name?.trim())     return res.status(400).json({ success: false, message: "الاسم مطلوب" });
    if (!email)            return res.status(400).json({ success: false, message: "البريد الإلكتروني مطلوب" });
    if (!password?.trim()) return res.status(400).json({ success: false, message: "كلمة المرور مطلوبة" });
    if (!PASSWORD_REGEX.test(password))
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "البريد مستخدم بالفعل" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, department: department || null, phone, isActive });
    const { password: _, ...rest } = user.toObject();
    res.status(201).json({ success: true, user: rest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Strip immutable/system fields to prevent MongoDB errors
    const { _id, __v, createdAt, updatedAt, googleId, password, ...rest } = req.body;
    const updates = { ...rest };
    // Normalize email to lowercase if provided
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    // Only update password if explicitly provided and non-empty
    if (password && password.trim()) updates.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "لا يمكنك حذف حسابك الخاص" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المستخدم" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, password } = req.body;
    const updates = { name, phone, avatar };
    if (password) updates.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
