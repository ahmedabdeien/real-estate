import mongoose from "mongoose";

const recurringTransactionSchema = new mongoose.Schema(
  {
    ledgerId:    { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },
    sheetId:     { type: String, required: true }, // sheet subdoc id
    name:        { type: String, required: true },
    frequency:   { type: String, enum: ["daily","weekly","monthly","yearly"], default: "monthly" },
    dayOfMonth:  { type: Number, min: 1, max: 31, default: 1 }, // for monthly/yearly
    columns:     { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, // { colKey: value }
    isActive:    { type: Boolean, default: true },
    lastRunAt:   { type: Date, default: null },
    nextRunAt:   { type: Date, default: null },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("RecurringTransaction", recurringTransactionSchema);
