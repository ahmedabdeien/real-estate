import { LegalCase, LegalContract, LegalConsultation } from "../models/legal.model.js";
import { logActivity } from "./activity.controller.js";

// ─── Legal Cases ──────────────────────────────────────────────────────────────

export const getCases = async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { caseNumber: { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
        { counterparty: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [cases, total] = await Promise.all([
      LegalCase.find(query)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LegalCase.countDocuments(query),
    ]);

    res.json({ success: true, data: cases, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCase = async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("documents.uploadedBy", "name");
    if (!legalCase) return res.status(404).json({ success: false, message: "القضية غير موجودة" });
    res.json({ success: true, data: legalCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCase = async (req, res) => {
  try {
    const legalCase = await LegalCase.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "legal_case", entityId: legalCase._id, entityName: legalCase.title });
    res.status(201).json({ success: true, data: legalCase });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const legalCase = await LegalCase.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("createdBy", "name");
    if (!legalCase) return res.status(404).json({ success: false, message: "القضية غير موجودة" });
    logActivity({ userId: req.user._id, action: "update", entity: "legal_case", entityId: legalCase._id, entityName: legalCase.title });
    res.json({ success: true, data: legalCase });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const closeCase = async (req, res) => {
  try {
    const legalCase = await LegalCase.findById(req.params.id);
    if (!legalCase) return res.status(404).json({ success: false, message: "القضية غير موجودة" });

    const { result, status } = req.body;
    const validClosedStatuses = ["closed", "won", "lost", "settled"];
    const newStatus = validClosedStatuses.includes(status) ? status : "closed";

    legalCase.status = newStatus;
    legalCase.closedDate = new Date();
    if (result) legalCase.result = result;

    await legalCase.save();

    logActivity({
      userId: req.user._id,
      action: "update",
      entity: "legal_case",
      entityId: legalCase._id,
      entityName: legalCase.title,
      details: `إغلاق القضية: ${newStatus}`,
    });

    res.json({ success: true, data: legalCase, message: "تم إغلاق القضية" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Legal Contracts ──────────────────────────────────────────────────────────

export const getContracts = async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { contractNumber: { $regex: search, $options: "i" } },
        { "partyA.name": { $regex: search, $options: "i" } },
        { "partyB.name": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [contracts, total] = await Promise.all([
      LegalContract.find(query)
        .populate("createdBy", "name")
        .populate("relatedProject", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LegalContract.countDocuments(query),
    ]);

    const now = new Date();
    // Add expiryAlert: days until endDate
    const contractsWithAlert = contracts.map((c) => {
      const obj = c.toObject();
      if (c.endDate && c.status === "active") {
        const diffMs = c.endDate - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        obj.daysUntilExpiry = diffDays;
        obj.isExpiringSoon = diffDays <= c.expiryAlertDays && diffDays >= 0;
        obj.isExpired = diffDays < 0;
      }
      return obj;
    });

    res.json({ success: true, data: contractsWithAlert, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getContract = async (req, res) => {
  try {
    const contract = await LegalContract.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("relatedProject", "name")
      .populate("documents.uploadedBy", "name");
    if (!contract) return res.status(404).json({ success: false, message: "العقد غير موجود" });

    const obj = contract.toObject();
    if (contract.endDate && contract.status === "active") {
      const now = new Date();
      const diffDays = Math.ceil((contract.endDate - now) / (1000 * 60 * 60 * 24));
      obj.daysUntilExpiry = diffDays;
      obj.isExpiringSoon = diffDays <= contract.expiryAlertDays && diffDays >= 0;
      obj.isExpired = diffDays < 0;
    }

    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createContract = async (req, res) => {
  try {
    const contract = await LegalContract.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "legal_contract", entityId: contract._id, entityName: contract.title });
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateContract = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Auto-update status to 'expired' if endDate is in the past
    if (updateData.endDate) {
      const endDate = new Date(updateData.endDate);
      if (endDate < new Date() && !["terminated", "renewed"].includes(updateData.status)) {
        updateData.status = "expired";
      }
    }

    const contract = await LegalContract.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("createdBy", "name")
      .populate("relatedProject", "name");
    if (!contract) return res.status(404).json({ success: false, message: "العقد غير موجود" });

    // Also check existing endDate if not being updated
    if (!updateData.endDate && contract.endDate && contract.endDate < new Date()) {
      if (!["terminated", "renewed", "expired"].includes(contract.status)) {
        await LegalContract.findByIdAndUpdate(req.params.id, { status: "expired" });
        contract.status = "expired";
      }
    }

    logActivity({ userId: req.user._id, action: "update", entity: "legal_contract", entityId: contract._id, entityName: contract.title });
    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Legal Consultations ──────────────────────────────────────────────────────

export const getConsultations = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [consultations, total] = await Promise.all([
      LegalConsultation.find(query)
        .populate("createdBy", "name")
        .populate("respondedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LegalConsultation.countDocuments(query),
    ]);

    res.json({ success: true, data: consultations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const consultation = await LegalConsultation.create({ ...req.body, createdBy: req.user._id });
    logActivity({ userId: req.user._id, action: "create", entity: "legal_consultation", entityId: consultation._id, entityName: consultation.title });
    res.status(201).json({ success: true, data: consultation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const answerConsultation = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) return res.status(400).json({ success: false, message: "الرد مطلوب" });

    const consultation = await LegalConsultation.findByIdAndUpdate(
      req.params.id,
      {
        response,
        respondedBy: req.user._id,
        respondedAt: new Date(),
        status: "answered",
      },
      { new: true }
    )
      .populate("createdBy", "name")
      .populate("respondedBy", "name");

    if (!consultation) return res.status(404).json({ success: false, message: "الاستشارة غير موجودة" });

    logActivity({
      userId: req.user._id,
      action: "update",
      entity: "legal_consultation",
      entityId: consultation._id,
      entityName: consultation.title,
      details: "الرد على استشارة",
    });

    res.json({ success: true, data: consultation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Legal Stats ──────────────────────────────────────────────────────────────

export const getLegalStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      casesByStatus,
      totalCases,
      totalContracts,
      activeContracts,
      expiringContracts,
      pendingConsultations,
      totalConsultations,
    ] = await Promise.all([
      LegalCase.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      LegalCase.countDocuments(),
      LegalContract.countDocuments(),
      LegalContract.countDocuments({ status: "active" }),
      LegalContract.countDocuments({
        status: "active",
        endDate: { $gte: now, $lte: thirtyDaysLater },
      }),
      LegalConsultation.countDocuments({ status: "pending" }),
      LegalConsultation.countDocuments(),
    ]);

    const expiringContractsList = await LegalContract.find({
      status: "active",
      endDate: { $gte: now, $lte: thirtyDaysLater },
    })
      .select("contractNumber title partyA partyB endDate expiryAlertDays")
      .sort({ endDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        cases: {
          total: totalCases,
          byStatus: casesByStatus,
        },
        contracts: {
          total: totalContracts,
          active: activeContracts,
          expiringSoon: expiringContracts,
          expiringList: expiringContractsList,
        },
        consultations: {
          total: totalConsultations,
          pending: pendingConsultations,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
