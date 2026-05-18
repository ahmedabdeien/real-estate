import { Supplier, PurchaseOrder, PurchaseInvoice } from "../models/purchasing.model.js";
import { createTransaction } from "./warehouse.controller.js";
import { logActivity } from "./activity.controller.js";

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const getSuppliers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    else query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Supplier.countDocuments(query),
    ]);

    res.json({ success: true, data: suppliers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "supplier", entityId: supplier._id, entityName: supplier.name });
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: "المورد غير موجود" });
    logActivity({ userId: req.user._id, action: "update", entity: "supplier", entityId: supplier._id, entityName: supplier.name });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const getPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    if (dateFrom || dateTo) {
      query.orderDate = {};
      if (dateFrom) query.orderDate.$gte = new Date(dateFrom);
      if (dateTo) query.orderDate.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate("supplier", "name phone")
        .populate("warehouse", "name")
        .populate("items.item", "name code unit")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PurchaseOrder.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name phone email address taxNumber")
      .populate("warehouse", "name location")
      .populate("items.item", "name code unit")
      .populate("createdBy", "name")
      .populate("approvedBy", "name");
    if (!order) return res.status(404).json({ success: false, message: "أمر الشراء غير موجود" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { items = [], discount = 0, tax = 0, ...rest } = req.body;

    // Calculate totals
    const itemsWithTotals = items.map((item) => ({
      ...item,
      totalCost: item.quantity * item.unitCost,
    }));
    const subtotal = itemsWithTotals.reduce((sum, i) => sum + i.totalCost, 0);
    const total = subtotal - Number(discount) + Number(tax);

    const order = await PurchaseOrder.create({
      ...rest,
      items: itemsWithTotals,
      subtotal,
      discount,
      tax,
      total,
      createdBy: req.user._id,
    });

    logActivity({ userId: req.user._id, action: "create", entity: "purchase_order", entityId: order._id, entityName: order.orderNumber });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "أمر الشراء غير موجود" });

    if (["received", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "لا يمكن تعديل أمر شراء مكتمل أو ملغي" });
    }

    const { items, discount, tax, ...rest } = req.body;
    let updateData = { ...rest };

    if (items) {
      const itemsWithTotals = items.map((item) => ({
        ...item,
        totalCost: item.quantity * item.unitCost,
      }));
      const subtotal = itemsWithTotals.reduce((sum, i) => sum + i.totalCost, 0);
      const d = discount !== undefined ? Number(discount) : order.discount;
      const t = tax !== undefined ? Number(tax) : order.tax;
      updateData = {
        ...updateData,
        items: itemsWithTotals,
        subtotal,
        discount: d,
        tax: t,
        total: subtotal - d + t,
      };
    }

    const updated = await PurchaseOrder.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("supplier", "name phone")
      .populate("warehouse", "name")
      .populate("items.item", "name code unit");

    logActivity({ userId: req.user._id, action: "update", entity: "purchase_order", entityId: updated._id, entityName: updated.orderNumber });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const receivePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate("items.item");
    if (!order) return res.status(404).json({ success: false, message: "أمر الشراء غير موجود" });
    if (order.status === "cancelled") {
      return res.status(400).json({ success: false, message: "لا يمكن استلام أمر شراء ملغي" });
    }
    if (order.status === "received") {
      return res.status(400).json({ success: false, message: "تم استلام هذا الأمر بالفعل" });
    }

    const { receivedItems } = req.body; // [{ itemIndex or itemId, receivedQuantity }]

    // Validate and update received quantities
    let allReceived = true;
    let anyReceived = false;

    for (const orderItem of order.items) {
      const received = receivedItems?.find(
        (r) => String(r.itemId) === String(orderItem._id) || String(r.itemId) === String(orderItem.item?._id)
      );
      if (received) {
        const qty = Number(received.receivedQuantity);
        if (qty > orderItem.quantity - orderItem.receivedQuantity) {
          return res.status(400).json({
            success: false,
            message: `الكمية المستلمة تتجاوز الكمية المطلوبة للصنف`,
          });
        }
        orderItem.receivedQuantity += qty;
        anyReceived = true;

        // Create inventory transaction for each received item
        if (qty > 0 && orderItem.item) {
          // Build a mock req/res to call createTransaction
          const mockReq = {
            body: {
              item: orderItem.item._id || orderItem.item,
              warehouse: order.warehouse,
              type: "purchase_receive",
              quantity: qty,
              unitCost: orderItem.unitCost,
              referenceType: "purchase_order",
              referenceId: order._id,
              notes: `استلام من أمر شراء ${order.orderNumber}`,
            },
            user: req.user,
          };
          const mockRes = {
            status: () => mockRes,
            json: () => {},
          };
          await createTransaction(mockReq, mockRes);
        }
      }

      if (orderItem.receivedQuantity < orderItem.quantity) allReceived = false;
    }

    if (!anyReceived) {
      return res.status(400).json({ success: false, message: "لم يتم تحديد أي أصناف للاستلام" });
    }

    order.status = allReceived ? "received" : "partial";
    if (allReceived) order.receivedDate = new Date();

    await order.save();

    logActivity({
      userId: req.user._id,
      action: "update",
      entity: "purchase_order",
      entityId: order._id,
      entityName: order.orderNumber,
      details: "استلم أمر شراء",
    });

    res.json({ success: true, data: order, message: allReceived ? "تم استلام الأمر بالكامل" : "تم استلام جزء من الأمر" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "أمر الشراء غير موجود" });
    if (order.status === "received") {
      return res.status(400).json({ success: false, message: "لا يمكن إلغاء أمر شراء تم استلامه" });
    }

    order.status = "cancelled";
    await order.save();

    logActivity({ userId: req.user._id, action: "update", entity: "purchase_order", entityId: order._id, entityName: order.orderNumber, details: "إلغاء أمر شراء" });
    res.json({ success: true, data: order, message: "تم إلغاء أمر الشراء" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Purchase Invoices ────────────────────────────────────────────────────────

export const getPurchaseInvoices = async (req, res) => {
  try {
    const { status, purchaseOrder, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (purchaseOrder) query.purchaseOrder = purchaseOrder;

    const skip = (Number(page) - 1) * Number(limit);
    const [invoices, total] = await Promise.all([
      PurchaseInvoice.find(query)
        .populate({ path: "purchaseOrder", select: "orderNumber supplier", populate: { path: "supplier", select: "name" } })
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PurchaseInvoice.countDocuments(query),
    ]);

    res.json({ success: true, data: invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "purchase_invoice", entityId: invoice._id, entityName: invoice.invoiceNumber });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "الفاتورة غير موجودة" });

    const updateData = { ...req.body };

    // Auto-update payment status based on paidAmount
    const paidAmount = updateData.paidAmount !== undefined ? Number(updateData.paidAmount) : invoice.paidAmount;
    const amount = updateData.amount !== undefined ? Number(updateData.amount) : invoice.amount;

    if (paidAmount >= amount) {
      updateData.status = "paid";
    } else if (paidAmount > 0) {
      updateData.status = "partial";
    } else {
      updateData.status = "unpaid";
    }

    const updated = await PurchaseInvoice.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("purchaseOrder", "orderNumber");

    logActivity({ userId: req.user._id, action: "update", entity: "purchase_invoice", entityId: updated._id, entityName: updated.invoiceNumber });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
