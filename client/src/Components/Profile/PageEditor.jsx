import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, TextInput, Label, Alert } from "flowbite-react";
import { HiSave, HiArrowLeft } from "react-icons/hi";

export default function PageEditor() {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: { en: '', ar: '' },
        slug: '',
        content: { en: '', ar: '' }
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (pageId) {
            // Fetch existing page data
            const fetchPage = async () => {
                setLoading(true);
                try {
                    // We assume there's an API to get a single page by ID
                    // If not, we might need to add it to generic cms.controller
                    // For now let's assume getting all and filtering (inefficient but works for now)
                    // Or better, Implement getPageById in backend
                    // Trying filtered fetch
                    const res = await fetch('/api/cms/pages');
                    const data = await res.json();
                    const page = data.find(p => p._id === pageId);
                    if (page) {
                        setFormData(page);
                    }
                } catch (err) {
                    setError('Failed to load page data');
                } finally {
                    setLoading(false);
                }
            };
            fetchPage();
        }
    }, [pageId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const url = pageId
                ? `/api/cms/pages/${pageId}`
                : '/api/cms/pages';
            const method = pageId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                // Handle duplicate key error for slug
                if (data.message && data.message.includes('duplicate key')) {
                    throw new Error('Slug must be unique. This slug is already in use.');
                }
                throw new Error(data.message || 'Error saving page');
            }
            navigate('/Dashboard?tab=staticPages');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen bg-white font-body">
            <div className="mb-6 flex items-center justify-between">
                <Button color="light" size="sm" onClick={() => navigate('/Dashboard?tab=staticPages')} className="rounded-none border-0 hover:bg-slate-100">
                    <HiArrowLeft className="mr-2 h-4 w-4" /> Back to Pages
                </Button>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">
                    {pageId ? 'Edit Page' : 'Create New Page'}
                </h1>
            </div>

            {error && <Alert color="failure" className="mb-6 rounded-none">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 border border-slate-100">
                    <div className="md:col-span-2">
                        <Label value="Page Slug (URL Identifier)" className="mb-2 block uppercase tracking-widest text-xs font-bold text-slate-500" />
                        <TextInput
                            placeholder="e.g. privacy-policy"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            required
                            className="rounded-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">This will be used in the URL: /p/<b>slug</b></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* English Content */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-primary-600 border-b border-primary-100 pb-2 uppercase tracking-widest text-sm">English Version</h3>
                        <div>
                            <Label value="Page Title (EN)" className="mb-2 block font-bold text-xs" />
                            <TextInput
                                value={formData.title.en}
                                onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                                required
                                className="rounded-none mb-4"
                            />
                        </div>
                        <div className="h-96 pb-12">
                            <Label value="Content (EN)" className="mb-2 block font-bold text-xs" />
                            <ReactQuill
                                theme="snow"
                                value={formData.content.en}
                                onChange={value => setFormData({ ...formData, content: { ...formData.content, en: value } })}
                                className="h-80 bg-white"
                            />
                        </div>
                    </div>

                    {/* Arabic Content */}
                    <div className="space-y-4" dir="rtl">
                        <h3 className="font-bold text-primary-600 border-b border-primary-100 pb-2 uppercase tracking-widest text-sm">النسخة العربية</h3>
                        <div>
                            <Label value="عنوان الصفحة (AR)" className="mb-2 block font-bold text-xs" />
                            <TextInput
                                value={formData.title.ar}
                                onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })}
                                required
                                className="rounded-none mb-4"
                            />
                        </div>
                        <div className="h-96 pb-12">
                            <Label value="المحتوى (AR)" className="mb-2 block font-bold text-xs" />
                            <ReactQuill
                                theme="snow"
                                value={formData.content.ar}
                                onChange={value => setFormData({ ...formData, content: { ...formData.content, ar: value } })}
                                className="h-80 bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-end">
                    <Button type="submit" isProcessing={loading} className="bg-primary-600 hover:bg-primary-700 rounded-none px-8 py-2 font-black uppercase tracking-widest">
                        <HiSave className="mr-2 h-5 w-5" />
                        Save Page
                    </Button>
                </div>
            </form>
        </div>
    )
}
