import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, BedDouble, Bath, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Pagination from "../../components/UI/Pagination";
import EmptyState from "../../components/UI/EmptyState";
import Badge, { statusBadge } from "../../components/UI/Badge";

const unitTypeAr = { apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه" };

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("available");
  const [project, setProject] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/units", { params: { page, status, project, published: true } });
      setUnits(res.data.units);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status, project]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100, published: true } }).then((r) => setProjects(r.data.projects));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-white mb-3">الوحدات المتاحة</h1>
          <p className="text-white/70 text-lg">اختر وحدتك المثالية من مجموعة متنوعة من الخيارات</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <select value={project} onChange={(e) => { setProject(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
            <option value="">كل المشاريع</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
          </select>
          <div className="flex gap-2">
            {[
              { value: "", label: "الكل" },
              { value: "available", label: "متاحة" },
              { value: "reserved", label: "محجوزة" },
            ].map((o) => (
              <button key={o.value} onClick={() => { setStatus(o.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === o.value ? "bg-[#2d5d89] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#2d5d89] hover:text-[#2d5d89]"
                }`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner className="h-64" size="lg" /> : units.length === 0 ? (
          <EmptyState icon={Home} title="لا توجد وحدات" description="جرب تغيير فلاتر البحث" />
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-5">{total} وحدة</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {units.map((u) => {
                const { label, variant } = statusBadge(u.status);
                return (
                  <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                    {u.images?.[0] ? (
                      <img src={u.images[0]} alt="" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-[#2d5d89] to-[#1a3d5c] flex items-center justify-center">
                        <Home className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{unitTypeAr[u.type]} — {u.unitNumber}</span>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      {u.project?.name?.ar && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{u.project.name.ar}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1"><BedDouble className="w-4 h-4 text-gray-400" />{u.rooms}</span>
                        <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-gray-400" />{u.bathrooms}</span>
                        <span className="font-medium">{u.area} م²</span>
                        <span>ط{u.floor}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-[#2d5d89] font-black text-lg">{u.price?.toLocaleString()} ج</p>
                        <Link to={u.project?.slug ? `/projects/${u.project.slug}` : "/units"}
                          className="text-sm text-[#2d5d89] font-semibold hover:underline flex items-center gap-1">
                          التفاصيل <ArrowLeft className="w-3.5 h-3.5" />
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
