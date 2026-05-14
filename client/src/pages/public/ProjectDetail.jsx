import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Home, Building2, Phone, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import { PageLoader } from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";

const unitTypeAr = { apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه" };

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/projects/${slug}`)
      .then((r) => { setProject(r.data.project); setUnits(r.data.units || []); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-gray-500 mb-4">المشروع غير موجود</p>
        <Link to="/projects" className="text-[#2d5d89] font-semibold">← العودة للمشاريع</Link>
      </div>
    </div>
  );

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);
  const { label, variant } = statusBadge(project.status);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#2d5d89]">الرئيسية</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-[#2d5d89]">المشاريع</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{project.name?.ar}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-72 md:h-96 relative">
                  <img src={allImages[activeImage]} alt={project.name?.ar} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4"><Badge variant={variant}>{label}</Badge></div>
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${i === activeImage ? "ring-2 ring-[#2d5d89]" : "opacity-60 hover:opacity-100"}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 mb-1">{project.name?.ar}</h1>
                  {project.location?.city?.ar && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location.address?.ar}, {project.location.city.ar}</span>
                    </div>
                  )}
                </div>
                {project.startingPrice > 0 && (
                  <div className="text-left">
                    <p className="text-xs text-gray-400">يبدأ من</p>
                    <p className="text-2xl font-black text-[#2d5d89]">{project.startingPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">جنيه مصري</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                {project.totalUnits > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#2d5d89]">{project.totalUnits}</p>
                    <p className="text-xs text-gray-500 mt-0.5">وحدة</p>
                  </div>
                )}
              </div>

              {project.description?.ar && (
                <div>
                  <h2 className="font-bold text-gray-900 mb-2">وصف المشروع</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">{project.description.ar}</p>
                </div>
              )}
            </div>

            {/* Units */}
            {units.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg mb-4">الوحدات المتاحة ({units.filter(u => u.status === "available").length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {units.map((u) => {
                    const { label: ul, variant: uv } = statusBadge(u.status);
                    return (
                      <div key={u._id} className="border border-gray-100 rounded-xl p-4 hover:border-[#2d5d89]/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 text-sm">{unitTypeAr[u.type]} — {u.unitNumber}</span>
                          <Badge variant={uv}>{ul}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                          <span>{u.area} م²</span>
                          <span>ط {u.floor}</span>
                          <span>{u.rooms} غرف</span>
                        </div>
                        <p className="text-[#2d5d89] font-bold text-sm mt-2">{u.price?.toLocaleString()} ج</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">احجز استشارة مجانية</h3>
              <ContactForm projectName={project.name?.ar} projectId={project._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ projectName, projectId }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "", interestedProject: projectId, source: "website" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leads", form);
      setSent(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="text-center py-6">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
        <span className="text-green-600 text-xl">✓</span>
      </div>
      <p className="font-semibold text-gray-900">شكراً لك!</p>
      <p className="text-gray-500 text-sm mt-1">سيتواصل معك فريقنا قريباً</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="الاسم الكامل" required
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="رقم الهاتف" required
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="رسالتك (اختياري)"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
      <button type="submit" disabled={loading}
        className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
        {loading ? "جاري الإرسال..." : "احجز الآن"}
      </button>
      <a href="tel:+201234567890"
        className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
        <Phone className="w-4 h-4" />
        اتصل مباشرة
      </a>
    </form>
  );
}
