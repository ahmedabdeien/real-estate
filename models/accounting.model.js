import mongoose from "mongoose";

// A single cell/row in a sheet
const rowSchema = new mongoose.Schema({
  cells: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// A sheet (table) inside a ledger
const sheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  columns: [
    {
      key:   { type: String, required: true },
      label: { type: String, required: true },
      type:  { type: String, enum: ["text", "number", "date", "currency", "select"], default: "text" },
      options: [{ type: String }], // for select type
      width: { type: Number, default: 150 },
    },
  ],
  rows: [rowSchema],
  order: { type: Number, default: 0 },
}, { timestamps: true });

// A ledger — e.g. "فرع القاهرة", "المركز الرئيسي"
const ledgerSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    branch:      { type: String, default: "main" }, // branch identifier
    color:       { type: String, default: "#2d5d89" },
    icon:        { type: String, default: "📒" },
    sheets:      [sheetSchema],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isArchived:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ledger", ledgerSchema);
