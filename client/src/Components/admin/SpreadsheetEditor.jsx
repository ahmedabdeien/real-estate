/**
 * SpreadsheetEditor — wrapper with two modes:
 *   1. "جداول محلية"  → Handsontable (lazy-loaded, works offline, supports formulas + Excel import/export)
 *   2. "Google Sheets" → iframe embed of a linked Google Sheet
 */
import { useState, lazy, Suspense } from "react";
import { ExternalLink, Link2, X, Grid3x3, Globe } from "lucide-react";
import { useToast } from "../../context/ToastContext";

// Lazy-load Handsontable — heavy (~1.5 MB), only needed when table mode is active
const HansoEditor = lazy(() => import("./HansoEditor"));

// ─── Google Sheets Pane ────────────────────────────────────────────────────────
function GoogleSheetsPane({ storageKey }) {
  const [url, setUrl] = useState(() => localStorage.getItem(`${storageKey}_gsurl`) || "");
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(!url);
  const toast = useToast();

  const buildEmbedUrl = (raw) => {
    if (!raw) return "";
    try {
      const u = new URL(raw.trim());
      const match = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
      if (!match) return raw;
      const id = match[1];
      const gid = u.hash.match(/gid=(\d+)/)?.[1] || "0";
      return `https://docs.google.com/spreadsheets/d/${id}/htmlview?usp=sharing&gid=${gid}&embedded=true`;
    } catch {
      return raw;
    }
  };

  const save = () => {
    if (!input.trim()) { toast.error("أدخل رابط Google Sheets أولاً"); return; }
    localStorage.setItem(`${storageKey}_gsurl`, input.trim());
    setUrl(input.trim());
    setEditing(false);
  };

  const clear = () => {
    localStorage.removeItem(`${storageKey}_gsurl`);
    setUrl(""); setInput(""); setEditing(true);
  };

  if (editing) {
    return (
      <div className="flex flex-col items-center justify-center h-[62vh] gap-6 p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ربط Google Sheets</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            افتح ملف Google Sheets الخاص بك، انسخ الرابط من شريط العنوان والصقه أدناه
          </p>
        </div>
        <div className="w-full max-w-md space-y-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-left"
            dir="ltr"
          />
          <button
            onClick={save}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            ربط الملف
          </button>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-medium">كيف تربط الملف؟</p>
            <p>١. افتح Google Sheets → مشاركة → انسخ الرابط</p>
            <p>٢. أو: ملف → مشاركة → نشر على الويب → انسخ رابط الويب</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[62vh]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 overflow-hidden">
          <Globe className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <span className="text-xs text-green-700 truncate">{url}</span>
        </div>
        <button onClick={() => { setInput(url); setEditing(true); }} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors" title="تغيير الرابط">
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors" title="فتح في Google Sheets">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button onClick={clear} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400 transition-colors" title="إلغاء الربط">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <iframe
        src={buildEmbedUrl(url)}
        className="flex-1 w-full rounded-xl border border-gray-200"
        title="Google Sheets"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SpreadsheetEditor({ cols, rows, sheetId }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(`${sheetId}_spreadsheet_mode`) || "hanso"
  );

  const switchMode = (m) => {
    setMode(m);
    localStorage.setItem(`${sheetId}_spreadsheet_mode`, m);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => switchMode("hanso")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "hanso" ? "bg-white text-[#2d5d89] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          جداول محلية
        </button>
        <button
          onClick={() => switchMode("google")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "google" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Google Sheets
        </button>
      </div>

      {mode === "google" ? (
        <GoogleSheetsPane storageKey={sheetId} />
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[60vh] rounded-xl border border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">جاري تحميل محرر الجداول...</p>
            </div>
          </div>
        }>
          <HansoEditor cols={cols} rows={rows} storageKey={sheetId} />
        </Suspense>
      )}
    </div>
  );
}
