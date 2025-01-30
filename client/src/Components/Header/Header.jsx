"use client";
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Dropdown } from "flowbite-react";
import Logoelsarh from '../../assets/images/logoElsarh.png';
import { 
  FaComments, FaColumns, FaCoins, FaCogs, 
  FaDoorOpen, FaMoon, FaUser, FaSun 
} from "react-icons/fa";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useSelector(state => state.theme);
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const navLinks = [
    { title: 'الصفحة الرئيسية', path: '/' },
    { title: 'المشروعات', path: '/Project' },
    { title: 'معلومات عنا', path: '/About' },
    { title: 'تواصل معنا', path: '/contact' },
  ];

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body overflow control for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  // Sign out handler
  const handleSignout = async () => {
    try {
      dispatch(logOutUserStart());
      const res = await fetch('/api/user/signout', { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(logOutUserSuccess());
    } catch (error) {
      dispatch(logOutUserFailure(error.message));
    }
  };

  // Active link style handler
  const getNavLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? '#033e8a' : '',
    color: isActive ? '#fff' : theme === 'dark' ? '#fefcfb' : '#333',
  });

  return (
    <header className={`
      w-full z-40 py-4
      transition-all duration-300 ease-in-out
      ${isScrolled ? 'sticky top-0 bg-white/90 dark:bg-stone-950 shadow-md backdrop-blur-lg' : 'relative'}
    `}>
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="z-50">
          <img 
            src={Logoelsarh} 
            alt="Elsarh Logo" 
            className="w-12 hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              style={getNavLinkStyle}
              className="px-4 py-2 rounded-lg hover:bg-blue-900/10 dark:hover:bg-white/10 transition-colors"
            >
              {link.title}
            </NavLink>
          ))}
        </nav>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <FaMoon className="text-xl text-gray-800" />
            ) : (
              <FaSun className="text-xl text-yellow-400" />
            )}
          </button>

          {/* User Avatar */}
          {currentUser ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar 
                  img={currentUser.avatar}
                  alt="User"
                  rounded
                  className="border-2 border-transparent hover:border-blue-500 transition-colors"
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm font-semibold">{currentUser.name}</span>
                <span className="block text-sm text-gray-500 truncate">{currentUser.email}</span>
              </Dropdown.Header>
              
              <UserMenuItems 
                currentUser={currentUser}
                onCloseMenu={() => setIsMenuOpen(false)}
                onSignout={handleSignout}
              />
            </Dropdown>
          ) : (
            <NavLink
              to="/Signin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول
            </NavLink>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-6 h-0.5 bg-current my-1.5 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm
          transition-opacity duration-300 md:hidden
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}>
          <nav className={`
            absolute top-0 right-0 w-3/4 h-full bg-white dark:bg-gray-900
            transform transition-transform duration-300
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="p-6 space-y-4">
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  style={getNavLinkStyle}
                  className="block p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {link.title}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Extracted User Menu Items component
const UserMenuItems = ({ currentUser, onCloseMenu, onSignout }) => (
  <div dir="rtl" className="space-y-1">
    <Dropdown.Item onClick={onCloseMenu}>
      <Link to="/Dashboard?tab=Profile" className="flex items-center gap-2 hover:text-blue-600">
        <FaUser className="text-lg" />
        <span>حسابي</span>
      </Link>
    </Dropdown.Item>

    {currentUser.isAdmin && (
      <>
        <Dropdown.Item onClick={onCloseMenu}>
          <Link to="/CreatePage" className="flex items-center gap-2 hover:text-blue-600">
            <FaColumns className="text-lg" />
            <span>إنشاء صفحة</span>
          </Link>
        </Dropdown.Item>
        <Dropdown.Item onClick={onCloseMenu}>
          <Link to="/Dashboard?tab=dashbordData" className="flex items-center gap-2 hover:text-blue-600">
            <FaCoins className="text-lg" />
            <span>لوحة المعلومات</span>
          </Link>
        </Dropdown.Item>
      </>
    )}

    {currentUser.isBroker && (
      <Dropdown.Item onClick={onCloseMenu}>
        <Link to="/PageBroker" className="flex items-center gap-2 hover:text-blue-600">
          <FaComments className="text-lg" />
          <span>قائمة الرسائل</span>
        </Link>
      </Dropdown.Item>
    )}

    <Dropdown.Item onClick={onCloseMenu}>
      <Link to="/Settings" className="flex items-center gap-2 hover:text-blue-600">
        <FaCogs className="text-lg" />
        <span>إعدادات</span>
      </Link>
    </Dropdown.Item>

    <Dropdown.Divider />

    <Dropdown.Item 
      onClick={() => {
        onCloseMenu();
        onSignout();
      }}
      className="hover:text-red-600 dark:hover:text-red-400"
    >
      <div className="flex items-center gap-2">
        <FaDoorOpen className="text-lg" />
        <span>تسجيل الخروج</span>
      </div>
    </Dropdown.Item>
  </div>
);