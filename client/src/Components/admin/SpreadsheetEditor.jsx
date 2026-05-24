/**
 * SpreadsheetEditor — Advanced Cloud Spreadsheet Hub
 * ════════════════════════════════════════════════════
 * Tab 1: جداول محلية   → HansoEditor (Handsontable, offline-first, all formats)
 * Tab 2: Google Sheets  → iframe embed + open controls
 * Tab 3: OneDrive       → Microsoft 365 Excel Online embed
 * Tab 4: Dropbox        → Dropbox file preview
 */
import { useState, lazy, Suspense } from "react";
import {
  ExternalLink, Link2, X, Grid3x3, Globe,
  Cloud, RefreshCw, Check, Copy,
  FolderOpen, Info,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const HansoEditor = lazy(() => import("./HansoEditor"));

// ─── Reusable cloud link pane ─────────────────────────────────────────────────
function CloudPane({ provider, storageKey, buildEmbed, placeholder, icon: Icon, color, hint, steps }) {
  const toast = useToast();
  const [url,     setUrl]     = useState(() => localStorage.getItem(`${storageKey}_${provider}url`) || "");
  const [input,   setInput]   = useState("");
  const [editing, setEditing] = useState(!url);
  const [copied,  setCopied]  = useState(false);

  const save = () => {
    if (!input.trim()) { toast.error("أدخل الرابط أولاً"); return; }
    localStorage.setItem(`${storageKey}_${provider}url`, input.trim());
    setUrl(input.trim());
    setEditing(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const embedUrl = buildEmbed ? buildEmbed(url) : url;

  if (editing) return (
    <div className="flex flex-col items-center justify-center h-[62vh] gap-5 p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: color + "18" }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">ربط {provider === "google" ? "Google Sheets" : provider === "onedrive" ? "OneDrive / Excel" : "Dropbox"}</h3>
        <p className="text-sm text-gray-500 max-w-sm">{hint}</p>
      </div>

      {steps && (
        <div className="w-full max-w-md rounded-xl p-3 text-xs border"
          style={{ backgroundColor: color + "0d", borderColor: color + "30", color }}>
          <p className="font-bold mb-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> خطوات الربط:
          </p>
          <ol className="list-decimal list-inside space-y-0.5 opacity-80">
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      <div className="w-full max-w-md space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), save())}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono resize-none"
          dir="ltr"
        />
        <p className="text-[11px] text-gray-400 -mt-1">
          يمكنك لصق رابط المشاركة المباشر أو كود iframe بالكامل
        </p>
        <button
          onClick={save}
          className="w-full py-3 text-white rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}>
          ربط الملف
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[62vh]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
          style={{ backgroundColor: color + "12", color }}>
          <Check className="w-3 h-3" /> مرتبط
        </span>
        <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 overflow-hidden flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          <span className="text-xs text-gray-500 truncate" dir="ltr">{url}</span>
        </div>
        <button onClick={copyLink} title="نسخ الرابط" className="p-1.5 rounded-lg border hover:bg-gray-50">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
        </button>
        <button onClick={() => { setInput(url); setEditing(true); }} title="تغيير الرابط"
          className="p-1.5 rounded-lg border hover:bg-gray-50"><Link2 className="w-3.5 h-3.5 text-gray-500" /></button>
        <a href={url} target="_blank" rel="noopener noreferrer" title="فتح في تبويب جديد"
          className="p-1.5 rounded-lg border hover:bg-gray-50"><ExternalLink className="w-3.5 h-3.5 text-gray-500" /></a>
        <button
          onClick={() => { localStorage.removeItem(`${storageKey}_${provider}url`); setUrl(""); setEditing(true); }}
          title="إلغاء الربط"
          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-400">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embedded frame */}
      <iframe
        src={embedUrl}
        className="flex-1 w-full rounded-xl border border-gray-200 bg-white"
        title={provider}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox allow-modals"
      />
    </div>
  );
}

// ─── URL builders ─────────────────────────────────────────────────────────────
function buildGoogleEmbed(raw) {
  if (!raw) return "";
  const s = raw.trim();
  try {
    // If user pasted an iframe, extract src
    const iframeSrc = s.match(/src="([^"]+)"/)?.[1];
    if (iframeSrc) return iframeSrc;

    const u = new URL(s);
    const m = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!m) return s;
    const id  = m[1];
    // Get gid from hash or search params
    const gid = u.hash.match(/gid=(\d+)/)?.[1]
              || u.searchParams.get("gid")
              || "0";
    // Use /preview for better iframe compatibility across accounts
    return `https://docs.google.com/spreadsheets/d/${id}/preview?gid=${gid}&rm=minimal`;
  } catch { return s; }
}

function buildOneDriveEmbed(raw) {
  if (!raw) return raw;
  const s = raw.trim();

  // If user pasted full iframe HTML — extract src
  const iframeSrc = s.match(/src="([^"]+)"/)?.[1];
  if (iframeSrc) return iframeSrc;

  // Already a valid embed URL
  if (s.includes("onedrive.live.com/embed") || s.includes("sharepoint.com") && s.includes("action=embedview")) return s;
  if (s.includes("sharepoint.com") && s.includes("embed")) return s;

  // SharePoint document URL → convert to embed view
  if (s.includes("sharepoint.com") || s.includes("office.com")) {
    try {
      const u = new URL(s);
      // Add embed action params if not already there
      u.searchParams.set("action", "embedview");
      u.searchParams.set("wdAllowInteractivity", "True");
      return u.toString();
    } catch { return s; }
  }

  // 1drv.ms short link or personal OneDrive sharing link
  // These can't be directly embedded — we need the proper embed URL
  // Return as-is and let the iframe try (may show "open in OneDrive" button)
  return s;
}

function buildDropboxEmbed(raw) {
  if (!raw) return raw;
  // Replace dl=0 with dl=0 (preview mode) — Dropbox doesn't allow embedding directly,
  // so we show an info message and open button instead of iframe.
  return raw.replace("?dl=1", "?dl=0").replace("&dl=1", "&dl=0");
}

// ─── Provider definitions ─────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id:    "local",
    label: "جداول محلية",
    icon:  Grid3x3,
    color: "#2d5d89",
    desc:  "تعمل بدون إنترنت — استيراد/تصدير جميع صيغ Excel وApple Numbers",
  },
  {
    id:         "google",
    label:      "Google Sheets",
    icon:       Globe,
    color:      "#0F9D58",
    placeholder:"https://docs.google.com/spreadsheets/d/...",
    buildEmbed: buildGoogleEmbed,
    hint:       "انسخ رابط مشاركة ملف Google Sheets والصقه هنا",
    steps: [
      "افتح ملف Google Sheets",
      "اضغط مشاركة (Share) في الأعلى",
      "اختر 'أي شخص لديه الرابط يمكنه العرض'",
      "انسخ الرابط والصقه هنا",
    ],
  },
  {
    id:         "onedrive",
    label:      "OneDrive / Excel",
    icon:       Cloud,
    color:      "#0078D4",
    placeholder:"https://1drv.ms/x/... أو رابط SharePoint",
    buildEmbed: buildOneDriveEmbed,
    hint:       "Microsoft Excel Online من OneDrive أو SharePoint",
    steps: [
      "افتح الملف في Excel Online (OneDrive أو SharePoint)",
      "من القائمة: ملف ← مشاركة ← تضمين (Embed)",
      "انسخ كود iframe كاملاً والصقه هنا",
      "أو من SharePoint: انسخ رابط URL مباشرة",
    ],
  },
  {
    id:         "dropbox",
    label:      "Dropbox",
    icon:       FolderOpen,
    color:      "#0061FF",
    placeholder:"https://www.dropbox.com/s/...",
    buildEmbed: buildDropboxEmbed,
    hint:       "شارك ملف من Dropbox واعرضه هنا",
    steps: [
      "افتح Dropbox وانقر بالزر الأيمن على الملف",
      "اختر 'نسخ الرابط' (Copy link)",
      "تأكد أن الملف مشاركة 'يمكن لأي شخص بالرابط'",
      "الصق الرابط أدناه",
    ],
  },
];

