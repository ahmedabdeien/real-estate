import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin, ArrowLeft, Search, LayoutGrid, List, Sparkles, Settings } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useCms } from "../../hooks/useCms";
import { useAuth } from "../../context/AuthContext";
import PageHero from "../../Components/shared/PageHero";
import SectionHeader from "../../Components/shared/SectionHeader";

const statusOptions = [
  { value: "", label: "كل المشاريع" },
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز للتسليم" },
  { value: "coming_soon", label: "قريباً" },
];

function ProjectCard({ p, view = "grid" }) {
  const { label, variant } = statusBadge(p.status);
  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row"
      >
        <div className="relative sm:w-64 h-48 sm:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
          {p.coverImage ? (
            <img src={p.coverImage} alt={p.name?.ar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-dark)]/30">
              <Building2 className="w-16 h-16 text-[var(--primary)]/30" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <Badge variant={variant}>{label}</Badge>
            {p.featured && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold text-center">مميز</span>}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{p.name?.ar}</h3>
            {p.developer?.ar && <p className="text-xs text-gray-400 mb-2">{p.developer.ar}</p>}
            {p.location?.city?.ar && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{p.location.city.ar}</span>
              </div>
            )}
            {p.description?.ar && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.description.ar}</p>}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              {p.startingPrice > 0 && (
                <p className="text-[var(--primary)] font-bold">{p.startingPrice.toLocaleString("ar-EG")} ج.م</p>
              )}
              {p.totalUnits > 0 && <p className="text-gray-400 text-xs mt-0.5">{p.totalUnits} وحدة</p>}
            </div>
            <Link to={`/projects/${p.slug}`}
              className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              عرض التفاصيل <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {p.coverImage ? (
          <img src={p.coverImage} alt={p.name?.ar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-dark)]/30">
            <Building2 className="w-16 h-16 text-[var(--primary)]/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Badge variant={variant}>{label}</Badge>
          {p.featured && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold text-center">مميز</span>}
        </div>
        {p.amenities?.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
            {p.amenities.length} ميزة
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{p.name?.ar}</h3>
        {p.developer?.ar && <p className="text-xs text-gray-400 mb-2">{p.developer.ar}</p>}
        {p.location?.city?.ar && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{p.location.city.ar}</span>
          </div>
        )}
        {p.description?.ar && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.description.ar}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {p.startingPrice > 0 && (
              <p className="text-[var(--primary)] font-bold">{p.startingPrice.toLocaleString("ar-EG")} ج.م</p>
            )}
            {p.totalUnits > 0 && <p className="text-gray-400 text-xs mt-0.5">{p.totalUnits} وحدة</p>}
          </div>
          <Link to={`/projects/${p.slug}`}
            className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            عرض التفاصيل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: cmsPage } = useCms("projects_page", {
    title_ar: "مشاريعنا",
    subtitle_ar: "اكتشف مجموعة مشاريعنا المتميزة",
    hero_image: "",
  });
  const [projects, setProjects] = useState([]);
  const [allCounts, setAllCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("grid");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { page, search: debouncedSearch, status, published: true } });
      setProjects(res.data.projects || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Fetch status counts (lightweight)
  const loadCounts = async () => {
    try {
      const res = await api.get("/projects", { params: { published: true, limit: 1000 } });
      const list = res.data.projects || [];
      const counts = list.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      counts[""] = list.length;
      setAllCounts(counts);
    } catch {
      // ignore
    }
  };

  useEffect(() => { document.title = "المشاريع | الصرح للتطوير العقاري"; }, []);
  useEffect(() => { load(); }, [page, status, debouncedSearch]);
  useEffect(() => { loadCounts(); }, []);

  const featured = useMemo(() => projects.filter((p) => p.featured), [projects]);
  const regular = useMemo(() => projects.filter((p) => !p.featured), [projects]);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero Banner */}
      <PageHero
        title={cmsPage.title_ar}
        subtitle={cmsPage.subtitle_ar}
        image={cmsPage.hero_image}
      />

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="ابحث عن مشروع..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((o) => {
              const count = allCounts[o.value] ?? 0;
              return (
                <button
                  key={o.value}
                  onClick={() => { setStatus(o.value); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    status === o.value
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {o.label} {count > 0 && <span className="opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden mr-auto">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-2.5 text-sm ${view === "grid" ? "bg-[var(--primary)] text-white" : "bg-white text-gray-700"}`}
              title="عرض بطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2.5 text-sm ${view === "list" ? "bg-[var(--primary)] text-white" : "bg-white text-gray-700"}`}
              title="عرض قائمة"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? <LoadingSpinner className="h-64" size="lg" /> : projects.length === 0 ? (
          <EmptyState icon={Building2} title="لا توجد مشاريع" description="لا توجد مشاريع تطابق بحثك" />
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-5">{total} مشروع</p>

            {/* Featured Section */}
            {featured.length > 0 && page === 1 && !status && !debouncedSearch && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-bold text-gray-900 text-lg">المشاريع المميزة</h2>
                </div>
                <div className={view === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                  {featured.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div className={view === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {regular.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}
              </div>
            )}
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>

      {/* Admin floating manage button */}
      {user && ["admin", "supervisor"].includes(user.role) && (
        <a href="/admin/projects"
          className="fixed bottom-24 left-6 z-50 flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-[var(--primary-dark)] transition-all text-sm font-medium"
          title="إدارة المشاريع">
          <Settings className="w-4 h-4" />
          إدارة المشاريع
        </a>
      )}
    </div>
  );
}
