import mongoose from "mongoose";

const VALID_DEPARTMENTS = [
  "accounts",       // الحسابات
  "legal",          // الشئون القانونية
  "marketing",      // التسويق
  "administrative", // اداري
  "projects",       // مشروعات
  "warehouse",      // المخازن
  "purchasing",     // المشتريات
];

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String },
    avatar:   { type: String, default: "" },
    googleId: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "supervisor", "manager", "employee", "sales", "viewer"],
      default: "viewer",
    },
    // Department — optional, used for manager/employee roles
    department: {
      type: String,
      enum: [...VALID_DEPARTMENTS, null, undefined, ""],
      default: null,
      set: (v) => v || null, // coerce empty string → null
    },
    isActive:        { type: Boolean, default: true },
    lastLogin:       { type: Date },
    lastSeen:        { type: Date },
    phone:           { type: String, default: "" },
    address:         { type: String, default: "" },
    age:             { type: Number, default: null },
    coverImage:      { type: String, default: "" },
    phoneChangedAt:  { type: Date, default: null },
    emailChangedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
