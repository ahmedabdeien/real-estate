import Item, { ItemCategory } from "../models/item.model.js";
import Warehouse from "../models/warehouse.model.js";
import { InventoryTransaction, InventoryBalance } from "../models/inventory.model.js";
import { logActivity } from "./activity.controller.js";

// ─── Items ────────────────────────────────────────────────────────────────────

export const getItems = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    else query.isActive = true;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Item.find(query)
        .populate("category", "name")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Item.countDocuments(query),
    ]);

    res.json({ success: true, data: items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("category", "name description")
      .populate("createdBy", "name");
    if (!item) return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const itemData = { ...req.body, createdBy: req.user._id };
    const item = await Item.create(itemData);
    await item.populate("category", "name");
    logActivity({ userId: req.user._id, action: "create", entity: "item", entityId: item._id, entityName: item.name });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("category", "name");
    if (!item) return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    logActivity({ userId: req.user._id, action: "update", entity: "item", entityId: item._id, entityName: item.name });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "الصنف غير موجود" });
    logActivity({ userId: req.user._id, action: "delete", entity: "item", entityId: item._id, entityName: item.name });
    res.json({ success: true, message: "تم حذف الصنف" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = async (req, res) => {
  try {
    const categories = await ItemCategory.find().populate("createdBy", "name").sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await ItemCategory.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "item_category", entityId: category._id, entityName: category.name });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouses = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    const warehouses = await Warehouse.find(query)
      .populate("manager", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create({ ...req.body, createdBy: req.user._id });
    await warehouse.populate("manager", "name email");
    logActivity({ userId: req.user._id, action: "create", entity: "warehouse", entityId: warehouse._id, entityName: warehouse.name });
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("manager", "name email");
    if (!warehouse) return res.status(404).json({ success: false, message: "المخزن غير موجود" });
    logActivity({ userId: req.user._id, action: "update", entity: "warehouse", entityId: warehouse._id, entityName: warehouse.name });
    res.json({ success: true, data: warehouse });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getInventoryBalance = async (req, res) => {
  try {
    const { warehouse, item } = req.query;
    const query = {};
    if (warehouse) query.warehouse = warehouse;
    if (item) query.item = item;

    const balances = await InventoryBalance.find(query)
      .populate("item", "name code unit minStock")
      .populate("warehouse", "name location");
    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { item, warehouse, type, quantity, unitCost = 0, referenceType, referenceId, notes } = req.body;

    if (!item || !warehouse || !type || quantity === undefined) {
      return res.status(400).json({ success: false, message: "الحقول المطلوبة: item, warehouse, type, quantity" });
    }

    const totalCost = quantity * unitCost;

    const transaction = await InventoryTransaction.create({
      item,
      warehouse,
      type,
      quantity,
      unitCost,
      totalCost,
      referenceType,
      referenceId,
      notes,
      createdBy: req.user._id,
    });

    // Update InventoryBalance
    const isIncoming = ["in", "transfer_in", "purchase_receive"].includes(type);
    const isOutgoing = ["out", "transfer_out"].includes(type);

    if (isIncoming) {
      // Recalculate avgCost using weighted average
      const existing = await InventoryBalance.findOne({ item, warehouse });
      let newAvgCost = unitCost;
      let newQuantity = quantity;

      if (existing && existing.quantity > 0) {
        const totalExistingValue = existing.quantity * existing.avgCost;
        const totalNewValue = quantity * unitCost;
        newQuantity = existing.quantity + quantity;
        newAvgCost = (totalExistingValue + totalNewValue) / newQuantity;
      }

      await InventoryBalance.findOneAndUpdate(
        { item, warehouse },
        {
          $set: {
            avgCost: newAvgCost,
            lastUpdated: new Date(),
          },
          $inc: { quantity: quantity },
        },
        { upsert: true, new: true }
      );
    } else if (isOutgoing) {
      await InventoryBalance.findOneAndUpdate(
        { item, warehouse },
        {
          $inc: { quantity: -quantity },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );
    } else if (type === "adjustment") {
      // For adjustment, quantity can be positive or negative
      await InventoryBalance.findOneAndUpdate(
        { item, warehouse },
        {
          $inc: { quantity: quantity },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    logActivity({
      userId: req.user._id,
      action: "create",
      entity: "inventory_transaction",
      entityId: transaction._id,
      entityName: `${type} - ${quantity}`,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { item, warehouse, type, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const query = {};
    if (item) query.item = item;
    if (warehouse) query.warehouse = warehouse;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .populate("item", "name code unit")
        .populate("warehouse", "name")
        .populate("createdBy", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InventoryTransaction.countDocuments(query),
    ]);

    res.json({ success: true, data: transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
