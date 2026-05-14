import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiSearch, HiRefresh, HiTrash, HiExclamation, HiUsers, HiShieldCheck, HiBriefcase } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import Switch from 'react-switch';

const roleMap = {
    admin: { label: 'مسؤول النظام', color: 'bg-red-100 text-red-700' },
    broker: { label: 'وسيط عقاري', color: 'bg-blue-100 text-blue-700' },
    user: { label: 'مستخدم', color: 'bg-slate-100 text-slate-600' },
};

const getRoleKey = (user) => user.isAdmin ? 'admin' : user.isBroker ? 'broker' : 'user';

export default function DashUsers() {
    const { currentUser } = useSelector(state => state.user);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [targetUserId, setTargetUserId] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [showMore, setShowMore] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async (startIndex = 0) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setUsers(prev => startIndex === 0 ? data.users : [...prev, ...data.users]);
                setShowMore(data.users.length === 10);
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async () => {
        setShowDeleteModal(false);
        const res = await fetch(`/api/user/delete/${targetUserId}`, { method: 'DELETE' });
        if (res.ok) setUsers(prev => prev.filter(u => u._id !== targetUserId));
    };

    const handleRoleChange = async () => {
        setShowRoleModal(false);
        const res = await fetch(`/api/user/changerole/${targetUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            const updated = await res.json();
            setUsers(prev => prev.map(u => u._id === targetUserId ? { ...u, ...updated } : u));
        }
    };

    const handleToggleStatus = async (userId, current) => {
        const res = await fetch(`/api/user/togglestatus/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: !current }),
        });
        if (res.ok) setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !current } : u));
    };

    const filtered = users.filter(u =>
        (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterRole === 'all' ||
            (filterRole === 'admin' && u.isAdmin) ||
            (filterRole === 'broker' && u.isBroker) ||
            (filterRole === 'user' && !u.isAdmin && !u.isBroker))
    );

    const openDeleteModal = (id) => { setTargetUserId(id); setShowDeleteModal(true); };
    const openRoleModal = (id, role) => { setTargetUserId(id); setNewRole(role); setShowRoleModal(true); };

    return (
        <div className="p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">إدارة المستخدمين</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{filtered.length} مستخدم</p>
                </div>
                <button onClick={() => fetchUsers(0)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm font-bold text-slate-600 hover:border-primary hover:text-primary transition-colors">
                    <HiRefresh size={14} /> تحديث
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center mb-4">
                <div className="relative flex-1 min-w-48">
                    <HiSearch className="absolute right-3 top-2.5 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-1">
                    {['all', 'admin', 'broker', 'user'].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${filterRole === role ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {{ all: 'الكل', admin: 'مسؤول', broker: 'وسيط', user: 'مستخدم' }[role]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center p-16">
                    <TbLoaderQuarter className="animate-spin text-3xl text-primary" />
                </div>
            ) : (
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">المستخدم</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">البريد الإلكتروني</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">رقم الهاتف</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الدور</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الحالة</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">لا توجد نتائج</td></tr>
                            ) : filtered.map(user => {
                                const role = getRoleKey(user);
                                return (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-sm object-cover border border-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                                    <div className="text-[10px] text-slate-400">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{user.email}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{user.number || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${roleMap[role].color}`}>
                                                {roleMap[role].label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Switch
                                                checked={!!user.isActive}
                                                onChange={() => handleToggleStatus(user._id, user.isActive)}
                                                onColor="#8A6924"
                                                offColor="#d1d5db"
                                                height={20}
                                                width={40}
                                                handleDiameter={16}
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex gap-1.5">
                                                <div className="relative group">
                                                    <button className="px-3 py-1.5 bg-primary-50 text-primary rounded-sm text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                                                        تغيير الدور
                                                    </button>
                                                    <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-sm shadow-lg z-10 hidden group-hover:block min-w-32">
                                                        {['admin', 'broker', 'user'].map(r => (
                                                            <button key={r} onClick={() => openRoleModal(user._id, r)}
                                                                className="block w-full text-right px-4 py-2 text-xs hover:bg-slate-50 text-slate-700">
                                                                {roleMap[r].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openDeleteModal(user._id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-sm transition-colors"
                                                >
                                                    <HiTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {showMore && (
                        <div className="p-4 text-center border-t border-slate-50">
                            <button onClick={() => fetchUsers(users.length)} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-sm text-sm font-bold hover:bg-slate-200 transition-colors">
                                تحميل المزيد
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-sm shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()} dir="rtl">
                        <div className="flex items-center gap-3 bg-red-500 text-white p-4">
                            <HiExclamation size={18} />
                            <h3 className="font-bold text-sm">تأكيد حذف المستخدم</h3>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-sm text-slate-600">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-slate-100 justify-end">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200">إلغاء</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-xs font-bold bg-red-500 text-white rounded-sm hover:bg-red-600">حذف</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowRoleModal(false)}>
                    <div className="bg-white rounded-sm shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()} dir="rtl">
                        <div className="flex items-center gap-3 bg-primary text-white p-4">
                            <HiUsers size={18} />
                            <h3 className="font-bold text-sm">تغيير صلاحية المستخدم</h3>
                        </div>
                        <div className="p-5 text-center">
                            <p className="text-sm text-slate-600">تأكيد تغيير الدور إلى: <strong>{roleMap[newRole]?.label}</strong></p>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-slate-100 justify-end">
                            <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200">إلغاء</button>
                            <button onClick={handleRoleChange} className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-sm hover:bg-primary-700">تأكيد</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
