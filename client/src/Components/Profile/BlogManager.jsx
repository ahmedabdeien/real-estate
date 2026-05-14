import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPencilAlt, HiPlus, HiTrash, HiEye, HiExclamation, HiNewspaper } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';

const statusMap = {
    published: { label: 'منشور', color: 'bg-green-100 text-green-700' },
    draft: { label: 'مسودة', color: 'bg-yellow-100 text-yellow-700' },
};

export default function BlogManager() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [blogIdToDelete, setBlogIdToDelete] = useState('');

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/cms/blogs');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) setBlogs(data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async () => {
        setShowModal(false);
        const res = await fetch(`/api/cms/blogs/${blogIdToDelete}`, { method: 'DELETE' });
        if (res.ok) setBlogs(prev => prev.filter(b => b._id !== blogIdToDelete));
    };

    return (
        <div className="p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">إدارة الأخبار والمدونة</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{blogs.length} مقال</p>
                </div>
                <Link to="/Admin/Blog-Editor">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-bold hover:bg-primary-700 transition-colors">
                        <HiPlus size={16} /> كتابة مقال جديد
                    </button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-16">
                    <TbLoaderQuarter className="animate-spin text-3xl text-primary" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-16 text-center">
                    <HiNewspaper className="text-slate-200 mx-auto mb-3" size={48} />
                    <p className="text-slate-400 font-medium">لا توجد مقالات منشورة بعد</p>
                    <Link to="/Admin/Blog-Editor">
                        <button className="mt-4 px-5 py-2 bg-primary text-white rounded-sm text-sm font-bold hover:bg-primary-700">
                            كتابة أول مقال
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">عنوان المقال</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الحالة</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الكاتب</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">تاريخ النشر</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {blogs.map(blog => {
                                const st = blog.status || 'published';
                                const badge = statusMap[st] || statusMap.published;
                                return (
                                    <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {blog.coverImage && (
                                                    <img src={blog.coverImage} alt="" className="w-10 h-8 object-cover rounded-sm border border-slate-100" />
                                                )}
                                                <span className="font-bold text-slate-800">{blog.title?.ar || blog.title?.en || blog.title || 'بدون عنوان'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{blog.author?.name || blog.author || '—'}</td>
                                        <td className="px-5 py-3 text-xs text-slate-400">
                                            {new Date(blog.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex gap-1.5">
                                                <Link to={`/Admin/Blog-Editor/${blog._id}`}>
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary rounded-sm text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                                                        <HiPencilAlt size={11} /> تعديل
                                                    </button>
                                                </Link>
                                                <Link to={`/blog/${blog.slug}`} target="_blank">
                                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-sm text-xs font-bold hover:bg-slate-200 transition-colors">
                                                        <HiEye size={11} /> عرض
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => { setBlogIdToDelete(blog._id); setShowModal(true); }}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"
                                                >
                                                    <HiTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-sm shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()} dir="rtl">
                        <div className="flex items-center gap-3 bg-red-500 text-white p-4">
                            <HiExclamation size={18} />
                            <h3 className="font-bold text-sm">حذف المقال</h3>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-sm text-slate-600">هل تريد حذف هذا المقال بشكل دائم؟</p>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-slate-100 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm">إلغاء</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-sm hover:bg-red-600">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
