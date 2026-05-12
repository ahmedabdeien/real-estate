import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    name: { type: String, default: "" },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      default: "image",
    },
    size: { type: Number, default: 0 },
    folder: { type: String, default: "general" },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
