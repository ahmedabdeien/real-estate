import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle, Navigation } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

export default function ContactPage() {
  const { user } = useAuth();
  const { contact: siteContact, settings } = useSiteSettings();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    message: "",
    source: "website",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update form if user logs in after page load
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name:  prev.name  || user.name  || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

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

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Resolve contact info: prefer content API → settings → fallback
  const phone    = siteContact.phone    || "01234567890";
  const email    = siteContact.email    || "info@elsarh.com";
  const address  = siteContact.address_ar || "القاهرة، جمهورية مصر العربية";
  const hours    = siteContact.working_hours || "السبت - الخميس: 9 صباحاً - 6 مساءً";
  const whatsapp = siteContact.whatsapp || phone;

  let branches = [];
  try { branches = settings.branches ? JSON.parse(settings.branches) : []; } catch {}

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-white mb-3">تواصل معنا</h1>
          <p className="text-white/70 text-lg">نحن هنا لمساعدتك في رحلتك العقارية</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-black text-gray-900 mb-6">معلومات التواصل</h2>
              {[
                { icon: Phone,   title: "الهاتف",               value: phone,   href: `tel:+2${phone}` },
                { icon: Mail,    title: "البريد الإلكتروني",     value: email,   href: `mailto:${email}` },
                { icon: MapPin,  title: "العنوان",               value: address },
                { icon: Clock,   title: "أوقات العمل",           value: hours },
              ].map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#2d5d89]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
                    {href ? (
                      <a href={href} className="font-semibold text-gray-900 hover:text-[#2d5d89] transition-colors">{value}</a>
                    ) : (
                      <p className="font-semibold text-gray-900">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* WhatsApp CTA */}
            <a href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/2${whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-0.5 w-full">
              <MessageCircle className="w-5 h-5" />
              تواصل عبر واتساب
            </a>

            {/* Map embed */}
            {siteContact.map_embed && (
              <div
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                dangerouslySetInnerHTML={{ __html: siteContact.map_embed.replace('width="600"', 'width="100%"').replace('height="450"', 'height="280"') }}
              />
            )}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {sent ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال رسالتك!</h3>
                <p className="text-gray-500">سيتواصل معك فريقنا في أقرب وقت ممكن</p>
                <button onClick={() => setSent(false)} className="mt-6 text-[#2d5d89] text-sm font-semibold hover:underline">
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-2xl font-black text-gray-900 mb-2">أرسل رسالتك</h2>
                <p className="text-gray-500 text-sm mb-4">سنرد عليك خلال 24 ساعة</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
                    <input value={form.name} onChange={(e) => f("name", e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف *</label>
                    <input value={form.phone} onChange={(e) => f("phone", e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={(e) => f("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رسالتك</label>
                  <textarea rows={5} value={form.message} onChange={(e) => f("message", e.target.value)}
                    placeholder="أخبرنا عن احتياجاتك العقارية..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white py-4 rounded-xl font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 text-sm">
                  <Send className="w-4 h-4" />
                  {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Branches Section */}
      {branches.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">فروعنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((br, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#2d5d89]" />
                    </div>
                    <h3 className="font-bold text-gray-900">{br.name || `فرع ${i + 1}`}</h3>
                  </div>
                  <div className="space-y-2.5 text-sm text-gray-600">
                    {br.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{br.address}</span>
                      </div>
                    )}
                    {br.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${br.phone}`} className="hover:text-[#2d5d89] transition-colors">{br.phone}</a>
                      </div>
                    )}
                    {br.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{br.hours}</span>
                      </div>
                    )}
                  </div>
                  {br.map_link && (
                    <a href={br.map_link} target="_blank" rel="noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 bg-[#2d5d89]/10 hover:bg-[#2d5d89] text-[#2d5d89] hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                      <Navigation className="w-4 h-4" />
                      عرض على الخريطة
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
