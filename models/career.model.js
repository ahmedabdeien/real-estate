import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    department: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    location: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    type: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      default: "full_time",
    },
    description: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    requirements: [{ type: String }],
    cv_link:   { type: String, default: "" },
    salary: {
      min:      { type: Number, default: null },
      max:      { type: Number, default: null },
      currency: { type: String, default: "ج.م" },
      hidden:   { type: Boolean, default: false },
    },
    published: { type: Boolean, default: true },
    deadline:  { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Career", careerSchema);
