import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiSearch, HiArrowRight, HiCalendar, HiUser } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { useTranslation } from 'react-i18next';
import { Helmet } from "react-helmet";

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/cms/blogs');
                const data = await res.json();
                if (res.ok) {
                    // Filter only published blogs
                    const published = data.filter(b => b.status === "Published");
                    setBlogs(published);
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
        const title = (blog.title[currentLang] || blog.title['en'] || '').toLowerCase();
        return title.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-slate-50 font-body pb-20">
            <Helmet>
                <title>News & Blog | El Sarh</title>
            </Helmet>

            <div className="bg-white border-b border-slate-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Latest News & Insights</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">Discover the latest trends in real estate, company updates, and expert advice.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 mb-12">
                <div className="bg-white p-4 shadow-xl border border-slate-100 max-w-xl mx-auto flex items-center gap-2">
                    <HiSearch className="text-slate-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="flex-1 border-none focus:ring-0 text-slate-700 bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <TbLoaderQuarter className="text-5xl animate-spin text-primary-600" />
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    filteredBlogs.map(blog => {
                        const title = blog.title[currentLang] || blog.title['en'];
                        const excerpt = blog.excerpt[currentLang] || blog.excerpt['en'];
                        const date = new Date(blog.createdAt).toLocaleDateString();

                        return (
                            <Link to={`/blog/${blog.slug}`} key={blog._id} className="group">
                                <article className="bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                                    <div className="h-56 overflow-hidden bg-slate-200 relative">
                                        {blog.image ? (
                                            <img src={blog.image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-0 left-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest mt-4 ml-4">
                                            News
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><HiCalendar /> {date}</span>
                                            <span className="flex items-center gap-1"><HiUser /> {blog.author?.username || 'Admin'}</span>
                                        </div>
                                        <h2 className="text-xl font-black text-slate-800 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                                            {title}
                                        </h2>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                            {excerpt}
                                        </p>
                                        <div className="flex items-center text-primary-600 font-black text-xs uppercase tracking-widest group-hover:underline">
                                            Read Article <HiArrowRight className="ml-2" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-20">
                        <h3 className="text-xl font-bold text-slate-400">No articles found matching your search.</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
