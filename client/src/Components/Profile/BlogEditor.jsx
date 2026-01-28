import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, TextInput, Label, Alert, Select, FileInput } from "flowbite-react";
import { HiSave, HiArrowLeft } from "react-icons/hi";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";

export default function BlogEditor() {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: { en: '', ar: '' },
        slug: '',
        excerpt: { en: '', ar: '' },
        content: { en: '', ar: '' },
        status: 'Draft',
        image: ''
    });
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);

    useEffect(() => {
        if (blogId) {
            const fetchBlog = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/cms/blogs');
                    const data = await res.json();
                    const blog = data.find(b => b._id === blogId);
                    if (blog) {
                        setFormData(blog);
                    }
                } catch (err) {
                    setError('Failed to load blog data');
                } finally {
                    setLoading(false);
                }
            };
            fetchBlog();
        }
    }, [blogId]);

    const handleImageUpload = async () => {
        if (!imageFile) return null;
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + imageFile.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setImageUploadProgress(progress.toFixed(0));
                },
                (error) => reject(error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await handleImageUpload();
            }

            const url = blogId ? `/api/cms/blogs/${blogId}` : '/api/cms/blogs'; // Need POST /blogs and PUT /blogs/:id
            const method = blogId ? 'PUT' : 'POST';

            const payload = { ...formData, image: imageUrl };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.message && data.message.includes('duplicate key')) {
                    throw new Error('Slug must be unique.');
                }
                throw new Error(data.message || 'Error saving article');
            }
            navigate('/Dashboard?tab=blogs');
        } catch (err) {
            setError(err.message);
            setLoading(false);
            setImageUploadProgress(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen bg-white font-body">
            <div className="mb-6 flex items-center justify-between">
                <Button color="light" size="sm" onClick={() => navigate('/Dashboard?tab=blogs')} className="rounded-none border-0 hover:bg-slate-100">
                    <HiArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
                </Button>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">
                    {blogId ? 'Edit Article' : 'Write New Article'}
                </h1>
            </div>

            {error && <Alert color="failure" className="mb-6 rounded-none">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 border border-slate-100">
                    <div className="md:col-span-1">
                        <Label value="Featured Image" className="mb-2 block uppercase tracking-widest text-xs font-bold text-slate-500" />
                        <FileInput onChange={(e) => setImageFile(e.target.files[0])} className="rounded-none mb-2" />
                        {imageUploadProgress && <div className="text-xs text-blue-600">Uploading: {imageUploadProgress}%</div>}
                        {(formData.image || imageFile) && (
                            <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="w-full h-32 object-cover border mt-2" />
                        )}
                    </div>
                    <div className="md:col-span-1">
                        <Label value="URL Slug" className="mb-2 block uppercase tracking-widest text-xs font-bold text-slate-500" />
                        <TextInput
                            placeholder="e.g. real-estate-market-trends"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            required
                            className="rounded-none"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Label value="Publication Status" className="mb-2 block uppercase tracking-widest text-xs font-bold text-slate-500" />
                        <Select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="rounded-none"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Hidden">Hidden</option>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* English Content */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-primary-600 border-b border-primary-100 pb-2 uppercase tracking-widest text-sm">English Content</h3>
                        <TextInput
                            placeholder="Article Title (EN)"
                            value={formData.title.en}
                            onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                            required
                            className="rounded-none"
                        />
                        <TextInput
                            placeholder="Short Excerpt (EN)"
                            value={formData.excerpt.en}
                            onChange={e => setFormData({ ...formData, excerpt: { ...formData.excerpt, en: e.target.value } })}
                            className="rounded-none"
                        />
                        <div className="h-96 pb-12">
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
                        <h3 className="font-bold text-primary-600 border-b border-primary-100 pb-2 uppercase tracking-widest text-sm">المحتوى العربي</h3>
                        <TextInput
                            placeholder="عنوان المقال (AR)"
                            value={formData.title.ar}
                            onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })}
                            required
                            className="rounded-none"
                        />
                        <TextInput
                            placeholder="مقتطف قصير (AR)"
                            value={formData.excerpt.ar}
                            onChange={e => setFormData({ ...formData, excerpt: { ...formData.excerpt, ar: e.target.value } })}
                            className="rounded-none"
                        />
                        <div className="h-96 pb-12">
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
                        Save Article
                    </Button>
                </div>
            </form>
        </div>
    )
}
