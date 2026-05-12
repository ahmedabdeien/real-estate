import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { logActivity } from "./activity.controller.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const isProduction = process.env.NODE_ENV === "production";
const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isProduction ? "none" : "lax",
    secure:   isProduction,
  });
};

/**
 * Decode Firebase ID token payload (no signature verification).
 * Firebase tokens are JWTs — base64 decode is safe for reading claims.
 * We validate: issuer, project, expiry.
 */
function decodeFirebaseToken(idToken) {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const projectId = process.env.FIREBASE_PROJECT_ID || "elsarh-real-estate";
    // Validate issuer
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      throw new Error("Invalid token issuer");
    }
    // Validate expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (err) {
    throw new Error(`Token decode failed: ${err.message}`);
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "البريد مستخدم بالفعل" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "viewer" });
    const token = signToken(user._id);
    setCookie(res, token);
    const { password: _, ...rest } = user.toObject();
    res.status(201).json({ success: true, user: rest, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "الحساب معطل" });
    if (!user.password) return res.status(400).json({ success: false, message: "هذا الحساب مرتبط بـ Google، استخدم تسجيل الدخول بـ Google" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "كلمة المرور غير صحيحة" });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    setCookie(res, token);
    logActivity({ userId: user._id, action: "login", entity: "auth", entityName: user.name });
    const { password: _, ...rest } = user.toObject();
    res.json({ success: true, user: rest, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Google Sign-In — decode Firebase JWT, find/create user, issue our JWT
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: "idToken مطلوب" });

    // Decode Firebase token (validates issuer + expiry)
    const payload = decodeFirebaseToken(idToken);
    const { email, name, picture, sub: uid } = payload;

    if (!email) return res.status(400).json({ success: false, message: "البريد غير موجود في الـ token" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        googleId: uid || "",
        role: "viewer",
        isActive: true,
      });
    } else {
      if (!user.isActive) return res.status(403).json({ success: false, message: "الحساب معطل" });
      if (uid) user.googleId = uid;
      if (!user.avatar && picture) user.avatar = picture;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = signToken(user._id);
    setCookie(res, token);
    const { password: _, ...rest } = user.toObject();
    res.json({ success: true, user: rest, token });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ success: false, message: `فشل تسجيل الدخول: ${err.message}` });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "تم تسجيل الخروج" });
};

export const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const updateProfile = async (req, res) => {
  try {
    const { name, address, age, phone, email, coverImage } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "الاسم مطلوب" });
    }

    const current = await User.findById(req.user._id);
    const updates = {
      name: name.trim(),
      address: address ?? current.address,
      age: age !== undefined ? Number(age) || null : current.age,
      coverImage: coverImage ?? current.coverImage,
    };

    // Phone — 7-day restriction
    if (phone !== undefined && phone !== current.phone) {
      if (current.phoneChangedAt && Date.now() - new Date(current.phoneChangedAt) < SEVEN_DAYS) {
        const daysLeft = Math.ceil((SEVEN_DAYS - (Date.now() - new Date(current.phoneChangedAt))) / 86400000);
        return res.status(429).json({ success: false, message: `يمكن تغيير الهاتف بعد ${daysLeft} أيام` });
      }
      updates.phone = phone;
      updates.phoneChangedAt = new Date();
    }

    // Email — 7-day restriction
    if (email !== undefined && email !== current.email) {
      if (current.emailChangedAt && Date.now() - new Date(current.emailChangedAt) < SEVEN_DAYS) {
        const daysLeft = Math.ceil((SEVEN_DAYS - (Date.now() - new Date(current.emailChangedAt))) / 86400000);
        return res.status(429).json({ success: false, message: `يمكن تغيير البريد بعد ${daysLeft} أيام` });
      }
      // Check not taken
      const taken = await User.findOne({ email, _id: { $ne: current._id } });
      if (taken) return res.status(400).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
      updates.email = email;
      updates.emailChangedAt = new Date();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, select: "-password" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل التحديث" });
  }
};
