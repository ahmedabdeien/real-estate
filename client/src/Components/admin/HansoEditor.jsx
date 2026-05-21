/**
 * HansoEditor — Handsontable-based spreadsheet component.
 * Lazy-loaded from SpreadsheetEditor to keep main bundle small.
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";
import * as XLSX from "xlsx";
import { Upload, Download, RefreshCw } from "lucide-react";
import { useToast } from "../../context/ToastContext";

registerAllModules();

export default function HansoEditor({ cols, rows, storageKey }) {
  const hotRef = useRef(null);
  const toast = useToast();
  const fileRef = useRef(null);

  // Build table data from ledger cols/rows
  const buildTableData = useCallback(() => {
    const header = cols.map((c) => c.label);
    const body = rows.map((row) =>
      cols.map((col) => {
        if (col.type === "formula") return `=${col.formula || ""}`;
        return row.cells?.[col.key] ?? "";
      })
    );
    return [header, ...body];
  }, [cols, rows]);

  const [tableData, setTableData] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_hanso`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return buildTableData();
  });

  const handleChange = useCallback((changes) => {
    if (!changes) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    const data = hot.getData();
    localStorage.setItem(`${storageKey}_hanso`, JSON.stringify(data));
    setTableData(data);
  }, [storageKey]);

  useEffect(() => {
    const saved = localStorage.getItem(`${storageKey}_hanso`);
    if (!saved) setTableData(buildTableData());
  }, [storageKey, buildTableData]);

  const exportExcel = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    const data = hot.getData();
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `accounting_${Date.now()}.xlsx`);
    toast.success("تم تصدير الملف");
  };

  const importExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array", cellFormula: true, cellStyles: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
        setTableData(data.length ? data : buildTableData());
        localStorage.setItem(`${storageKey}_hanso`, JSON.stringify(data.length ? data : buildTableData()));
        toast.success("تم استيراد الملف بنجاح مع كل البيانات والمعادلات");
      } catch (err) {
        console.error("Excel import error:", err);
        toast.error("فشل قراءة الملف — تأكد أن الملف بصيغة .xlsx أو .xls");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const resetData = () => {
    localStorage.removeItem(`${storageKey}_hanso`);
    setTableData(buildTableData());
    toast.success("تم إعادة التعيين من بيانات الدفتر");
  };

  // HyperFormula engine — created once per component mount
  const [formulaEngine] = useState(() =>
    HyperFormula.buildEmpty({ licenseKey: "internal-use-in-handsontable" })
  );

  return (
    <div className="flex flex-col gap-2" style={{ direction: "ltr" }}>
      {/* Toolbar (RTL) */}
      <div className="flex items-center gap-2 flex-wrap" style={{ direction: "rtl" }}>
        <button
          onClick={exportExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          تصدير Excel
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          استيراد Excel
        </button>
        <button
          onClick={resetData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          مزامنة من الدفتر
        </button>
        <span className="text-xs text-gray-400 mr-auto">يتم الحفظ تلقائياً · يدعم المعادلات مثل =SUM(A1:A10)</span>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={importExcel} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "60vh" }}>
        <HotTable
          ref={hotRef}
          data={tableData}
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
          height="100%"
          width="100%"
          stretchH="all"
          fixedRowsTop={1}
        />
      </div>
    </div>
  );
}
