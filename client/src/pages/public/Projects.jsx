import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin, Calendar, ArrowLeft, Search } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useCms } from "../../hooks/useCms";

const statusOptions = [
  { value: "", label: "كل المشاريع" },
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز للتسليم" },
  { value: "coming_soon", label: "قريباً" },
];

export default function ProjectsPage() {
  const { data: cmsPage } = useCms("projects_page", {
    title_ar: "مشاريعنا",
    subtitle_ar: "اكتشف مجموعة مشاريعنا المتميزة",
    hero_image: "",
  });
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { page, search, status, published: true } });
      setProjects(res.data.projects || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero Banner */}
      <div
        className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-16 relative"
        style={cmsPage.hero_image ? { backgroundImage: `url('${cmsPage.hero_image}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {cmsPage.hero_image && <div className="absolute inset-0 bg-[#1a3d5c]/70" />}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-black text-white mb-3">{cmsPage.title_ar}</h1>
          <p className="text-white/70 text-lg">{cmsPage.subtitle_ar}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="ابحث عن مشروع..."
              className="pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] w-56"
            />
          </div>
          <div className="flex gap-2">
            {statusOptions.map((o) => (
              <button
                key={o.value}
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
        </div>

        {/* Grid */}
        {loading ? <LoadingSpinner className="h-64" size="lg" /> : projects.length === 0 ? (
          <EmptyState icon={Building2} title="لا توجد مشاريع" description="لا توجد مشاريع تطابق بحثك" />
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-5">{total} مشروع</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const { label, variant } = statusBadge(p.status);
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.name?.ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2d5d89] to-[#1a3d5c]">
                          <Building2 className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3"><Badge variant={variant}>{label}</Badge></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name?.ar}</h3>
                      {p.location?.city?.ar && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{p.location.city.ar}</span>
                        </div>
                      )}
                      {p.description?.ar && (
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.description.ar}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          {p.startingPrice > 0 && (
                            <p className="text-[#2d5d89] font-bold text-sm">من {p.startingPrice.toLocaleString()} ج</p>
                          )}
                          {p.totalUnits > 0 && (
                            <p className="text-gray-400 text-xs mt-0.5">{p.totalUnits} وحدة</p>
                          )}
                        </div>
                        <Link to={`/projects/${p.slug}`}
                          className="flex items-center gap-1 bg-[#2d5d89] hover:bg-[#245079] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          <span>عرض</span>
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
    </div>
  );
}
