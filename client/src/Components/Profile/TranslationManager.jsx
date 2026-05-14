import React, { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiSearch } from 'react-icons/hi';

const IS = { border: '1.5px solid #e2e8f0', background: 'white', borderRadius: 0 };
const fcs = e => e.target.style.borderColor = '#8A6924';
const blr = e => e.target.style.borderColor = '#e2e8f0';

const Card = ({ title, children }) => (
    <div className="bg-white mb-5 overflow-hidden" style={{ border: '1px solid rgba(138,105,36,0.1)', boxShadow: '0 2px 12px rgba(18,40,60,0.04)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(18,40,60,0.02)', borderBottom: '1px solid rgba(138,105,36,0.08)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#12283C' }}>{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

/**
 * TranslationManager
 * Props: get(path), set(path, value) — passed down from AdminSettings
 */
export default function TranslationManager({ get, set }) {
    const [rows, setRows]       = useState([]);
    const [search, setSearch]   = useState('');
    const [newKey, setNewKey]   = useState('');

    useEffect(() => {
        // Build rows from translations object
        const en = get ? (get('translations.en') || {}) : {};
        const ar = get ? (get('translations.ar') || {}) : {};
        const allKeys = Array.from(new Set([...Object.keys(en), ...Object.keys(ar)]));
        setRows(allKeys.map(k => ({ key: k, en: en[k] || '', ar: ar[k] || '' })));
    }, []); // eslint-disable-line

    const sync = (newRows) => {
        setRows(newRows);
        if (!set) return;
        const en = {}, ar = {};
        newRows.forEach(r => { en[r.key] = r.en; ar[r.key] = r.ar; });
        set('translations.en', en);
        set('translations.ar', ar);
    };

    const updateRow = (key, field, val) => {
        sync(rows.map(r => r.key === key ? { ...r, [field]: val } : r));
    };

    const deleteRow = (key) => sync(rows.filter(r => r.key !== key));

    const addRow = () => {
        const k = newKey.trim();
        if (!k || rows.find(r => r.key === k)) return;
        sync([...rows, { key: k, en: '', ar: '' }]);
        setNewKey('');
    };

    const filtered = rows.filter(r =>
        r.key.toLowerCase().includes(search.toLowerCase()) ||
        r.en.toLowerCase().includes(search.toLowerCase()) ||
        r.ar.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
        <Card title="إضافة مفتاح ترجمة جديد">
            <div className="flex gap-3">
                <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)}
                    placeholder="مثال: header.title"
                    className="flex-1 px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fcs} onBlur={blr}
                    onKeyDown={e => e.key === 'Enter' && addRow()} />
                <button onClick={addRow}
                    className="flex items-center gap-2 px-5 py-3 text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#8A6924,#c4983a)' }}>
                    <HiPlus size={14} /> إضافة
                </button>
            </div>
        </Card>

        <Card title={`جدول الترجمات (${rows.length} مفتاح)`}>
            {/* Search */}
            <div className="flex items-center gap-2 mb-4">
                <HiSearch size={14} style={{ color: '#94a3b8' }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="بحث في المفاتيح أو القيم..."
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none" style={IS} onFocus={fcs} onBlur={blr} />
            </div>

            {filtered.length === 0
                ? <p className="text-center py-8 text-xs" style={{ color: '#94a3b8' }}>لا توجد نتائج</p>
                : <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(138,105,36,0.1)' }}>
                                <th className="text-right py-2 px-3 font-black" style={{ color: '#12283C', width: '28%' }}>المفتاح</th>
                                <th className="text-right py-2 px-3 font-black" style={{ color: '#12283C', width: '33%' }}>العربية</th>
                                <th className="text-right py-2 px-3 font-black" style={{ color: '#12283C', width: '33%' }}>الإنجليزية</th>
                                <th className="py-2 px-3" style={{ width: '6%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, i) => (
                                <tr key={row.key} style={{ borderBottom: '1px solid rgba(138,105,36,0.07)', background: i % 2 === 0 ? 'white' : 'rgba(138,105,36,0.015)' }}>
                                    <td className="py-2 px-3">
                                        <code className="font-mono text-[11px]" style={{ color: '#8A6924' }}>{row.key}</code>
                                    </td>
                                    <td className="py-1.5 px-3" dir="rtl">
                                        <input type="text" value={row.ar} onChange={e => updateRow(row.key, 'ar', e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs focus:outline-none"
                                            style={{ ...IS, borderWidth: 1 }} onFocus={fcs} onBlur={blr} />
                                    </td>
                                    <td className="py-1.5 px-3" dir="ltr">
                                        <input type="text" value={row.en} onChange={e => updateRow(row.key, 'en', e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs focus:outline-none"
                                            style={{ ...IS, borderWidth: 1 }} onFocus={fcs} onBlur={blr} />
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <button onClick={() => deleteRow(row.key)}
                                            className="p-1.5 transition-opacity hover:opacity-70"
                                            style={{ color: '#dc2626' }}>
                                            <HiTrash size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </Card>
        </>
    );
}
