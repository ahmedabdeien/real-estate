import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  MessageCircle, Wifi, WifiOff, RefreshCw, Send, Unplug,
  CheckCircle, Loader, Zap, Users, Bell, ChevronDown,
  ChevronUp, Save, AlertCircle, Info, Clock,
  Plus, Trash2, Copy, Check, FileText, History,
  Phone, Download, Upload, Search, X, Star, StarOff,
  BarChart2, Calendar, BriefcaseBusiness, UserCheck,
  PlayCircle, PauseCircle, RotateCcw, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_INFO = {
  connected:    { color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800",  dot: "bg-green-500",  icon: <CheckCircle className="w-4 h-4" />, label: "متصل" },
  qr_ready:     { color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",    dot: "bg-blue-500",   icon: <Loader className="w-4 h-4 animate-spin" />, label: "في انتظار QR" },
  connecting:   { color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-800",  dot: "bg-amber-500",  icon: <Loader className="w-4 h-4 animate-spin" />, label: "جارٍ الاتصال..." },
  disconnected: { color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800",      dot: "bg-red-500",    icon: <WifiOff className="w-4 h-4" />, label: "غير متصل" },
};

const TABS = [
  { id: "connection", label: "الاتصال",      icon: Wifi },
  { id: "automation", label: "الأتومايشن",   icon: Zap },
  { id: "bulk",       label: "إرسال جماعي",  icon: Users },
  { id: "templates",  label: "القوالب",      icon: FileText },
  { id: "logs",       label: "السجل",        icon: History },
  { id: "stats",      label: "الإحصائيات",  icon: BarChart2 },
];

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ─── Template Editor ───────────────────────────────────────────────────────────
function TemplateEditor({ label, value, onChange, vars = [], rows = 3 }) {
  const [copied, setCopied] = useState(false);
  const insertVar = (v) => onChange(value + `{${v}}`);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {vars.map((v) => (
            <button key={v} onClick={() => insertVar(v)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 font-mono transition-colors">
              {`{${v}}`}
            </button>
          ))}
          <button onClick={copy} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
        dir="rtl" />
      <p className="text-[10px] text-gray-400 text-left">{value.length} حرف</p>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = "blue", badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
    green:  "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    amber:  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400",
    rose:   "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{title}</span>
          {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">{children}</div>}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "blue", icon: Icon }) {
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800",
    green:  "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800",
    amber:  "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800",
    rose:   "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AdminWhatsApp() {
  const toast = useToast();

  /* ── Connection ─────────────────────────────── */
  const [status, setStatus]           = useState("disconnected");
  const [statusMessage, setStatusMessage] = useState("جارٍ التحقق...");
  const [qr, setQr]                   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [connectedPhone, setConnectedPhone] = useState(null);
  const [connectedSince, setConnectedSince] = useState(null);
  const esRef = useRef(null);

  /* ── UI ─────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState("connection");

  /* ── Test ───────────────────────────────────── */
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg]     = useState("مرحباً، رسالة اختبار من الصرح للتطوير العقاري 🏢");
  const [testTemplate, setTestTemplate] = useState("");
  const [sending, setSending]     = useState(false);
  const [testLog, setTestLog]     = useState([]); // local test history

  /* ── Automation ─────────────────────────────── */
  const [auto, setAuto]               = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoSaving, setAutoSaving]   = useState(false);

  /* ── Bulk ───────────────────────────────────── */
  const [bulkMsg, setBulkMsg]         = useState("");
  const [bulkPhones, setBulkPhones]   = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult]   = useState(null);
  const [bulkDelay, setBulkDelay]     = useState(2);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [bulkTemplate, setBulkTemplate] = useState("");
  const [importingLeads, setImportingLeads] = useState(false);

  /* ── Templates ──────────────────────────────── */
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wa_templates") || "[]"); } catch { return []; }
  });
  const [newTpl, setNewTpl]   = useState({ name: "", body: "", starred: false });
  const [tplSearch, setTplSearch] = useState("");
  const [editTplId, setEditTplId] = useState(null);

  /* ── Logs ───────────────────────────────────── */
  const [logs, setLogs]           = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsFilter, setLogsFilter] = useState("all"); // all / sent / failed
  const [logsSearch, setLogsSearch] = useState("");

  /* ── Stats ──────────────────────────────────── */
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData]   = useState(null);

  // ── SSE ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const connectSSE = () => {
      if (esRef.current) esRef.current.close();
      const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");
      esRef.current = new EventSource(`${base}/api/whatsapp/events`, { withCredentials: true });
      esRef.current.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          setStatus(d.status);
          setStatusMessage(d.statusMessage || "");
          setQr(d.qr || null);
          if (d.phone) setConnectedPhone(d.phone);
          if (d.status === "connected" && !connectedSince) setConnectedSince(new Date());
          if (d.status !== "connected") setConnectedSince(null);
        } catch {}
      };
      esRef.current.onerror = () => { esRef.current?.close(); setTimeout(connectSSE, 5000); };
    };
    api.get("/whatsapp/status").then((r) => {
      setStatus(r.data.status);
      setStatusMessage(r.data.statusMessage);
      setQr(r.data.qr || null);
      if (r.data.phone) setConnectedPhone(r.data.phone);
    }).catch(() => {});
    connectSSE();
    return () => esRef.current?.close();
  }, []);

  // ── Load automation ───────────────────────────────────────────────────────────
  const loadAuto = useCallback(async () => {
    setAutoLoading(true);
    try { const r = await api.get("/whatsapp/automation"); setAuto(r.data.settings); }
    catch { toast.error("فشل تحميل إعدادات الأتومايشن"); }
    finally { setAutoLoading(false); }
  }, [toast]);

  useEffect(() => { if (activeTab === "automation") loadAuto(); }, [activeTab, loadAuto]);

  // ── Load logs ─────────────────────────────────────────────────────────────────
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const r = await api.get("/whatsapp/logs", { params: { limit: 50 } });
      setLogs(r.data.logs || []);
    } catch {
      // Backend may not have logs endpoint yet — use empty
      setLogs([]);
    } finally { setLogsLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === "logs") loadLogs(); }, [activeTab, loadLogs]);

  // ── Load stats ────────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await api.get("/whatsapp/stats");
      setStatsData(r.data);
    } catch {
      // Fallback: compute from logs
      setStatsData(null);
    } finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === "stats") loadStats(); }, [activeTab, loadStats]);

  // ── Persist templates ─────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("wa_templates", JSON.stringify(templates));
  }, [templates]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const setAutoField = (path, value) => {
    setAuto((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const saveAuto = async () => {
    setAutoSaving(true);
    try { await api.put("/whatsapp/automation", { settings: auto }); toast.success("تم حفظ إعدادات الأتومايشن"); }
    catch { toast.error("فشل الحفظ"); }
    finally { setAutoSaving(false); }
  };

  const handleConnect    = async () => { setLoading(true); try { await api.post("/whatsapp/connect"); toast.success("جارٍ الاتصال..."); } catch (e) { toast.error(e.response?.data?.message || "فشل"); } finally { setLoading(false); } };
  const handleDisconnect = async () => { if (!confirm("تأكيد قطع الاتصال؟")) return; setLoading(true); try { await api.post("/whatsapp/disconnect"); toast.success("تم قطع الاتصال"); setConnectedPhone(null); setConnectedSince(null); } catch (e) { toast.error(e.response?.data?.message || "فشل"); } finally { setLoading(false); } };

  const handleTest = async () => {
    if (!testPhone) return toast.error("أدخل رقم الهاتف");
    if (!testMsg.trim()) return toast.error("أدخل نص الرسالة");
    setSending(true);
    try {
      await api.post("/whatsapp/test", { phone: testPhone, message: testMsg });
      toast.success("✅ تم الإرسال بنجاح");
      setTestLog((prev) => [{ phone: testPhone, msg: testMsg, time: new Date(), ok: true }, ...prev.slice(0, 9)]);
    } catch (e) {
      toast.error(e.response?.data?.message || "فشل الإرسال");
      setTestLog((prev) => [{ phone: testPhone, msg: testMsg, time: new Date(), ok: false }, ...prev.slice(0, 9)]);
    } finally { setSending(false); }
  };

  const handleBulk = async () => {
    const phones = bulkPhones.split(/[\n,،]+/).map((p) => p.trim()).filter(Boolean);
    if (!phones.length) return toast.error("أدخل أرقام الهواتف");
    if (!bulkMsg.trim()) return toast.error("أدخل نص الرسالة");
    setBulkSending(true); setBulkResult(null); setBulkProgress({ sent: 0, total: phones.length });
    try {
      const r = await api.post("/whatsapp/bulk", { phones, message: bulkMsg, delay: bulkDelay * 1000 });
      setBulkResult(r.data.results);
      setBulkProgress(null);
      toast.success(`تم الإرسال: ${r.data.results?.sent ?? phones.length} رسالة`);
    } catch (e) {
      toast.error(e.response?.data?.message || "فشل الإرسال جماعي");
      setBulkProgress(null);
    } finally { setBulkSending(false); }
  };

  const importLeadsPhones = async () => {
    setImportingLeads(true);
    try {
      const r = await api.get("/leads", { params: { limit: 200 } });
      const phones = (r.data.leads || [])
        .map((l) => l.phone)
        .filter(Boolean)
        .map((p) => p.replace(/[^0-9]/g, ""));
      if (!phones.length) return toast.error("لا يوجد عملاء بأرقام هواتف");
      setBulkPhones(phones.join("\n"));
      toast.success(`تم استيراد ${phones.length} رقم من العملاء`);
    } catch { toast.error("فشل استيراد الأرقام"); }
    finally { setImportingLeads(false); }
  };

  // ── Template CRUD ──────────────────────────────────────────────────────────────
  const saveTemplate = () => {
    if (!newTpl.name.trim() || !newTpl.body.trim()) return toast.error("أدخل الاسم والنص");
    if (editTplId) {
      setTemplates((t) => t.map((tpl) => tpl.id === editTplId ? { ...tpl, ...newTpl } : tpl));
      setEditTplId(null);
      toast.success("تم تحديث القالب");
    } else {
      setTemplates((t) => [...t, { ...newTpl, id: Date.now().toString(), usedCount: 0 }]);
      toast.success("تم حفظ القالب");
    }
    setNewTpl({ name: "", body: "", starred: false });
  };

  const deleteTemplate = (id) => { setTemplates((t) => t.filter((tpl) => tpl.id !== id)); };
  const toggleStar = (id) => { setTemplates((t) => t.map((tpl) => tpl.id === id ? { ...tpl, starred: !tpl.starred } : tpl)); };
  const useTemplate = (body, dest) => {
    if (dest === "test") setTestMsg(body);
    if (dest === "bulk") { setBulkMsg(body); setActiveTab("bulk"); }
    setTemplates((t) => t.map((tpl) => tpl.body === body ? { ...tpl, usedCount: (tpl.usedCount || 0) + 1 } : tpl));
    toast.success("تم تطبيق القالب");
  };
  const editTemplate = (tpl) => { setNewTpl({ name: tpl.name, body: tpl.body, starred: tpl.starred }); setEditTplId(tpl.id); };

  const filteredTemplates = useMemo(() => {
    let list = templates;
    if (tplSearch) list = list.filter((t) => t.name.includes(tplSearch) || t.body.includes(tplSearch));
    return [...list].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  }, [templates, tplSearch]);

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (logsFilter !== "all") list = list.filter((l) => l.status === logsFilter);
    if (logsSearch) list = list.filter((l) => l.phone?.includes(logsSearch) || l.message?.includes(logsSearch));
    return list;
  }, [logs, logsFilter, logsSearch]);

  const exportLogsCSV = () => {
    if (!logs.length) return toast.error("لا يوجد سجل");
    const rows = [["الرقم", "الرسالة", "الحالة", "التاريخ"], ...logs.map((l) => [l.phone, l.message, l.status, new Date(l.createdAt).toLocaleString("ar-EG")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿"+csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "whatsapp_logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const info = STATUS_INFO[status] || STATUS_INFO.disconnected;

  // ── Computed automation summary ───────────────────────────────────────────────
  const autoSummary = auto ? [
    { label: "استفسار", enabled: auto.newLead?.enabled, desc: auto.newLead?.enabled ? (auto.newLead?.notifyAdmin && auto.newLead?.welcomeClient ? "أدمن + عميل" : auto.newLead?.notifyAdmin ? "إشعار أدمن" : "ترحيب عميل") : "معطّل" },
    { label: "الحجز", enabled: auto.booking?.enabled, desc: auto.booking?.enabled ? "تأكيد الحجز" : "معطّل" },
    { label: "الأقساط", enabled: auto.reminder?.enabled, desc: auto.reminder?.enabled ? `${auto.reminder?.daysBefore || 3}ي مسبقاً` : "معطّل" },
    { label: "الوظائف", enabled: auto.jobApp?.enabled, desc: auto.jobApp?.enabled ? "إشعار أدمن" : "معطّل" },
    { label: "المتابعة", enabled: auto.followUp?.enabled, desc: auto.followUp?.enabled ? `بعد ${auto.followUp?.afterDays || 3}ي` : "معطّل" },
  ] : [];

  const enabledCount = autoSummary.filter((a) => a.enabled).length;

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-3xl mx-auto" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shadow-sm">
          <MessageCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">إدارة الواتساب</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">اتصال • أتومايشن • رسائل جماعية • قوالب • إحصائيات</p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${info.bg} ${info.border} ${info.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${info.dot} animate-pulse`} />
          {info.label}
        </span>
      </div>

      {/* ── Auto summary bar ────────────────────────────────────────────────── */}
      {auto && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">حالة الأتومايشن</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${enabledCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {enabledCount}/{autoSummary.length} مفعّل
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {autoSummary.map((item) => (
              <div key={item.label} onClick={() => setActiveTab("automation")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors ${item.enabled ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-700 text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="font-medium">{item.label}</span>
                <span className="opacity-60 text-[10px]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

          {/* ══════════════════════════════════════════ TAB: CONNECTION */}
          {activeTab === "connection" && (
            <div className="space-y-4">
              {/* Main status card */}
              <div className={`rounded-2xl border p-5 ${info.bg} ${info.border}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${info.bg} border ${info.border}`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className={`font-bold ${info.color}`}>{info.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{statusMessage}</p>
                      {connectedPhone && status === "connected" && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-0.5">📱 {connectedPhone}</p>
                      )}
                      {connectedSince && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          متصل منذ: {connectedSince.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status === "disconnected" && (
                      <button onClick={handleConnect} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                        اتصال
                      </button>
                    )}
                    {(status === "connecting" || status === "qr_ready") && (
                      <button onClick={handleConnect} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-50">
                        <RefreshCw className="w-4 h-4" /> إعادة المحاولة
                      </button>
                    )}
                    {status === "connected" && (
                      <button onClick={handleDisconnect} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-medium transition-colors">
                        <Unplug className="w-4 h-4" /> قطع الاتصال
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick actions when connected */}
              {status === "connected" && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "إرسال رسالة", icon: Send, action: () => setActiveTab("bulk"), color: "text-green-600 bg-green-50 border-green-200" },
                    { label: "اختبار سريع", icon: Phone, action: () => setActiveTab("test"), color: "text-blue-600 bg-blue-50 border-blue-200" },
                    { label: "السجل", icon: History, action: () => setActiveTab("logs"), color: "text-purple-600 bg-purple-50 border-purple-200" },
                  ].map(({ label, icon: Icon, action, color }) => (
                    <button key={label} onClick={action}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${color} hover:opacity-80 transition-opacity`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* QR Code */}
              {qr && status === "qr_ready" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">امسح QR Code بهاتفك</h2>
                  <ol className="text-sm text-gray-500 text-right space-y-1.5 max-w-xs mx-auto">
                    {["افتح واتساب على هاتفك", 'اضغط النقاط الثلاث ← "الأجهزة المرتبطة"', 'اضغط "ربط جهاز"', "وجّه الكاميرا على الصورة أدناه"].map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <div className="flex justify-center">
                    <img src={qr} alt="QR Code" className="w-56 h-56 rounded-xl border-4 border-white shadow-xl" />
                  </div>
                  <p className="text-xs text-gray-400">QR Code صالح لمدة 60 ثانية — يتجدد تلقائياً</p>
                </div>
              )}

              {/* Info box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-1.5">
                <p className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 text-sm"><Info className="w-4 h-4" /> كيف يعمل النظام؟</p>
                {["مجاني 100% — يستخدم واتساب الخاص بك عبر بروتوكول Baileys", "الجلسة تُحفظ في قاعدة البيانات وتُعاد تلقائياً عند إعادة تشغيل الخادم", "استخدم رقم هاتف مخصص للشركة وليس رقمك الشخصي"].map((t, i) => (
                  <p key={i} className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" /> {t}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: AUTOMATION */}
          {activeTab === "automation" && (
            <div className="space-y-4">
              {autoLoading ? (
                <div className="flex items-center justify-center py-16"><Loader className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : !auto ? (
                <div className="text-center py-10 text-gray-500 text-sm"><AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />تعذّر تحميل الإعدادات</div>
              ) : (<>
                {/* 1. New Lead */}
                <SectionCard title="استفسار جديد" icon={Bell} color="blue" badge={auto.newLead?.enabled ? "مفعّل" : null}>
                  <Toggle checked={auto.newLead?.enabled} onChange={(v) => setAutoField("newLead.enabled", v)}
                    label="تفعيل الأتومايشن" desc="إرسال رسائل واتساب تلقائياً عند وصول استفسار جديد" />
                  {auto.newLead?.enabled && (
                    <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Toggle checked={auto.newLead?.notifyAdmin} onChange={(v) => setAutoField("newLead.notifyAdmin", v)} label="إشعار الأدمن" desc="إرسال رسالة لرقم ADMIN_WHATSAPP عند كل استفسار" />
                      <Toggle checked={auto.newLead?.welcomeClient} onChange={(v) => setAutoField("newLead.welcomeClient", v)} label="رسالة ترحيب للعميل" desc="إرسال رسالة ترحيب تلقائية لرقم العميل" />
                      {auto.newLead?.notifyAdmin && <TemplateEditor label="رسالة الأدمن" value={auto.newLead?.adminMsg || ""} onChange={(v) => setAutoField("newLead.adminMsg", v)} vars={["name", "phone", "project", "source"]} />}
                      {auto.newLead?.welcomeClient && <TemplateEditor label="رسالة الترحيب" value={auto.newLead?.clientMsg || ""} onChange={(v) => setAutoField("newLead.clientMsg", v)} vars={["name"]} />}
                    </div>
                  )}
                </SectionCard>

                {/* 2. Booking */}
                <SectionCard title="تأكيد الحجز" icon={CheckCircle} color="green" badge={auto.booking?.enabled ? "مفعّل" : null}>
                  <Toggle checked={auto.booking?.enabled} onChange={(v) => setAutoField("booking.enabled", v)} label="تفعيل الأتومايشن" desc="إرسال رسائل واتساب عند حجز وحدة" />
                  {auto.booking?.enabled && (
                    <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Toggle checked={auto.booking?.notifyAdmin} onChange={(v) => setAutoField("booking.notifyAdmin", v)} label="إشعار الأدمن" desc="إشعار رقم الأدمن عند كل حجز" />
                      <Toggle checked={auto.booking?.notifyClient} onChange={(v) => setAutoField("booking.notifyClient", v)} label="إشعار العميل" desc="إرسال تأكيد الحجز لرقم العميل" />
                      {auto.booking?.notifyAdmin && <TemplateEditor label="رسالة الأدمن" value={auto.booking?.adminMsg || ""} onChange={(v) => setAutoField("booking.adminMsg", v)} vars={["client", "unit", "project", "date"]} />}
                      {auto.booking?.notifyClient && <TemplateEditor label="رسالة العميل" value={auto.booking?.clientMsg || ""} onChange={(v) => setAutoField("booking.clientMsg", v)} vars={["client", "unit", "project"]} />}
                    </div>
                  )}
                </SectionCard>

                {/* 3. Reminders */}
                <SectionCard title="تذكيرات الأقساط" icon={Clock} color="amber" badge={auto.reminder?.enabled ? "مفعّل" : null}>
                  <Toggle checked={auto.reminder?.enabled} onChange={(v) => setAutoField("reminder.enabled", v)} label="تفعيل التذكيرات" desc="يعمل يومياً الساعة 8 صباحاً ويرسل تذكيرات بالأقساط القادمة" />
                  {auto.reminder?.enabled && (
                    <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">عدد أيام التذكير المسبق</label>
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} max={30} value={auto.reminder?.daysBefore || 3}
                            onChange={(e) => setAutoField("reminder.daysBefore", Number(e.target.value))}
                            className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" />
                          <span className="text-sm text-gray-500">يوم قبل الاستحقاق</span>
                        </div>
                      </div>
                      <TemplateEditor label="نص رسالة التذكير" value={auto.reminder?.msg || ""} onChange={(v) => setAutoField("reminder.msg", v)} vars={["name", "amount", "date", "ref"]} />
                    </div>
                  )}
                </SectionCard>

                {/* 4. NEW: Job Application */}
                <SectionCard title="طلب توظيف جديد" icon={BriefcaseBusiness} color="purple" badge={auto.jobApp?.enabled ? "مفعّل" : null} defaultOpen={false}>
                  <Toggle checked={auto.jobApp?.enabled} onChange={(v) => setAutoField("jobApp.enabled", v)} label="إشعار عند طلب توظيف" desc="إرسال رسالة واتساب للأدمن عند وصول طلب توظيف جديد من الموقع" />
                  {auto.jobApp?.enabled && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <TemplateEditor label="رسالة الإشعار" value={auto.jobApp?.adminMsg || ""} onChange={(v) => setAutoField("jobApp.adminMsg", v)} vars={["name", "phone", "position", "email"]} />
                    </div>
                  )}
                </SectionCard>

                {/* 5. NEW: Follow-up */}
                <SectionCard title="متابعة تلقائية" icon={UserCheck} color="rose" badge={auto.followUp?.enabled ? "مفعّل" : null} defaultOpen={false}>
                  <Toggle checked={auto.followUp?.enabled} onChange={(v) => setAutoField("followUp.enabled", v)} label="تفعيل المتابعة التلقائية" desc="يرسل رسالة متابعة للعملاء الذين لم يُرد عليهم بعد عدد أيام محدد" />
                  {auto.followUp?.enabled && (
                    <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">بعد كم يوم؟</label>
                          <input type="number" min={1} max={30} value={auto.followUp?.afterDays || 3}
                            onChange={(e) => setAutoField("followUp.afterDays", Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">أقصى عدد مرات</label>
                          <input type="number" min={1} max={5} value={auto.followUp?.maxTimes || 2}
                            onChange={(e) => setAutoField("followUp.maxTimes", Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400" />
                        </div>
                      </div>
                      <TemplateEditor label="نص رسالة المتابعة" value={auto.followUp?.msg || ""} onChange={(v) => setAutoField("followUp.msg", v)} vars={["name", "project"]} />
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                        <Info className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-400">يُرسل للعملاء الجدد الذين حالتهم "جديد" ولم يتم تغييرها بعد {auto.followUp?.afterDays || 3} أيام.</p>
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="flex justify-end">
                  <button onClick={saveAuto} disabled={autoSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#24507a] text-white text-sm font-medium transition-colors disabled:opacity-50">
                    {autoSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ الإعدادات
                  </button>
                </div>
              </>)}
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: BULK */}
          {activeTab === "bulk" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#2d5d89]" /> إرسال رسائل جماعية
                </h3>

                {/* Phone numbers */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      أرقام الهواتف
                      <span className="text-xs text-gray-400 font-normal mr-2">({bulkPhones.split(/[\n,،]+/).filter(p=>p.trim()).length} رقم)</span>
                    </label>
                    <button onClick={importLeadsPhones} disabled={importingLeads}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2d5d89]/10 text-[#2d5d89] hover:bg-[#2d5d89]/20 transition-colors font-medium disabled:opacity-50">
                      {importingLeads ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      استيراد من العملاء
                    </button>
                  </div>
                  <textarea value={bulkPhones} onChange={(e) => setBulkPhones(e.target.value)} rows={4}
                    placeholder={"201012345678\n201098765432\n..."}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" dir="ltr" />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نص الرسالة</label>
                    {templates.length > 0 && (
                      <select value={bulkTemplate}
                        onChange={(e) => { setBulkTemplate(e.target.value); if (e.target.value) setBulkMsg(e.target.value); }}
                        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none max-w-[160px]">
                        <option value="">اختر قالب...</option>
                        {templates.map((t) => <option key={t.id} value={t.body}>{t.name}</option>)}
                      </select>
                    )}
                  </div>
                  <textarea value={bulkMsg} onChange={(e) => setBulkMsg(e.target.value)} rows={4}
                    placeholder="اكتب نص رسالتك هنا..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" dir="rtl" />
                  <p className="text-xs text-gray-400 mt-1">{bulkMsg.length} حرف</p>
                </div>

                {/* Delay */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">التأخير بين الرسائل</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBulkDelay(d => Math.max(1, d-1))} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">−</button>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-center">{bulkDelay} ث</span>
                    <button onClick={() => setBulkDelay(d => Math.min(30, d+1))} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">+</button>
                  </div>
                </div>

                {/* ETA */}
                {bulkPhones.split(/[\n,،]+/).filter(p=>p.trim()).length > 0 && (
                  <div className="text-xs text-center text-gray-500">
                    {(() => { const n = bulkPhones.split(/[\n,،]+/).filter(p=>p.trim()).length; const s = n*bulkDelay; return `وقت الإرسال المتوقع: ~${s<60?`${s}ث`:`${Math.ceil(s/60)} دقيقة`} لـ ${n} رسالة`; })()}
                  </div>
                )}

                {/* Progress */}
                {bulkSending && bulkProgress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>جارٍ الإرسال...</span>
                      <span>{bulkProgress.sent} / {bulkProgress.total}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(bulkProgress.sent/bulkProgress.total)*100}%` }} />
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">الإرسال على التوالي بتأخير {bulkDelay}ث بين كل رسالة لتجنب الحظر. يجب الاتصال بالواتساب أولاً.</p>
                </div>

                <button onClick={handleBulk} disabled={bulkSending || status !== "connected"}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {bulkSending ? <><Loader className="w-4 h-4 animate-spin" /> جارٍ الإرسال...</> : <><Send className="w-4 h-4" /> إرسال ({bulkPhones.split(/[\n,،]+/).filter(p=>p.trim()).length} رسالة)</>}
                </button>
                {status !== "connected" && <p className="text-center text-xs text-red-500">يجب الاتصال بالواتساب أولاً من تبويب "الاتصال"</p>}
              </div>

              {/* Result */}
              {bulkResult && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">نتيجة الإرسال</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "تم الإرسال", val: bulkResult.sent, color: "text-green-600 bg-green-50 border-green-200" },
                      { label: "فشل", val: bulkResult.failed, color: "text-red-600 bg-red-50 border-red-200" },
                      { label: "غير متصل", val: bulkResult.offline, color: "text-amber-600 bg-amber-50 border-amber-200" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className={`text-center p-3 rounded-xl border ${color}`}>
                        <p className="text-2xl font-bold">{val ?? 0}</p>
                        <p className="text-xs mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              {/* New / Edit template form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2d5d89]" />
                  {editTplId ? "تعديل القالب" : "إضافة قالب جديد"}
                </h3>
                <input value={newTpl.name} onChange={(e) => setNewTpl(n => ({...n, name: e.target.value}))}
                  placeholder="اسم القالب (مثال: ترحيب عميل)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-gray-900 dark:text-white" />
                <textarea value={newTpl.body} onChange={(e) => setNewTpl(n => ({...n, body: e.target.value}))} rows={4}
                  placeholder={"مرحباً {name}،\nشكراً لتواصلك مع الصرح للتطوير العقاري 🏢\nسيتواصل معك فريقنا قريباً."}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-gray-900 dark:text-white resize-none" dir="rtl" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={newTpl.starred} onChange={(e) => setNewTpl(n => ({...n, starred: e.target.checked}))} className="w-4 h-4 rounded accent-amber-500" />
                    تمييز بنجمة ⭐
                  </label>
                  <div className="flex gap-2">
                    {editTplId && (
                      <button onClick={() => { setEditTplId(null); setNewTpl({ name: "", body: "", starred: false }); }}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        إلغاء
                      </button>
                    )}
                    <button onClick={saveTemplate}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors">
                      <Save className="w-3.5 h-3.5" /> {editTplId ? "تحديث" : "حفظ القالب"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Templates list */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input value={tplSearch} onChange={(e) => setTplSearch(e.target.value)} placeholder="بحث في القوالب..."
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 text-gray-900 dark:text-white" />
                  </div>
                  <span className="text-xs text-gray-400">{filteredTemplates.length} قالب</span>
                </div>

                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{templates.length === 0 ? "لا يوجد قوالب بعد — أضف قالبك الأول أعلاه" : "لا نتائج"}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {filteredTemplates.map((tpl) => (
                      <div key={tpl.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {tpl.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tpl.name}</p>
                              {tpl.usedCount > 0 && <span className="text-[10px] text-gray-400">استُخدم {tpl.usedCount}×</span>}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-mono whitespace-pre-line">{tpl.body}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => toggleStar(tpl.id)} title={tpl.starred ? "إزالة التمييز" : "تمييز"}
                              className="w-7 h-7 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center transition-colors">
                              {tpl.starred ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                            <button onClick={() => editTemplate(tpl)} title="تعديل"
                              className="w-7 h-7 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 flex items-center justify-center transition-colors">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => useTemplate(tpl.body, "test")} title="استخدام في الاختبار"
                              className="w-7 h-7 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 flex items-center justify-center transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => useTemplate(tpl.body, "bulk")} title="استخدام في الجماعي"
                              className="w-7 h-7 rounded-lg hover:bg-[#2d5d89]/10 text-[#2d5d89] flex items-center justify-center transition-colors">
                              <Users className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteTemplate(tpl.id)} title="حذف"
                              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 flex items-center justify-center transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {[{ key:"all", label:"الكل" }, { key:"sent", label:"تم" }, { key:"failed", label:"فشل" }].map(({ key, label }) => (
                    <button key={key} onClick={() => setLogsFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${logsFilter===key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input value={logsSearch} onChange={(e) => setLogsSearch(e.target.value)} placeholder="بحث بالرقم أو الرسالة..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30 text-gray-900 dark:text-white" />
                </div>
                <button onClick={exportLogsCSV}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-3.5 h-3.5" /> تصدير CSV
                </button>
                <button onClick={loadLogs}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> تحديث
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{logs.length === 0 ? "لا يوجد سجل رسائل بعد" : "لا نتائج للفلتر المحدد"}</p>
                    {logs.length === 0 && <p className="text-xs mt-1 text-gray-400">سيُسجَّل هنا كل رسالة مُرسَلة عبر النظام</p>}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {filteredLogs.map((log, i) => (
                      <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.status === "sent" ? "bg-green-500" : "bg-red-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{log.phone}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{log.message}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${log.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {log.status === "sent" ? "تم" : "فشل"}
                          </span>
                          {log.createdAt && <p className="text-[10px] text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
                          {log.type && <p className="text-[10px] text-gray-400">{log.type}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: STATS */}
          {activeTab === "stats" && (
            <div className="space-y-4">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12"><Loader className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard label="رسائل اليوم" value={statsData?.today ?? "—"} sub="إجمالي الإرسال" color="green" icon={Send} />
                    <StatCard label="هذا الأسبوع" value={statsData?.week ?? "—"} sub="آخر 7 أيام" color="blue" icon={Calendar} />
                    <StatCard label="هذا الشهر" value={statsData?.month ?? "—"} sub="آخر 30 يوم" color="purple" icon={BarChart2} />
                    <StatCard label="إجمالي الإرسال" value={statsData?.total ?? "—"} sub="منذ البداية" color="amber" icon={MessageCircle} />
                    <StatCard label="فشل الإرسال" value={statsData?.failed ?? "—"} sub="إجمالي الفشل" color="rose" icon={AlertCircle} />
                    <StatCard label="القوالب المحفوظة" value={templates.length} sub="قابلة للاستخدام" color="blue" icon={FileText} />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> حالة الأتومايشن
                    </h3>
                    {auto ? (
                      <div className="space-y-2">
                        {autoSummary.map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{item.desc}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {item.enabled ? "مفعّل" : "معطّل"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        <button onClick={() => setActiveTab("automation")} className="text-[#2d5d89] hover:underline">افتح تبويب الأتومايشن</button> لتحميل الإعدادات
                      </p>
                    )}
                  </div>

                  {!statsData && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      الإحصائيات التفصيلية تحتاج endpoint <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">/api/whatsapp/stats</span> في الخادم.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════ TAB: TEST (implicit — hidden in TABS but kept for old ref) */}
          {/* Moved test into connection tab quick action. Keeping as hidden fallback. */}
          {activeTab === "test" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" /> إرسال رسالة اختبار
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">رقم الهاتف</label>
                  <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="201012345678"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" dir="ltr" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نص الرسالة</label>
                    {templates.length > 0 && (
                      <select value={testTemplate}
                        onChange={(e) => { setTestTemplate(e.target.value); if (e.target.value) setTestMsg(e.target.value); }}
                        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none max-w-[140px]">
                        <option value="">اختر قالب...</option>
                        {templates.map((t) => <option key={t.id} value={t.body}>{t.name}</option>)}
                      </select>
                    )}
                  </div>
                  <textarea value={testMsg} onChange={(e) => setTestMsg(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" dir="rtl" />
                  <p className="text-xs text-gray-400 mt-1">{testMsg.length} حرف</p>
                </div>
                <button onClick={handleTest} disabled={sending || status !== "connected"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  إرسال اختبار
                </button>
                {status !== "connected" && <p className="text-xs text-red-500">يجب الاتصال بالواتساب أولاً</p>}
              </div>

              {/* Local test log */}
              {testLog.length > 0 && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">سجل الاختبار المحلي</p>
                  <div className="space-y-2">
                    {testLog.map((entry, i) => (
                      <div key={i} className={`flex items-center gap-3 text-xs p-2 rounded-lg ${entry.ok ? "bg-green-50 dark:bg-green-900/20 text-green-700" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}>
                        <span className="font-mono">{entry.phone}</span>
                        <span className="flex-1 truncate opacity-70">{entry.msg}</span>
                        <span className="flex-shrink-0">{entry.ok ? "✅" : "❌"}</span>
                        <span className="flex-shrink-0 opacity-50">{entry.time.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
