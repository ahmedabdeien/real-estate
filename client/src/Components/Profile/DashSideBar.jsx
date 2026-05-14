import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteUserFailure, deleteUserStart, deleteUserSuccess,
    logOutUserFailure, logOutUserStart, logOutUserSuccess
} from '../redux/user/userSlice';
import {
    HiUser, HiUsers, HiChartBar, HiCog, HiDocumentText,
    HiMail, HiNewspaper, HiPencilAlt, HiOfficeBuilding, HiLogout,
    HiTrash, HiExclamation, HiChevronDown, HiViewGrid, HiBriefcase
} from 'react-icons/hi';
import Logoelsarh from '../../assets/images/logoElsarh.png';

function DashSideBar() {
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab') || '';
    const [showModal, setShowModal] = useState(false);
    const [openGroups, setOpenGroups] = useState({ projects: true, content: true });
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const toggleGroup = (key) => setOpenGroups(p => ({ ...p, [key]: !p[key] }));

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) dispatch(deleteUserFailure(data.message));
            else dispatch(deleteUserSuccess(data));
        } catch { dispatch(deleteUserFailure()); }
    };

    const handleSignout = async () => {
        try {
            dispatch(logOutUserStart());
            const res = await fetch('/api/user/signout', { method: 'POST' });
            if (!res.ok) dispatch(logOutUserFailure());
            else dispatch(logOutUserSuccess());
        } catch { dispatch(logOutUserFailure()); }
    };

    const roleLabel = currentUser?.isAdmin ? 'مسؤول النظام' :
        currentUser?.role === 'Sales' ? 'فريق المبيعات' : 'مستخدم';

    const NavItem = ({ to, icon: Icon, label, tabKey }) => {
        const isActive = tab === tabKey;
        return (
            <Link to={to}>
                <div
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', transition: 'all .15s',
                        background: isActive ? 'rgba(138,105,36,0.18)' : 'transparent',
                        color: isActive ? '#DFBA6B' : 'rgba(255,255,255,0.6)',
                        borderRight: isActive ? '3px solid #8A6924' : '3px solid transparent',
                    }}
                >
                    <Icon size={15} style={{ color: isActive ? '#DFBA6B' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                    <span>{label}</span>
                </div>
            </Link>
        );
    };

    const SectionLabel = ({ label, icon: Icon, groupKey }) => (
        <button
            onClick={() => toggleGroup(groupKey)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '6px 16px',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 8,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={11} />
                <span>{label}</span>
            </div>
            <HiChevronDown
                size={11}
                style={{
                    transition: 'transform .2s',
                    transform: openGroups[groupKey] ? 'rotate(0)' : 'rotate(-90deg)',
                }}
            />
        </button>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#12283C', userSelect: 'none' }}>

            {/* هيدر */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(223,186,107,0.2)', flexShrink: 0 }}>
                    <img src={Logoelsarh} alt="الصرح" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: 13, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>الصرح للتطوير العقاري</p>
                    <p style={{ color: '#DFBA6B', fontSize: 10, fontWeight: 700 }}>لوحة التحكم</p>
                </div>
            </div>

            {/* بيانات المستخدم */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <img src={currentUser?.avatar} alt="" style={{ width: 34, height: 34, objectFit: 'cover', border: '2px solid rgba(138,105,36,0.4)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ color: 'white', fontSize: 12, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name}</p>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', display: 'inline-block', marginTop: 2, background: currentUser?.isAdmin ? 'rgba(220,38,38,0.25)' : 'rgba(138,105,36,0.25)', color: currentUser?.isAdmin ? '#fca5a5' : '#DFBA6B' }}>{roleLabel}</span>
                </div>
            </div>

            {/* روابط القائمة */}
            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 8, paddingBottom: 8 }}>
                <NavItem to="/Dashboard?tab=Profile" icon={HiUser} label="ملفي الشخصي" tabKey="Profile" />

                {currentUser?.isAdmin && (
                    <>
                        <NavItem to="/Dashboard?tab=dashbordData" icon={HiChartBar} label="الإحصائيات" tabKey="dashbordData" />

                        <SectionLabel label="إدارة المشاريع" icon={HiOfficeBuilding} groupKey="projects" />
                        {openGroups.projects && (
                            <>
                                <NavItem to="/Dashboard?tab=pagesFinished" icon={HiViewGrid} label="قائمة المشاريع" tabKey="pagesFinished" />
                                <NavItem to="/CreatePage" icon={HiPencilAlt} label="إضافة مشروع" tabKey="createPage" />
                            </>
                        )}

                        <SectionLabel label="إدارة المحتوى" icon={HiDocumentText} groupKey="content" />
                        {openGroups.content && (
                            <>
                                <NavItem to="/Dashboard?tab=blogs" icon={HiNewspaper} label="المقالات" tabKey="blogs" />
                                <NavItem to="/Admin/Blog-Editor" icon={HiPencilAlt} label="مقال جديد" tabKey="newBlog" />
                                <NavItem to="/Dashboard?tab=staticPages" icon={HiDocumentText} label="الصفحات الثابتة" tabKey="staticPages" />
                            </>
                        )}

                        <NavItem to="/Dashboard?tab=users" icon={HiUsers} label="المستخدمون" tabKey="users" />
                        <NavItem to="/Dashboard?tab=messages" icon={HiMail} label="الرسائل" tabKey="messages" />
                        <NavItem to="/Admin-Settings" icon={HiCog} label="إعدادات الموقع" tabKey="settings" />
                    </>
                )}

                {!currentUser?.isAdmin && currentUser?.role === 'Sales' && (
                    <>
                        <NavItem to="/Dashboard?tab=pagesFinished" icon={HiViewGrid} label="المشاريع" tabKey="pagesFinished" />
                        <NavItem to="/CreatePage" icon={HiPencilAlt} label="إضافة مشروع" tabKey="createPage" />
                        <NavItem to="/Dashboard?tab=messages" icon={HiMail} label="الرسائل" tabKey="messages" />
                        <NavItem to="/PageBroker" icon={HiBriefcase} label="ملف الوسيط" tabKey="broker" />
                    </>
                )}
            </nav>

            {/* أسفل */}
            <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button onClick={() => setShowModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'rgba(248,113,113,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                    <HiTrash size={14} />
                    <span>حذف الحساب</span>
                </button>
                <button onClick={handleSignout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                    <HiLogout size={14} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>

            {/* مودال التأكيد */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 16px', padding: 24, background: '#12283C', border: '1px solid rgba(223,186,107,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} dir="rtl">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(220,38,38,0.2)' }}>
                                <HiExclamation size={20} style={{ color: '#f87171' }} />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>تأكيد حذف الحساب</p>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>هذا الإجراء لا يمكن التراجع عنه</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={handleDeleteUser} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 900, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}>نعم، احذف</button>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 900, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer' }}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashSideBar;
