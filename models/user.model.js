import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional — null for Google-only accounts
    avatar: { type: String, default: "" },
    googleId: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "manager", "employee", "sales", "viewer"],
      default: "viewer",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    lastSeen: { type: Date },
    phone:           { type: String, default: "" },
    address:         { type: String, default: "" },
    age:             { type: Number, default: null },
    avatar:          { type: String, default: "" },
    coverImage:      { type: String, default: "" },
    phoneChangedAt:  { type: Date, default: null },
    emailChangedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
