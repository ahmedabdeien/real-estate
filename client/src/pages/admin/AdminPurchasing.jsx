import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, X, Search, ShoppingCart, Eye,
  CheckCircle, XCircle, RefreshCw, ChevronDown, FileText,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { key: "orders",    label: "أوامر الشراء" },
  { key: "suppliers", label: "الموردون" },
  { key: "invoices",  label: "الفواتير" },
];

const ORDER_STATUS = {
  draft:     { label: "مسودة",       color: "text-gray-600 bg-gray-100 border-gray-200" },
  sent:      { label: "مرسل",        color: "text-blue-600 bg-blue-50 border-blue-200" },
  partial:   { label: "استلام جزئي", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  received:  { label: "مستلم",       color: "text-green-600 bg-green-50 border-green-200" },
  cancelled: { label: "ملغى",        color: "text-red-600 bg-red-50 border-red-200" },
};

const INVOICE_STATUS = {
  unpaid:   { label: "غير مدفوع",   color: "text-red-600 bg-red-50 border-red-200" },
  partial:  { label: "مدفوع جزئياً", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  paid:     { label: "مدفوع",       color: "text-green-600 bg-green-50 border-green-200" },
};

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 focus:border-[#2d5d89]" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 bg-white" {...props}>{children}</select>
    </div>
  );
}

// ─── Status Pipeline ──────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: "draft",     label: "مسودة" },
  { key: "sent",      label: "مرسل" },
  { key: "partial",   label: "استلام جزئي" },
  { key: "received",  label: "مستلم" },
];

