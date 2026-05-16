import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    location: {
      address: {
        ar: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      city: {
        ar: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ["under_construction", "ready", "sold_out", "coming_soon"],
      default: "under_construction",
    },
    images: [{ type: String }],
    coverImage: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    developer: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    amenities: [{ type: String }],
    videoUrl: { type: String, default: "" },
    brochureUrl: { type: String, default: "" },
    startingPrice: { type: Number, default: 0 },
    totalUnits: { type: Number, default: 0 },
    mapEmbedUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
