/**
 * HansoEditor v2 — Professional Spreadsheet Editor
 * ══════════════════════════════════════════════════
 * ✅ Drag & Drop file import (prominent zone)
import { FaPlus, FaTrash, FaPen, FaXmark, FaMagnifyingGlass, FaCheck, FaDownload, FaUpload, FaArrowsRotate, FaPrint, FaChevronDown, FaChevronUp, FaGripLines, FaTableList, FaFileExcel, FaFilter, FaBookmark, FaBookOpen, FaCalculator, FaEye, FaEyeSlash, FaCopy, FaFileArrowDown, FaClipboardList, FaSortUp, FaSortDown, FaBars, FaWandMagicSparkles, FaChartBar, FaCircleExclamation } from 'react-icons/fa6';
 * ✅ All formats: .xlsx  .xls  .csv  .tsv  .ods  (Microsoft + Apple Numbers export)
 * ✅ Multi-sheet tabs — shows all sheets from imported file
 * ✅ Full Excel-like editing: formulas, sort, filter, merge, undo/redo
 * ✅ Auto-save to localStorage on every change
 * ✅ Export to .xlsx with one click
 * ✅ Handsontable + HyperFormula engine
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";
import * as XLSX from "xlsx";
import { useToast } from "../../context/ToastContext";

registerAllModules();

// ─── Parse any supported file → array of { name, data[][] } sheets ───────────
function parseFile(arrayBuffer, fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  let wb;
  if (ext === "csv" || ext === "tsv") {
    const text = new TextDecoder("utf-8").decode(arrayBuffer);
    const sep  = ext === "tsv" ? "\t" : ",";
    wb = XLSX.read(text, { type: "string", FS: sep });
  } else {
    wb = XLSX.read(new Uint8Array(arrayBuffer), {
      type: "array",
      cellFormula: true,
      cellStyles: true,
      cellDates: true,
    });
  }
  return wb.SheetNames.map((name) => {
    const ws   = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    return { name, data };
  });
}

const STORAGE_PREFIX = "hanso_v2_";

function loadSaved(storageKey) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveToStorage(storageKey, sheets) {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(sheets));
  } catch {}
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────
function DropZone({ onFile, compact }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  if (compact) return (
    <button
      onClick={() => inputRef.current?.click()}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
    >
      <FaUpload className="w-3.5 h-3.5" />
      فتح ملف
      <input ref={inputRef} type="file"
        accept=".xlsx,.xls,.csv,.tsv,.ods" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
    </button>
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all select-none
        ${dragging
          ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]"
          : "border-gray-300 dark:border-gray-600 hover:border-[var(--primary)] hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
        }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
        <FaFileExcel className="w-8 h-8 text-[var(--primary)]" />
      </div>
      <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">
        {dragging ? "أفلت الملف هنا..." : "اسحب ملفك هنا أو اضغط للاختيار"}
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
        يدعم: Excel (.xlsx .xls) · CSV · TSV · ODS (Numbers / LibreOffice)
      </p>
      <span className="inline-block bg-[var(--primary)] text-white text-sm px-5 py-2 rounded-xl font-medium">
        اختر ملف
      </span>
      <input ref={inputRef} type="file"
        accept=".xlsx,.xls,.csv,.tsv,.ods" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HansoEditor({ cols, rows, storageKey }) {
  const hotRef  = useRef(null);
  const toast   = useToast();
  const [fullscreen, setFullscreen] = useState(false);

  // sheets = [{ name, data[][] }]
  const [sheets, setSheets]           = useState(() => {
    const saved = loadSaved(storageKey);
    if (saved) return saved;
    // Build default from ledger cols/rows
    const header = (cols || []).map((c) => c.label);
    const body   = (rows || []).map((row) =>
      (cols || []).map((col) => {
        if (col.type === "formula") return `=${col.formula || ""}`;
        return row.cells?.[col.key] ?? "";
      })
    );
    return [{ name: "Sheet1", data: header.length ? [header, ...body] : [[""]] }];
  });

  const [activeSheet, setActiveSheet] = useState(0);

  // HyperFormula engine — one per mount
  const [formulaEngine] = useState(() =>
    HyperFormula.buildEmpty({ licenseKey: "internal-use-in-handsontable" })
  );

  // Sync sheets state → localStorage on every change
  const persistSheets = useCallback((next) => {
    setSheets(next);
    saveToStorage(storageKey, next);
  }, [storageKey]);

  const handleChange = useCallback(() => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    const data = hot.getData();
    setSheets((prev) => {
      const next = prev.map((s, i) => i === activeSheet ? { ...s, data } : s);
      saveToStorage(storageKey, next);
      return next;
    });
  }, [activeSheet, storageKey]);

  // ─── Import file ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseFile(ev.target.result, file.name);
        if (!parsed.length) { toast.error("الملف فارغ"); return; }
        persistSheets(parsed);
        setActiveSheet(0);
        toast.success(`✅ تم فتح "${file.name}" — ${parsed.length} ورقة`);
      } catch (err) {
        console.error(err);
        toast.error("فشل قراءة الملف — تأكد من الصيغة");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [persistSheets, toast]);

  // ─── Append rows from another file ────────────────────────────────────────
  const appendFileRef = useRef(null);
  const handleAppend = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseFile(ev.target.result, file.name);
        if (!parsed.length) return;
        const incoming = parsed[0].data;
        setSheets((prev) => {
          const current  = prev[activeSheet]?.data || [[]];
          const curHeader = JSON.stringify(current[0] || []);
          const incHeader = JSON.stringify(incoming[0] || []);
          const rowsToAdd = curHeader === incHeader ? incoming.slice(1) : incoming;
          const merged    = [...current, ...rowsToAdd.filter((r) => r.some((c) => c !== ""))];
          const next = prev.map((s, i) => i === activeSheet ? { ...s, data: merged } : s);
          saveToStorage(storageKey, next);
          return next;
        });
        toast.success(`تم إضافة بيانات من "${file.name}"`);
      } catch (err) {
        toast.error("فشل قراءة الملف");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [activeSheet, storageKey, toast]);

  // ─── Export ───────────────────────────────────────────────────────────────
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    sheets.forEach((s) => {
      const ws = XLSX.utils.aoa_to_sheet(s.data);
      XLSX.utils.book_append_sheet(wb, ws, s.name || "Sheet");
    });
    XLSX.writeFile(wb, `حسابات_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`);
    toast.success("تم التصدير بنجاح");
  };

  // ─── Sheet management ─────────────────────────────────────────────────────
  const addSheet = () => {
    const name = `ورقة ${sheets.length + 1}`;
    persistSheets([...sheets, { name, data: [[""]] }]);
    setActiveSheet(sheets.length);
  };

  const deleteSheet = (idx) => {
    if (sheets.length === 1) { toast.error("لا يمكن حذف الورقة الوحيدة"); return; }
    const next = sheets.filter((_, i) => i !== idx);
    persistSheets(next);
    setActiveSheet(Math.min(activeSheet, next.length - 1));
  };

  const renameSheet = (idx, name) => {
    persistSheets(sheets.map((s, i) => i === idx ? { ...s, name } : s));
  };

  const resetToLedger = () => {
    const header = (cols || []).map((c) => c.label);
    const body   = (rows || []).map((row) =>
      (cols || []).map((col) => col.type === "formula" ? `=${col.formula || ""}` : (row.cells?.[col.key] ?? ""))
    );
    const defaultSheet = [{ name: "Sheet1", data: header.length ? [header, ...body] : [[""]] }];
    persistSheets(defaultSheet);
    setActiveSheet(0);
    toast.success("تم مزامنة البيانات من الدفتر");
  };

  const currentData = sheets[activeSheet]?.data || [[""]];
  const hasData = sheets.length > 0 && currentData.some((r) => r.some((c) => c !== ""));

  return (
    <div className={`flex flex-col gap-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm
      ${fullscreen ? "fixed inset-2 z-50" : ""}`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap" dir="rtl">
        {/* Import */}
        <DropZone onFile={handleFile} compact />

        {/* Append old file */}
        <button
          onClick={() => appendFileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors"
          title="أضف بيانات ملف قديم على الموجود بدون حذف"
        >
          <FaPlus className="w-3.5 h-3.5" />
          إضافة من ملف قديم
        </button>
        <input ref={appendFileRef} type="file" accept=".xlsx,.xls,.csv,.tsv,.ods" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAppend(f); e.target.value = ""; }}
        />

        {/* Export */}
        <button onClick={exportExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors">
          <FaDownload className="w-3.5 h-3.5" />
          تصدير Excel
        </button>

        {/* Sync from ledger */}
        <button onClick={resetToLedger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium transition-colors">
          <FaArrowsRotate className="w-3.5 h-3.5" />
          مزامنة من الدفتر
        </button>

        <span className="text-xs text-gray-400 dark:text-gray-500 me-auto hidden sm:block">
          حفظ تلقائي · يدعم =SUM() =IF() وكل معادلات Excel
        </span>

        {/* Fullscreen */}
        <button onClick={() => setFullscreen((v) => !v)}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Empty state: drag & drop zone ──────────────────────────────── */}
      {!hasData ? (
        <div className="p-6">
          <DropZone onFile={handleFile} compact={false} />
        </div>
      ) : (
        <>
          {/* ── Handsontable ─────────────────────────────────────────── */}
          <div style={{ height: fullscreen ? "calc(100vh - 120px)" : "62vh" }}>
            <HotTable
              key={`${storageKey}-${activeSheet}`}
              ref={hotRef}
              data={currentData}
              formulas={{ engine: formulaEngine }}
              rowHeaders={true}
              colHeaders={true}
              contextMenu={true}
              multiColumnSorting={true}
              filters={true}
              dropdownMenu={true}
              manualColumnResize={true}
              manualRowResize={true}
              copyPaste={true}
              mergeCells={true}
              undo={true}
              autoWrapRow={true}
              autoWrapCol={true}
              licenseKey="non-commercial-and-evaluation"
              afterChange={handleChange}
              afterCreateRow={handleChange}
              afterRemoveRow={handleChange}
              afterCreateCol={handleChange}
              afterRemoveCol={handleChange}
              height="100%"
              width="100%"
              stretchH="last"
              fixedRowsTop={1}
            />
          </div>

          {/* ── Sheet tabs ───────────────────────────────────────────── */}
          <div className="flex items-center gap-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto" dir="ltr">
            {sheets.map((s, i) => (
              <SheetTab
                key={i}
                name={s.name}
                active={i === activeSheet}
                onSelect={() => setActiveSheet(i)}
                onRename={(name) => renameSheet(i, name)}
                onDelete={() => deleteSheet(i)}
                showDelete={sheets.length > 1}
              />
            ))}
            <button onClick={addSheet}
              className="flex-shrink-0 px-3 py-2 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              title="إضافة ورقة">
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sheet Tab ────────────────────────────────────────────────────────────────
function SheetTab({ name, active, onSelect, onRename, onDelete, showDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(name);
  const inputRef              = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (val.trim()) onRename(val.trim());
    else setVal(name);
  };

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      onClick={onSelect}
      className={`group flex items-center gap-1 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer text-sm flex-shrink-0 transition-colors
        ${active
          ? "bg-white dark:bg-gray-900 text-[var(--primary)] font-semibold border-t-2 border-t-[var(--primary)]"
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setVal(name); } }}
          className="w-20 text-sm outline-none bg-transparent border-b border-[var(--primary)]"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span>{name}</span>
      )}
      {showDelete && !editing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1"
        >
          <FaTrash className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
