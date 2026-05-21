import { useEffect, useState, useRef } from "react";
import { MessageCircle, Wifi, WifiOff, RefreshCw, Send, Unplug, CheckCircle, Loader } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const STATUS_INFO = {
  connected:    { color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800",  icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: "متصل ✅" },
  qr_ready:     { color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",     icon: <Loader className="w-5 h-5 text-blue-500 animate-spin" />, label: "في انتظار مسح QR" },
  connecting:   { color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-800",   icon: <Loader className="w-5 h-5 text-amber-500 animate-spin" />, label: "جارٍ الاتصال..." },
  disconnected: { color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800",       icon: <WifiOff className="w-5 h-5 text-red-500" />, label: "غير متصل" },
};

export default function AdminWhatsApp() {
  const toast = useToast();
  const [status, setStatus]             = useState("disconnected");
  const [statusMessage, setStatusMessage] = useState("جارٍ التحقق...");
  const [qr, setQr]                     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [testPhone, setTestPhone]       = useState("");
  const [testMsg, setTestMsg]           = useState("🏢 اختبار إشعار من الصرح للتطوير العقاري ✅");
  const [sending, setSending]           = useState(false);
  const esRef = useRef(null);

  // ─── Server-Sent Events ──────────────────────────────────────────────────
  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1] ||
                  localStorage.getItem("token") || "";

    const connectSSE = () => {
      if (esRef.current) esRef.current.close();
      const url = `${import.meta.env.VITE_API_URL || ""}/api/whatsapp/events`;
      // SSE with cookie auth (credentials included)
      esRef.current = new EventSource(url, { withCredentials: true });

      esRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setStatus(data.status);
          setStatusMessage(data.statusMessage || "");
          setQr(data.qr || null);
        } catch {}
      };
      esRef.current.onerror = () => {
        esRef.current?.close();
        setTimeout(connectSSE, 5000);
      };
    };

    // Initial fetch
    api.get("/whatsapp/status").then((r) => {
      setStatus(r.data.status);
      setStatusMessage(r.data.statusMessage);
      setQr(r.data.qr || null);
    }).catch(() => {});

    connectSSE();
    return () => esRef.current?.close();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await api.post("/whatsapp/connect");
      toast.success("جارٍ الاتصال، انتظر QR Code...");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الاتصال");
    } finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm("تأكيد قطع الاتصال بالواتساب؟")) return;
    setLoading(true);
    try {
      await api.post("/whatsapp/disconnect");
      toast.success("تم قطع الاتصال");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل");
    } finally { setLoading(false); }
  };

  const handleTest = async () => {
    if (!testPhone) return toast.error("أدخل رقم الهاتف");
    setSending(true);
    try {
      await api.post("/whatsapp/test", { phone: testPhone, message: testMsg });
      toast.success("تم إرسال الرسالة بنجاح ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الإرسال");
    } finally { setSending(false); }
  };

  const info = STATUS_INFO[status] || STATUS_INFO.disconnected;

  return (
    <div className="space-y-6 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">إعداد الواتساب</h1>
          <p className="text-sm text-gray-500">إرسال إشعارات تلقائية مجانية عبر الواتساب</p>
        </div>
      </div>

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
          <ol className="text-sm text-gray-500 text-right space-y-1 max-w-xs mx-auto">
            <li>1. افتح واتساب على هاتفك</li>
            <li>2. اضغط على النقاط الثلاث ← الأجهزة المرتبطة</li>
            <li>3. اضغط "ربط جهاز"</li>
            <li>4. وجّه الكاميرا على الصورة أدناه</li>
          </ol>
          <div className="flex justify-center">
            <img src={qr} alt="QR Code" className="w-56 h-56 rounded-xl border-4 border-white shadow-lg" />
          </div>
          <p className="text-xs text-gray-400">QR Code صالح لمدة 60 ثانية — يتجدد تلقائياً</p>
        </div>
      )}

      {/* Test Message */}
      {status === "connected" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">اختبار الإرسال</h2>
          <div className="space-y-3">
            <input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="رقم الهاتف (مثال: 201012345678)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              dir="ltr"
            />
            <textarea
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={handleTest} disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
              {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إرسال اختبار
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-800 dark:text-blue-300 space-y-1">
        <p className="font-semibold">📱 كيف تعمل؟</p>
        <p>• مجاني 100% — يستخدم واتساب الخاص بك</p>
        <p>• الإشعارات تُرسل تلقائياً عند: استفسار جديد، حجز وحدة، عقد جديد</p>
        <p>• الاتصال يُحفظ تلقائياً ويُعاد عند إعادة تشغيل الخادم</p>
        <p>• استخدم رقم هاتف مخصص للشركة وليس رقمك الشخصي</p>
      </div>
    </div>
  );
}
