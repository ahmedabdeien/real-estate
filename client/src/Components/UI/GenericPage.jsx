import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { TbLoaderQuarter } from "react-icons/tb";
import { useTranslation } from 'react-i18next';

export default function GenericPage() {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                // Fetch all pages and find by slug (Optimization: Add getPageBySlug to backend later)
                const res = await fetch('/api/cms/pages');
                const data = await res.json();
                const foundPage = data.find(p => p.slug === slug);
                if (foundPage) {
                    setPage(foundPage);
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
        fetchPage();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <TbLoaderQuarter className="text-6xl animate-spin text-primary-600" />
        </div>
    );

    if (error || !page) return (
        <div className="min-h-screen flex justify-center items-center text-xl font-bold text-slate-400">
            Page Not Found
        </div>
    );

    const title = page.title[currentLang] || page.title['en'];
    const content = page.content[currentLang] || page.content['en'];

    return (
        <div className="min-h-screen bg-slate-50 font-body py-12">
            <Helmet>
                <title>{title} | El Sarh</title>
            </Helmet>
            <div className="container mx-auto px-4 lg:px-24">
                <div className="bg-white p-8 lg:p-16 border border-slate-200 shadow-sm rounded-none">
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-8 pb-6 border-b border-slate-100">
                        {title}
                    </h1>
                    <div
                        className="prose prose-slate lg:prose-lg max-w-none text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
}
