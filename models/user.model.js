import mongoose from "mongoose";

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
    // Department — required for manager/employee roles
    department: {
      type: String,
      enum: [
        "accounts",       // الحسابات
        "legal",          // الشئون القانونية
        "marketing",      // التسويق
        "administrative", // اداري
        "projects",       // مشروعات (المواقع البنائية)
        "warehouse",      // المخازن
        "purchasing",     // المشتريات
        null,
      ],
      default: null,
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
