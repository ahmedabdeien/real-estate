/**
 * AdminLeads.jsx — إدارة العملاء المحتملين (Leads)
 * TanStack Query + TanStack Table v8 + Zod validation
 */
import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  FaPlus, FaMagnifyingGlass, FaTrash, FaPen, FaXmark,
  FaUserTie, FaPhone, FaEnvelope, FaMoneyBill, FaTag,
  FaChevronDown, FaFilter, FaUsers, FaCircleCheck,
  FaCircleXmark, FaHandshake, FaArrowsRotate, FaStar,
  FaEllipsisVertical,
} from "react-icons/fa6";

import DataTable, { checkboxColumn } from "../../Components/UI/DataTable";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  usePatchLead,
  useDeleteLead,
} from "../../hooks/queries/useLeads";
import { leadSchema, parseSchema } from "../../schemas/index";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STATUSES = ["جديد", "تم التواصل", "مهتم", "غير مهتم", "تم البيع", "متابعة"];

const STATUS_STYLES = {
  "جديد":       { bg: "var(--primary-10, #fef9e7)", color: "var(--primary)",  label: "جديد" },
  "تم التواصل": { bg: "#dbeafe",                    color: "#1d4ed8",          label: "تم التواصل" },
  "مهتم":       { bg: "#dcfce7",                    color: "#15803d",          label: "مهتم" },
  "غير مهتم":   { bg: "#fee2e2",                    color: "#b91c1c",          label: "غير مهتم" },
  "تم البيع":   { bg: "#f3e8ff",                    color: "#7e22ce",          label: "تم البيع" },
  "متابعة":     { bg: "#fef3c7",                    color: "#b45309",          label: "متابعة" },
};

const STATUS_ICONS = {
  "جديد":       FaStar,
  "تم التواصل": FaPhone,
  "مهتم":       FaCircleCheck,
  "غير مهتم":   FaCircleXmark,
  "تم البيع":   FaHandshake,
  "متابعة":     FaArrowsRotate,
};

const EMPTY_FORM = {
  name: "", phone: "", email: "", status: "جديد",
  source: "", budget: "", notes: "",
};

// ─────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────
function StatusBadge({ status, small = false }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES["جديد"];
  const Icon = STATUS_ICONS[status] || FaStar;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: small ? "2px 8px" : "4px 10px",
        borderRadius: "999px",
        fontSize: small ? "11px" : "12px",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={small ? 10 : 11} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────
// InlineStatusDropdown
// ─────────────────────────────────────────────
function InlineStatusCell({ lead }) {
  const [open, setOpen] = useState(false);
  const patch = usePatchLead();

  const handleChange = (status) => {
    patch.mutate({ id: lead._id, data: { status } });
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        <StatusBadge status={lead.status} />
        <FaChevronDown size={10} style={{ color: "var(--text-muted, #888)", marginTop: 1 }} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              zIndex: 50,
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: "140px",
              overflow: "hidden",
            }}
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleChange(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: lead.status === s ? "var(--primary-10, #fef9e7)" : "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--text, #111)",
                  textAlign: "right",
                }}
              >
                <StatusBadge status={s} small />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ConfirmDelete overlay
// ─────────────────────────────────────────────
function ConfirmDeleteModal({ count, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: "12px",
          padding: "28px 32px",
          maxWidth: "380px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text, #111)" }}>
          تأكيد الحذف
        </h3>
        <p style={{ color: "var(--text-muted, #666)", marginBottom: "24px", fontSize: "14px" }}>
          هل تريد حذف <strong>{count}</strong> عميل محتمل؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 20px", borderRadius: "8px",
              border: "1px solid var(--border, #e5e7eb)",
              background: "none", cursor: "pointer",
              fontSize: "14px", color: "var(--text, #111)",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 20px", borderRadius: "8px",
              border: "none",
              background: "#ef4444", color: "#fff",
              cursor: "pointer", fontSize: "14px", fontWeight: 600,
            }}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LeadModal (Add / Edit)
