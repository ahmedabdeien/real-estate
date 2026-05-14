import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaRegSave } from "react-icons/fa";
import { HiCheckCircle, HiExclamationCircle, HiUpload } from 'react-icons/hi';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../../firebase.js';
import { updateFailure, updateStart, updateSuccess } from '../redux/user/userSlice.js';

const Field = ({ label, children, hint }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

const StyledInput = ({ id, type = 'text', defaultValue, value, onChange, placeholder, disabled }) => (
    <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#8A6924] focus:ring-1 focus:ring-[#8A6924]/20 transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
    />
);

const Section = ({ title, children }) => (
    <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

export default function DashProfile() {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const filePickerRef = useRef();

    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [formData, setFormData] = useState({});

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (imageFile) uploadImage();
    }, [imageFile]);

    const uploadImage = async () => {
        setImageFileUploading(true);
        setImageFileUploadError(null);
        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
            () => {
                setImageFileUploadError('فشل رفع الصورة (يجب أن يكون حجم الملف أقل من 2MB)');
                setImageFileUploadProgress(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageFileUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL);
                    setFormData(prev => ({ ...prev, avatar: downloadURL }));
                    setImageFileUploading(false);
                });
            }
        );
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
        setUpdateUserError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);
        if (Object.keys(formData).length === 0) {
            setUpdateUserError('لم تقم بأي تغييرات!');
            return;
        }
        if (imageFileUploading) return;
        try {
            dispatch(updateStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(updateFailure(data.message));
                setUpdateUserError(data.message);
            } else {
                dispatch(updateSuccess(data));
                setUpdateUserSuccess('تم تحديث البيانات بنجاح!');
                setTimeout(() => setUpdateUserSuccess(null), 4000);
            }
        } catch (error) {
            dispatch(updateFailure(error.message));
            setUpdateUserError(error.message);
        }
    };

    const roleLabel = currentUser?.isAdmin ? 'مسؤول النظام' :
        currentUser?.isBroker ? 'وسيط عقاري' : 'مستخدم';
    const roleColor = currentUser?.isAdmin
        ? 'bg-red-100 text-red-700'
        : currentUser?.isBroker
            ? 'bg-amber-100 text-amber-700'
            : 'bg-slate-100 text-slate-600';

    return (
        <div className="p-6" dir="rtl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">الملف الشخصي</h1>
                    <p className="text-xs text-slate-400 mt-0.5">تعديل بيانات حسابك الشخصي</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left: Avatar */}
                    <div className="lg:col-span-1">
                        <Section title="الصورة الشخصية">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-28 h-28 group cursor-pointer" onClick={() => filePickerRef.current.click()}>
                                    {imageFileUploadProgress && imageFileUploading ? (
                                        <CircularProgressbar
                                            value={imageFileUploadProgress || 0}
                                            strokeWidth={5}
                                            styles={{
                                                root: { position: 'absolute', inset: 0 },
                                                path: { stroke: '#8A6924' },
                                            }}
                                        />
                                    ) : null}
                                    <img
                                        src={imageFileUrl || currentUser?.avatar}
                                        alt={currentUser?.name}
                                        className="w-28 h-28 object-cover border-2 border-slate-200 group-hover:border-[#8A6924] transition-all"
                                        style={{ opacity: imageFileUploading ? 0.6 : 1 }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaCamera className="text-white text-xl" />
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} ref={filePickerRef} hidden />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-800 text-sm">{currentUser?.name}</p>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${roleColor}`}>
                                        {roleLabel}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => filePickerRef.current.click()}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:border-[#8A6924] hover:text-[#8A6924] transition-colors"
                                >
                                    <HiUpload size={14} />
                                    تغيير الصورة
                                </button>
                                {imageFileUploadError && (
                                    <p className="text-[11px] text-red-600 text-center">{imageFileUploadError}</p>
                                )}
                            </div>
                        </Section>

                        {/* Role Badge */}
                        <Section title="الصلاحيات">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <span className="text-xs text-slate-500">نوع الحساب</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${roleColor}`}>{roleLabel}</span>
                                </div>
                                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <span className="text-xs text-slate-500">البريد الإلكتروني</span>
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{currentUser?.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-slate-500">تاريخ الإنضمام</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('ar-EG') : '—'}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Right: Form Fields */}
                    <div className="lg:col-span-2">
                        <Section title="البيانات الشخصية">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="الاسم الكامل">
                                    <StyledInput id="name" defaultValue={currentUser?.name} onChange={handleChange} placeholder="أدخل الاسم الكامل" />
                                </Field>
                                <Field label="اسم المستخدم">
                                    <StyledInput id="username" defaultValue={currentUser?.username} onChange={handleChange} placeholder="أدخل اسم المستخدم" />
                                </Field>
                                <Field label="البريد الإلكتروني">
                                    <StyledInput id="email" type="email" defaultValue={currentUser?.email} onChange={handleChange} placeholder="أدخل البريد الإلكتروني" />
                                </Field>
                                <Field label="رقم الهاتف" hint={!currentUser?.isAdmin && !currentUser?.isBroker ? 'متاح للمسؤولين والوسطاء فقط' : ''}>
                                    <StyledInput
                                        id="number"
                                        type="tel"
                                        defaultValue={currentUser?.number}
                                        onChange={handleChange}
                                        placeholder="أدخل رقم الهاتف"
                                        disabled={!currentUser?.isAdmin && !currentUser?.isBroker}
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section title="تغيير كلمة المرور">
                            <Field label="كلمة المرور الجديدة" hint="اترك الحقل فارغاً إذا لم تريد تغيير كلمة المرور">
                                <StyledInput id="password" type="password" onChange={handleChange} placeholder="أدخل كلمة مرور جديدة" />
                            </Field>
                        </Section>

                        {/* Feedback */}
                        {updateUserSuccess && (
                            <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-sm">
                                <HiCheckCircle size={18} />
                                {updateUserSuccess}
                            </div>
                        )}
                        {updateUserError && (
                            <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-sm">
                                <HiExclamationCircle size={18} />
                                {updateUserError}
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={imageFileUploading}
                            className="flex items-center gap-2 px-7 py-3 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                                boxShadow: '0 6px 20px rgba(138,105,36,0.35)',
                            }}
                        >
                            <FaRegSave size={14} />
                            {imageFileUploading ? 'جارٍ الرفع...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
