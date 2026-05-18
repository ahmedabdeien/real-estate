import mongoose from "mongoose";
import crypto from "crypto";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true }, // SHA-256 of raw token
    expiresAt: { type: Date,   required: true },
    isRevoked: { type: Boolean, default: false },
    userAgent: { type: String, default: "" },
    ip:        { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-delete expired tokens from DB
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Quick lookup by userId for "logout all sessions"
refreshTokenSchema.index({ userId: 1 });

// Helper: hash a raw token before storing/comparing
refreshTokenSchema.statics.hash = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// Generate a secure raw token + return it (call .hash() before storing)
refreshTokenSchema.statics.generate = () => crypto.randomBytes(48).toString("hex");

export default mongoose.model("RefreshToken", refreshTokenSchema);
