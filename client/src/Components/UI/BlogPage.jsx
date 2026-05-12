import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { TbLoaderQuarter } from 'react-icons/tb';
import { HiArrowRight, HiCalendar, HiUser } from 'react-icons/hi';
import { useSelector } from 'react-redux';

export default function BlogPage() {
    const { slug } = useParams();
    const { config } = useSelector(s => s.config);
    const currentLang = 'ar';
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/cms/blogs');
                const data = await res.json();
                const foundBlog = data.find(b => b.slug === slug);
                if (foundBlog) {
                    setBlog(foundBlog);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center" style={{ background: '#faf8f4' }}>
            <TbLoaderQuarter className="animate-spin text-4xl" style={{ color: '#8A6924' }} />
        </div>
    );

    if (error || !blog) return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-6" style={{ background: '#faf8f4' }}>
            <p className="text-xl font-black" style={{ color: '#12283C' }}>المقال غير موجود</p>
            <Link
                to="/Blogs"
                className="flex items-center gap-2 px-6 py-3 text-sm font-black text-white"
                style={{ background: '#12283C' }}
            >
                <HiArrowRight size={14} />
                العودة للمدونة
            </Link>
        </div>
    );

    const title = blog.title?.[currentLang] || blog.title?.['ar'] || blog.title?.['en'];
    const content = blog.content?.[currentLang] || blog.content?.['ar'] || blog.content?.['en'];
    const date = new Date(blog.createdAt).toLocaleDateString('ar-EG');

    return (
        <div dir="rtl" className="min-h-screen" style={{ background: '#faf8f4' }}>
            <Helmet>
                <title>{title} | {config?.siteName || 'الصرح للعقارات'}</title>
            </Helmet>

            {/* Hero */}
            <div className="relative h-[55vh] min-h-[380px] overflow-hidden" style={{ background: '#12283C' }}>
                {blog.image && (
                    <img src={blog.image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(18,40,60,1) 0%, rgba(18,40,60,0.6) 60%, transparent 100%)' }}
                />
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />
                <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-4 lg:px-12 pb-12">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="flex items-center gap-5 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <span className="flex items-center gap-2 text-xs font-bold">
                                <HiCalendar size={13} style={{ color: '#DFBA6B' }} /> {date}
                            </span>
                            {blog.author?.username && (
                                <span className="flex items-center gap-2 text-xs font-bold">
                                    <HiUser size={13} style={{ color: '#DFBA6B' }} /> {blog.author.username}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white max-w-3xl leading-tight">
                            {title}
                        </h1>
                        <div className="h-1 w-16 mt-5" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
                    </motion.div>
                </div>
            </div>

            {/* Article */}
            <div className="container mx-auto px-4 lg:px-12 py-12">
                <div className="max-w-4xl mx-auto">
                    <Link
                        to="/Blogs"
                        className="inline-flex items-center gap-2 text-xs font-black tracking-widest mb-8 transition-colors hover:text-[#8A6924]"
                        style={{ color: '#6b5e3e' }}
                    >
                        <HiArrowRight size={14} />
                        العودة إلى المدونة
                    </Link>

                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="p-8 lg:p-14"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(138,105,36,0.12)',
                            boxShadow: '0 16px 48px rgba(18,40,60,0.06)',
                            borderTop: '3px solid #8A6924',
                        }}
                    >
                        <div
                            className="prose prose-lg max-w-none"
                            style={{
                                '--tw-prose-body': '#4a3e2a',
                                '--tw-prose-headings': '#12283C',
                                '--tw-prose-links': '#8A6924',
                                '--tw-prose-bold': '#12283C',
                                color: '#4a3e2a',
                                lineHeight: '2',
                            }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </motion.article>
                </div>
            </div>
        </div>
    );
}
