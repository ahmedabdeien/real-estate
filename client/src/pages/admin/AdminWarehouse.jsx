import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaTrash, FaPen, FaMagnifyingGlass, FaBox,
  FaWarehouse, FaTag, FaArrowsRotate, FaTriangleExclamation,
} from "react-icons/fa6";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, filterInputCls, SelectField, TextareaField } from "../../Components/UI/FormField";
import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import EmptyState from "../../Components/UI/EmptyState";
import InlineAiChat from "../../Components/UI/InlineAiChat";

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

// ─── Balance Tab ─────────────────────────────────────────────────────────────
function BalanceTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/inventory/balance");
      setData(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل بيانات المخزون");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allCategories = [...new Set(data.map((r) => r.category).filter(Boolean))];
  const lowStockItems = data.filter((r) => r.minStock != null && r.quantity < r.minStock);
  const totalValue = data.reduce((s, r) => s + (r.quantity || 0) * (r.avgCost || 0), 0);

  const filtered = data.filter((row) => {
    const matchSearch = !search || row.itemName?.toLowerCase().includes(search.toLowerCase()) || row.warehouseName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || row.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{data.length}</p>
          <p className="text-xs text-blue-600 mt-0.5">إجمالي الأصناف</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-700">{lowStockItems.length}</p>
          <p className="text-xs text-red-600 mt-0.5">منخفض المخزون</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">{totalValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-green-600 mt-0.5">القيمة الإجمالية (ج)</p>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaTriangleExclamation className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">تحذير: {lowStockItems.length} صنف تحت الحد الأدنى للمخزون</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {lowStockItems.slice(0, 5).map((item) => (
                <span key={item._id} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {item.itemName} ({item.quantity}/{item.minStock})
                </span>
              ))}
              {lowStockItems.length > 5 && (
                <span className="text-xs text-red-500">+{lowStockItems.length - 5} أخرى</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الصنف أو المخزن..."
            className={`${filterInputCls} w-full pr-10`}
          />
        </div>
        {/* Category chips */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!categoryFilter ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-[color:var(--primary)]"}`}
            style={!categoryFilter ? { background: "var(--primary)" } : {}}
          >الكل</button>
          {allCategories.map((cat) => (
            <button key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${categoryFilter === cat ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-[color:var(--primary)]"}`}
              style={categoryFilter === cat ? { background: "var(--primary)" } : {}}
            >{cat}</button>
          ))}
        </div>
        <SecondaryButton onClick={fetchData} icon={<FaArrowsRotate className="w-4 h-4" />} />
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
              <tr><td colSpan={6} className="p-0"><EmptyState icon={FaBox} title="لا توجد بيانات" /></td></tr>
            ) : filtered.map((row, i) => {
              const belowMin = row.minStock != null && row.quantity < row.minStock;
              return (
                <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${belowMin ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {belowMin && <FaTriangleExclamation className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {row.itemName}
                      {belowMin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">نفد تقريباً</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.warehouseName}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${belowMin ? "text-red-600" : "text-gray-900"}`}>
                      {row.quantity?.toLocaleString("ar-EG")}
                    </span>
                    {row.minStock != null && (
                      <span className="text-gray-400 text-xs mr-1">/ {row.minStock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{row.avgCost ? Number(row.avgCost).toLocaleString("ar-EG") + " ج" : "—"}</td>
                  <td className="px-4 py-3">
                    {belowMin
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg"><FaTriangleExclamation className="w-3 h-3" />أقل من الحد</span>
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
function ItemsTab({ categories }) {
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
      setItems(r.data?.data || []);
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
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..." className={`${filterInputCls} w-full pr-10`} />
        </div>
        <PrimaryButton onClick={openAdd} icon={<FaPlus className="w-4 h-4" />}>إضافة صنف</PrimaryButton>
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
              <tr><td colSpan={6} className="p-0"><EmptyState icon={FaBox} title="لا توجد أصناف" /></td></tr>
            ) : filtered.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.code || "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.category || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.unit || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{item.minStock ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaPen className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FaTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal} onClose={() => setModal(false)} title={editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
        footer={<>
          <SecondaryButton onClick={() => setModal(false)}>إلغاء</SecondaryButton>
          <PrimaryButton onClick={save} loading={saving}>حفظ</PrimaryButton>
        </>}
      >
        <div className="space-y-4">
          <FormField label="الكود">
            <input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="كود الصنف" />
          </FormField>
          <FormField label="الاسم" required>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الصنف" />
          </FormField>
          <FormField label="الفئة">
            <SelectField value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">اختر الفئة</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </SelectField>
          </FormField>
          <FormField label="الوحدة">
            <input className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="مثال: قطعة، كجم، متر" />
          </FormField>
          <FormField label="الحد الأدنى للمخزون">
            <input className={inputCls} type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteItem(deleteId)}
        title="حذف الصنف"
        message="هل أنت متأكد من حذف هذا الصنف؟"
      />
    </div>
  );
}

// ─── Warehouses Tab ───────────────────────────────────────────────────────────
function WarehousesTab({ onRefresh }) {
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", manager: "" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get("/users").then((r) => setUsers(r.data?.users || r.data?.data || [])).catch(() => {});
  }, []);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/warehouse/warehouses");
      setWarehouses(r.data?.data || []);
      onRefresh?.(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل المخازن");
    } finally {
      setLoading(false);
    }
  }, [toast, onRefresh]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const openAdd = () => { setEditItem(null); setForm({ name: "", location: "", manager: "" }); setModal(true); };
  const openEdit = (w) => { setEditItem(w); setForm({ name: w.name || "", location: w.location || "", manager: w.manager?._id || w.manager || "" }); setModal(true); };

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
        <PrimaryButton onClick={openAdd} icon={<FaPlus className="w-4 h-4" />}>إضافة مخزن</PrimaryButton>
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
              <tr><td colSpan={4} className="p-0"><EmptyState icon={FaWarehouse} title="لا توجد مخازن" /></td></tr>
            ) : warehouses.map((w) => (
              <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                <td className="px-4 py-3 text-gray-600">{w.location || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{w.manager?.name || (users.find(u => u._id === w.manager)?.name) || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaPen className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal} onClose={() => setModal(false)} title={editItem ? "تعديل المخزن" : "إضافة مخزن جديد"}
        footer={<>
          <SecondaryButton onClick={() => setModal(false)}>إلغاء</SecondaryButton>
          <PrimaryButton onClick={save} loading={saving}>حفظ</PrimaryButton>
        </>}
      >
        <div className="space-y-4">
          <FormField label="الاسم" required>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المخزن" />
          </FormField>
          <FormField label="الموقع">
            <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="عنوان المخزن" />
          </FormField>
          <FormField label="المسؤول">
            <SelectField value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}>
              <option value="">— اختر المسؤول —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </SelectField>
          </FormField>
        </div>
      </AdminModal>
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
      setTransactions(r.data?.data || []);
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
        <PrimaryButton onClick={() => setModal(true)} icon={<FaPlus className="w-4 h-4" />}>حركة جديدة</PrimaryButton>
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
              <tr><td colSpan={7} className="p-0"><EmptyState icon={FaTag} title="لا توجد حركات" /></td></tr>
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

      <AdminModal isOpen={modal} onClose={() => setModal(false)} title="تسجيل حركة مخزنية"
        footer={<>
          <SecondaryButton onClick={() => setModal(false)}>إلغاء</SecondaryButton>
          <PrimaryButton onClick={save} loading={saving}>حفظ</PrimaryButton>
        </>}
      >
        <div className="space-y-4">
          <FormField label="الصنف" required>
            <SelectField value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
              <option value="">اختر الصنف</option>
              {items.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </SelectField>
          </FormField>
          <FormField label="المخزن" required>
            <SelectField value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
              <option value="">اختر المخزن</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </SelectField>
          </FormField>
          <FormField label="نوع الحركة">
            <SelectField value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </SelectField>
          </FormField>
          <FormField label="الكمية" required>
            <input className={inputCls} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
          </FormField>
          <FormField label="تكلفة الوحدة">
            <input className={inputCls} type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} placeholder="0.00" />
          </FormField>
          <FormField label="ملاحظات">
            <TextareaField value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="ملاحظات اختيارية" />
          </FormField>
        </div>
      </AdminModal>
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
      setCats(r.data?.data || []);
      onRefresh?.(r.data?.data || []);
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
        <PrimaryButton onClick={openAdd} icon={<FaPlus className="w-4 h-4" />}>إضافة فئة</PrimaryButton>
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
              <tr><td colSpan={3} className="p-0"><EmptyState icon={FaTag} title="لا توجد فئات" /></td></tr>
            ) : cats.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaPen className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FaTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal} onClose={() => setModal(false)} title={editItem ? "تعديل الفئة" : "إضافة فئة جديدة"}
        footer={<>
          <SecondaryButton onClick={() => setModal(false)}>إلغاء</SecondaryButton>
          <PrimaryButton onClick={save} loading={saving}>حفظ</PrimaryButton>
        </>}
      >
        <div className="space-y-4">
          <FormField label="الاسم" required>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم الفئة" />
          </FormField>
          <FormField label="الوصف">
            <TextareaField value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteCat(deleteId)}
        title="حذف الفئة"
        message="هل أنت متأكد من حذف هذه الفئة؟"
      />
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
    api.get("/warehouse/items").then((r) => setItems(r.data?.data || [])).catch(() => {});
    api.get("/warehouse/categories").then((r) => setCategories(r.data?.data || [])).catch(() => {});
    api.get("/warehouse/warehouses").then((r) => setWarehouses(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <PageHeader
        title="إدارة المخازن"
        subtitle="متابعة المخزون والأصناف والحركات المخزنية"
        icon={<FaWarehouse />}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === tab.key ? { background: "var(--primary)" } : {}}
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

        <InlineAiChat context="inventory" />
      </div>
    </div>
  );
}
