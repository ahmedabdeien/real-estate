import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home, BedDouble, Bath, Maximize2, Layers, Building2,
  Check, GitCompare, X, Search, SlidersHorizontal, ArrowLeft,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import { useCms } from "../../hooks/useCms";
import { useAuth } from "../../context/AuthContext";

const unitTypeAr = {
  apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس",
  penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه",
};

export default function UnitsPage() {
  const { data: cms } = useCms("units_page", {
    title_ar: "الوحدات المتاحة",
    subtitle_ar: "اختر وحدتك المثالية من مجموعة متنوعة من الخيارات",
    hero_image: "",
  });
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("available");
  const [project, setProject] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/units", {
        params: { page, status, project, published: true, search },
      });
      setUnits(res.data.units || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status, project, search]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100, published: true } })
      .then((r) => setProjects(r.data.projects || []));
  }, []);

  const submitSearch = (e) => {
    e?.preventDefault?.();
    setPage(1);
    setSearch(searchInput.trim());
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev
    );
  };

  const sortedUnits = useMemo(() => {
    const arr = [...units];
    if (sort === "price_asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "price_desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === "area_desc") arr.sort((a, b) => (b.area || 0) - (a.area || 0));
    return arr;
  }, [units, sort]);

  const compareUnits = units.filter((u) => compareIds.includes(u._id));

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-20 overflow-hidden">
        {cms.hero_image && (
          <>
            <img src={cms.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d5c]/80 to-[#2d5d89]/60" />
          </>
        )}
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur">
              الصرح للتطوير العقاري
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{cms.title_ar}</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">{cms.subtitle_ar}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث برقم الوحدة، النوع، المشروع..."
                className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
              />
            </div>
            <select
              value={project}
              onChange={(e) => { setProject(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            >
              <option value="">كل المشاريع</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name?.ar}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            >
              <option value="">الترتيب الافتراضي</option>
              <option value="price_asc">الأرخص</option>
              <option value="price_desc">الأغلى</option>
              <option value="area_desc">الأكبر مساحة</option>
            </select>
            <div className="flex gap-2">
              {[
                { value: "", label: "الكل" },
                { value: "available", label: "متاحة" },
                { value: "reserved", label: "محجوزة" },
              ].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setStatus(o.value); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    status === o.value
                      ? "bg-[#2d5d89] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#2d5d89] hover:text-[#2d5d89]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="bg-[#2d5d89] hover:bg-[#1e4470] text-white text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              بحث
            </button>
          </form>
        </div>

        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : sortedUnits.length === 0 ? (
          <EmptyState icon={Home} title="لا توجد وحدات" description="جرب تغيير فلاتر البحث" />
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-5">{total} وحدة</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedUnits.map((unit) => {
                const coverImage = unit.coverImage || unit.images?.[0];
                const isCompared = compareIds.includes(unit._id);
                return (
                  <motion.div
                    key={unit._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 group"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2d5d89]/20 to-[#2d5d89]/5 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-[#2d5d89]/30" />
                        </div>
                      )}
                      {/* Type badge */}
                      <span className="absolute top-3 right-3 bg-[#2d5d89] text-white text-xs px-2 py-1 rounded-lg font-medium">
                        {unitTypeAr[unit.type] || unit.type}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-lg font-medium ${
                          unit.status === "available"
                            ? "bg-green-500 text-white"
                            : unit.status === "reserved"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {unit.status === "available"
                          ? "متاحة"
                          : unit.status === "reserved"
                            ? "محجوزة"
                            : "مبيعة"}
                      </span>
                      {/* Compare checkbox - only for logged-in users */}
                      {user && (
                        <button
                          onClick={(e) => { e.preventDefault(); toggleCompare(unit._id); }}
                          title="مقارنة"
                          className={`absolute bottom-3 left-3 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isCompared
                              ? "bg-[#2d5d89] border-[#2d5d89] text-white"
                              : "bg-white/80 border-white text-gray-400 hover:text-[#2d5d89]"
                          }`}
                        >
                          {isCompared ? <Check className="w-4 h-4" /> : <GitCompare className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {unit.unitNumber} {unit.project?.name?.ar ? `— ${unit.project.name.ar}` : ""}
                      </h3>
                      {unit.project?.name?.ar && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                          <Building2 className="w-3 h-3" />
                          <span>{unit.project.name.ar}</span>
                        </div>
                      )}
                      {/* Features grid */}
                      <div className="grid grid-cols-4 gap-2 my-3">
                        {[
                          { icon: BedDouble, value: unit.rooms ?? "—", label: "غرفة" },
                          { icon: Bath, value: unit.bathrooms ?? "—", label: "حمام" },
                          { icon: Maximize2, value: unit.area ?? "—", label: "م²" },
                          { icon: Layers, value: unit.floor ?? "—", label: "الدور" },
                        ].map(({ icon: Icon, value, label }) => (
                          <div key={label} className="text-center">
                            <Icon className="w-4 h-4 text-[#2d5d89] mx-auto mb-0.5" />
                            <p className="text-xs font-semibold text-gray-800">{value}</p>
                            <p className="text-[10px] text-gray-400">{label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Amenities */}
                      {unit.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {unit.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                          {unit.amenities.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{unit.amenities.length - 3}</span>
                          )}
                        </div>
                      )}
                      {/* Price + CTA */}
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                        <div>
                          <p className="text-lg font-bold text-[#2d5d89]">
                            {unit.price ? unit.price.toLocaleString("ar-EG") : "—"}
                          </p>
                          <p className="text-xs text-gray-400">جنيه مصري</p>
                        </div>
                        <Link
                          to={`/projects/${unit.project?.slug || unit.project?._id || ""}`}
                          className="bg-[#2d5d89] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#1e4470] transition-colors flex items-center gap-1"
                        >
                          التفاصيل
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      {/* Floating compare bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#2d5d89] text-white rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">تم اختيار {compareIds.length} وحدة</span>
          <button
            onClick={() => setShowCompare(true)}
            disabled={compareIds.length < 2}
            className="bg-white text-[#2d5d89] text-sm font-bold px-4 py-1.5 rounded-xl hover:bg-gray-100 disabled:opacity-60"
          >
            مقارنة
          </button>
          <button onClick={() => setCompareIds([])} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowCompare(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">مقارنة الوحدات</h2>
              <button onClick={() => setShowCompare(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-gray-500 font-medium w-36">المواصفة</th>
                    {compareUnits.map((u) => (
                      <th key={u._id} className="py-3 px-4 font-bold text-[#2d5d89]">
                        {u.unitNumber}
                        <button
                          onClick={() => setCompareIds((p) => p.filter((i) => i !== u._id))}
                          className="mr-2 text-gray-300 hover:text-red-400"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["النوع", (u) => unitTypeAr[u.type] || u.type || "—"],
                    ["السعر", (u) => u.price ? u.price.toLocaleString("ar-EG") + " ج.م" : "—"],
                    ["المساحة", (u) => u.area ? u.area + " م²" : "—"],
                    ["الغرف", (u) => u.rooms ?? "—"],
                    ["الحمامات", (u) => u.bathrooms ?? "—"],
                    ["الدور", (u) => u.floor ?? "—"],
                    ["نوع الإنهاء", (u) => u.finishing || "—"],
                    ["الجهة", (u) => u.facing || "—"],
                    [
                      "الحالة",
                      (u) =>
                        u.status === "available"
                          ? "متاحة"
                          : u.status === "reserved"
                            ? "محجوزة"
                            : "مبيعة",
                    ],
                    ["المرافق", (u) => u.amenities?.join("، ") || "—"],
                  ].map(([label, fn]) => (
                    <tr key={label} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-600">{label}</td>
                      {compareUnits.map((u) => (
                        <td key={u._id} className="py-3 px-4">{fn(u)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
