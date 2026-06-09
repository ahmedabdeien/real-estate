import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding, FaPhone, FaBars, FaXmark, FaUser, FaGear,
  FaRightFromBracket, FaChevronDown,
} from "react-icons/fa6";

import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const links = [
  { to: "/", label: "الرئيسية", exact: true },
  { to: "/projects", label: "المشاريع" },
  { to: "/blog", label: "الأخبار" },
  { to: "/about", label: "عن الشركة" },
  { to: "/careers", label: "وظائف" },
  { to: "/contact", label: "تواصل معنا" },
];

function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] px-3 py-2 rounded-xl text-sm font-medium transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <span className="hidden sm:block max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
        <FaChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
            dir="rtl"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
            <div className="p-1.5">
              <Link to="/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <FaUser className="w-4 h-4 text-gray-400" />
                الملف الشخصي
              </Link>
              {["admin", "sales"].includes(user.role) && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FaGear className="w-4 h-4 text-gray-400" />
                  لوحة التحكم
                </Link>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                <FaRightFromBracket className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { contact, settings } = useSiteSettings();

  const phone = contact.phone || settings.company_phone || "01234567890";
  const logo  = settings.company_logo;
  const name  = settings.company_name_ar || "الصرح للتطوير العقاري";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          {logo ? (
            <img src={logo} alt={name} className="h-9 w-auto object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <FaBuilding className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-bold text-gray-900 text-lg">{name}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--primary)] bg-[var(--primary)]/8" : "text-gray-600 hover:text-[var(--primary)] hover:bg-gray-50"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user ? (
            <UserDropdown user={user} logout={logout} />
          ) : (
            <>
              <Link
                to="/admin/login"
                className="hidden md:flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors"
              >
                تسجيل الدخول
              </Link>
              <a
                href={`tel:+2${phone}`}
                className="hidden md:flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <FaPhone className="w-4 h-4" />
                اتصل بنا
              </a>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700"
          >
            {open ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {links.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? "text-[var(--primary)] bg-[var(--primary)]/8" : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              {user ? (
                <div className="mt-2 border-t border-gray-100 pt-2 space-y-1">
                  <Link to="/profile"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                    <FaUser className="w-4 h-4 text-gray-400" />
                    {user.name} — الملف الشخصي
                  </Link>
                  {["admin", "sales"].includes(user.role) && (
                    <Link to="/admin"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                      <FaGear className="w-4 h-4 text-gray-400" />
                      لوحة التحكم
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50">
                    <FaRightFromBracket className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <Link to="/admin/login"
                    className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
                    تسجيل الدخول
                  </Link>
                  <a href={`tel:+2${phone}`}
                    className="flex items-center justify-center gap-2 bg-[#f59e0b] text-white px-4 py-3 rounded-xl text-sm font-semibold">
                    <FaPhone className="w-4 h-4" />
                    اتصل بنا الآن
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
