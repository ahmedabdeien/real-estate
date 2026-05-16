import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Home, Building2, Phone, ArrowRight, MessageCircle,
  CheckCircle, Star, ChevronLeft, ChevronRight, Play,
  BedDouble, Bath, Maximize2, Layers, Scale, X, Filter, Eye
} from "lucide-react";
import api from "../../api/axios";
import { PageLoader } from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const unitTypeAr = {
  apartment: "شقة", villa: "فيلا", studio: "استوديو",
  duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب",
  shop: "محل", chalet: "شاليه"
};

const unitStatusOptions = [
  { value: "", label: "الكل" },
  { value: "available", label: "متاح" },
  { value: "sold", label: "مباعة" },
  { value: "reserved", label: "محجوز" },
];

const statusColors = {
  available: "bg-green-100 text-green-700 border-green-200",
  sold: "bg-red-100 text-red-700 border-red-200",
  reserved: "bg-amber-100 text-amber-700 border-amber-200",
};
const statusLabels = { available: "متاح", sold: "مباعة", reserved: "محجوز" };

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [unitFilter, setUnitFilter] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const { contact } = useSiteSettings();
  const waNumber = (contact.whatsapp_number || contact.whatsapp || contact.phone || "201000000000").replace(/\D/g, "");

  useEffect(() => {
    document.title = "تفاصيل المشروع - الصرح للتطوير العقاري";
    api.get(`/projects/${slug}`)
      .then((r) => { setProject(r.data.project); setUnits(r.data.units || []); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-gray-500 mb-4 text-lg">المشروع غير موجود</p>
        <Link to="/projects" className="text-[#2d5d89] font-semibold flex items-center gap-1 justify-center hover:underline">
          <ArrowRight className="w-4 h-4" /> العودة للمشاريع
        </Link>
      </div>
    </div>
  );

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);
  const { label, variant } = statusBadge(project.status);
  const filteredUnits = unitFilter ? units.filter(u => u.status === unitFilter) : units;
  const availableCount = units.filter(u => u.status === "available").length;
  const soldCount = units.filter(u => u.status === "sold").length;
  const reservedCount = units.filter(u => u.status === "reserved").length;

  const toggleCompare = (id) => {
    setCompareIds(prev => prev.includes(id)
      ? prev.filter(x => x !== id)
      : prev.length < 3 ? [...prev, id] : prev
    );
  };
  const compareUnits = units.filter(u => compareIds.includes(u._id));

  // Extract embed URL from Google Maps link
  const getMapEmbed = () => {
    if (project.mapEmbedUrl) return project.mapEmbedUrl;
    if (project.location?.lat && project.location?.lng) {
      return `https://maps.google.com/maps?q=${project.location.lat},${project.location.lng}&z=15&output=embed`;
    }
    return null;
  };

  const prevImage = () => setActiveImage(i => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setActiveImage(i => (i + 1) % allImages.length);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero Image Section */}
      {allImages.length > 0 && (
        <div className="relative h-[50vh] md:h-[60vh] bg-gray-900 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              src={allImages[activeImage]}
              alt={project.name?.ar}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button onClick={prevImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={nextImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-4 right-4">
            <Badge variant={variant}>{label}</Badge>
          </div>

          {/* Project name overlay */}
          <div className="absolute bottom-0 right-0 left-0 p-6">
            <div className="container mx-auto">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{project.name?.ar}</h1>
              {project.location?.city?.ar && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location.address?.ar && project.location.address.ar + "، "}{project.location.city.ar}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#2d5d89]">الرئيسية</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-[#2d5d89]">المشاريع</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{project.name?.ar}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Stats Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.startingPrice > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">يبدأ من</p>
                    <p className="text-lg font-black text-[#2d5d89]">{project.startingPrice.toLocaleString("ar-EG")}</p>
                    <p className="text-xs text-gray-400">ج.م</p>
                  </div>
                )}
                {project.totalUnits > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">إجمالي الوحدات</p>
                    <p className="text-lg font-black text-[#2d5d89]">{project.totalUnits}</p>
                    <p className="text-xs text-gray-400">وحدة</p>
                  </div>
                )}
                {availableCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">متاح</p>
                    <p className="text-lg font-black text-green-600">{availableCount}</p>
                    <p className="text-xs text-gray-400">وحدة</p>
                  </div>
                )}
                {project.developer?.ar && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">المطور</p>
                    <p className="text-sm font-bold text-gray-800">{project.developer.ar}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {project.description?.ar && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full inline-block"></span>
                  عن المشروع
                </h2>
                <p className="text-gray-600 leading-relaxed">{project.description.ar}</p>
              </div>
            )}

            {/* Amenities */}
            {project.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full inline-block"></span>
                  المميزات والمرافق
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {project.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 bg-[#2d5d89]/5 rounded-xl px-3 py-2">
                      <CheckCircle className="w-4 h-4 text-[#2d5d89] flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2d5d89] rounded-full inline-block"></span>
                  معرض الصور
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => { setActiveImage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`aspect-video rounded-xl overflow-hidden transition-all ${i === activeImage ? "ring-2 ring-[#2d5d89] ring-offset-1" : "opacity-70 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {getMapEmbed() && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2d5d89]" /> موقع المشروع
                  </h2>
                </div>
                <div className="h-72 relative">
                  <iframe
                    src={getMapEmbed()}
                    width="100%" height="100%"
                    style={{ border: 0 }} loading="lazy"
                    title="موقع المشروع"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            {/* Video */}
            {project.videoUrl && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#2d5d89]" /> فيديو المشروع
                  </h2>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={project.videoUrl.includes("embed/") ? project.videoUrl : project.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                    className="w-full h-full"
                    allowFullScreen title="فيديو المشروع"
                  />
                </div>
              </div>
            )}

            {/* Units Section */}
            {units.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">وحدات المشروع</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{units.length} وحدة إجمالاً</p>
                    </div>
                    {/* Status filter pills */}
                    <div className="flex flex-wrap gap-2">
                      {unitStatusOptions.map(opt => {
                        const count = opt.value ? units.filter(u => u.status === opt.value).length : units.length;
                        return (
                          <button key={opt.value}
                            onClick={() => setUnitFilter(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              unitFilter === opt.value
                                ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]"
                            }`}>
                            {opt.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compare bar notice */}
                  {compareIds.length > 0 && (
                    <div className="mt-3 p-3 bg-[#2d5d89]/5 border border-[#2d5d89]/20 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-[#2d5d89] font-medium">
                        تم اختيار {compareIds.length} وحدة للمقارنة
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => setShowCompare(true)}
                          className="px-3 py-1.5 bg-[#2d5d89] text-white text-xs rounded-lg font-medium">
                          مقارنة
                        </button>
                        <button onClick={() => setCompareIds([])}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnits.length === 0 ? (
                    <div className="md:col-span-2 text-center py-12 text-gray-400">
                      <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>لا توجد وحدات بهذه الحالة</p>
                    </div>
                  ) : filteredUnits.map((u) => {
                    const inCompare = compareIds.includes(u._id);
                    return (
                      <motion.div key={u._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`border-2 rounded-2xl overflow-hidden transition-all ${
                          inCompare ? "border-[#2d5d89] shadow-md shadow-[#2d5d89]/10" : "border-gray-100 hover:border-gray-200"
                        }`}>
                        {/* Cover */}
                        {u.images?.[0] && (
                          <div className="h-36 overflow-hidden">
                            <img src={u.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-gray-900">{unitTypeAr[u.type] || u.type} — {u.unitNumber}</p>
                              {u.floor && <p className="text-xs text-gray-400 mt-0.5">الدور: {u.floor}</p>}
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[u.status] || "bg-gray-100 text-gray-600"}`}>
                              {statusLabels[u.status] || u.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {u.area && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                                <Maximize2 className="w-3 h-3 text-gray-400" />
                                <span>{u.area} م²</span>
                              </div>
                            )}
                            {u.rooms && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                                <BedDouble className="w-3 h-3 text-gray-400" />
                                <span>{u.rooms} غرف</span>
                              </div>
                            )}
                            {u.bathrooms && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                                <Bath className="w-3 h-3 text-gray-400" />
                                <span>{u.bathrooms}</span>
                              </div>
                            )}
                          </div>

                          {u.price > 0 && (
                            <p className="text-[#2d5d89] font-black text-lg mb-3">
                              {u.price.toLocaleString("ar-EG")} <span className="text-xs font-normal text-gray-400">ج.م</span>
                            </p>
                          )}

                          {u.amenities?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {u.amenities.slice(0, 3).map(a => (
                                <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                              ))}
                              {u.amenities.length > 3 && <span className="text-xs text-gray-400">+{u.amenities.length - 3}</span>}
                            </div>
                          )}

                          <button onClick={() => toggleCompare(u._id)}
                            className={`w-full py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                              inCompare
                                ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                                : "border-gray-200 text-gray-600 hover:border-[#2d5d89] hover:text-[#2d5d89]"
                            }`}>
                            <Scale className="w-3.5 h-3.5" />
                            {inCompare ? "إلغاء المقارنة" : "إضافة للمقارنة"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div className="space-y-4">
            {/* Contact Card - Sticky */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-1 text-lg">احجز استشارة مجانية</h3>
              <p className="text-sm text-gray-400 mb-4">سيتواصل معك خبراؤنا في أقرب وقت</p>
              <ContactForm projectName={project.name?.ar} projectId={project._id} waNumber={waNumber} />
            </div>

            {/* Brochure */}
            {project.brochureUrl && (
              <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"
                className="block bg-[#2d5d89] hover:bg-[#245079] text-white text-center py-3 rounded-2xl font-semibold text-sm transition-colors">
                تحميل الكتيب التعريفي
              </a>
            )}

            {/* Project quick info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-bold text-gray-800 text-sm mb-3">معلومات المشروع</h3>
              {[
                { label: "الحالة", value: label },
                project.developer?.ar && { label: "المطور", value: project.developer.ar },
                project.location?.city?.ar && { label: "المدينة", value: project.location.city.ar },
                project.totalUnits && { label: "الوحدات", value: `${project.totalUnits} وحدة` },
                availableCount > 0 && { label: "المتاح", value: `${availableCount} وحدة`, color: "text-green-600" },
              ].filter(Boolean).map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color || "text-gray-700"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareUnits.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="font-bold text-gray-900 text-lg">مقارنة الوحدات</h3>
                <button onClick={() => setShowCompare(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-right text-sm font-medium text-gray-500 pb-4 w-32"></th>
                      {compareUnits.map(u => (
                        <th key={u._id} className="text-center pb-4 px-3">
                          <div className="bg-[#2d5d89]/5 rounded-xl p-3">
                            <p className="font-bold text-gray-900 text-sm">{unitTypeAr[u.type] || u.type}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{u.unitNumber}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "الحالة", key: u => <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[u.status] || ""}`}>{statusLabels[u.status] || u.status}</span> },
                      { label: "السعر", key: u => u.price ? `${u.price.toLocaleString("ar-EG")} ج.م` : "—" },
                      { label: "المساحة", key: u => u.area ? `${u.area} م²` : "—" },
                      { label: "الغرف", key: u => u.rooms || "—" },
                      { label: "الحمامات", key: u => u.bathrooms || "—" },
                      { label: "الدور", key: u => u.floor || "—" },
                      { label: "المرافق", key: u => u.amenities?.length ? u.amenities.slice(0,4).join("، ") : "—" },
                    ].map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                        <td className="py-3 px-2 text-sm text-gray-500 font-medium">{row.label}</td>
                        {compareUnits.map(u => (
                          <td key={u._id} className="py-3 px-3 text-center text-sm text-gray-800 font-semibold">
                            {row.key(u)}
                          </td>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/leads", form); setSent(true); }
    catch {} finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <p className="font-bold text-gray-900">تم استلام طلبك!</p>
      <p className="text-gray-500 text-sm mt-1">سيتواصل معك فريقنا خلال ٢٤ ساعة</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="الاسم الكامل" required
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="رقم الهاتف" required type="tel"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="رسالتك (اختياري)"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
      <button type="submit" disabled={loading}
        className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
        {loading ? "جاري الإرسال..." : "احجز الآن مجاناً"}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${waNumber}`}
          className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors">
          <Phone className="w-3.5 h-3.5" /> اتصل
        </a>
        <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن مشروع ${projectName}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-medium transition-colors">
          <MessageCircle className="w-3.5 h-3.5" /> واتساب
        </a>
      </div>
    </form>
  );
}
