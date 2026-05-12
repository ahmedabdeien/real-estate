import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    content: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    excerpt: {
      ar: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    coverImage: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: String, default: "general" },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
