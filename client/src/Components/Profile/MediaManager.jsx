import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../../firebase';
import { HiPhotograph, HiTrash, HiClipboardCopy } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';

const Card = ({ title, children }) => (
    <div className="bg-white mb-5 overflow-hidden" style={{ border: '1px solid rgba(138,105,36,0.1)', boxShadow: '0 2px 12px rgba(18,40,60,0.04)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(18,40,60,0.02)', borderBottom: '1px solid rgba(138,105,36,0.08)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#12283C' }}>{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

export default function MediaManager() {
    const [images, setImages]       = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress]   = useState(0);
    const [copied, setCopied]       = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const fileInputRef = useRef();

    const handleUpload = (file) => {
        if (!file) return;
        setUploading(true);
        const storage    = getStorage(app);
        const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
        const task       = uploadBytesResumable(storageRef, file);

        task.on('state_changed',
            snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            err  => { console.error(err); setUploading(false); setProgress(0); },
            ()   => {
                getDownloadURL(task.snapshot.ref).then(url => {
                    setImages(prev => [{ url, path: task.snapshot.ref.fullPath, name: file.name }, ...prev]);
                    setUploading(false);
                    setProgress(0);
                });
            }
        );
    };

    const handleDelete = async (img) => {
        try {
            const storage = getStorage(app);
            await deleteObject(ref(storage, img.path));
            setImages(prev => prev.filter(i => i.path !== img.path));
        } catch (e) {
            // If file already gone, still remove from UI
            setImages(prev => prev.filter(i => i.path !== img.path));
        }
        setDeleteTarget(null);
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url).catch(() => {});
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <>
        <Card title="رفع صورة جديدة">
            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center py-12 cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(138,105,36,0.3)', background: 'rgba(138,105,36,0.02)' }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#8A6924'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)'; }}
            >
                {uploading ? (
                    <>
                        <TbLoaderQuarter className="animate-spin text-3xl mb-2" style={{ color: '#8A6924' }} />
                        <p className="text-xs font-bold" style={{ color: '#8A6924' }}>جارٍ الرفع: {progress}%</p>
                        <div className="mt-3 w-48 h-1.5 bg-gray-200">
                            <div className="h-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #8A6924, #DFBA6B)' }} />
                        </div>
                    </>
                ) : (
                    <>
                        <HiPhotograph size={40} style={{ color: 'rgba(138,105,36,0.35)' }} />
                        <p className="text-sm font-black mt-2" style={{ color: '#8A6924' }}>انقر لرفع صورة</p>
                        <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>PNG · JPG · WEBP — حتى 5MB</p>
                    </>
                )}
                <input
                    ref={fileInputRef} type="file" accept="image/*" hidden
                    onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ''; }}
                />
            </div>
        </Card>

        {images.length > 0 && (
            <Card title={`الصور المرفوعة في هذه الجلسة (${images.length})`}>
                <p className="text-[11px] mb-4" style={{ color: '#94a3b8' }}>
                    انقر على "نسخ الرابط" ثم الصق الرابط في أي حقل صورة في الإعدادات
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map(img => (
                        <div key={img.path} className="group relative overflow-hidden"
                            style={{ border: '1px solid rgba(138,105,36,0.12)', aspectRatio: '1' }}>
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            {/* Overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center p-2"
                                style={{ background: 'rgba(18,40,60,0.85)' }}>
                                <button
                                    onClick={() => copyUrl(img.url)}
                                    className="w-full py-1.5 text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                                    style={{ background: copied === img.url ? '#16a34a' : 'rgba(138,105,36,0.8)', color: 'white' }}
                                >
                                    <HiClipboardCopy size={11} />
                                    {copied === img.url ? 'تم النسخ ✓' : 'نسخ الرابط'}
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(img)}
                                    className="w-full py-1.5 text-[10px] font-black flex items-center justify-center gap-1"
                                    style={{ background: 'rgba(220,38,38,0.75)', color: 'white' }}
                                >
                                    <HiTrash size={11} /> حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )}

        {images.length === 0 && (
            <Card title="كيفية الاستخدام">
                <div className="space-y-3 text-xs" style={{ color: '#6b5e3e' }}>
                    {[
                        'ارفع الصورة بالنقر على منطقة الرفع أعلاه',
                        'بعد اكتمال الرفع ستظهر الصورة هنا',
                        'انقر على "نسخ الرابط" للحصول على رابط الصورة',
                        'الصق الرابط في أي حقل صورة (الشعار، Hero، من نحن...)',
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                                style={{ background: 'rgba(138,105,36,0.12)', color: '#8A6924' }}>
                                {i + 1}
                            </span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </Card>
        )}

        {/* Confirm Delete Modal */}
        {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={() => setDeleteTarget(null)}>
                <div className="bg-white p-6 max-w-xs w-full" style={{ border: '1px solid rgba(138,105,36,0.2)' }}
                    onClick={e => e.stopPropagation()}>
                    <h3 className="font-black text-sm mb-1" style={{ color: '#12283C' }}>تأكيد الحذف</h3>
                    <p className="text-xs mb-5" style={{ color: '#6b5e3e' }}>
                        سيتم حذف الصورة من Firebase Storage نهائياً.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setDeleteTarget(null)}
                            className="px-4 py-2 text-xs font-bold"
                            style={{ border: '1px solid #e2e8f0', color: '#6b5e3e' }}>
                            إلغاء
                        </button>
                        <button onClick={() => handleDelete(deleteTarget)}
                            className="px-4 py-2 text-xs font-black text-white"
                            style={{ background: '#dc2626' }}>
                            حذف نهائياً
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
