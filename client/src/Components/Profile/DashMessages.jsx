import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiTrash, HiEye, HiUser, HiPhone, HiMail, HiExclamation, HiX, HiInbox } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';

export default function DashMessages() {
    const { currentUser } = useSelector((state) => state.user);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [msgToDelete, setMsgToDelete] = useState(null);
    const [selectedMsg, setSelectedMsg] = useState(null);

    useEffect(() => {
        if (currentUser.isAdmin || currentUser.role === 'Sales') {
            fetch('/api/cms/messages')
                .then(r => r.json())
                .then(d => { if (Array.isArray(d)) setMessages(d); })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [currentUser._id]);

    const handleDelete = async () => {
        setShowDeleteModal(false);
        const res = await fetch(`/api/cms/messages/${msgToDelete}`, { method: 'DELETE' });
        if (res.ok) setMessages(prev => prev.filter(m => m._id !== msgToDelete));
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <TbLoaderQuarter className="animate-spin text-3xl text-primary" />
        </div>
    );

    return (
        <div className="p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">صندوق الرسائل الواردة</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{messages.length} رسالة</p>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-16 text-center">
                    <HiInbox className="text-slate-200 mx-auto mb-3" size={48} />
                    <p className="text-slate-400 font-medium">لا توجد رسائل واردة</p>
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">التاريخ</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">المرسل</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">مقتطف الرسالة</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">البريد الإلكتروني</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {messages.map(msg => (
                                <tr key={msg._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(msg.createdAt).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-5 py-3 font-bold text-slate-800">{msg.fullName || '—'}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate text-xs">
                                        {msg.message?.substring(0, 60)}...
                                    </td>
                                    <td className="px-5 py-3 text-xs text-slate-500">{msg.email}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedMsg(msg)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-sm text-xs font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                <HiEye size={11} /> عرض
                                            </button>
                                            <button
                                                onClick={() => { setMsgToDelete(msg._id); setShowDeleteModal(true); }}
                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"
                                            >
                                                <HiTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Message Detail Modal */}
            {selectedMsg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setSelectedMsg(null)}>
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()} dir="rtl">
                        <div className="flex items-center justify-between bg-secondary text-white p-4">
                            <h3 className="font-bold">تفاصيل الرسالة</h3>
                            <button onClick={() => setSelectedMsg(null)} className="hover:text-slate-300 transition-colors">
                                <HiX size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 bg-slate-100 rounded-sm flex items-center justify-center">
                                    <HiUser size={22} className="text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800">{selectedMsg.fullName}</h3>
                                    <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><HiMail size={11} />{selectedMsg.email}</span>
                                        {selectedMsg.phoneNumber && <span className="flex items-center gap-1"><HiPhone size={11} />{selectedMsg.phoneNumber}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-sm text-slate-700 text-sm leading-relaxed">
                                {selectedMsg.message}
                            </div>
                            <p className="text-[10px] text-slate-400 text-left">
                                استلمت: {new Date(selectedMsg.createdAt).toLocaleString('ar-EG')}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
                            <button onClick={() => setSelectedMsg(null)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200">
                                إغلاق
                            </button>
                            <a
                                href={`mailto:${selectedMsg.email}`}
                                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-sm hover:bg-primary-700 transition-colors"
                            >
                                الرد بالبريد الإلكتروني
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-sm shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()} dir="rtl">
                        <div className="flex items-center gap-3 bg-red-500 text-white p-4">
                            <HiExclamation size={18} />
                            <h3 className="font-bold text-sm">حذف الرسالة</h3>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-sm text-slate-600">هل تريد حذف هذه الرسالة بشكل دائم؟</p>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-slate-100 justify-end">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm">إلغاء</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-sm hover:bg-red-600">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
