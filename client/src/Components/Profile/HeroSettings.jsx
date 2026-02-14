import React from 'react';

export default function HeroSettings({ formData, handleChange }) {

    // Helper to handle nested hero changes if not handled by parent generic handleChange
    const handleHeroChange = (e, field, lang) => {
        const { value } = e.target;
        // Construct the event object expected by parent or directly update parent state if passed
        // Assuming parent `handleChange` handles `hero.title.en` style IDs
        // But the parent `handleChange` in `AdminSettings.jsx` splits by `.` only once: `[parent, child]`
        // `hero.title.en` has 2 dots. The parent logic:
        /*
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
             setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value }});
        }
        */
        // This won't work for `hero.title.en`. We need a specialized handler or update the parent.
        // Let's assume we pass a special handler or update the parent to handle deep nesting.
        // For now, let's rely on a custom handler passed from parent, or implement one here if we passed properties down.
        // Actually, let's just use the `handleChange` from props and ensure IDs are compatible or logic is updated.
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Hero Section Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* English Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headline (English)</label>
                    <input
                        type="text"
                        // We will need to update AdminSettings handleChange to support deep nesting or handle it manually here
                        // For now let's use a specific ID convention and update AdminSettings logic
                        id="hero.title.en"
                        value={formData.hero?.title?.en || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm"
                    />
                </div>

                {/* Arabic Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headline (Arabic)</label>
                    <input
                        type="text"
                        dir="rtl"
                        id="hero.title.ar"
                        value={formData.hero?.title?.ar || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm"
                    />
                </div>

                {/* English Subtitle */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtitle (English)</label>
                    <textarea
                        id="hero.subtitle.en"
                        value={formData.hero?.subtitle?.en || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm h-24 resize-none"
                    />
                </div>

                {/* Arabic Subtitle */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtitle (Arabic)</label>
                    <textarea
                        dir="rtl"
                        id="hero.subtitle.ar"
                        value={formData.hero?.subtitle?.ar || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-sm h-24 resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
