import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Building2, Phone, MessageCircle, CheckCircle,
  ChevronLeft, ChevronRight, Play, BedDouble, Bath,
  Maximize2, X, Pencil, ArrowRight, Tag, Home,
  GitCompare, RotateCcw
} from "lucide-react";
import api from "../../api/axios";
import { PageLoader } from "../../Components/UI/LoadingSpinner";
import { statusBadge } from "../../Components/UI/Badge";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { useAuth } from "../../context/AuthContext";

const unitTypeAr = {
  apartment: "شقة", villa: "فيلا", studio: "استوديو",
  duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب",
  shop: "محل", chalet: "شاليه",
};

const UNIT_STATUS = {
  available: { label: "متاح",   bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  sold:      { label: "مباعة",  bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  reserved:  { label: "محجوز",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
};

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [unitFilter, setUnitFilter] = useState("all");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const { contact } = useSiteSettings();
  const waNum = (contact.whatsapp_number || contact.whatsapp || contact.phone || "201000000000").replace(/\D/g, "");

  useEffect(() => {
    document.title = "تفاصيل المشروع";
    api.get(`/projects/${slug}`)
      .then(r => { setProject(r.data.project); setUnits(r.data.units || []); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-gray-500 mb-4">المشروع غير موجود</p>
        <Link to="/projects" className="text-[#2d5d89] font-semibold hover:underline">← العودة للمشاريع</Link>
      </div>
    </div>
  );

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);
  const { label: statusLabel, variant } = statusBadge(project.status);
  const filteredUnits = unitFilter === "all" ? units : units.filter(u => u.status === unitFilter);
  const counts = {
    all: units.length,
    available: units.filter(u => u.status === "available").length,
    sold: units.filter(u => u.status === "sold").length,
    reserved: units.filter(u => u.status === "reserved").length,
  };

  const toggleCompare = (id) => setCompareList(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);
  const compareUnits = units.filter(u => compareList.includes(u._id));

  const mapEmbed = project.mapEmbedUrl || (project.location?.lat && project.location?.lng ? `https://maps.google.com/maps?q=${project.location.lat},${project.location.lng}&z=15&output=embed` : null);

  const variantColors = {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Hero */}
      {allImages.length > 0 && (
        <div className="relative h-[55vh] bg-[#12283C] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img key={activeImg} src={allImages[activeImg]} alt="" className="w-full h-full object-cover opacity-80"
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 0.85, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#12283C]/80 via-transparent to-transparent" />

          {allImages.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            </>
          )}

          {/* Status pill */}
          <div className="absolute top-5 right-5">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${variantColors[variant] || "bg-gray-100 text-gray-600"}`}>{statusLabel}</span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 right-0 left-0 px-6 pb-6">
            <div className="container mx-auto">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1 drop-shadow">{project.name?.ar}</h1>
              {project.location?.city?.ar && (
                <p className="text-white/70 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {[project.location.address?.ar, project.location.city.ar].filter(Boolean).join("، ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-2.5">
        <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#2d5d89]">الرئيسية</Link>
          <span className="text-gray-300">/</span>
          <Link to="/projects" className="hover:text-[#2d5d89]">المشاريع</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate">{project.name?.ar}</span>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ direction: "rtl" }}>

          {/* SIDEBAR (RIGHT in RTL — first in DOM) */}
          <div className="space-y-4 order-first lg:order-none lg:col-span-1">

            {/* Contact card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#2d5d89] rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">احجز استشارة مجانية</p>
                  <p className="text-xs text-gray-400">نتواصل معك خلال ٢٤ ساعة</p>
                </div>
              </div>
              <ContactForm projectName={project.name?.ar} projectId={project._id} waNumber={waNum} />
            </div>

            {/* Project stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">تفاصيل المشروع</p>
              <div className="space-y-2.5">
                {[
                  project.developer?.ar && { icon: Building2, label: "المطور", value: project.developer.ar },
                  project.startingPrice > 0 && { icon: Tag, label: "يبدأ من", value: `${project.startingPrice.toLocaleString("ar-EG")} ج.م` },
                  project.totalUnits > 0 && { icon: Home, label: "إجمالي الوحدات", value: `${project.totalUnits} وحدة` },
                  counts.available > 0 && { icon: CheckCircle, label: "متاح الآن", value: `${counts.available} وحدة`, green: true },
                  project.location?.city?.ar && { icon: MapPin, label: "الموقع", value: project.location.city.ar },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${item.green ? "text-green-500" : "text-gray-400"}`} />
                    <span className="text-xs text-gray-400 w-20 flex-shrink-0">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.green ? "text-green-600" : "text-gray-800"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brochure */}
            {project.brochureUrl && (
              <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"
                className="block bg-[#12283C] hover:bg-[#1a3a58] text-white text-center py-3 rounded-xl font-semibold text-sm transition-colors">
                تحميل الكتيب التعريفي
              </a>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {project.description?.ar && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full" />
                  عن المشروع
                </h2>
                <p className="text-gray-600 leading-loose text-sm">{project.description.ar}</p>
              </div>
            )}

            {/* Amenities */}
            {project.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full" />
                  المميزات والمرافق
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 p-2.5 bg-[#2d5d89]/5 rounded-xl border border-[#2d5d89]/10">
                      <div className="w-5 h-5 rounded-full bg-[#2d5d89]/15 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-[#2d5d89]" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full" />
                  معرض الصور
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => { setActiveImg(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`aspect-square rounded-xl overflow-hidden transition-all ${i === activeImg ? "ring-2 ring-[#2d5d89]" : "opacity-60 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {mapEmbed && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2d5d89]" />
                  <h2 className="font-bold text-gray-900">موقع المشروع</h2>
                </div>
                <iframe src={mapEmbed} width="100%" height="280" style={{ border: 0 }} loading="lazy" title="موقع المشروع" sandbox="allow-scripts allow-same-origin" />
              </div>
            )}

            {/* Video */}
            {project.videoUrl && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#2d5d89]" />
                  <h2 className="font-bold text-gray-900">فيديو المشروع</h2>
                </div>
                <div className="aspect-video">
                  <iframe src={project.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                    className="w-full h-full" allowFullScreen title="فيديو" />
                </div>
              </div>
            )}

            {/* Units */}
            {units.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="font-bold text-gray-900 text-lg">وحدات المشروع</h2>
                    {/* Filter tabs */}
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { key: "all", label: "الكل" },
                        { key: "available", label: "متاح" },
                        { key: "reserved", label: "محجوز" },
                        { key: "sold", label: "مباعة" },
                      ].map(tab => (
                        <button key={tab.key}
                          onClick={() => setUnitFilter(tab.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            unitFilter === tab.key
                              ? "bg-[#2d5d89] text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}>
                          {tab.label} {counts[tab.key] > 0 && `(${counts[tab.key]})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compare bar */}
                  {compareList.length >= 2 && (
                    <div className="mt-3 flex items-center justify-between bg-[#2d5d89]/5 border border-[#2d5d89]/20 rounded-xl px-4 py-2.5">
                      <span className="text-sm text-[#2d5d89] font-semibold">{compareList.length} وحدات مختارة للمقارنة</span>
                      <div className="flex gap-2">
                        <button onClick={() => setShowCompare(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d5d89] text-white text-xs rounded-lg font-semibold">
                          <GitCompare className="w-3.5 h-3.5" /> مقارنة
                        </button>
                        <button onClick={() => setCompareList([])}
                          className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">
                          مسح
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Unit cards - horizontal list */}
                <div className="divide-y divide-gray-50">
                  {filteredUnits.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا توجد وحدات بهذه الحالة</p>
                    </div>
                  ) : filteredUnits.map(u => {
                    const st = UNIT_STATUS[u.status] || UNIT_STATUS.available;
                    const inCompare = compareList.includes(u._id);
                    return (
                      <motion.div key={u._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${inCompare ? "bg-[#2d5d89]/3" : ""}`}>

                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {u.images?.[0]
                            ? <img src={u.images[0]} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Home className="w-6 h-6 text-gray-300" /></div>
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-sm">{unitTypeAr[u.type] || u.type} {u.unitNumber && `— ${u.unitNumber}`}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {u.area && <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{u.area} م²</span>}
                            {u.rooms && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{u.rooms} غرف</span>}
                            {u.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{u.bathrooms} حمام</span>}
                            {u.floor && <span>الدور: {u.floor}</span>}
                          </div>
                        </div>

                        {/* Price + Compare */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {u.price > 0 && (
                            <div className="text-left">
                              <p className="font-black text-[#2d5d89] text-sm">{u.price.toLocaleString("ar-EG")}</p>
                              <p className="text-xs text-gray-400">ج.م</p>
                            </div>
                          )}
                          <button onClick={() => toggleCompare(u._id)}
                            title={inCompare ? "إلغاء المقارنة" : "أضف للمقارنة"}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                              inCompare ? "bg-[#2d5d89] border-[#2d5d89] text-white" : "border-gray-200 text-gray-400 hover:border-[#2d5d89] hover:text-[#2d5d89]"
                            }`}>
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin quick edit button */}
      {user && ["admin", "supervisor"].includes(user.role) && (
        <a href={`/admin/projects`}
          className="fixed bottom-24 left-6 z-50 flex items-center gap-2 bg-[#2d5d89] text-white px-4 py-2.5 rounded-full shadow-xl hover:bg-[#245079] transition-all text-sm font-bold">
          <Pencil className="w-4 h-4" />
          تعديل المشروع
        </a>
      )}

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareUnits.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowCompare(false)}>
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-auto" dir="rtl">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-[#2d5d89]" />
                  <h3 className="font-bold text-gray-900">مقارنة الوحدات</h3>
                </div>
                <button onClick={() => setShowCompare(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="w-28 text-right text-xs text-gray-400 font-medium pb-4"></th>
                      {compareUnits.map(u => (
                        <th key={u._id} className="pb-4 px-4">
                          <div className="bg-[#2d5d89]/5 rounded-2xl p-3 text-center">
                            {u.images?.[0] && <img src={u.images[0]} alt="" className="w-full h-16 object-cover rounded-xl mb-2" />}
                            <p className="font-bold text-gray-900 text-sm">{unitTypeAr[u.type] || u.type}</p>
                            <p className="text-xs text-gray-400">{u.unitNumber}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "الحالة",      fn: u => { const s = UNIT_STATUS[u.status]; return s ? <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.bg} ${s.text}`}>{s.label}</span> : "—"; } },
                      { label: "السعر",       fn: u => u.price ? <span className="font-black text-[#2d5d89]">{u.price.toLocaleString("ar-EG")} ج.م</span> : "—" },
                      { label: "المساحة",     fn: u => u.area ? `${u.area} م²` : "—" },
                      { label: "الغرف",       fn: u => u.rooms || "—" },
                      { label: "الحمامات",    fn: u => u.bathrooms || "—" },
                      { label: "الدور",       fn: u => u.floor || "—" },
                      { label: "سعر المتر",   fn: u => (u.price && u.area) ? `${Math.round(u.price / u.area).toLocaleString("ar-EG")} ج.م` : "—" },
                      { label: "المرافق",     fn: u => u.amenities?.length ? <div className="flex flex-wrap gap-1">{u.amenities.slice(0,4).map(a => <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{a}</span>)}</div> : "—" },
                    ].map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-gray-50/60" : ""}>
                        <td className="py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{row.label}</td>
                        {compareUnits.map(u => (
                          <td key={u._id} className="py-3 px-4 text-center text-gray-800 font-medium">{row.fn(u)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm({ projectName, projectId, waNumber }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "", interestedProject: projectId, source: "website" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/leads", form); setSent(true); }
    catch {} finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center py-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
        <CheckCircle className="w-6 h-6 text-green-500" />
      </div>
      <p className="font-bold text-gray-900 text-sm">تم الاستلام!</p>
      <p className="text-xs text-gray-400 mt-1">سنتواصل معك قريباً</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="الاسم الكامل" required
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        placeholder="رقم الهاتف" required type="tel"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <textarea rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        placeholder="رسالة (اختياري)"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
      <button type="submit" disabled={loading}
        className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
        {loading ? "..." : "احجز الآن"}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${waNumber}`}
          className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-medium hover:bg-gray-50">
          <Phone className="w-3.5 h-3.5" /> اتصل
        </a>
        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`أريد الاستفسار عن ${projectName}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-xs font-medium">
          <MessageCircle className="w-3.5 h-3.5" /> واتساب
        </a>
      </div>
    </form>
  );
}
