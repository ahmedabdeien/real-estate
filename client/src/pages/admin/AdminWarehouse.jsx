import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, X, Search, Package, Warehouse,
  Tag, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle,
  ChevronDown, Save, Filter,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { key: "balance",      label: "المخزون" },
  { key: "items",        label: "الأصناف" },
  { key: "warehouses",   label: "المخازن" },
  { key: "transactions", label: "الحركات" },
  { key: "categories",   label: "الفئات" },
];

const TRANSACTION_TYPES = [
  { value: "in",               label: "وارد",       color: "green" },
  { value: "out",              label: "صادر",       color: "red" },
  { value: "purchase_receive", label: "استلام شراء", color: "green" },
  { value: "adjustment",       label: "تسوية",      color: "yellow" },
];

function typeColor(type) {
  if (type === "in" || type === "purchase_receive") return "text-green-700 bg-green-50 border-green-200";
  if (type === "out") return "text-red-700 bg-red-50 border-red-200";
  return "text-yellow-700 bg-yellow-50 border-yellow-200";
}

function typeLabel(type) {
  return TRANSACTION_TYPES.find((t) => t.value === type)?.label || type;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
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
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 focus:border-[#2d5d89]"
        {...props}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 focus:border-[#2d5d89] bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Balance Tab ─────────────────────────────────────────────────────────────
function BalanceTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/inventory/balance");
      setData(r.data || []);
    } catch {
      toast.error("فشل تحميل بيانات المخزون");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((row) =>
    !search || row.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    row.warehouseName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الصنف أو المخزن..."
            className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30"
          />
        </div>
        <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">اسم الصنف</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المخزن</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الكمية الحالية</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الوحدة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">متوسط التكلفة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
            ) : filtered.map((row, i) => {
              const belowMin = row.minStock != null && row.quantity < row.minStock;
              return (
                <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${belowMin ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {belowMin && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {row.itemName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.warehouseName}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${belowMin ? "text-red-600" : "text-gray-900"}`}>
                      {row.quantity?.toLocaleString("ar-EG")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{row.avgCost ? Number(row.avgCost).toLocaleString("ar-EG") + " ج" : "—"}</td>
                  <td className="px-4 py-3">
                    {belowMin
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" />أقل من الحد</span>
                      : <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">طبيعي</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Items Tab ────────────────────────────────────────────────────────────────
function ItemsTab({ categories, warehouses }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", category: "", unit: "", minStock: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/items");
      setItems(r.data || []);
    } catch {
      toast.error("فشل تحميل الأصناف");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditItem(null); setForm({ code: "", name: "", category: "", unit: "", minStock: "" }); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ code: item.code || "", name: item.name || "", category: item.category || "", unit: item.unit || "", minStock: item.minStock ?? "" }); setModal(true); };

  const save = async () => {
    if (!form.name) { toast.error("اسم الصنف مطلوب"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/warehouse/items/${editItem._id}`, form);
        toast.success("تم تحديث الصنف");
      } else {
        await api.post("/warehouse/items", form);
        toast.success("تم إضافة الصنف");
      }
      setModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/warehouse/items/${id}`);
      toast.success("تم حذف الصنف");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const filtered = items.filter((i) =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..." className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> إضافة صنف
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الكود</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الاسم</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الفئة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الوحدة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الحد الأدنى</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد أصناف</td></tr>
            ) : filtered.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.code || "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.category || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.unit || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.minStock ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل الصنف" : "إضافة صنف جديد"}>
        <div className="space-y-4">
          <Input label="الكود" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="كود الصنف" />
          <Input label="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الصنف" />
          <Select label="الفئة" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">اختر الفئة</option>
            {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </Select>
          <Input label="الوحدة" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="مثال: قطعة، كجم، متر" />
          <Input label="الحد الأدنى للمخزون" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-gray-900 mb-4">هل أنت متأكد من حذف هذا الصنف؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteItem(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600">حذف</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Warehouses Tab ───────────────────────────────────────────────────────────
function WarehousesTab({ onRefresh }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", manager: "" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/warehouses");
      setWarehouses(r.data || []);
      onRefresh?.(r.data || []);
    } catch {
      toast.error("فشل تحميل المخازن");
    } finally {
      setLoading(false);
    }
  }, [toast, onRefresh]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const openAdd = () => { setEditItem(null); setForm({ name: "", location: "", manager: "" }); setModal(true); };
  const openEdit = (w) => { setEditItem(w); setForm({ name: w.name || "", location: w.location || "", manager: w.manager || "" }); setModal(true); };

  const save = async () => {
    if (!form.name) { toast.error("اسم المخزن مطلوب"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/warehouse/warehouses/${editItem._id}`, form);
        toast.success("تم تحديث المخزن");
      } else {
        await api.post("/warehouse/warehouses", form);
        toast.success("تم إضافة المخزن");
      }
      setModal(false);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> إضافة مخزن
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الاسم</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الموقع</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المسؤول</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : warehouses.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">لا توجد مخازن</td></tr>
            ) : warehouses.map((w) => (
              <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                <td className="px-4 py-3 text-gray-600">{w.location || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{w.manager || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل المخزن" : "إضافة مخزن جديد"}>
        <div className="space-y-4">
          <Input label="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المخزن" />
          <Input label="الموقع" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="عنوان المخزن" />
          <Input label="المسؤول" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="اسم المسؤول" />
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ items, warehouses }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ item: "", warehouse: "", type: "in", quantity: "", unitCost: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/transactions");
      setTransactions(r.data || []);
    } catch {
      toast.error("فشل تحميل الحركات");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const save = async () => {
    if (!form.item || !form.warehouse || !form.quantity) { toast.error("الصنف والمخزن والكمية مطلوبة"); return; }
    setSaving(true);
    try {
      await api.post("/warehouse/transactions", form);
      toast.success("تم تسجيل الحركة");
      setModal(false);
      setForm({ item: "", warehouse: "", type: "in", quantity: "", unitCost: "", notes: "" });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> حركة جديدة
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الصنف</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المخزن</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">النوع</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الكمية</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">تكلفة الوحدة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">ملاحظات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا توجد حركات</td></tr>
            ) : transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 text-xs">{t.date ? new Date(t.date).toLocaleDateString("ar-EG") : "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.itemName || t.item}</td>
                <td className="px-4 py-3 text-gray-600">{t.warehouseName || t.warehouse}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${typeColor(t.type)}`}>{typeLabel(t.type)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.quantity?.toLocaleString("ar-EG")}</td>
                <td className="px-4 py-3 text-gray-600">{t.unitCost ? Number(t.unitCost).toLocaleString("ar-EG") + " ج" : "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{t.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="تسجيل حركة مخزنية">
        <div className="space-y-4">
          <Select label="الصنف *" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
            <option value="">اختر الصنف</option>
            {items.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
          </Select>
          <Select label="المخزن *" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
            <option value="">اختر المخزن</option>
            {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </Select>
          <Select label="نوع الحركة" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="الكمية *" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
          <Input label="تكلفة الوحدة" type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} placeholder="0.00" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30" placeholder="ملاحظات اختيارية" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab({ onRefresh }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/categories");
      setCats(r.data || []);
      onRefresh?.(r.data || []);
    } catch {
      toast.error("فشل تحميل الفئات");
    } finally {
      setLoading(false);
    }
  }, [toast, onRefresh]);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const openAdd = () => { setEditItem(null); setForm({ name: "", description: "" }); setModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name || "", description: c.description || "" }); setModal(true); };

  const save = async () => {
    if (!form.name) { toast.error("اسم الفئة مطلوب"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/warehouse/categories/${editItem._id}`, form);
        toast.success("تم تحديث الفئة");
      } else {
        await api.post("/warehouse/categories", form);
        toast.success("تم إضافة الفئة");
      }
      setModal(false);
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const deleteCat = async (id) => {
    try {
      await api.delete(`/warehouse/categories/${id}`);
      toast.success("تم حذف الفئة");
      setDeleteId(null);
      fetchCats();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <Plus className="w-4 h-4" /> إضافة فئة
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الاسم</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الوصف</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : cats.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">لا توجد فئات</td></tr>
            ) : cats.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل الفئة" : "إضافة فئة جديدة"}>
        <div className="space-y-4">
          <Input label="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الفئة" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[#2d5d89] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">إلغاء</button>
          </div>
        </div>
      </Modal>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-gray-900 mb-4">هل أنت متأكد من حذف هذه الفئة؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteCat(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600">حذف</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminWarehouse() {
  const [activeTab, setActiveTab] = useState("balance");
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/warehouse/items").then((r) => setItems(r.data || [])).catch(() => {});
    api.get("/warehouse/categories").then((r) => setCategories(r.data || [])).catch(() => {});
    api.get("/warehouse/warehouses").then((r) => setWarehouses(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2d5d89]/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-[#2d5d89]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المخازن</h1>
            <p className="text-sm text-gray-500 mt-0.5">متابعة المخزون والأصناف والحركات المخزنية</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[#2d5d89] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
              {activeTab === "balance" && <BalanceTab />}
              {activeTab === "items" && <ItemsTab categories={categories} warehouses={warehouses} />}
              {activeTab === "warehouses" && <WarehousesTab onRefresh={setWarehouses} />}
              {activeTab === "transactions" && <TransactionsTab items={items} warehouses={warehouses} />}
              {activeTab === "categories" && <CategoriesTab onRefresh={setCategories} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
