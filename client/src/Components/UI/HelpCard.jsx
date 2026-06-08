import { useState } from "react";
import { FaCircleQuestion, FaChevronDown, FaChevronUp } from "react-icons/fa6";

export default function HelpCard({ title, tips }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-3 text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 transition-colors"
      >
        <FaCircleQuestion className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">{title}</span>
        {open ? <FaChevronUp className="w-4 h-4 mr-auto" /> : <FaChevronDown className="w-4 h-4 mr-auto" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1.5">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
