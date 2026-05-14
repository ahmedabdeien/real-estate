import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Calendar, Eye } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs", { params: { page, search, status: "published" } });
      setBlogs(res.data.blogs || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-white mb-3">الأخبار والمقالات</h1>
          <p className="text-white/70 text-lg">آخر أخبار السوق العقاري والمقالات المتخصصة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-3 mb-8">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="ابحث عن مقال..."
              className="pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] w-64" />
          </div>
        </div>

        {loading ? <LoadingSpinner className="h-64" size="lg" /> : blogs.length === 0 ? (
          <EmptyState icon={FileText} title="لا توجد مقالات" description="لا توجد مقالات منشورة حالياً" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <motion.article key={b._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="h-48 overflow-hidden bg-gray-100">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.title?.ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2d5d89] to-[#1a3d5c]">
                        <FileText className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {b.views}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[#2d5d89] transition-colors">
                      {b.title?.ar}
                    </h3>
                    {b.excerpt?.ar && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{b.excerpt.ar}</p>
                    )}
                    <Link to={`/blog/${b.slug}`}
                      className="text-[#2d5d89] font-semibold text-sm hover:underline">
                      اقرأ المزيد ←
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
