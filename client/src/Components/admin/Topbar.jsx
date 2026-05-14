import { useState } from "react";
import { Menu, Bell, Sun, Moon, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick, collapsed }) {
  const { user } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-20 flex items-center gap-4 px-4 transition-all duration-300
        ${collapsed ? "lg:mr-16" : "lg:mr-64"}`}
    >
      <button
        onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search placeholder */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">بحث سريع...</span>
        </div>
      </div>

      <div className="mr-auto flex items-center gap-2">
        <Link
          to="/"
          target="_blank"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          title="الموقع الإلكتروني"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        <button
          onClick={toggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-9 h-9 rounded-full bg-[#2d5d89] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          {user?.name?.[0] || "A"}
        </div>
      </div>
    </header>
  );
}
