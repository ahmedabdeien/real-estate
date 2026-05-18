import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    type: {
      type: String,
      enum: ["in", "out", "transfer_in", "transfer_out", "adjustment", "purchase_receive"],
      required: true,
    },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    referenceType: {
      type: String,
      enum: ["purchase_order", "manual", "transfer", "adjustment"],
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-calculate totalCost
inventoryTransactionSchema.pre("save", function (next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

const inventoryBalanceSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  quantity: { type: Number, default: 0 },
  avgCost: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

inventoryBalanceSchema.index({ item: 1, warehouse: 1 }, { unique: true });

export const InventoryTransaction = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
export const InventoryBalance = mongoose.model("InventoryBalance", inventoryBalanceSchema);
