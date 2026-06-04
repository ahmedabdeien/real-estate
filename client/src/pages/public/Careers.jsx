import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Calendar, Clock, Search, Filter,
  ArrowLeft, Users, CheckCircle, DollarSign, ChevronLeft,
} from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import EmptyState from "../../Components/UI/EmptyState";
import { useCms } from "../../hooks/useCms";

const TYPE_LABELS = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };
const TYPE_COLORS = { full_time: "bg-blue-100 text-blue-700", part_time: "bg-purple-100 text-purple-700", contract: "bg-amber-100 text-amber-700", internship: "bg-green-100 text-green-700" };

export default function CareersPage() {
  const { data: cmsPage } = useCms("careers_page", {
    title_ar: "الوظائف المتاحة",
    subtitle_ar: "انضم إلى فريق الصرح للتطوير العقاري",
    image: "",
  });
  const [careers, setCareers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterType, setFilter] = useState("all");

  useEffect(() => {
    api.get("/careers", { params: { published: true } })
      .then(r => setCareers(r.data.careers || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = careers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title?.ar?.includes(search) || c.department?.ar?.includes(search) || c.location?.ar?.includes(search);
    const matchType   = filterType === "all" || c.type === filterType;
    return matchSearch && matchType;
  });

  const active  = careers.filter(c => !c.deadline || new Date(c.deadline) >= new Date()).length;
  const depts   = [...new Set(careers.map(c => c.department?.ar).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-20 overflow-hidden"
        style={cmsPage.image ? { backgroundImage: `url('${cmsPage.image}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
        {cmsPage.image && <div className="absolute inset-0 bg-[#1a3d5c]/75" />}
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/5 rounded-full" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full border border-white/20 mb-5">
              <Users className="w-4 h-4" /> {active} وظيفة متاحة
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{cmsPage.title_ar}</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">{cmsPage.subtitle_ar}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن وظيفة..."
              className="w-full pr-11 pl-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
          </div>
          <select value={filterType} onChange={e => setFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
            <option value="all">كل الأنواع</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {(search || filterType !== "all") && (
            <button onClick={() => { setSearch(""); setFilter("all"); }}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
              مسح الفلتر
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner className="h-64" size="lg" /> :
         filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="لا توجد وظائف تطابق البحث" description="جرب تغيير كلمات البحث أو الفلاتر" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((c, i) => {
              const isExpired = c.deadline && new Date(c.deadline) < new Date();
              return (
                <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-md ${
                    isExpired ? "border-gray-200 opacity-80" : "border-gray-100 hover:border-[#2d5d89]/30"
                  }`}>
                  <div className={`h-1.5 ${isExpired ? "bg-gray-200" : "bg-gradient-to-r from-[#2d5d89] to-[#4a8ab5]"}`} />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isExpired ? "bg-gray-100" : "bg-[#2d5d89]/10"}`}>
                        <Briefcase className={`w-5 h-5 ${isExpired ? "text-gray-400" : "text-[#2d5d89]"}`} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[c.type]}`}>
                        {TYPE_LABELS[c.type]}
                      </span>
                    </div>

                    <h3 className="font-black text-gray-900 text-base mb-1 leading-snug">{c.title?.ar}</h3>
                    {c.title?.en && <p className="text-gray-400 text-xs mb-2">{c.title.en}</p>}

                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-3">
                      {c.department?.ar && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.department.ar}</span>
                      )}
                      {c.location?.ar && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location.ar}</span>
                      )}
                    </div>

                    {c.description?.ar && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">{c.description.ar}</p>
                    )}

                    {/* Requirements count */}
                    {c.requirements?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[#2d5d89] mb-3">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{c.requirements.length} متطلب</span>
                      </div>
                    )}

                    {/* Salary */}
                    {c.salary?.min && !c.salary?.hidden && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mb-3">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{Number(c.salary.min).toLocaleString("ar-EG")} — {Number(c.salary.max).toLocaleString("ar-EG")} {c.salary.currency}</span>
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100">
                      {c.deadline && (
                        <p className={`flex items-center gap-1 text-xs mb-3 ${isExpired ? "text-red-500" : "text-gray-400"}`}>
                          <Calendar className="w-3 h-3" />
                          {isExpired ? "انتهت في " : "حتى "}
                          {new Date(c.deadline).toLocaleDateString("ar-EG")}
                        </p>
                      )}
                      <Link to={`/careers/${c._id}`}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          isExpired
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                            : "bg-[#2d5d89] hover:bg-[#245079] text-white"
                        }`}>
                        عرض التفاصيل والتقديم
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
