import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiCalendar, HiUser, HiArrowLeft } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';

const Skeleton = () => (
    <div className="overflow-hidden" style={{ background: 'white', border: '1px solid rgba(138,105,36,0.1)' }}>
        <div className="h-52" style={{ background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%' }} />
        <div className="p-6 space-y-3">
            <div className="h-4 w-3/4" style={{ background: '#f1f5f9' }} />
            <div className="h-3 w-full" style={{ background: '#f1f5f9' }} />
            <div className="h-3 w-2/3" style={{ background: '#f1f5f9' }} />
        </div>
    </div>
);

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { config } = useSelector(s => s.config);
    const currentLang = 'ar';
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/cms/blogs');
                const data = await res.json();
                if (res.ok) {
                    setBlogs(data.filter(b => b.status === 'Published'));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter(blog => {
        const title = (blog.title?.[currentLang] || blog.title?.['ar'] || blog.title?.['en'] || '').toLowerCase();
        return title.includes(searchTerm.toLowerCase());
    });

    return (
        <div dir="rtl" className="min-h-screen pb-20" style={{ background: '#faf8f4' }}>
            <Helmet>
                <title>المدونة | {config?.siteName || 'الصرح للتطوير العقاري'}</title>
            </Helmet>

            {/* Hero */}
            <section className="relative py-24 overflow-hidden" style={{ background: '#12283C' }}>
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="container mx-auto px-4 lg:px-12 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <span className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase mb-5"
                            style={{ background: 'rgba(138,105,36,0.85)', color: '#DFBA6B', border: '1px solid rgba(223,186,107,0.3)' }}>
                            آخر الأخبار والمقالات
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">المدونة العقارية</h1>
                        <div className="h-1 w-16 mb-4" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
                        <p className="text-sm max-w-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            اطلع على أحدث الأخبار العقارية ونصائح الخبراء من فريق الصرح
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Search */}
            <div className="container mx-auto px-4 lg:px-12 py-8">
                <div className="relative max-w-xl">
                    <HiSearch className="absolute right-3 top-3 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="ابحث في المقالات..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 bg-white focus:outline-none focus:border-[#8A6924]"
                    />
                </div>
            </div>

            {/* Articles Grid */}
            <div className="container mx-auto px-4 lg:px-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-slate-400 font-bold text-lg">لا توجد مقالات متاحة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog, i) => {
                            const title = blog.title?.[currentLang] || blog.title?.['ar'] || blog.title?.['en'];
                            const excerpt = blog.excerpt?.[currentLang] || blog.excerpt?.['ar'] || blog.excerpt?.['en'];
                            const date = new Date(blog.createdAt).toLocaleDateString('ar-EG');

                            return (
                                <motion.div
                                    key={blog._id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Link to={`/blog/${blog.slug}`} className="group block h-full">
                                        <article
                                            className="flex flex-col h-full transition-all duration-400 hover:-translate-y-1"
                                            style={{
                                                background: 'white',
                                                border: '1px solid rgba(138,105,36,0.1)',
                                                boxShadow: '0 4px 16px rgba(18,40,60,0.04)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(18,40,60,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(18,40,60,0.04)'}
                                        >
                                            {/* Image */}
                                            <div className="relative h-52 overflow-hidden">
                                                {blog.image ? (
                                                    <img
                                                        src={blog.image}
                                                        alt={title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                                                        style={{ background: 'linear-gradient(135deg, #12283C, #8A6924)', color: '#DFBA6B' }}>
                                                        الصرح
                                                    </div>
                                                )}
                                                <div
                                                    className="absolute top-3 right-3 px-3 py-1 text-[9px] font-black tracking-widest text-white"
                                                    style={{ background: '#8A6924' }}
                                                >
                                                    مقال
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-4 text-[11px] mb-4" style={{ color: '#8A6924' }}>
                                                    <span className="flex items-center gap-1">
                                                        <HiCalendar size={12} /> {date}
                                                    </span>
                                                    {blog.author?.username && (
                                                        <span className="flex items-center gap-1">
                                                            <HiUser size={12} /> {blog.author.username}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2
                                                    className="text-base font-black mb-3 line-clamp-2 leading-snug transition-colors group-hover:text-[#8A6924]"
                                                    style={{ color: '#12283C' }}
                                                >
                                                    {title}
                                                </h2>
                                                <p className="text-xs leading-relaxed line-clamp-3 flex-1 mb-5" style={{ color: '#6b5e3e' }}>
                                                    {excerpt}
                                                </p>
                                                <div
                                                    className="flex items-center gap-2 text-xs font-black pt-4"
                                                    style={{ borderTop: '1px solid rgba(138,105,36,0.1)', color: '#8A6924' }}
                                                >
                                                    <span>اقرأ المقال</span>
                                                    <HiArrowLeft size={12} />
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
