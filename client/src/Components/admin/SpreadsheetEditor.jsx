/**
 * SpreadsheetEditor — wrapper
 * Tab 1: جداول محلية  → HansoEditor (Handsontable, works offline, all file formats)
 * Tab 2: Google Sheets → iframe embed
 */
import { useState, lazy, Suspense } from "react";
import { ExternalLink, Link2, X, Grid3x3, Globe } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const HansoEditor = lazy(() => import("./HansoEditor"));

// ─── Google Sheets Pane ───────────────────────────────────────────────────────
function GoogleSheetsPane({ storageKey }) {
  const [url, setUrl]     = useState(() => localStorage.getItem(`${storageKey}_gsurl`) || "");
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(!url);
  const toast = useToast();

  const buildEmbedUrl = (raw) => {
    if (!raw) return "";
    try {
      const u   = new URL(raw.trim());
      const m   = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
      if (!m) return raw;
      const gid = u.hash.match(/gid=(\d+)/)?.[1] || "0";
      return `https://docs.google.com/spreadsheets/d/${m[1]}/htmlview?usp=sharing&gid=${gid}&embedded=true`;
    } catch { return raw; }
  };

  const save = () => {
    if (!input.trim()) { toast.error("أدخل رابط Google Sheets أولاً"); return; }
    localStorage.setItem(`${storageKey}_gsurl`, input.trim());
    setUrl(input.trim()); setEditing(false);
  };

  if (editing) return (
    <div className="flex flex-col items-center justify-center h-[62vh] gap-6 p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">ربط Google Sheets</h3>
        <p className="text-sm text-gray-500 max-w-sm">انسخ رابط ملف Google Sheets والصقه أدناه</p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          dir="ltr"
        />
        <button onClick={save} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm">
          ربط الملف
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[62vh]">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 overflow-hidden flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          <span className="text-xs text-green-700 truncate">{url}</span>
        </div>
        <button onClick={() => { setInput(url); setEditing(true); }} className="p-1.5 rounded-lg border hover:bg-gray-50"><Link2 className="w-3.5 h-3.5" /></button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg border hover:bg-gray-50"><ExternalLink className="w-3.5 h-3.5" /></a>
        <button onClick={() => { localStorage.removeItem(`${storageKey}_gsurl`); setUrl(""); setEditing(true); }} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400"><X className="w-3.5 h-3.5" /></button>
      </div>
      <iframe src={buildEmbedUrl(url)} className="flex-1 w-full rounded-xl border border-gray-200"
        title="Google Sheets" allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpreadsheetEditor({ cols, rows, sheetId }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(`${sheetId}_spreadsheet_mode`) || "hanso"
  );
  const switchMode = (m) => { setMode(m); localStorage.setItem(`${sheetId}_spreadsheet_mode`, m); };

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit" dir="rtl">
        <button onClick={() => switchMode("hanso")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "hanso" ? "bg-white dark:bg-gray-700 text-[#2d5d89] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Grid3x3 className="w-3.5 h-3.5" />
          جداول محلية
        </button>
        <button onClick={() => switchMode("google")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "google" ? "bg-white dark:bg-gray-700 text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Globe className="w-3.5 h-3.5" />
          Google Sheets
        </button>
      </div>

      {mode === "google" ? (
        <GoogleSheetsPane storageKey={sheetId} />
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[60vh] rounded-2xl border border-gray-200 bg-gray-50">
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
