import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Calendar, Link2 } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import EmptyState from "../../Components/UI/EmptyState";
import Badge from "../../Components/UI/Badge";

const typeAr = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };

export default function CareersPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", career: "", cv_link: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get("/careers", { params: { published: true } })
      .then((r) => setCareers(r.data.careers))
      .finally(() => setLoading(false));
  }, []);

  const apply = (career) => {
    setSelected(career);
    setForm({ name: "", phone: "", email: "", career: career._id, cv_link: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const msg = form.cv_link
        ? `تقديم على وظيفة: ${selected?.title?.ar} — رابط السيرة الذاتية: ${form.cv_link}`
        : `تقديم على وظيفة: ${selected?.title?.ar}`;
      await api.post("/leads", { ...form, source: "website", message: msg });
      setSent(true);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-white mb-3">الوظائف المتاحة</h1>
          <p className="text-white/70 text-lg">انضم إلى فريق الصرح للعقارات</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {loading ? <LoadingSpinner className="h-64" size="lg" /> : careers.length === 0 ? (
          <EmptyState icon={Briefcase} title="لا توجد وظائف متاحة حالياً" description="تابعنا للاطلاع على فرص العمل الجديدة" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {careers.map((c) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#2d5d89]/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2d5d89]/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-[#2d5d89]" />
                  </div>
                  <Badge variant="info">{typeAr[c.type]}</Badge>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{c.title?.ar}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                  {c.department?.ar && (
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{c.department.ar}</span>
                  )}
                  {c.location?.ar && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{c.location.ar}</span>
                  )}
                  {c.deadline && (
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />حتى {new Date(c.deadline).toLocaleDateString("ar-EG")}</span>
                  )}
                </div>
                {c.description?.ar && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{c.description.ar}</p>
                )}
                {c.cv_link ? (
                  <a href={c.cv_link} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <span>📎</span> قدّم عبر الرابط
                  </a>
                ) : (
                  <button onClick={() => apply(c)}
                    className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    قدّم الآن
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Apply Modal */}
        {selected && !sent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-xl text-gray-900 mb-1">التقديم على وظيفة</h3>
              <p className="text-[#2d5d89] font-semibold text-sm mb-5">{selected.title?.ar}</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="الاسم الكامل *" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="رقم الهاتف *" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="البريد الإلكتروني *" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-gray-400" />
                    <label className="text-xs text-gray-500">رابط سيرتك الذاتية (Google Drive / Dropbox)</label>
                  </div>
                  <input type="url" value={form.cv_link} onChange={(e) => setForm({ ...form, cv_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelected(null)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit"
                    className="flex-1 bg-[#2d5d89] hover:bg-[#245079] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    إرسال
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {sent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setSent(false); setSelected(null); }}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">تم إرسال طلبك!</h3>
              <p className="text-gray-500 text-sm">سيتواصل معك فريق الموارد البشرية قريباً</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