function StatusPipeline({ currentStatus }) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === currentStatus);
  if (currentStatus === "cancelled") {
    return <span className="text-xs text-red-600 font-medium">ملغى</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? "bg-[#2d5d89]" : "bg-gray-200"}`} title={step.label} />
          {i < PIPELINE_STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < currentIdx ? "bg-[#2d5d89]" : "bg-gray-200"}`} />}
        </div>
      ))}
      <span className="text-xs text-gray-600 mr-1">{PIPELINE_STEPS[currentIdx]?.label || currentStatus}</span>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ suppliers, warehouseItems, warehouses }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [receiveModal, setReceiveModal] = useState(null);
  const [receiveForm, setReceiveForm] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const emptyForm = { supplier: "", warehouse: "", expectedDate: "", discount: "0", tax: "0", notes: "", items: [{ item: "", qty: 1, unitCost: 0 }] };
  const [form, setForm] = useState(emptyForm);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/purchasing/orders");
      setOrders(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل أوامر الشراء");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const subtotal = form.items.reduce((s, i) => s + (Number(i.qty) * Number(i.unitCost)), 0);
  const discountAmt = subtotal * (Number(form.discount) / 100);
  const taxAmt = (subtotal - discountAmt) * (Number(form.tax) / 100);
  const total = subtotal - discountAmt + taxAmt;

  const addItemRow = () => setForm({ ...form, items: [...form.items, { item: "", qty: 1, unitCost: 0 }] });
  const removeItemRow = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItemRow = (idx, field, val) => {
    const updated = form.items.map((row, i) => i === idx ? { ...row, [field]: val } : row);
    setForm({ ...form, items: updated });
  };

  const saveOrder = async () => {
    if (!form.supplier) { toast.error("اختر المورد"); return; }
    if (!form.items.length || !form.items[0].item) { toast.error("أضف صنفاً واحداً على الأقل"); return; }
    setSaving(true);
    try {
      await api.post("/purchasing/orders", { ...form, subtotal, discount: form.discount, tax: form.tax, total });
      toast.success("تم إنشاء أمر الشراء");
      setCreateModal(false);
      setForm(emptyForm);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await api.put(`/purchasing/orders/${id}/cancel`);
      toast.success("تم إلغاء الأمر");
      fetchOrders();
    } catch {
      toast.error("فشل الإلغاء");
    }
  };

  const openReceive = (order) => {
    const init = {};
    (order.items || []).forEach((it) => { init[it._id || it.item] = ""; });
    setReceiveForm(init);
    setReceiveModal(order);
  };

  const submitReceive = async () => {
    setSaving(true);
    try {
      await api.put(`/purchasing/orders/${receiveModal._id}/receive`, { items: receiveForm });
      toast.success("تم تسجيل الاستلام");
      setReceiveModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الاستلام");
    } finally {
      setSaving(false);
    }
  };

  const filtered = (Array.isArray(orders) ? orders : []).filter((o) => {
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.supplier?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Supplier stats — top supplier by order count
  const supplierMap = {};
  orders.forEach((o) => {
    const name = o.supplierName || (typeof o.supplier === "string" ? o.supplier : o.supplier?.name) || "غير معروف";
    supplierMap[name] = (supplierMap[name] || 0) + 1;
  });
  const topSupplier = Object.entries(supplierMap).sort((a, b) => b[1] - a[1])[0];

  // Budget vs actual (current month)
  const now = new Date();
  const monthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const MONTHLY_BUDGET = 50000; // placeholder — could be made configurable

  // Quick approve: send a draft order
  const approveOrder = async (id) => {
    try {
      await api.put(`/purchasing/orders/${id}`, { status: "sent" });
      toast.success("تم إرسال الأمر");
      fetchOrders();
    } catch {
      toast.error("فشل الموافقة");
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#2d5d89]/5 border border-[#2d5d89]/10 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5">أكثر المورّدين طلباً</p>
          <p className="font-bold text-gray-900 truncate">{topSupplier ? topSupplier[0] : "—"}</p>
          {topSupplier && <p className="text-xs text-[#2d5d89] mt-0.5">{topSupplier[1]} أمر شراء</p>}
        </div>
        <div className="col-span-1 sm:col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs text-gray-500">الإنفاق الشهري مقابل الميزانية</p>
            <p className="text-xs font-bold text-gray-700">{monthTotal.toLocaleString("ar-EG")} / {MONTHLY_BUDGET.toLocaleString("ar-EG")} ج</p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${monthTotal > MONTHLY_BUDGET ? "bg-red-500" : monthTotal > MONTHLY_BUDGET * 0.8 ? "bg-orange-400" : "bg-[#2d5d89]"}`}
              style={{ width: `${Math.min(100, (monthTotal / MONTHLY_BUDGET) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{Math.round((monthTotal / MONTHLY_BUDGET) * 100)}% من الميزانية الشهرية</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الأمر أو المورد..." className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
          <option value="">كل الحالات</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => { setForm(emptyForm); setCreateModal(true); }} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> أمر شراء جديد
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">رقم الأمر</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المورد</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجمالي</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المسار</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد أوامر شراء</td></tr>
            ) : filtered.map((order) => {
              return (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{order.supplierName || order.supplier}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{order.total ? Number(order.total).toLocaleString("ar-EG") + " ج" : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPipeline currentStatus={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => setViewModal(order)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="عرض"><Eye className="w-4 h-4" /></button>
                      {order.status === "draft" && (
                        <button onClick={() => approveOrder(order._id)} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="موافقة">
                          <CheckCircle className="w-3.5 h-3.5" /> موافقة
                        </button>
                      )}
                      {(order.status === "sent" || order.status === "partial") && (
                        <button onClick={() => openReceive(order)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="استلام"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      {order.status === "draft" && (
                        <button onClick={() => cancelOrder(order._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="إلغاء"><XCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="إنشاء أمر شراء جديد" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="المورد *" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              <option value="">اختر المورد</option>
              {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
            <Select label="المخزن" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
              <option value="">اختر المخزن</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </Select>
          </div>
          <Input label="تاريخ التوقع" type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">الأصناف *</label>
              <button onClick={addItemRow} className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />إضافة صنف</button>
            </div>
            <div className="space-y-2">
              {form.items.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select value={row.item} onChange={(e) => updateItemRow(idx, "item", e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="">اختر الصنف</option>
                    {warehouseItems.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                  <input type="number" value={row.qty} onChange={(e) => updateItemRow(idx, "qty", e.target.value)} placeholder="كمية" className="w-20 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none" />
                  <input type="number" value={row.unitCost} onChange={(e) => updateItemRow(idx, "unitCost", e.target.value)} placeholder="سعر" className="w-24 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none" />
                  <span className="text-xs text-gray-500 w-20 text-left">{(Number(row.qty) * Number(row.unitCost)).toLocaleString("ar-EG")} ج</span>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItemRow(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="خصم %" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            <Input label="ضريبة %" type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{subtotal.toLocaleString("ar-EG")} ج</span></div>
            <div className="flex justify-between text-gray-600"><span>الخصم ({form.discount}%)</span><span>- {discountAmt.toLocaleString("ar-EG")} ج</span></div>
            <div className="flex justify-between text-gray-600"><span>الضريبة ({form.tax}%)</span><span>{taxAmt.toLocaleString("ar-EG")} ج</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1"><span>الإجمالي</span><span>{total.toLocaleString("ar-EG")} ج</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={saveOrder} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "إنشاء أمر الشراء"}
            </button>
            <button onClick={() => setCreateModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`تفاصيل الأمر ${viewModal?.orderNumber || ""}`} wide>
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">المورد: </span><span className="font-medium">{viewModal.supplierName || viewModal.supplier}</span></div>
              <div><span className="text-gray-500">التاريخ: </span><span>{viewModal.createdAt ? new Date(viewModal.createdAt).toLocaleDateString("ar-EG") : "—"}</span></div>
              <div><span className="text-gray-500">المخزن: </span><span>{viewModal.warehouseName || viewModal.warehouse || "—"}</span></div>
              <div><span className="text-gray-500">الحالة: </span><span className={`text-xs font-medium px-2 py-1 rounded-lg border ${ORDER_STATUS[viewModal.status]?.color}`}>{ORDER_STATUS[viewModal.status]?.label}</span></div>
            </div>
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50"><tr>
                <th className="px-3 py-2 text-right text-gray-600">الصنف</th>
                <th className="px-3 py-2 text-right text-gray-600">الكمية المطلوبة</th>
                <th className="px-3 py-2 text-right text-gray-600">المستلمة</th>
                <th className="px-3 py-2 text-right text-gray-600">السعر</th>
                <th className="px-3 py-2 text-right text-gray-600">الإجمالي</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(viewModal.items || []).map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium">{item.itemName || item.item}</td>
                    <td className="px-3 py-2">{item.qty}</td>
                    <td className="px-3 py-2">{item.receivedQty ?? "—"}</td>
                    <td className="px-3 py-2">{Number(item.unitCost).toLocaleString("ar-EG")} ج</td>
                    <td className="px-3 py-2 font-medium">{(Number(item.qty) * Number(item.unitCost)).toLocaleString("ar-EG")} ج</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between text-gray-900 font-bold"><span>الإجمالي</span><span>{Number(viewModal.total).toLocaleString("ar-EG")} ج</span></div>
            </div>
            {viewModal.notes && <p className="text-sm text-gray-600"><span className="font-medium">ملاحظات: </span>{viewModal.notes}</p>}
          </div>
        )}
      </Modal>

      {/* Receive Modal */}
      <Modal open={!!receiveModal} onClose={() => setReceiveModal(null)} title="تسجيل استلام البضاعة">
        {receiveModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">أدخل الكمية المستلمة لكل صنف</p>
            <div className="space-y-3">
              {(receiveModal.items || []).map((item) => (
                <div key={item._id || item.item} className="flex items-center gap-3">
                  <span className="flex-1 text-sm font-medium">{item.itemName || item.item}</span>
                  <span className="text-xs text-gray-500">مطلوب: {item.qty}</span>
                  <input
                    type="number" placeholder="مستلم" min="0" max={item.qty}
                    value={receiveForm[item._id || item.item] || ""}
                    onChange={(e) => setReceiveForm({ ...receiveForm, [item._id || item.item]: e.target.value })}
                    className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={submitReceive} disabled={saving} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-60">
                {saving ? "جاري الحفظ..." : "تأكيد الاستلام"}
              </button>
              <button onClick={() => setReceiveModal(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Suppliers Tab ────────────────────────────────────────────────────────────
function SuppliersTab({ onRefresh }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", taxNumber: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/purchasing/suppliers");
      setSuppliers(r.data?.data || []);
      onRefresh?.(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل الموردين");
    } finally {
      setLoading(false);
    }
  }, [toast, onRefresh]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const openAdd = () => { setEditItem(null); setForm({ name: "", phone: "", email: "", taxNumber: "" }); setModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name || "", phone: s.phone || "", email: s.email || "", taxNumber: s.taxNumber || "" }); setModal(true); };

  const save = async () => {
    if (!form.name) { toast.error("اسم المورد مطلوب"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/purchasing/suppliers/${editItem._id}`, form);
        toast.success("تم تحديث المورد");
      } else {
        await api.post("/purchasing/suppliers", form);
        toast.success("تم إضافة المورد");
      }
      setModal(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await api.delete(`/purchasing/suppliers/${id}`);
      toast.success("تم حذف المورد");
      setDeleteId(null);
      fetchSuppliers();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> إضافة مورد
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الاسم</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الهاتف</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الرقم الضريبي</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا يوجد موردون</td></tr>
            ) : suppliers.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.phone || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{s.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.taxNumber || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل المورد" : "إضافة مورد جديد"}>
        <div className="space-y-4">
          <Input label="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المورد" />
          <Input label="الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          <Input label="الرقم الضريبي" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} placeholder="الرقم الضريبي" />
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </div>
      </Modal>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-gray-900 mb-4">هل أنت متأكد من حذف هذا المورد؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteSupplier(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600">حذف</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Invoices Tab ─────────────────────────────────────────────────────────────
function InvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/purchasing/invoices")
      .then((r) => setInvoices(r.data?.data || []))
      .catch(() => toast.error("فشل تحميل الفواتير"))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">رقم الفاتورة</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">أمر الشراء</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجمالي</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">المدفوع</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">نسبة السداد</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
          ) : invoices.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا توجد فواتير</td></tr>
          ) : invoices.map((inv) => {
            const pct = inv.total > 0 ? Math.min(100, Math.round((inv.paidAmount / inv.total) * 100)) : 0;
            const st = INVOICE_STATUS[inv.status] || INVOICE_STATUS.unpaid;
            return (
              <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{inv.invoiceNumber || "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.orderNumber || "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.date ? new Date(inv.date).toLocaleDateString("ar-EG") : "—"}</td>
                <td className="px-4 py-3 font-medium">{Number(inv.total).toLocaleString("ar-EG")} ج</td>
                <td className="px-4 py-3 text-green-600 font-medium">{Number(inv.paidAmount || 0).toLocaleString("ar-EG")} ج</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : pct > 0 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${st.color}`}>{st.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPurchasing() {
  const [activeTab, setActiveTab] = useState("orders");
  const [suppliers, setSuppliers] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    api.get("/purchasing/suppliers").then((r) => setSuppliers(r.data?.data || [])).catch(() => {});
    api.get("/warehouse/items").then((r) => setWarehouseItems(r.data?.data || [])).catch(() => {});
    api.get("/warehouse/warehouses").then((r) => setWarehouses(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2d5d89]/10 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-[#2d5d89]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المشتريات</h1>
            <p className="text-sm text-gray-500 mt-0.5">أوامر الشراء والموردين والفواتير</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-[#2d5d89] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {activeTab === "orders" && <OrdersTab suppliers={suppliers} warehouseItems={warehouseItems} warehouses={warehouses} />}
              {activeTab === "suppliers" && <SuppliersTab onRefresh={setSuppliers} />}
              {activeTab === "invoices" && <InvoicesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