// ─────────────────────────────────────────────
function LeadModal({ lead, onClose }) {
  const isEdit = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [form, setForm] = useState(
    isEdit
      ? {
          name: lead.name || "",
          phone: lead.phone || "",
          email: lead.email || "",
          status: lead.status || "جديد",
          source: lead.source || "",
          budget: lead.budget || "",
          notes: lead.notes || "",
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    const result = parseSchema(leadSchema, form);
    if (!result.ok) { setErrors(result.errors); return; }
    setErrors({});

    if (isEdit) {
      updateLead.mutate(
        { id: lead._id, data: result.data },
        { onSuccess: onClose }
      );
    } else {
      createLead.mutate(result.data, { onSuccess: onClose });
    }
  };

  const isPending = createLead.isPending || updateLead.isPending;

  const fieldStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border, #e5e7eb)",
    background: "var(--input-bg, #f9fafb)",
    fontSize: "14px",
    color: "var(--text, #111)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text, #111)",
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "3px",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text, #111)" }}>
            {isEdit ? "تعديل العميل المحتمل" : "إضافة عميل محتمل"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted, #888)", padding: "4px",
            }}
          >
            <FaXmark size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Row: name + phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>
                <FaUserTie size={12} style={{ marginLeft: "5px" }} />
                الاسم *
              </label>
              <input
                style={{ ...fieldStyle, borderColor: errors.name ? "#ef4444" : undefined }}
                value={form.name} onChange={set("name")} placeholder="اسم العميل"
              />
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>
                <FaPhone size={12} style={{ marginLeft: "5px" }} />
                الهاتف *
              </label>
              <input
                style={{ ...fieldStyle, borderColor: errors.phone ? "#ef4444" : undefined }}
                value={form.phone} onChange={set("phone")} placeholder="05xxxxxxxx" dir="ltr"
              />
              {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
            </div>
          </div>

          {/* Row: email + source */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>
                <FaEnvelope size={12} style={{ marginLeft: "5px" }} />
                البريد الإلكتروني
              </label>
              <input
                style={{ ...fieldStyle, borderColor: errors.email ? "#ef4444" : undefined }}
                value={form.email} onChange={set("email")} placeholder="example@email.com" dir="ltr"
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>
                <FaTag size={12} style={{ marginLeft: "5px" }} />
                المصدر
              </label>
              <input
                style={fieldStyle}
                value={form.source} onChange={set("source")} placeholder="إعلان، توصية، موقع..."
              />
            </div>
          </div>

          {/* Row: status + budget */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>الحالة</label>
              <select style={fieldStyle} value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                <FaMoneyBill size={12} style={{ marginLeft: "5px" }} />
                الميزانية
              </label>
              <input
                style={fieldStyle}
                value={form.budget} onChange={set("budget")} placeholder="مثال: 500,000 ريال"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>ملاحظات</label>
            <textarea
              style={{ ...fieldStyle, resize: "vertical", minHeight: "80px" }}
              value={form.notes} onChange={set("notes")}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border, #e5e7eb)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px", borderRadius: "8px",
              border: "1px solid var(--border, #e5e7eb)",
              background: "none", cursor: "pointer",
              fontSize: "14px", color: "var(--text, #111)",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              padding: "9px 20px", borderRadius: "8px",
              border: "none",
              background: "var(--primary, #d4af37)", color: "#fff",
              cursor: isPending ? "not-allowed" : "pointer",
              fontSize: "14px", fontWeight: 600,
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة العميل"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// StatsBar
// ─────────────────────────────────────────────
function StatsBar({ leads = [] }) {
  const counts = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => (map[s] = 0));
    leads.forEach((l) => { if (map[l.status] !== undefined) map[l.status]++; });
    return map;
  }, [leads]);

  const items = [
    { label: "إجمالي", value: leads.length, color: "var(--primary)", icon: FaUsers },
    { label: "جديد", value: counts["جديد"], color: "var(--primary)", icon: FaStar },
    { label: "مهتم", value: counts["مهتم"], color: "#15803d", icon: FaCircleCheck },
    { label: "تم البيع", value: counts["تم البيع"], color: "#7e22ce", icon: FaHandshake },
    { label: "غير مهتم", value: counts["غير مهتم"], color: "#b91c1c", icon: FaCircleXmark },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "38px", height: "38px",
                borderRadius: "9px",
                background: item.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} style={{ color: item.color }} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text, #111)", lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted, #888)", marginTop: "2px" }}>
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// ActionsCell
// ─────────────────────────────────────────────
function ActionsCell({ lead, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted, #888)", padding: "4px 8px",
          borderRadius: "6px",
        }}
      >
        <FaEllipsisVertical size={14} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: "130px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => { setOpen(false); onEdit(lead); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "9px 14px", border: "none",
                background: "none", cursor: "pointer", fontSize: "13px",
                color: "var(--text, #111)", textAlign: "right",
              }}
            >
              <FaPen size={12} style={{ color: "var(--primary, #d4af37)" }} />
              تعديل
            </button>
            <button
              onClick={() => { setOpen(false); onDelete(lead); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "9px 14px", border: "none",
                background: "none", cursor: "pointer", fontSize: "13px",
                color: "#ef4444", textAlign: "right",
              }}
            >
              <FaTrash size={12} />
              حذف
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const col = createColumnHelper();

