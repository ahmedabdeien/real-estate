import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageCircle, Wifi, WifiOff, RefreshCw, Send, Unplug,
  CheckCircle, Loader, Settings, Zap, Users, Bell, ChevronDown,
  ChevronUp, Save, AlertCircle, Info, Phone, FileText, Clock,
  ToggleLeft, ToggleRight, Plus, Trash2, Copy, Check,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_INFO = {
  connected:    { color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800",  icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: "متصل" },
  qr_ready:     { color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",     icon: <Loader className="w-5 h-5 text-blue-500 animate-spin" />, label: "في انتظار مسح QR" },
  connecting:   { color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-800",   icon: <Loader className="w-5 h-5 text-amber-500 animate-spin" />, label: "جارٍ الاتصال..." },
  disconnected: { color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800",       icon: <WifiOff className="w-5 h-5 text-red-500" />, label: "غير متصل" },
};

const TABS = [
  { id: "connection", label: "الاتصال",     icon: Wifi },
  { id: "automation", label: "الأتومايشن",  icon: Zap },
  { id: "bulk",       label: "رسائل جماعية", icon: Users },
  { id: "test",       label: "اختبار",      icon: Send },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ─── Template Editor ──────────────────────────────────────────────────────────
function TemplateEditor({ label, value, onChange, vars = [] }) {
  const [copied, setCopied] = useState(false);
  const insertVar = (v) => onChange(value + `{${v}}`);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <div className="flex items-center gap-1.5">
          {vars.map((v) => (
            <button key={v} onClick={() => insertVar(v)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 font-mono">
              {`{${v}}`}
            </button>
          ))}
          <button onClick={copy} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
        dir="rtl"
      />
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = "blue", children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
    green:  "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    amber:  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminWhatsApp() {
  const toast = useToast();

  // Connection state
  const [status, setStatus]               = useState("disconnected");
  const [statusMessage, setStatusMessage] = useState("جارٍ التحقق...");
  const [qr, setQr]                       = useState(null);
  const [loading, setLoading]             = useState(false);
  const esRef = useRef(null);

  // UI
  const [activeTab, setActiveTab] = useState("connection");

  // Test
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg]     = useState("اختبار إشعار من الصرح للتطوير العقاري");
  const [sending, setSending]     = useState(false);

  // Automation
  const [auto, setAuto]           = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoSaving, setAutoSaving]   = useState(false);

  // Bulk
  const [bulkMsg, setBulkMsg]     = useState("");
  const [bulkPhones, setBulkPhones] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // ── SSE connection ──────────────────────────────────────────────────────────
  useEffect(() => {
    const connectSSE = () => {
      if (esRef.current) esRef.current.close();
      const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");
      esRef.current = new EventSource(`${apiBase}/api/whatsapp/events`, { withCredentials: true });
      esRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setStatus(data.status);
          setStatusMessage(data.statusMessage || "");
          setQr(data.qr || null);
        } catch {}
      };
      esRef.current.onerror = () => { esRef.current?.close(); setTimeout(connectSSE, 5000); };
    };
    api.get("/whatsapp/status").then((r) => {
      setStatus(r.data.status); setStatusMessage(r.data.statusMessage); setQr(r.data.qr || null);
    }).catch(() => {});
    connectSSE();
    return () => esRef.current?.close();
  }, []);

  // ── Load automation settings ────────────────────────────────────────────────
  const loadAuto = useCallback(async () => {
    setAutoLoading(true);
    try {
      const r = await api.get("/whatsapp/automation");
      setAuto(r.data.settings);
    } catch { toast.error("فشل تحميل إعدادات الأتومايشن"); }
    finally { setAutoLoading(false); }
  }, [toast]);

  useEffect(() => { if (activeTab === "automation") loadAuto(); }, [activeTab, loadAuto]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
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
    try {
      await api.put("/whatsapp/automation", { settings: auto });
      toast.success("تم حفظ إعدادات الأتومايشن");
    } catch { toast.error("فشل الحفظ"); }
    finally { setAutoSaving(false); }
  };

  const handleConnect    = async () => { setLoading(true); try { await api.post("/whatsapp/connect"); toast.success("جارٍ الاتصال، انتظر QR Code..."); } catch (err) { toast.error(err.response?.data?.message || "فشل الاتصال"); } finally { setLoading(false); } };
  const handleDisconnect = async () => { if (!confirm("تأكيد قطع الاتصال؟")) return; setLoading(true); try { await api.post("/whatsapp/disconnect"); toast.success("تم قطع الاتصال"); } catch (err) { toast.error(err.response?.data?.message || "فشل"); } finally { setLoading(false); } };
  const handleTest       = async () => { if (!testPhone) return toast.error("أدخل رقم الهاتف"); setSending(true); try { await api.post("/whatsapp/test", { phone: testPhone, message: testMsg }); toast.success("تم إرسال الرسالة بنجاح"); } catch (err) { toast.error(err.response?.data?.message || "فشل الإرسال"); } finally { setSending(false); } };

  const handleBulk = async () => {
    const phones = bulkPhones.split(/[\n,،]+/).map((p) => p.trim()).filter(Boolean);
    if (!phones.length) return toast.error("أدخل أرقام الهواتف");
    if (!bulkMsg.trim()) return toast.error("أدخل نص الرسالة");
    setBulkSending(true); setBulkResult(null);
    try {
      const r = await api.post("/whatsapp/bulk", { phones, message: bulkMsg });
      setBulkResult(r.data.results);
      toast.success(`تم الإرسال: ${r.data.results.sent} رسالة`);
    } catch (err) { toast.error(err.response?.data?.message || "فشل الإرسال جماعي"); }
    finally { setBulkSending(false); }
  };

  const info = STATUS_INFO[status] || STATUS_INFO.disconnected;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">الواتساب</h1>
          <p className="text-sm text-gray-500">إدارة الاتصال والإشعارات التلقائية</p>
        </div>
        {/* Connection badge */}
        <span className={`mr-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${info.bg} ${info.border} ${info.color}`}>
          {info.icon}
          {info.label}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Connection ─────────────────────────────────────────────────── */}
      {activeTab === "connection" && (
        <div className="space-y-4">
          {/* Status Card */}
          <div className={`rounded-2xl border p-5 ${info.bg} ${info.border}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {info.icon}
                <div>
                  <p className={`font-bold text-base ${info.color}`}>{info.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>
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
                    <RefreshCw className="w-4 h-4" />
                    إعادة المحاولة
                  </button>
                )}
                {status === "connected" && (
                  <button onClick={handleDisconnect} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-medium transition-colors">
                    <Unplug className="w-4 h-4" />
                    قطع الاتصال
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qr && status === "qr_ready" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">امسح QR Code بهاتفك</h2>
              <ol className="text-sm text-gray-500 text-right space-y-1 max-w-xs mx-auto list-decimal list-inside">
                <li>افتح واتساب على هاتفك</li>
                <li>اضغط على النقاط الثلاث ← الأجهزة المرتبطة</li>
                <li>اضغط "ربط جهاز"</li>
                <li>وجّه الكاميرا على الصورة أدناه</li>
              </ol>
              <div className="flex justify-center">
                <img src={qr} alt="QR Code" className="w-56 h-56 rounded-xl border-4 border-white shadow-lg" />
              </div>
              <p className="text-xs text-gray-400">QR Code صالح لمدة 60 ثانية — يتجدد تلقائياً</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-800 dark:text-blue-300 space-y-1.5">
            <p className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> كيف يعمل النظام؟</p>
            <p>مجاني 100% — يستخدم واتساب الخاص بك عبر بروتوكول Baileys</p>
            <p>الجلسة تُحفظ في قاعدة البيانات وتُعاد تلقائياً عند إعادة تشغيل الخادم</p>
            <p>استخدم رقم هاتف مخصص للشركة وليس رقمك الشخصي</p>
            <p>تأكد من ضبط متغير البيئة <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">ADMIN_WHATSAPP</span> برقم الأدمن (مثال: 201012345678)</p>
          </div>
        </div>
      )}

      {/* ── TAB: Automation ──────────────────────────────────────────────────── */}
      {activeTab === "automation" && (
        <div className="space-y-4">
          {autoLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : !auto ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              تعذّر تحميل الإعدادات
            </div>
          ) : (
            <>
              {/* New Lead */}
              <SectionCard title="استفسار جديد" icon={Bell} color="blue">
                <Toggle checked={auto.newLead?.enabled} onChange={(v) => setAutoField("newLead.enabled", v)}
                  label="تفعيل الأتومايشن" desc="إرسال رسائل واتساب تلقائياً عند وصول استفسار جديد" />
                {auto.newLead?.enabled && (
                  <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Toggle checked={auto.newLead?.notifyAdmin} onChange={(v) => setAutoField("newLead.notifyAdmin", v)}
                      label="إشعار الأدمن" desc="إرسال رسالة لرقم ADMIN_WHATSAPP عند كل استفسار" />
                    <Toggle checked={auto.newLead?.welcomeClient} onChange={(v) => setAutoField("newLead.welcomeClient", v)}
                      label="رسالة ترحيب للعميل" desc="إرسال رسالة ترحيب تلقائية لرقم العميل" />
                    {auto.newLead?.notifyAdmin && (
                      <TemplateEditor label="نص رسالة الأدمن" value={auto.newLead?.adminMsg || ""}
                        onChange={(v) => setAutoField("newLead.adminMsg", v)}
                        vars={["name", "phone", "project"]} />
                    )}
                    {auto.newLead?.welcomeClient && (
                      <TemplateEditor label="نص رسالة الترحيب" value={auto.newLead?.clientMsg || ""}
                        onChange={(v) => setAutoField("newLead.clientMsg", v)}
                        vars={["name"]} />
                    )}
                  </div>
                )}
              </SectionCard>

              {/* Booking */}
              <SectionCard title="تأكيد الحجز" icon={CheckCircle} color="green">
                <Toggle checked={auto.booking?.enabled} onChange={(v) => setAutoField("booking.enabled", v)}
                  label="تفعيل الأتومايشن" desc="إرسال رسائل واتساب عند حجز وحدة" />
                {auto.booking?.enabled && (
                  <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Toggle checked={auto.booking?.notifyAdmin} onChange={(v) => setAutoField("booking.notifyAdmin", v)}
                      label="إشعار الأدمن" desc="إشعار رقم الأدمن عند كل حجز" />
                    <Toggle checked={auto.booking?.notifyClient} onChange={(v) => setAutoField("booking.notifyClient", v)}
                      label="إشعار العميل" desc="إرسال تأكيد الحجز لرقم العميل" />
                    {auto.booking?.notifyAdmin && (
                      <TemplateEditor label="نص رسالة الأدمن" value={auto.booking?.adminMsg || ""}
                        onChange={(v) => setAutoField("booking.adminMsg", v)}
                        vars={["client", "unit", "project"]} />
                    )}
                    {auto.booking?.notifyClient && (
                      <TemplateEditor label="نص رسالة العميل" value={auto.booking?.clientMsg || ""}
                        onChange={(v) => setAutoField("booking.clientMsg", v)}
                        vars={["client", "unit", "project"]} />
                    )}
                  </div>
                )}
              </SectionCard>

              {/* Reminders */}
              <SectionCard title="تذكيرات الأقساط" icon={Clock} color="amber">
                <Toggle checked={auto.reminder?.enabled} onChange={(v) => setAutoField("reminder.enabled", v)}
                  label="تفعيل التذكيرات التلقائية" desc="يعمل يومياً الساعة 8 صباحاً ويرسل تذكيرات بالأقساط القادمة" />
                {auto.reminder?.enabled && (
                  <div className="space-y-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                        عدد أيام التذكير المسبق
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} max={30}
                          value={auto.reminder?.daysBefore || 3}
                          onChange={(e) => setAutoField("reminder.daysBefore", Number(e.target.value))}
                          className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-500">يوم قبل الاستحقاق</span>
                      </div>
                    </div>
                    <TemplateEditor label="نص رسالة التذكير" value={auto.reminder?.msg || ""}
                      onChange={(v) => setAutoField("reminder.msg", v)}
                      vars={["name", "amount", "date", "ref"]} />
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        يبحث التذكير في سجلات المشتريات عن الدفعات المستحقة خلال الأيام المحددة ويرسل رسالة لرقم المورد.
                      </p>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Save */}
              <div className="flex justify-end">
                <button onClick={saveAuto} disabled={autoSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#24507a] text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {autoSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ الإعدادات
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Bulk ───────────────────────────────────────────────────────── */}
      {activeTab === "bulk" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                أرقام الهواتف
                <span className="text-xs text-gray-400 font-normal mr-2">افصل بينها بسطر جديد أو فاصلة</span>
              </label>
              <textarea
                value={bulkPhones}
                onChange={(e) => setBulkPhones(e.target.value)}
                rows={5}
                placeholder={"201012345678\n201098765432\n201111111111"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">
                {bulkPhones.split(/[\n,،]+/).filter((p) => p.trim()).length} رقم محدد
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">نص الرسالة</label>
              <textarea
                value={bulkMsg}
                onChange={(e) => setBulkMsg(e.target.value)}
                rows={4}
                placeholder="اكتب الرسالة هنا..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
              <p className="text-xs text-gray-400 mt-1">{bulkMsg.length} حرف</p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                الإرسال الجماعي قد يستغرق بعض الوقت. يوجد تأخير 2.5 ثانية بين كل رسالة لتجنب الحظر.
                يجب أن يكون الواتساب متصلاً.
              </p>
            </div>

            <button onClick={handleBulk} disabled={bulkSending || status !== "connected"}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {bulkSending ? (
                <><Loader className="w-4 h-4 animate-spin" /> جارٍ الإرسال...</>
              ) : (
                <><Send className="w-4 h-4" /> إرسال للجميع</>
              )}
            </button>

            {status !== "connected" && (
              <p className="text-center text-xs text-red-500">
                يجب الاتصال بالواتساب أولاً من تبويب "الاتصال"
              </p>
            )}
          </div>

          {/* Bulk Result */}
          {bulkResult && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">نتيجة الإرسال</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600">{bulkResult.sent}</p>
                  <p className="text-xs text-green-600 mt-1">تم الإرسال</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-2xl font-bold text-red-600">{bulkResult.failed}</p>
                  <p className="text-xs text-red-600 mt-1">فشل</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-2xl font-bold text-amber-600">{bulkResult.offline}</p>
                  <p className="text-xs text-amber-600 mt-1">لم يُرسل (غير متصل)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Test ───────────────────────────────────────────────────────── */}
      {activeTab === "test" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <p className="text-sm text-gray-500">اختبر الاتصال بإرسال رسالة تجريبية</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">رقم الهاتف</label>
              <input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="201012345678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">نص الرسالة</label>
              <textarea
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button onClick={handleTest} disabled={sending || status !== "connected"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إرسال اختبار
            </button>
            {status !== "connected" && (
              <p className="text-xs text-red-500">يجب الاتصال بالواتساب أولاً</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
