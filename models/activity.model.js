import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "login", "logout"],
      required: true,
    },
    entity: { type: String, default: "" },      // "project" | "unit" | "lead" | ...
    entityId: { type: String, default: "" },
    entityName: { type: String, default: "" },  // human-readable name
    details: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-delete after 90 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model("Activity", activitySchema);