export default function AdminLeads() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState([]);

  const deleteLead = useDeleteLead();

  const { data, isLoading } = useLeads({
    page: page + 1,
    limit: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;

  const applySearch = () => { setSearch(searchInput); setPage(0); };

  const openAdd = () => { setEditLead(null); setModalOpen(true); };
  const openEdit = (lead) => { setEditLead(lead); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditLead(null); };

  const handleDeleteSingle = (lead) => setConfirmDelete([lead]);
  const handleDeleteBulk = () => setConfirmDelete(selected);

  const executeDelete = async () => {
    if (!confirmDelete?.length) return;
    for (const lead of confirmDelete) {
      await deleteLead.mutateAsync(lead._id);
    }
    setSelected([]);
    setConfirmDelete(null);
  };

  const columns = useMemo(
    () => [
      checkboxColumn(),
      col.accessor("name", {
        header: "اسم العميل",
        cell: ({ row }) => (
          <div style={{ fontWeight: 600, color: "var(--text, #111)" }}>
            {row.original.name}
          </div>
        ),
      }),
      col.accessor("phone", {
        header: "الهاتف",
        cell: ({ getValue }) => (
          <span style={{ direction: "ltr", display: "inline-block", color: "var(--text-muted, #555)", fontSize: "13px" }}>
            {getValue()}
          </span>
        ),
      }),
      col.accessor("status", {
        header: "الحالة",
        cell: ({ row }) => <InlineStatusCell lead={row.original} />,
      }),
      col.accessor("source", {
        header: "المصدر",
        cell: ({ getValue }) => (
          <span style={{ fontSize: "13px", color: "var(--text-muted, #666)" }}>
            {getValue() || "—"}
          </span>
        ),
      }),
      col.accessor("budget", {
        header: "الميزانية",
        cell: ({ getValue }) => (
          <span style={{ fontSize: "13px", fontWeight: 500 }}>
            {getValue() || "—"}
          </span>
        ),
      }),
      col.accessor("createdAt", {
        header: "التاريخ",
        cell: ({ getValue }) => {
          const v = getValue();
          return v ? new Date(v).toLocaleDateString("ar-EG") : "—";
        },
      }),
      col.display({
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => (
          <ActionsCell
            lead={row.original}
            onEdit={openEdit}
            onDelete={handleDeleteSingle}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div dir="rtl" style={{ padding: "24px", minHeight: "100vh", background: "var(--bg, #f5f6fa)" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--text, #111)" }}>
            إدارة العملاء المحتملين
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted, #888)" }}>
            إجمالي {total} عميل محتمل
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "9px",
            border: "none",
            background: "var(--primary, #d4af37)", color: "#fff",
            cursor: "pointer", fontSize: "14px", fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <FaPlus size={13} />
          إضافة عميل محتمل
        </button>
      </div>

      {/* Stats Bar */}
      <StatsBar leads={leads} />

      {/* Filters Row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "14px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", minWidth: "220px", flex: 1, maxWidth: "320px" }}>
            <FaMagnifyingGlass
              size={13}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted, #999)",
              }}
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              onBlur={applySearch}
              placeholder="بحث بالاسم أو الهاتف..."
              style={{
                width: "100%",
                padding: "9px 36px 9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
                background: "var(--card-bg, #fff)",
                fontSize: "13px",
                color: "var(--text, #111)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ position: "relative" }}>
            <FaFilter
              size={12}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted, #999)", pointerEvents: "none",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              style={{
                padding: "9px 34px 9px 32px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
                background: "var(--card-bg, #fff)",
                fontSize: "13px",
                color: "var(--text, #111)",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
              }}
            >
              <option value="">جميع الحالات</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FaChevronDown
              size={11}
              style={{
                position: "absolute", left: "10px", top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted, #999)", pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Bulk Delete */}
        {selected.length > 0 && (
          <button
            onClick={handleDeleteBulk}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", borderRadius: "8px",
              border: "none",
              background: "#ef4444", color: "#fff",
              cursor: "pointer", fontSize: "13px", fontWeight: 600,
            }}
          >
            <FaTrash size={12} />
            حذف المحدد ({selected.length})
          </button>
        )}
      </div>

      {/* DataTable */}
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border, #e5e7eb)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <DataTable
          data={leads}
          columns={columns}
          loading={isLoading}
          totalCount={total}
          pageIndex={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          enableRowSelection
          onSelectionChange={setSelected}
          emptyMessage="لا يوجد عملاء محتملون"
          searchPlaceholder="بحث..."
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <LeadModal lead={editLead} onClose={closeModal} />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <ConfirmDeleteModal
          count={confirmDelete.length}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
