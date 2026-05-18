import React from 'react';
import LogoSvg from '../../assets/images/logo.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaHome,
  FaBuilding,
  FaPlusCircle,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaPalette,
} from 'react-icons/fa';
import { signOut } from '../../store/userSlice';
import { logout } from '../../lib/api';

const NAV = [
  { to: '/dashboard', icon: FaTachometerAlt, label: 'الإحصائيات', exact: true },
  { to: '/dashboard?tab=listings', icon: FaBuilding, label: 'المشاريع' },
  { to: '/dashboard/create', icon: FaPlusCircle, label: 'إضافة مشروع' },
  { to: '/dashboard?tab=users', icon: FaUsers, label: 'المستخدمون' },
  { to: '/dashboard?tab=builder', icon: FaPalette, label: 'محرر الصفحات' },
  { to: '/dashboard?tab=settings', icon: FaCog, label: 'الإعدادات' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    dispatch(signOut());
    navigate('/');
  };

  const TAB_MAP = {
    '/dashboard': 'stats',
    'listings': 'listings',
    'create': 'create',
    'users': 'users',
    'builder': 'builder',
    'settings': 'settings',
  };

  return (
    <aside className="w-64 min-h-screen bg-[#12283C] flex flex-col border-l border-[#DFBA6B]/10">
      {/* Logo */}
      <div className="p-5 border-b border-[#DFBA6B]/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img src={LogoSvg} alt="الصرح" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <div className="text-[#DFBA6B] font-black text-sm">الصرح للتطوير العقاري</div>
            <div className="text-white/40 text-[10px]">لوحة التحكم</div>
          </div>
        </div>
      </div>

      {/* User */}
      {currentUser && (
        <div className="p-4 border-b border-[#DFBA6B]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8A6924] flex items-center justify-center text-white font-black text-sm">
              {(currentUser.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white font-bold text-sm truncate max-w-[130px]">
                {currentUser.username || 'المستخدم'}
              </div>
              <div className="text-[#DFBA6B]/60 text-[10px]">
                {currentUser.role === 'admin' ? 'مدير' : 'وسيط'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV.map((item) => {
          const tab = item.to.includes('?tab=')
            ? item.to.split('?tab=')[1]
            : item.to === '/dashboard'
            ? 'stats'
            : 'create';

          const isActive = activeTab === tab;

          return (
            <button
              key={item.to}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 text-sm font-bold transition-all duration-200 text-right ${
                isActive
                  ? 'bg-[#8A6924] text-white border-r-2 border-[#DFBA6B]'
                  : 'text-white/60 hover:text-[#DFBA6B] hover:bg-[#DFBA6B]/5'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#DFBA6B]/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <FaSignOutAlt />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
