import { useState, useMemo } from "react";
import { Printer, FileText, BarChart3, Columns } from "lucide-react";

function formatCell(val, type) {
  if (val === undefined || val === null || val === "") return "";
  if (type === "currency")   return Number(val).toLocaleString("ar-EG") + " ج";
  if (type === "number")     return Number(val).toLocaleString("ar-EG");
  if (type === "percentage") return Number(val).toLocaleString("ar-EG", { maximumFractionDigits: 2 }) + " %";
  if (type === "date")       return val ? new Date(val).toLocaleDateString("ar-EG") : "";
  return val;
}

const REPORT_TYPES = [
  { id: "expense", label: "تقرير مصروفات", icon: FileText },
  { id: "monthly", label: "ملخص شهري",     icon: BarChart3 },
  { id: "columns", label: "مقارنة الأعمدة", icon: Columns },
];

export default function ReportsPanel({ rows, cols, sheetName, ledgerName }) {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const [type, setType] = useState("expense");
  const [generated, setGenerated] = useState(false);

  const dateCol     = cols.find(c => c.type === "date");
  const currencyCols = cols.filter(c => ["currency","number"].includes(c.type));
  const textCol     = cols.find(c => c.type === "text");

  const filteredRows = useMemo(() => {
    let r = rows.filter(row => !row.isDeleted);
    if (from && dateCol) {
      r = r.filter(row => {
        const d = row.cells?.[dateCol.key];
        return d && new Date(d) >= new Date(from);
      });
    }
    if (to && dateCol) {
      r = r.filter(row => {
        const d = row.cells?.[dateCol.key];
        return d && new Date(d) <= new Date(to);
      });
    }
    return r;
  }, [rows, from, to, dateCol]);

  // Monthly grouping for "ملخص شهري"
  const monthlyData = useMemo(() => {
    if (!dateCol || currencyCols.length === 0) return [];
    const map = {};
    filteredRows.forEach(row => {
      const d = row.cells?.[dateCol.key];
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;
      if (!map[key]) map[key] = { month: key };
      currencyCols.forEach(c => {
        if (!map[key][c.label]) map[key][c.label] = 0;
        map[key][c.label] += parseFloat(row.cells?.[c.key] || 0) || 0;
      });
    });
    return Object.values(map).sort((a,b) => a.month.localeCompare(b.month));
  }, [filteredRows, dateCol, currencyCols]);

  const totals = useMemo(() => {
    const t = {};
    currencyCols.forEach(c => {
      t[c.key] = filteredRows.reduce((sum, row) => sum + (parseFloat(row.cells?.[c.key]) || 0), 0);
    });
    return t;
  }, [filteredRows, currencyCols]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    const reportTitle = REPORT_TYPES.find(t => t.id === type)?.label || "تقرير";
    let tableHtml = "";

    if (type === "monthly" && monthlyData.length > 0) {
      const headers = ["الشهر", ...currencyCols.map(c => c.label)];
      tableHtml = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>
        ${monthlyData.map(row => `<tr>${["month",...currencyCols.map(c=>c.label)].map((k,i) =>
          `<td>${i===0 ? row.month : formatCell(row[currencyCols[i-1]?.label]||0, currencyCols[i-1]?.type)}</td>`
        ).join("")}</tr>`).join("")}
        </tbody></table>`;
    } else {
      const visibleCols = type === "columns" ? currencyCols : cols;
      tableHtml = `<table>
        <thead><tr>${visibleCols.map(c=>`<th>${c.label}</th>`).join("")}</tr></thead>
        <tbody>
        ${filteredRows.map(row => `<tr>${visibleCols.map(c =>
          `<td>${formatCell(row.cells?.[c.key]||"", c.type) || "—"}</td>`).join("")}</tr>`).join("")}
        <tr class="total-row">${visibleCols.map((c,i) =>
          i===0 ? `<td><b>الإجمالي</b></td>` :
          (["currency","number","percentage"].includes(c.type) ? `<td>${formatCell(totals[c.key]||0, c.type)}</td>` : `<td></td>`)
        ).join("")}</tr>
        </tbody></table>`;
    }

    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${reportTitle}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; direction: rtl; padding: 24px; font-size: 12px; }
        .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; border-bottom:2px solid #2d5d89; padding-bottom:12px; }
        h1 { color:#2d5d89; font-size:16px; margin:0; }
        .meta { color:#64748b; font-size:11px; }
        table { width:100%; border-collapse:collapse; }
        th { background:#2d5d89; color:white; padding:8px 12px; text-align:right; font-size:11px; }
        td { padding:6px 12px; border-bottom:1px solid #e5e7eb; font-size:11px; text-align:right; }
        tr:nth-child(even) td { background:#f8fafc; }
        .total-row td { font-weight:bold; background:#dbeafe; border-top:2px solid #2d5d89; color:#2d5d89; }
        @media print { button { display:none; } }
      </style>
    </head><body>
      <div class="header">
        <div><h1>${ledgerName} — ${sheetName}</h1><p class="meta">${reportTitle} | ${new Date().toLocaleDateString("ar-EG")}</p></div>
        <div class="meta">${from ? `من: ${new Date(from).toLocaleDateString("ar-EG")}` : ""} ${to ? `إلى: ${new Date(to).toLocaleDateString("ar-EG")}` : ""}</div>
      </div>
      ${tableHtml}
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="p-5 space-y-5 overflow-auto h-full" dir="rtl">
      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#2d5d89]" /> إنشاء تقرير
      </h3>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 shadow-sm">
        {/* Report type */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">نوع التقرير</p>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setType(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  type === id ? "bg-[#2d5d89] text-white border-[#2d5d89]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]/40"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        {dateCol && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">من تاريخ</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#2d5d89]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">إلى تاريخ</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#2d5d89]" />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setGenerated(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm font-semibold hover:bg-[#245079] transition-colors">
            <BarChart3 className="w-4 h-4" /> إنشاء التقرير
          </button>
          {generated && (
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" /> طباعة
            </button>
          )}
        </div>
      </div>

      {/* Preview table */}
      {generated && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">{REPORT_TYPES.find(t=>t.id===type)?.label} — معاينة</p>
            <p className="text-xs text-gray-400">{filteredRows.length} سطر</p>
          </div>
          <div className="overflow-x-auto">
            {type === "monthly" ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#2d5d89] text-white">
                    <th className="px-4 py-2.5 text-right font-semibold">الشهر</th>
                    {currencyCols.map(c => <th key={c.key} className="px-4 py-2.5 text-right font-semibold">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row, i) => (
                    <tr key={row.month} className={i%2===0?"bg-white":"bg-gray-50/50"}>
                      <td className="px-4 py-2 text-gray-700 font-medium">{row.month}</td>
                      {currencyCols.map(c => (
                        <td key={c.key} className="px-4 py-2 text-gray-700">{formatCell(row[c.label]||0, c.type)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#2d5d89] text-white">
                    {(type === "columns" ? currencyCols : cols).map(c => (
                      <th key={c.key} className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={row._id} className={i%2===0?"bg-white":"bg-gray-50/50"}>
                      {(type === "columns" ? currencyCols : cols).map(c => (
                        <td key={c.key} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                          {formatCell(row.cells?.[c.key]||"", c.type) || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-blue-50 font-bold text-[#2d5d89]">
                    {(type === "columns" ? currencyCols : cols).map((c, idx) => (
                      <td key={c.key} className="px-4 py-2.5 whitespace-nowrap">
                        {idx === 0 && type !== "columns" ? "الإجمالي" :
                          (["currency","number","percentage"].includes(c.type) ? formatCell(totals[c.key]||0, c.type) : "")}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
