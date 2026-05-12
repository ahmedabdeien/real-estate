import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      items.push(i);
    } else if (i === page - 2 || i === page + 2) {
      items.push("...");
    }
  }
  const unique = [...new Set(items)];

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {unique.map((item, i) =>
        item === "..." ? (
          <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              item === page
                ? "bg-[#2d5d89] text-white"
                : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
