import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    interestedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    interestedUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    message: { type: String, default: "" },
    source: {
      type: String,
      enum: ["website", "whatsapp", "phone", "referral", "campaign", "other"],
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "interested", "not_interested", "converted", "lost"],
      default: "new",
    },
    notes: { type: String, default: "" },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    followUpDate: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    registrationSource: {
      type: String,
      enum: ["website", "admin_registration", "walk_in", "call", "social_media", "exhibition"],
      default: "website",
    },
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      default: null,
    },
    cv_link: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
