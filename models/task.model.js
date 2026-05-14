import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate:     { type: Date, required: true },
    status:      { type: String, enum: ["pending", "in_progress", "done"], default: "pending" },
    priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
    notes:       { type: String, default: "" }, // notes from employee
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
