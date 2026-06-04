import { useState, useMemo } from "react";
import { Download, Filter, AlertCircle, CheckCircle2, BarChart2 } from "lucide-react";
import * as XLSX from "xlsx";

function fmtNum(n) {
  if (!isFinite(n)) return "—";
  return Number(n).toLocaleString("ar-EG") + " ج";
}

export default function ReconciliationPanel({ rows, cols }) {
  const numericCols = cols.filter((c) => ["currency","number","percentage","formula"].includes(c.type));

  const [colA, setColA] = useState(numericCols[0]?.key || "");
  const [colB, setColB] = useState(numericCols[1]?.key || "");
  const [diffOnly, setDiffOnly] = useState(false);
  const [threshold, setThreshold] = useState(0);

  const colADef = cols.find((c) => c.key === colA);
  const colBDef = cols.find((c) => c.key === colB);

  function getCellNum(row, colDef) {
    if (!colDef) return 0;
    const raw = row.cells?.[colDef.key];
    const n = parseFloat(raw);
    return isFinite(n) ? n : 0;
  }

  const tableRows = useMemo(() => {
    return rows.map((row) => {
      const a = getCellNum(row, colADef);
      const b = getCellNum(row, colBDef);
      const diff = a - b;
      return { row, a, b, diff };
    });
  }, [rows, colADef, colBDef]);

  const filtered = diffOnly
    ? tableRows.filter((r) => Math.abs(r.diff) > threshold)
    : tableRows;

  const totalA = tableRows.reduce((s, r) => s + r.a, 0);
  const totalB = tableRows.reduce((s, r) => s + r.b, 0);
  const totalDiff = totalA - totalB;
  const diffCount = tableRows.filter((r) => Math.abs(r.diff) > threshold).length;

  const exportReconcile = () => {
    const data = filtered.map((r) => {
      const base = {};
      cols.forEach((c) => { base[c.label] = r.row.cells?.[c.key] ?? ""; });
      base[`${colADef?.label || "A"} الفعلي`] = r.a;
      base[`${colBDef?.label || "B"} المتوقع`] = r.b;
      base["الفرق"] = r.diff;
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "مطابقة");
    XLSX.writeFile(wb, "reconciliation.xlsx");
  };

  if (numericCols.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8" dir="rtl">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>يتطلب عمودين رقميين على الأقل للمطابقة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">مطابقة الأرقام</h3>
          <p className="text-xs text-gray-400 mt-0.5">قارن بين عمودين وكشف الفروقات</p>
        </div>
        <button
          onClick={exportReconcile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#217346] text-white text-xs font-semibold hover:bg-[#1a5c38]"
        >
          <Download className="w-3.5 h-3.5" /> تصدير
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">العمود الفعلي (A)</label>
            <select
              value={colA}
              onChange={(e) => setColA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] bg-white"
            >
              {numericCols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">العمود المتوقع (B)</label>
            <select
              value={colB}
              onChange={(e) => setColB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] bg-white"
            >
              {numericCols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
              className="accent-[#2d5d89]"
            />
            فروقات فقط
          </label>
          {diffOnly && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">أكثر من:</span>
              <input
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded-lg border border-gray-300 text-xs focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: colADef?.label || "A", value: fmtNum(totalA), color: "blue" },
          { label: colBDef?.label || "B", value: fmtNum(totalB), color: "purple" },
          { label: "الفرق الكلي", value: fmtNum(totalDiff), color: totalDiff === 0 ? "green" : "red" },
          { label: "صفوف بها فرق", value: diffCount.toLocaleString("ar-EG"), color: diffCount === 0 ? "green" : "orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white border border-gray-200 rounded-2xl p-3 shadow-sm text-center`}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-base font-bold ${
              color === "green" ? "text-emerald-600" :
              color === "red" ? "text-red-600" :
              color === "orange" ? "text-orange-500" :
              color === "blue" ? "text-blue-600" :
              "text-purple-600"
            }`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-auto max-h-[50vh]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#2d5d89] text-white">
              <tr>
                <th className="px-3 py-2.5 text-right">#</th>
                {cols.filter((c) => c.type !== "formula").slice(0, 4).map((c) => (
                  <th key={c.key} className="px-3 py-2.5 text-right whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-3 py-2.5 text-right">{colADef?.label || "A"}</th>
                <th className="px-3 py-2.5 text-right">{colBDef?.label || "B"}</th>
                <th className="px-3 py-2.5 text-right">الفرق</th>
                <th className="px-3 py-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row, a, b, diff }, i) => {
                const hasDiff = Math.abs(diff) > threshold;
                return (
                  <tr
                    key={row._id}
                    className={`border-b border-gray-100 transition-colors ${
                      hasDiff ? "bg-red-50/40 hover:bg-red-50/80" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    {cols.filter((c) => c.type !== "formula").slice(0, 4).map((c) => (
                      <td key={c.key} className="px-3 py-2 text-gray-700 max-w-[120px] truncate">
                        {row.cells?.[c.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-blue-700 font-medium">{fmtNum(a)}</td>
                    <td className="px-3 py-2 text-purple-700 font-medium">{fmtNum(b)}</td>
                    <td className={`px-3 py-2 font-bold ${
                      diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-gray-400"
                    }`}>
                      {diff > 0 ? "+" : ""}{fmtNum(diff)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {hasDiff
                        ? <AlertCircle className="w-4 h-4 text-red-400 mx-auto" />
                        : <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              {diffOnly ? "لا توجد فروقات" : "لا توجد بيانات"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
