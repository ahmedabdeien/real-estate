import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    career: { type: mongoose.Schema.Types.ObjectId, ref: "Career", required: true },
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    email:   { type: String, required: true },
    cv_link: { type: String, default: "" },
    status:  { type: String, enum: ["new", "reviewed", "rejected"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", jobApplicationSchema);
