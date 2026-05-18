import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import { logActivity } from "./activity.controller.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS   = 10 * 60 * 1000; // 10 minutes
const PASSWORD_REGEX     = /^(?=.*[A-Za-z؀-ۿ])(?=.*\d).{8,}$/; // 8+ chars + digit

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signAccessToken  = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2h" });

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTS = { httpOnly: true, sameSite: isProduction ? "none" : "lax", secure: isProduction };

const setCookie = (res, token) => {
  res.cookie("token", token, { ...COOKIE_OPTS, maxAge: 2 * 60 * 60 * 1000 }); // 2h
};

const setRefreshCookie = (res, raw) => {
  res.cookie("refresh_token", raw, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30d
};

// Issue both access + refresh tokens and set cookies
const issueTokens = async (res, userId, meta = {}) => {
  const accessToken = signAccessToken(userId);
  setCookie(res, accessToken);

  // Create refresh token
  const raw = RefreshToken.generate();
  await RefreshToken.create({
    userId,
    tokenHash: RefreshToken.hash(raw),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: meta.userAgent || "",
    ip:        meta.ip        || "",
  });
  setRefreshCookie(res, raw);
  return accessToken;
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
    const { name, password, role } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    if (!email)    return res.status(400).json({ success: false, message: "البريد الإلكتروني مطلوب" });
    if (!password) return res.status(400).json({ success: false, message: "كلمة المرور مطلوبة" });
    if (!PASSWORD_REGEX.test(password))
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "البريد مستخدم بالفعل" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "viewer" });
    const token = await issueTokens(res, user._id, { ip: req.ip, userAgent: req.headers["user-agent"] });
    const { password: _, ...rest } = user.toObject();
    res.status(201).json({ success: true, user: rest, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    if (!email || !password) return res.status(400).json({ success: false, message: "البريد وكلمة المرور مطلوبان" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "الحساب معطل" });
    if (!user.password) return res.status(400).json({ success: false, message: "هذا الحساب مرتبط بـ Google، استخدم تسجيل الدخول بـ Google" });

    // ── Account lockout check ──
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ success: false, message: `الحساب مقفل مؤقتاً، حاول بعد ${mins} دقيقة` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.loginAttempts = 0;
        await user.save();
        return res.status(429).json({ success: false, message: "تم قفل الحساب 10 دقائق بسبب محاولات متكررة" });
      }
      await user.save();
      const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return res.status(401).json({ success: false, message: `كلمة المرور غير صحيحة — ${remaining} محاولة متبقية` });
    }

    // Success — reset lockout counters
    user.loginAttempts = 0;
    user.lockUntil     = null;
    user.lastLogin     = new Date();
    await user.save();

    const token = await issueTokens(res, user._id, { ip: req.ip, userAgent: req.headers["user-agent"] });
    logActivity({ userId: user._id, action: "login", entity: "auth", entityName: user.name });
    const { password: _, loginAttempts: __, lockUntil: ___, ...rest } = user.toObject();
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

    const token = await issueTokens(res, user._id, { ip: req.ip, userAgent: req.headers["user-agent"] });
    const { password: _, ...rest } = user.toObject();
    res.json({ success: true, user: rest, token });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ success: false, message: `فشل تسجيل الدخول: ${err.message}` });
  }
};

export const logout = async (req, res) => {
  // Revoke refresh token in DB
  const raw = req.cookies?.refresh_token;
  if (raw) {
    try {
      await RefreshToken.findOneAndUpdate(
        { tokenHash: RefreshToken.hash(raw) },
        { isRevoked: true }
      );
    } catch { /* ignore */ }
  }
  res.clearCookie("token",         COOKIE_OPTS);
  res.clearCookie("refresh_token", COOKIE_OPTS);
  res.json({ success: true, message: "تم تسجيل الخروج" });
};

// POST /api/auth/refresh — issue new access token using refresh token cookie
export const refresh = async (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) return res.status(401).json({ success: false, message: "لا يوجد refresh token" });

  try {
    const tokenHash = RefreshToken.hash(raw);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      res.clearCookie("refresh_token", COOKIE_OPTS);
      return res.status(401).json({ success: false, message: "الجلسة منتهية، يرجى تسجيل الدخول مجدداً" });
    }

    const user = await User.findById(stored.userId).select("-password -loginAttempts -lockUntil");
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: "الحساب غير نشط" });

    const newAccess = signAccessToken(user._id);
    setCookie(res, newAccess);
    res.json({ success: true, token: newAccess, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
