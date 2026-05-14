import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Home as HomeIcon, Users, Award, ArrowLeft, Phone, MapPin, Calendar, Search, X } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";

// Badge labels for search result types
const typeBg = { project: "bg-blue-500", unit: "bg-emerald-500", blog: "bg-purple-500", career: "bg-amber-500" };

function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const boxRef  = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback((q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true);
    api.get("/search", { params: { q } })
      .then((r) => { setResults(r.data.results || []); setOpen(true); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/projects?search=${encodeURIComponent(query.trim())}`);
  };

  const clear = () => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); };

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl mx-auto" dir="rtl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <button type="submit" className="flex-shrink-0 px-5 py-4 text-[#2d5d89]">
            <Search className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => results.length && setOpen(true)}
            placeholder="ابحث عن مشاريع، وحدات، أخبار، وظائف..."
            className="flex-1 py-4 text-gray-900 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
          {searching && (
            <div className="px-4">
              <div className="w-4 h-4 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {query && !searching && (
            <button type="button" onClick={clear} className="px-4 py-4 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 inset-x-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {results.map((r, i) => (
              <Link key={i} to={r.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                {r.img ? (
                  <img src={r.img} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#2d5d89]/10 flex-shrink-0 flex items-center justify-center">
                    <Search className="w-4 h-4 text-[#2d5d89]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                  {r.sub && <p className="text-xs text-gray-400 truncate">{r.sub}</p>}
                </div>
                <span className={`text-xs text-white px-2 py-0.5 rounded-full flex-shrink-0 ${typeBg[r.type] || "bg-gray-400"}`}>
                  {r.badge}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
        {open && results.length === 0 && !searching && query.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-full mt-2 inset-x-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center z-50">
            <p className="text-gray-400 text-sm">لا توجد نتائج لـ «{query}»</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ icon: Icon, value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7 text-[#f59e0b]" />
      </div>
      <p className="text-4xl font-black text-white mb-1">{value}</p>
      <p className="text-white/70 text-sm">{label}</p>
    </motion.div>
  );
}

function ProjectCard({ project }) {
  const { label, variant } = statusBadge(project.status);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.name?.ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2d5d89] to-[#1a3d5c]">
            <Building2 className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={variant}>{label}</Badge>
        </div>
        {project.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="warning">مميز</Badge>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{project.name?.ar}</h3>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{project.location?.city?.ar}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {project.startingPrice > 0 && (
              <p className="text-[#2d5d89] font-bold text-sm">من {project.startingPrice.toLocaleString()} ج</p>
            )}
            {project.deliveryDate && (
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>تسليم {new Date(project.deliveryDate).getFullYear()}</span>
              </div>
            )}
          </div>
          <Link to={`/projects/${project.slug}`}
            className="flex items-center gap-1 text-[#2d5d89] hover:text-[#245079] text-sm font-semibold transition-colors group">
            <span>التفاصيل</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [hero, setHero] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get("/projects", { params: { featured: true, published: true, limit: 6 } })
      .then((r) => setProjects(r.data.projects))
      .finally(() => setLoadingProjects(false));
    api.get("/content/hero").then((r) => setHero(r.data.data || {})).catch(() => {});
    api.get("/content/stats").then((r) => setStats(r.data.data || {})).catch(() => {});
  }, []);

  const content = hero;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f2336] via-[#1a3d5c] to-[#2d5d89]">
        {content.background_image && (
          <div className="absolute inset-0">
            <img src={content.background_image} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2336]/90 to-[#0f2336]/40" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-[#f59e0b]/20 text-[#f59e0b] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur">
              الصرح للعقارات — مستقبلك يبدأ هنا
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {content.title_ar || "اكتشف بيت أحلامك"}
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              {content.subtitle_ar || "نقدم أفضل الوحدات السكنية والتجارية بمواقع متميزة وأسعار تنافسية وخدمة ما بعد البيع الاستثنائية"}
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <HeroSearch />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/projects"
                className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-xl hover:shadow-[#f59e0b]/20 hover:-translate-y-0.5">
                {content.cta_text_ar || "استكشف مشاريعنا"}
              </Link>
              <Link to="/contact"
                className="bg-white/10 backdrop-blur hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-colors">
                تواصل معنا
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#2d5d89]/80 to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-[#2d5d89] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8" dir="rtl">
            <StatItem icon={Building2} value={stats.projects_count   || "50+"}  label="مشروع ناجح" />
            <StatItem icon={HomeIcon}  value={stats.units_count      || "2000+"} label="وحدة سكنية" />
            <StatItem icon={Users}     value={stats.clients_count    || "5000+"} label="عميل سعيد" />
            <StatItem icon={Award}     value={stats.years_experience || "15+"}   label="سنة خبرة" />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-[#f8fafc]" dir="rtl">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#2d5d89] font-semibold text-sm uppercase tracking-widest">مشاريعنا</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">المشاريع المميزة</h2>
            <p className="text-gray-500 max-w-xl mx-auto">اكتشف مشاريعنا المتميزة التي تجمع بين الجودة والتصميم الفريد والموقع الاستراتيجي</p>
          </motion.div>

          {loadingProjects ? (
            <LoadingSpinner className="h-40" size="lg" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/projects"
              className="inline-flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-7 py-3.5 rounded-2xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2d5d89]/20">
              كل المشاريع
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#2d5d89] to-[#1a3d5c] py-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">هل أنت مستعد لبدء رحلتك العقارية؟</h2>
            <p className="text-white/70 text-lg mb-8">فريقنا المتخصص جاهز لمساعدتك في اختيار العقار المثالي</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact"
                className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-0.5">
                احجز استشارة مجانية
              </Link>
              <a href="tel:+201234567890"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-colors">
                <Phone className="w-5 h-5" />
                اتصل الآن
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
