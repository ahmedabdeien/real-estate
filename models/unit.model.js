import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    unitNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ["apartment", "villa", "studio", "duplex", "penthouse", "office", "shop", "chalet"],
      required: true,
    },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    floor: { type: String, default: "" },
    rooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
    images: [{ type: String }],
    description: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    features: [{ type: String }],
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Unit", unitSchema);
