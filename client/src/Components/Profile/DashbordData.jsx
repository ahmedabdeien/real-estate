import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import {
    HiUsers, HiShieldCheck, HiBriefcase, HiDocumentText,
    HiMail, HiRefresh, HiSearch, HiEye, HiPencilAlt,
    HiOfficeBuilding, HiChartBar
} from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className={`bg-white rounded-sm shadow-sm border-r-4 ${color} p-5 flex items-center justify-between hover:shadow-md transition-shadow`}>
        <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-slate-800">{(value ?? 0).toLocaleString('ar-EG')}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-sm bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Icon className="text-slate-500" size={22} />
        </div>
    </div>
);

export default function DashbordData() {
    const { currentUser } = useSelector((state) => state.user);
    const [stats, setStats] = useState({
        totalUsers: 0, lastMonthUsers: 0,
        totalAdmins: 0, totalBrokers: 0, totalRegular: 0,
        totalBlogs: 0, totalMessages: 0, totalProjects: 0,
    });
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeView, setActiveView] = useState('stats');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [usersRes, projectsRes, blogsRes, messagesRes] = await Promise.all([
                fetch('/api/user/getusers'),
                fetch('/api/listing/getListings?limit=200'),
                fetch('/api/cms/blogs'),
                fetch('/api/cms/messages'),
            ]);

            if (!usersRes.ok) throw new Error('فشل تحميل بيانات المستخدمين');

            const usersData = await usersRes.json();
            const users = usersData.users || [];

            let blogsCount = 0, messagesCount = 0, projectsList = [];

            if (blogsRes.ok) { const b = await blogsRes.json(); blogsCount = Array.isArray(b) ? b.length : 0; }
            if (messagesRes.ok) { const m = await messagesRes.json(); messagesCount = Array.isArray(m) ? m.length : 0; }
            if (projectsRes.ok) { const p = await projectsRes.json(); projectsList = p.listings || []; }

            setStats({
                totalUsers: usersData.totalUsers || users.length,
                lastMonthUsers: usersData.lastMonthUsers || 0,
                totalAdmins: users.filter(u => u.isAdmin).length,
                totalBrokers: users.filter(u => u.isBroker).length,
                totalRegular: users.filter(u => !u.isAdmin && !u.isBroker).length,
                totalBlogs: blogsCount,
                totalMessages: messagesCount,
                totalProjects: projectsList.length,
            });
            setProjects(projectsList);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const nameStr    = p => p.name?.ar    || p.name?.en    || '';
    const addressStr = p => p.address?.ar || p.address?.en || '';

    const filteredProjects = projects.filter(p =>
        (nameStr(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
            addressStr(p).toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || p.available === filterStatus)
    );

    const chartData = [
        { name: 'مستخدمون', value: stats.totalRegular },
        { name: 'مدراء', value: stats.totalAdmins },
        { name: 'وسطاء', value: stats.totalBrokers },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <TbLoaderQuarter className="animate-spin text-4xl text-primary" />
        </div>
    );

    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-sm p-6 text-center">
                <p className="text-red-700 font-bold mb-3">{error}</p>
                <button onClick={fetchData} className="bg-red-500 text-white px-5 py-2 rounded-sm text-sm font-bold hover:bg-red-600 transition-colors">
                    إعادة المحاولة
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">لوحة الإحصائيات</h1>
                    <p className="text-xs text-slate-400 mt-0.5">نظرة عامة على أداء الموقع</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveView('stats')}
                        className={`px-4 py-2 rounded-sm text-xs font-bold transition-colors ${activeView === 'stats' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'}`}
                    >الإحصائيات</button>
                    <button
                        onClick={() => setActiveView('projects')}
                        className={`px-4 py-2 rounded-sm text-xs font-bold transition-colors ${activeView === 'projects' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'}`}
                    >إدارة المشاريع</button>
                    <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-sm text-slate-400 hover:text-primary hover:border-primary transition-colors" title="تحديث">
                        <HiRefresh size={16} />
                    </button>
                </div>
            </div>

            {activeView === 'stats' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="إجمالي المستخدمين" value={stats.totalUsers} icon={HiUsers} color="border-blue-500" sub={`+${stats.lastMonthUsers} هذا الشهر`} />
                        <StatCard title="إجمالي المشاريع" value={stats.totalProjects} icon={HiOfficeBuilding} color="border-primary" />
                        <StatCard title="المقالات المنشورة" value={stats.totalBlogs} icon={HiDocumentText} color="border-green-500" />
                        <StatCard title="الرسائل الواردة" value={stats.totalMessages} icon={HiMail} color="border-orange-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <StatCard title="مسؤولو النظام" value={stats.totalAdmins} icon={HiShieldCheck} color="border-red-500" />
                        <StatCard title="الوسطاء العقاريون" value={stats.totalBrokers} icon={HiBriefcase} color="border-purple-500" />
                        <StatCard title="المستخدمون العاديون" value={stats.totalRegular} icon={HiUsers} color="border-slate-400" />
                    </div>
                    <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-6">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <HiChartBar size={14} className="text-primary" />
                            توزيع المستخدمين
                        </h2>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip formatter={(v) => [v.toLocaleString('ar-EG'), 'العدد']} contentStyle={{ borderRadius: '2px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                                    <Bar dataKey="value" fill="#8A6924" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'projects' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <HiSearch className="absolute right-3 top-2.5 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="بحث في المشاريع..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="py-2 px-3 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary">
                            <option value="all">كل الحالات</option>
                            <option value="available">متاح</option>
                            <option value="not available">غير متاح</option>
                        </select>
                        <span className="text-xs text-slate-400">{filteredProjects.length} مشروع</span>
                    </div>
                    <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">تاريخ التحديث</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">اسم المشروع</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الموقع</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الحالة</th>
                                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredProjects.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">لا توجد مشاريع</td></tr>
                                ) : filteredProjects.map(p => (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-5 py-3 font-bold text-slate-800">{nameStr(p)}</td>
                                        <td className="px-5 py-3 text-slate-500">{addressStr(p)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${p.available === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {p.available === 'available' ? 'متاح' : 'غير متاح'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex gap-2">
                                                <Link to={`/Update-Page/${p._id}`} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary rounded-sm text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                                                    <HiPencilAlt size={11} /> تعديل
                                                </Link>
                                                <Link to={`/Projects/${p.slug}`} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-sm text-xs font-bold hover:bg-slate-200 transition-colors">
                                                    <HiEye size={11} /> عرض
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
