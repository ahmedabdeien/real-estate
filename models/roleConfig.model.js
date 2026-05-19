import mongoose from "mongoose";

const roleConfigSchema = new mongoose.Schema(
  {
    roleKey: { type: String, unique: true, required: true },
    label: { type: String, required: true },
    branch: { type: String, default: "" },
    allowedPages: [{ type: String }],
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("RoleConfig", roleConfigSchema);
