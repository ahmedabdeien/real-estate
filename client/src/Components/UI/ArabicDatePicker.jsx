import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronRight, ChevronLeft, X } from "lucide-react";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const DAYS_AR = ["أح","إث","ث","أر","خ","ج","س"];

function formatAr(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch { return dateStr; }
}

export default function ArabicDatePicker({ value, onChange, placeholder = "اختر تاريخاً", className = "", label, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse current value to get initial month/year
  const today = new Date();
  const parsed = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (d) => {
    const month = String(viewMonth + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    onChange(`${viewYear}-${month}-${day}`);
    setOpen(false);
  };

  const isSelected = (d) => {
    if (!value || !d) return false;
    const p = new Date(value);
    return p.getFullYear() === viewYear && p.getMonth() === viewMonth && p.getDate() === d;
  };

  const isToday = (d) => {
    if (!d) return false;
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
  };

  return (
    <div className={`relative ${className}`} ref={ref} dir="rtl">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <button type="button" disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] transition-colors hover:border-[#2d5d89]/50 disabled:opacity-50">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-right ${value ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          {value ? formatAr(value) : placeholder}
        </span>
        {value && (
          <span onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 min-w-[260px]">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
            <div className="text-center">
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                {MONTHS_AR[viewMonth]} {viewYear.toLocaleString("ar-EG", { useGrouping: false })}
              </span>
            </div>
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_AR.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => (
              <div key={i} className="aspect-square flex items-center justify-center">
                {d ? (
                  <button type="button" onClick={() => selectDay(d)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      isSelected(d)
                        ? "bg-[#2d5d89] text-white"
                        : isToday(d)
                        ? "bg-[#2d5d89]/10 text-[#2d5d89] font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}>
                    {d.toLocaleString("ar-EG")}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="button"
              onClick={() => { const t = today; onChange(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`); setOpen(false); }}
              className="w-full text-xs text-[#2d5d89] hover:underline font-medium py-1">
              اليوم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
