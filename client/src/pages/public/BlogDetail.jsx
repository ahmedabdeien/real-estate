import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import { PageLoader } from "../../Components/UI/LoadingSpinner";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then((r) => setBlog(r.data.blog)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-gray-500 mb-4">المقال غير موجود</p>
        <Link to="/blog" className="text-[#2d5d89] font-semibold">← العودة للمقالات</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      {/* Hero Image */}
      {blog.coverImage && (
        <div className="h-72 md:h-96 w-full overflow-hidden">
          <img src={blog.coverImage} alt={blog.title?.ar} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="flex items-center gap-2 text-[#2d5d89] text-sm font-semibold mb-6 hover:underline">
          <ArrowRight className="w-4 h-4" />
          العودة للمقالات
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(blog.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {blog.views} مشاهدة
            </span>
            {blog.author?.name && (
              <span>بقلم: {blog.author.name}</span>
            )}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">{blog.title?.ar}</h1>

          {blog.excerpt?.ar && (
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium border-r-4 border-[#2d5d89] pr-4">{blog.excerpt.ar}</p>
          )}

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {blog.content?.ar}
          </div>
        </div>
      </div>
    </div>
  );
}
