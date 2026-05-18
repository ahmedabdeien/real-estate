import mongoose from "mongoose";

const itemCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ItemCategory" },
    unit: {
      type: String,
      enum: ["piece", "kg", "m", "m2", "m3", "liter", "box", "set", "ton"],
      default: "piece",
    },
    minStock: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Auto-generate item code: ITEM-001 format
itemSchema.pre("save", async function (next) {
  if (this.code) return next();
  const count = await mongoose.model("Item").countDocuments();
  this.code = `ITEM-${String(count + 1).padStart(3, "0")}`;
  next();
});

export const ItemCategory = mongoose.model("ItemCategory", itemCategorySchema);
export default mongoose.model("Item", itemSchema);