// ─── Dropbox special pane (can't embed, show preview + open button) ───────────
function DropboxPane({ storageKey }) {
  const toast = useToast();
  const [url,     setUrl]     = useState(() => localStorage.getItem(`${storageKey}_dropboxurl`) || "");
  const [input,   setInput]   = useState("");
  const [editing, setEditing] = useState(!url);

  const save = () => {
    if (!input.trim()) { toast.error("أدخل رابط Dropbox"); return; }
    localStorage.setItem(`${storageKey}_dropboxurl`, input.trim());
    setUrl(input.trim());
    setEditing(false);
  };

  const cfg = PROVIDERS.find((p) => p.id === "dropbox");

  if (editing) return (
    <CloudPane
      key="dropbox-edit"
      provider="dropbox"
      storageKey={storageKey}
      buildEmbed={buildDropboxEmbed}
      placeholder={cfg.placeholder}
      icon={cfg.icon}
      color={cfg.color}
      hint={cfg.hint}
      steps={cfg.steps}
    />
  );

  return (
    <div className="flex flex-col h-[62vh] items-center justify-center gap-5">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
        <FolderOpen className="w-10 h-10 text-[#0061FF]" />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-gray-900 mb-1">ملف Dropbox مرتبط</h3>
        <p className="text-sm text-gray-500 max-w-xs dir-ltr truncate">{url}</p>
        <p className="text-xs text-gray-400 mt-2">Dropbox لا يدعم التضمين المباشر — استخدم الزر للفتح في تبويب</p>
      </div>
      <div className="flex gap-3">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0061FF] text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <ExternalLink className="w-4 h-4" /> فتح في Dropbox
        </a>
        <button onClick={() => { localStorage.removeItem(`${storageKey}_dropboxurl`); setUrl(""); setEditing(true); }}
          className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function SpreadsheetEditor({ cols, rows, sheetId }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(`${sheetId}_spreadsheet_mode`) || "local"
  );
  const switchMode = (m) => {
    setMode(m);
    localStorage.setItem(`${sheetId}_spreadsheet_mode`, m);
  };

  const active = PROVIDERS.find((p) => p.id === mode) || PROVIDERS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {/* ── Provider tabs ── */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 overflow-x-auto">
        {PROVIDERS.map((p) => {
          const Icon = p.icon;
          const isActive = mode === p.id;
          return (
            <button
              key={p.id}
              onClick={() => switchMode(p.id)}
              title={p.desc || p.label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center min-w-0 ${
                isActive
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              style={isActive ? { color: p.color } : {}}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Description bar ── */}
      {active.desc && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 bg-gray-50 border border-gray-100">
          <ActiveIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active.color }} />
          {active.desc}
        </div>
      )}

      {/* ── Content ── */}
      {mode === "local" ? (
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
      ) : mode === "dropbox" ? (
        <DropboxPane storageKey={sheetId} />
      ) : (
        <CloudPane
          key={mode}
          provider={mode}
          storageKey={sheetId}
          buildEmbed={active.buildEmbed}
          placeholder={active.placeholder}
          icon={active.icon}
          color={active.color}
          hint={active.hint}
          steps={active.steps}
        />
      )}
    </div>
  );
}
