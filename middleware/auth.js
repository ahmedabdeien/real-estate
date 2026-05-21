import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import RoleConfig from "../models/roleConfig.model.js";

const LASTSEEN_TTL = 2 * 60 * 1000; // update lastSeen at most every 2 min

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "غير مصرح" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: "المستخدم غير موجود أو غير نشط" });

    // Attach allowedPages from RoleConfig
    const roleKey = user.customRoleKey || user.role;
    const config = await RoleConfig.findOne({ roleKey }).lean();
    if (config) {
      user.allowedPages = config.allowedPages;
    } else if (user.role === "admin") {
      user.allowedPages = ["*"];
    } else {
      user.allowedPages = [];
    }

    req.user = user;

    // Update lastSeen (debounced — avoid hammering DB on every request)
    const now = new Date();
    if (!user.lastSeen || now - user.lastSeen > LASTSEEN_TTL) {
      User.findByIdAndUpdate(user._id, { lastSeen: now }).catch(() => {});
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: "رمز غير صالح" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Admin always passes
    if (req.user.role === "admin") return next();
    // Custom role users: allow if their underlying role is in the list
    if (req.user.customRoleKey && roles.includes(req.user.role)) return next();
    // Custom role users with wildcard allowedPages
    if (req.user.customRoleKey && req.user.allowedPages?.includes("*")) return next();
    // Standard role check
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية" });
    }
    next();
  };
};

// Like authenticate but doesn't block unauthenticated requests — just sets req.user if token is valid
export const optionalAuthenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user && user.isActive) req.user = user;
  } catch { /* ignore invalid token */ }
  next();
};
