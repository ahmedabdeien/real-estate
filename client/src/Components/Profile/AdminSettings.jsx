import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure, updateConfigSuccess } from '../redux/config/configSlice';
import { motion } from 'framer-motion';
import { FiSave, FiImage, FiType, FiPhone, FiMail, FiGlobe } from 'react-icons/fi';

export default function AdminSettings() {
    const { config, loading } = useSelector((state) => state.config);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(config);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                dispatch(fetchConfigStart());
                const res = await fetch('/api/config');
                const data = await res.json();
                if (data.success === false) {
                    dispatch(fetchConfigFailure(data.message));
                    return;
                }
                dispatch(fetchConfigSuccess(data));
                setFormData(data);
            } catch (error) {
                dispatch(fetchConfigFailure(error.message));
            }
        };
        fetchConfig();
    }, [dispatch]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            setFormData({
                ...formData,
                [parent]: { ...formData[parent], [child]: value }
            });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) {
                alert(data.message || 'Error updating settings');
                return;
            }
            dispatch(updateConfigSuccess(data));
            alert('Settings updated successfully!');

            // Update CSS variables dynamically
            document.documentElement.style.setProperty('--primary', data.primaryColor);
            document.documentElement.style.setProperty('--accent', data.accentColor);

        } catch (error) {
            alert(error.message);
        }
    };

    if (currentUser?.role !== 'Admin') return <div className="p-20 text-center">Unauthorized Access</div>;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-body">
            <div className="container mx-auto px-4 lg:px-12">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Configuration</h1>
                    <p className="text-slate-500 italic">"SASS Style" Flexible Site Control</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Tabs */}
                    <aside className="w-full lg:w-64 space-y-2">
                        {[
                            { id: 'general', label: 'General Branding', icon: <FiType /> },
                            { id: 'colors', label: 'Design & Colors', icon: <FiGlobe /> },
                            { id: 'contact', label: 'Contact Details', icon: <FiPhone /> },
                            { id: 'branches', label: 'Branch Locations', icon: <FiGlobe /> },
                            { id: 'social', label: 'Social Networks', icon: <FiGlobe /> },
                            { id: 'translations', label: 'Content & Labels', icon: <FiType /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-none text-sm font-bold uppercase tracking-widest transition-all
                  ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-primary-600 border border-slate-200'}
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Form Content */}
                    <main className="flex-1">
                        <form onSubmit={handleSubmit} className="bg-white p-10 border border-slate-200 rounded-none shadow-sm space-y-10">

                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">General Branding</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Name</label>
                                            <input type="text" id="siteName" value={formData.siteName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none rounded-none transition-all text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo URL</label>
                                            <input type="text" id="logo" value={formData.logo} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none rounded-none transition-all text-sm" />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Maps API Key</label>
                                            <input type="text" id="mapsApiKey" value={formData.mapsApiKey} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-primary-500 outline-none rounded-none transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'colors' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Design & Colors</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Color (Corporate Blue)</label>
                                            <div className="flex gap-4">
                                                <input type="color" id="primaryColor" value={formData.primaryColor || '#005B94'} onChange={handleChange} className="h-12 w-20 cursor-pointer rounded-none border border-slate-200 p-1" />
                                                <input type="text" id="primaryColorText" value={formData.primaryColor} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" readOnly />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accent Color (Teal)</label>
                                            <div className="flex gap-4">
                                                <input type="color" id="accentColor" value={formData.accentColor || '#5BC1D7'} onChange={handleChange} className="h-12 w-20 cursor-pointer rounded-none border border-slate-200 p-1" />
                                                <input type="text" id="accentColorText" value={formData.accentColor} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Contact Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hotline</label>
                                            <input type="text" id="contact.hotline" value={formData.contact.hotline} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                            <input type="email" id="contact.email" value={formData.contact.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                            <input type="text" id="contact.phone" value={formData.contact.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'branches' && (
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest">Maadi Branch</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</label>
                                                <input type="text" id="contact.maadiBranchAddress" value={formData.contact.maadiBranchAddress} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Maps Link</label>
                                                <input type="text" id="contact.maadiBranchLink" value={formData.contact.maadiBranchLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest">Beni Suef Branch</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</label>
                                                <input type="text" id="contact.beniSuefBranchAddress" value={formData.contact.beniSuefBranchAddress} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Maps Link</label>
                                                <input type="text" id="contact.beniSuefBranchLink" value={formData.contact.beniSuefBranchLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'social' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Social Networks</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facebook</label>
                                            <input type="text" id="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instagram</label>
                                            <input type="text" id="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp</label>
                                            <input type="text" id="socialLinks.whatsapp" value={formData.socialLinks.whatsapp} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'translations' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Content & Labels</h2>
                                    <div className="bg-blue-50 text-blue-800 p-4 rounded-none text-sm mb-4">
                                        Note: These overrides will take precedence over the default site text.
                                    </div>
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {['welcome', 'contact_us', 'contact_us_now', 'learn_more', 'about_desc', 'about_story_title', 'about_story_desc', 'visions_title', 'vision_tab', 'mission_tab', 'quick_links', 'working_hours', 'saturday', 'thursday', 'friday', 'closed', 'send_a_message', 'hero_title', 'hero_subtitle'].map((key) => (
                                            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-50 pb-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-1">{key} (EN)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.translations?.en?.[key] || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            translations: {
                                                                ...formData.translations,
                                                                en: { ...formData.translations?.en, [key]: e.target.value }
                                                            }
                                                        })}
                                                        placeholder={`Default EN for ${key}`}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-1">{key} (AR)</label>
                                                    <input
                                                        type="text"
                                                        dir="rtl"
                                                        value={formData.translations?.ar?.[key] || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            translations: {
                                                                ...formData.translations,
                                                                ar: { ...formData.translations?.ar, [key]: e.target.value }
                                                            }
                                                        })}
                                                        placeholder={`Default AR for ${key}`}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary-600 text-white px-10 py-4 rounded-none font-bold uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-3 shadow-lg disabled:opacity-50"
                                >
                                    <FiSave />
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>

                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
}
