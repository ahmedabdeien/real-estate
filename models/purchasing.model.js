import mongoose from "mongoose";

// ─── Supplier ─────────────────────────────────────────────────────────────────

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    taxNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// ─── Purchase Order ───────────────────────────────────────────────────────────

const purchaseOrderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  description: { type: String, default: "" },
  quantity: { type: Number, required: true },
  receivedQuantity: { type: Number, default: 0 },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", default: null },
    status: {
      type: String,
      enum: ["draft", "sent", "partial", "received", "cancelled"],
      default: "draft",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    orderDate: { type: Date, default: Date.now },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    items: [purchaseOrderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Auto-generate orderNumber: PO-YYYY-NNN
purchaseOrderSchema.pre("save", async function (next) {
  if (this.orderNumber) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model("PurchaseOrder").countDocuments();
  this.orderNumber = `PO-${year}-${String(count + 1).padStart(3, "0")}`;
  next();
});

// Auto-calculate totalCost for each item
purchaseOrderSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.totalCost = item.quantity * item.unitCost;
  });
  next();
});

// ─── Purchase Invoice ─────────────────────────────────────────────────────────

const purchaseInvoiceSchema = new mongoose.Schema(
  {
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export const PurchaseInvoice = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
