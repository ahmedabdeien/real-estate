import mongoose from "mongoose";

// ─── Legal Case ───────────────────────────────────────────────────────────────

const legalCaseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["lawsuit", "arbitration", "contract_dispute", "consultation", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "pending", "closed", "won", "lost", "settled"],
      default: "open",
    },
    client: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      nationalId: { type: String, default: "" },
    },
    counterparty: { type: String, default: "" },
    court: { type: String, default: "" },
    nextHearingDate: { type: Date },
    lawyer: { type: String, default: "" },
    filingDate: { type: Date },
    closedDate: { type: Date },
    description: { type: String, default: "" },
    result: { type: String, default: "" },
    fee: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Auto-generate caseNumber: CASE-YYYY-NNN
legalCaseSchema.pre("save", async function (next) {
  if (this.caseNumber) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model("LegalCase").countDocuments();
  this.caseNumber = `CASE-${year}-${String(count + 1).padStart(3, "0")}`;
  next();
});

// ─── Legal Contract ───────────────────────────────────────────────────────────

const legalContractSchema = new mongoose.Schema(
  {
    contractNumber: { type: String, unique: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["sale", "rent", "construction", "service", "employment", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["draft", "active", "expired", "terminated", "renewed"],
      default: "draft",
    },
    partyA: {
      name: { type: String, required: true },
      role: { type: String, default: "" },
      phone: { type: String, default: "" },
      nationalId: { type: String, default: "" },
    },
    partyB: {
      name: { type: String, required: true },
      role: { type: String, default: "" },
      phone: { type: String, default: "" },
      nationalId: { type: String, default: "" },
    },
    startDate: { type: Date },
    endDate: { type: Date },
    value: { type: Number, default: 0 },
    description: { type: String, default: "" },
    notes: { type: String, default: "" },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    expiryAlertDays: { type: Number, default: 30 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Auto-generate contractNumber: CONTRACT-YYYY-NNN
legalContractSchema.pre("save", async function (next) {
  if (this.contractNumber) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model("LegalContract").countDocuments();
  this.contractNumber = `CONTRACT-${year}-${String(count + 1).padStart(3, "0")}`;
  next();
});

// ─── Legal Consultation ───────────────────────────────────────────────────────

const legalConsultationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    clientName: { type: String, default: "" },
    clientPhone: { type: String, default: "" },
    topic: { type: String, default: "" },
    description: { type: String, default: "" },
    response: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "answered", "closed"],
      default: "pending",
    },
    fee: { type: Number, default: 0 },
    consultationDate: { type: Date, default: Date.now },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    respondedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const LegalCase = mongoose.model("LegalCase", legalCaseSchema);
export const LegalContract = mongoose.model("LegalContract", legalContractSchema);
export const LegalConsultation = mongoose.model("LegalConsultation", legalConsultationSchema);
