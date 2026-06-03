import mongoose from "mongoose";

// ─── Chart of Accounts ────────────────────────────────────────────────────────
const accountSchema = new mongoose.Schema({
  code:        { type: String, required: true },
  name:        { type: String, required: true },
  type:        { type: String, enum: ["Asset","Liability","Equity","Revenue","Expense"], required: true },
  typeAr:      { type: String },
  parentCode:  { type: String, default: null },
  branch:      { type: String, default: "main" },
  isActive:    { type: Boolean, default: true },
  description: { type: String, default: "" },
}, { timestamps: true });

accountSchema.index({ code: 1, branch: 1 }, { unique: true });

accountSchema.pre("save", function(next) {
  const map = { Asset:"أصول", Liability:"خصوم", Equity:"حقوق ملكية", Revenue:"إيرادات", Expense:"مصروفات" };
  this.typeAr = map[this.type] || this.type;
  next();
});

// ─── Journal Entry (القيد المحاسبي) ──────────────────────────────────────────
const journalLineSchema = new mongoose.Schema({
  accountId:   { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  accountCode: { type: String },
  accountName: { type: String },
  debit:       { type: Number, default: 0 },
  credit:      { type: Number, default: 0 },
  description: { type: String, default: "" },
  order:       { type: Number, default: 0 },
});

const journalEntrySchema = new mongoose.Schema({
  entryNumber:    { type: String, required: true },
  date:           { type: Date, required: true },
  description:    { type: String, required: true },
  reference:      { type: String, default: "" },
  branch:         { type: String, default: "main" },
  status:         { type: String, enum: ["Draft","Posted","Reversed"], default: "Draft" },
  createdBy:      { type: String, default: "system" },
  postedAt:       { type: Date, default: null },
  reversedFromId: { type: mongoose.Schema.Types.ObjectId, ref: "JournalEntry", default: null },
  lines:          [journalLineSchema],
}, { timestamps: true });

journalEntrySchema.index({ entryNumber: 1, branch: 1 }, { unique: true });

journalEntrySchema.virtual("totalDebit").get(function() {
  return this.lines.reduce((s, l) => s + (l.debit || 0), 0);
});
journalEntrySchema.virtual("totalCredit").get(function() {
  return this.lines.reduce((s, l) => s + (l.credit || 0), 0);
});
journalEntrySchema.virtual("isBalanced").get(function() {
  return Math.abs(this.totalDebit - this.totalCredit) < 0.001;
});
journalEntrySchema.set("toJSON", { virtuals: true });

export const Account      = mongoose.model("Account",      accountSchema);
export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
