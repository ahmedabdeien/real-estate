import mongoose from "mongoose";

const budgetLineSchema = new mongoose.Schema({
  category: { type: String, required: true },
  allocated: { type: Number, required: true, min: 0 },
  notes: { type: String, default: "" },
});

const budgetSchema = new mongoose.Schema(
  {
    ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },
    sheetId:  { type: String, default: null }, // optional: link to specific sheet
    name:     { type: String, required: true },
    period:   { type: String, enum: ["monthly", "quarterly", "annual"], default: "monthly" },
    year:     { type: Number, required: true },
    month:    { type: Number, min: 1, max: 12, default: null }, // null for annual/quarterly
    lines:    [budgetLineSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branch:   { type: String, default: "main" },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
