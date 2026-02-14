import React, { useState, useEffect } from 'react';
import { FiTrash2, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

export default function MediaManager() {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);

    const fetchImages = async (cursor = null) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/media/images${cursor ? `?next_cursor=${cursor}` : ''}`);
            const data = await res.json();
            if (data.success) {
                if (cursor) {
                    setImages(prev => [...prev, ...data.images]);
                } else {
                    setImages(data.images);
                }
                setNextCursor(data.next_cursor);
            } else {
                setError('Failed to fetch images');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'elsarh_preset');

        try {
            // Direct unsigned upload
            const res = await fetch(`https://api.cloudinary.com/v1_1/elsarh/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.secure_url) {
                // Add new image to start of list (simulated until refresh)
                setImages(prev => [{
                    secure_url: data.secure_url,
                    public_id: data.public_id,
                    format: data.format
                }, ...prev]);
            } else {
                setError('Upload failed: ' + (data.error?.message || 'Unknown error'));
            }
        } catch (error) {
            setError('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (public_id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const res = await fetch(`/api/media/delete/${encodeURIComponent(public_id)}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setImages(prev => prev.filter(img => img.public_id !== public_id));
            } else {
                setError(data.message || 'Failed to delete image');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Media Manager (Cloudinary)</h2>

            {error && <Alert color="failure" icon={HiInformationCircle} className="rounded-none">{error}</Alert>}

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <label className={`cursor-pointer bg-primary-600 text-white px-6 py-3 rounded-none font-bold uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <FiUpload />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                </label>

                <button
                    onClick={() => fetchImages()}
                    className="px-4 py-3 border border-slate-200 hover:bg-slate-50 transition-colors rounded-none flex items-center gap-2"
                    title="Refresh Gallery"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                    <div key={img.public_id} className="relative group aspect-square bg-slate-100 border border-slate-200">
                        <img
                            src={img.secure_url}
                            alt={img.public_id}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate px-2">
                            {img.public_id.split('/').pop()}
                        </div>
                        <button
                            onClick={() => handleDelete(img.public_id)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                            title="Delete Image"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            {images.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-400 border border-dashed border-slate-300">
                    No images found in library.
                </div>
            )}

            {loading && images.length === 0 && (
                <div className="text-center py-10 text-slate-400">Loading library...</div>
            )}

            {nextCursor && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => fetchImages(nextCursor)}
                        disabled={loading}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
