import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const PROPERTY_TYPES = ['', 'فيلا', 'شقة', 'أرض', 'مجمع سكني', 'تجاري'];
const STATUSES = ['', 'متاح', 'مباع'];
const CITIES = ['', 'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'];

export default function FilterBar({ filters, onChange, onClear }) {
  return (
    <div className="bg-white border-b border-[#8A6924]/10 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 p-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A6924] text-xs" />
          <input
            type="text"
            placeholder="ابحث باسم المشروع أو العنوان..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pr-8 pl-3 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C] placeholder-[#6b5e3e]/50"
          />
        </div>

        {/* Type */}
        <select
          value={filters.type || ''}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="px-3 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C] bg-white min-w-[120px]"
        >
          <option value="">كل الأنواع</option>
          {PROPERTY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C] bg-white min-w-[100px]"
        >
          <option value="">كل الحالات</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* City */}
        <select
          value={filters.city || ''}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="px-3 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C] bg-white min-w-[120px]"
        >
          <option value="">كل المدن</option>
          {CITIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Price */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="سعر من"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-24 px-2 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C]"
          />
          <span className="text-[#6b5e3e] text-xs">-</span>
          <input
            type="number"
            placeholder="سعر إلى"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-24 px-2 py-2 text-sm border border-[#8A6924]/20 focus:border-[#8A6924] focus:outline-none text-[#12283C]"
          />
        </div>

        {/* Clear */}
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <FaTimes />
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  );
}
