import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["task_assigned", "task_updated", "new_message", "task_due_soon", "new_lead"],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  link: { type: String, default: "" },
  read: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
