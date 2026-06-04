import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Calendar, Clock, ArrowRight, Share2,
  CheckCircle, Link2, Facebook, Twitter, Linkedin, MessageCircle,
  Copy, ChevronLeft, Users, DollarSign, ExternalLink,
} from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

const TYPE_LABELS = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };
const TYPE_COLORS = { full_time: "bg-blue-100 text-blue-700", part_time: "bg-purple-100 text-purple-700", contract: "bg-amber-100 text-amber-700", internship: "bg-green-100 text-green-700" };

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "", cv_link: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const pageUrl = window.location.href;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/careers/${id}`),
      api.get("/careers", { params: { published: true } }),
    ]).then(([det, all]) => {
      setCareer(det.data.career);
      setRelated((all.data.careers || []).filter(c => c._id !== id).slice(0, 3));
    }).catch(() => navigate("/careers"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/job-applications", { ...form, career: id });
      setSent(true);
    } catch (err) {
      alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى");
    } finally { setSending(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      label: "واتساب",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      href: `https://wa.me/?text=${encodeURIComponent(`وظيفة: ${career?.title?.ar}\n${pageUrl}`)}`,
    },
    {
      label: "فيسبوك",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: "X",
      icon: Twitter,
      color: "bg-gray-900 hover:bg-black",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`وظيفة شاغرة: ${career?.title?.ar}`)}&url=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    },
  ];

  if (loading) return <LoadingSpinner className="min-h-screen" size="lg" />;
  if (!career) return null;

  const isExpired = career.deadline && new Date(career.deadline) < new Date();

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-14">
        <div className="container mx-auto px-4">
          <Link to="/careers" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" /> العودة للوظائف
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[career.type]} border border-white/20`}>
                  {TYPE_LABELS[career.type]}
                </span>
                {career.published && !isExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-400/20 text-green-300 border border-green-400/30">
                    متاحة
                  </span>
                )}
                {isExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-400/20 text-red-300 border border-red-400/30">
                    انتهت المدة
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{career.title?.ar}</h1>
              {career.title?.en && <p className="text-white/60 text-lg mb-4">{career.title.en}</p>}
              <div className="flex flex-wrap gap-5 text-white/70 text-sm">
                {career.department?.ar && (
                  <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{career.department.ar}</span>
                )}
                {career.location?.ar && (
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{career.location.ar}</span>
                )}
                {career.deadline && (
                  <span className={`flex items-center gap-2 ${isExpired ? "text-red-300" : ""}`}>
                    <Calendar className="w-4 h-4" />
                    آخر موعد: {new Date(career.deadline).toLocaleDateString("ar-EG")}
                  </span>
                )}
                {career.salary?.min && !career.salary?.hidden && (
                  <span className="flex items-center gap-2 text-green-300">
                    <DollarSign className="w-4 h-4" />
                    {Number(career.salary.min).toLocaleString("ar-EG")} — {Number(career.salary.max).toLocaleString("ar-EG")} {career.salary.currency}
                  </span>
                )}
              </div>
            </div>

            {/* Share button */}
            <div className="relative">
              <button onClick={() => setShowShare(p => !p)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20">
                <Share2 className="w-4 h-4" /> مشاركة
              </button>
              {showShare && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute left-0 top-12 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-50" dir="rtl">
                  <p className="text-xs font-bold text-gray-500 mb-3">مشاركة الوظيفة</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {shareLinks.map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-medium transition-colors ${s.color}`}>
                        <s.icon className="w-4 h-4" /> {s.label}
                      </a>
                    ))}
                  </div>
                  <button onClick={copyLink}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      copied ? "border-green-300 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "تم النسخ!" : "نسخ الرابط"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {career.description?.ar && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#2d5d89]" /> وصف الوظيفة
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{career.description.ar}</p>
              </div>
            )}

            {/* Requirements */}
            {career.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#2d5d89]" /> المتطلبات
                </h2>
                <ul className="space-y-3">
                  {career.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-[#2d5d89]" />
                      </span>
                      <span className="text-gray-700 text-sm leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share section (mobile) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:hidden">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#2d5d89]" /> شارك هذه الوظيفة
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {shareLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${s.color}`}>
                    <s.icon className="w-4 h-4" /> {s.label}
                  </a>
                ))}
              </div>
              <button onClick={copyLink}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${copied ? "border-green-300 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Copy className="w-4 h-4" /> {copied ? "تم النسخ!" : "نسخ الرابط"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">قدّم الآن</h2>

              {isExpired ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-red-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">انتهت مدة التقديم على هذه الوظيفة</p>
                </div>
              ) : sent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">تم إرسال طلبك!</h3>
                  <p className="text-gray-500 text-sm">سيتواصل معك فريق الموارد البشرية قريباً</p>
                </div>
              ) : career.cv_link ? (
                <div>
                  <p className="text-gray-500 text-sm mb-4">للتقديم على هذه الوظيفة يرجى الضغط على الزر أدناه</p>
                  <a href={career.cv_link} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-3 rounded-xl text-sm font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" /> تقديم عبر الرابط
                  </a>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-3">
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="الاسم الكامل *" required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="رقم الهاتف *" required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="البريد الإلكتروني *" required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Link2 className="w-3.5 h-3.5 text-gray-400" />
                      <label className="text-xs text-gray-500">رابط السيرة الذاتية (اختياري)</label>
                    </div>
                    <input type="url" value={form.cv_link} onChange={e => setForm({...form, cv_link: e.target.value})}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                    {sending ? "جاري الإرسال..." : "إرسال الطلب"}
                  </button>
                </form>
              )}
            </div>

            {/* Share (desktop) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hidden lg:block">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#2d5d89]" /> مشاركة الوظيفة
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {shareLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-medium transition-colors ${s.color}`}>
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </a>
                ))}
              </div>
              <button onClick={copyLink}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-colors ${copied ? "border-green-300 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Copy className="w-3.5 h-3.5" /> {copied ? "تم النسخ!" : "نسخ الرابط"}
              </button>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5">وظائف أخرى قد تهمك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(c => (
                <Link key={c._id} to={`/careers/${c._id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-[#2d5d89]/30 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-[#2d5d89]" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[c.type]}`}>{TYPE_LABELS[c.type]}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#2d5d89] transition-colors">{c.title?.ar}</h3>
                  <p className="text-gray-400 text-xs">{c.department?.ar} • {c.location?.ar}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
