import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { TbLoaderQuarter } from "react-icons/tb";
import { useTranslation } from 'react-i18next';
import { HiArrowLeft, HiCalendar, HiUser } from 'react-icons/hi';
import { Button } from 'flowbite-react';

export default function BlogPage() {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
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
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <TbLoaderQuarter className="text-6xl animate-spin text-primary-600" />
        </div>
    );

    if (error || !blog) return (
        <div className="min-h-screen flex flex-col justify-center items-center text-xl font-bold text-slate-400 gap-4">
            <p>Article Not Found</p>
            <Link to="/Blogs">
                <Button color="dark" className="rounded-none uppercase font-bold">Back to News</Button>
            </Link>
        </div>
    );

    const title = blog.title[currentLang] || blog.title['en'];
    const content = blog.content[currentLang] || blog.content['en'];
    const date = new Date(blog.createdAt).toLocaleDateString();

    return (
        <div className="min-h-screen bg-white font-body">
            <Helmet>
                <title>{title} | El Sarh News</title>
            </Helmet>

            {/* Hero Header with Image */}
            <div className="relative h-[50vh] bg-slate-900 flex items-center justify-center overflow-hidden">
                {blog.image && (
                    <img src={blog.image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-6 text-white/80 font-bold uppercase tracking-widest text-xs mb-4">
                        <span className="flex items-center gap-2"><HiCalendar /> {date}</span>
                        <span className="flex items-center gap-2"><HiUser /> {blog.author?.username || 'Admin'}</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black text-white max-w-4xl mx-auto leading-tight">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-24 -mt-20 relative z-20 pb-20">
                <div className="bg-white p-8 lg:p-16 border border-slate-200 shadow-xl max-w-5xl mx-auto">
                    <Link to="/Blogs" className="inline-flex items-center text-slate-400 hover:text-primary-600 font-bold uppercase text-xs tracking-widest mb-8 transition-colors">
                        <HiArrowLeft className="mr-2" /> Back to Articles
                    </Link>

                    <div
                        className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-primary-600 first-letter:float-left first-letter:mr-3"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
}
