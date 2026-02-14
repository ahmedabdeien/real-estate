import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCTAsStart, fetchCTAsSuccess, fetchCTAsFailure, createCTASuccess, updateCTASuccess, deleteCTASuccess } from '../redux/cta/ctaSlice';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function CTAManager() {
    const dispatch = useDispatch();
    const { ctas, loading } = useSelector((state) => state.cta);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: { en: '', ar: '' },
        link: '',
        color: '#005B94',
        type: 'primary',
        active: true
    });

    useEffect(() => {
        const fetchCTAs = async () => {
            dispatch(fetchCTAsStart());
            try {
                const res = await fetch('/api/cta');
                const data = await res.json();
                dispatch(fetchCTAsSuccess(data));
            } catch (error) {
                dispatch(fetchCTAsFailure(error.message));
            }
        };
        fetchCTAs();
    }, [dispatch]);

    const handleChange = (e, lang) => {
        const { name, value, type, checked } = e.target;
        if (lang) {
            setFormData({ ...formData, label: { ...formData.label, [lang]: value } });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/cta/update/${editingId}` : '/api/cta/create';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (editingId) {
                dispatch(updateCTASuccess(data));
                setEditingId(null);
            } else {
                dispatch(createCTASuccess(data));
            }
            // Reset form
            setFormData({ label: { en: '', ar: '' }, link: '', color: '#005B94', type: 'primary', active: true });
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (cta) => {
        setEditingId(cta._id);
        setFormData(cta);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetch(`/api/cta/delete/${id}`, { method: 'DELETE' });
            dispatch(deleteCTASuccess(id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">CTA Buttons Manager</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 p-6 border border-slate-200 rounded-none space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Label (EN)" value={formData.label.en} onChange={(e) => handleChange(e, 'en')} className="w-full px-4 py-2 border border-slate-200 text-sm" required />
                    <input type="text" dir="rtl" placeholder="النص (AR)" value={formData.label.ar} onChange={(e) => handleChange(e, 'ar')} className="w-full px-4 py-2 border border-slate-200 text-sm" required />
                    <input type="text" name="link" placeholder="Link / URL" value={formData.link} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 text-sm" required />
                    <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-full h-10 cursor-pointer border border-slate-200 p-1" />
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 text-sm">
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="call">Call Action</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} id="activeCTA" />
                        <label htmlFor="activeCTA" className="text-sm font-bold text-slate-600">Active</label>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ label: { en: '', ar: '' }, link: '', color: '#005B94', type: 'primary', active: true }); }} className="px-4 py-2 bg-slate-200 text-slate-600 font-bold uppercase text-xs flex items-center gap-2"><FiX /> Cancel</button>}
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold uppercase text-xs flex items-center gap-2">
                        {editingId ? <><FiSave /> Update CTA</> : <><FiPlus /> Add CTA</>}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-2">
                {ctas.map(cta => (
                    <div key={cta._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: cta.color }}></div>
                            <div>
                                <p className="font-bold text-sm text-slate-900">{cta.label.en} / {cta.label.ar}</p>
                                <p className="text-xs text-slate-500">{cta.link} ({cta.type})</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(cta)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><FiEdit2 /></button>
                            <button onClick={() => handleDelete(cta._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><FiTrash2 /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
