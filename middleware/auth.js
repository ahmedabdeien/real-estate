import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const LASTSEEN_TTL = 2 * 60 * 1000; // update lastSeen at most every 2 min

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "غير مصرح" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: "المستخدم غير موجود أو غير نشط" });
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
