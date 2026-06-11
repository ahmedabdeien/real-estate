import React, { useState, useMemo } from 'react';
import {
  FaStar, FaBuilding, FaCity, FaHouse, FaKey, FaMapPin, FaLocationDot,
  FaFileContract, FaFile, FaFolder,
  FaUsers, FaUser, FaUserTie, FaUserGear, FaUserShield,
  FaChartLine, FaChartBar, FaChartPie, FaArrowTrendUp,
  FaMoneyBillWave, FaCoins, FaSackDollar, FaCreditCard, FaReceipt,
  FaBell, FaCircleCheck, FaCircleInfo, FaCircleXmark,
  FaShield, FaLock, FaUnlock,
  FaWhatsapp, FaComments, FaEnvelope, FaPhone,
  FaHeart, FaThumbsUp, FaFire, FaRocket, FaBolt,
  FaGear, FaWrench, FaMagnifyingGlass, FaFilter,
  FaPlus, FaArrowLeft, FaArrowRight,
  FaLayerGroup, FaWarehouse,
  FaPalette, FaWandMagicSparkles,
  FaGauge, FaBriefcase,
  FaNewspaper, FaBook, FaBookOpen, FaImage, FaImages,
  FaCalendar, FaCalendarDays, FaClock,
  FaTag, FaTags, FaHashtag,
  FaGlobe, FaLink, FaDownload, FaUpload, FaCloudArrowUp,
  FaHeadset, FaLifeRing, FaQuestion,
  FaCode, FaDatabase, FaServer,
  FaStore, FaLandmark,
  FaAward, FaMedal, FaTrophy, FaCrown,
  FaHandshake, FaGraduationCap,
  FaBullhorn, FaPen, FaRss,
} from 'react-icons/fa6';

const ICON_MAP = {
  FaStar, FaBuilding, FaCity, FaHouse, FaKey, FaMapPin, FaLocationDot,
  FaFileContract, FaFile, FaFolder,
  FaUsers, FaUser, FaUserTie, FaUserGear, FaUserShield,
  FaChartLine, FaChartBar, FaChartPie, FaArrowTrendUp,
  FaMoneyBillWave, FaCoins, FaSackDollar, FaCreditCard, FaReceipt,
  FaBell, FaCircleCheck, FaCircleInfo, FaCircleXmark,
  FaShield, FaLock, FaUnlock,
  FaWhatsapp, FaComments, FaEnvelope, FaPhone,
  FaHeart, FaThumbsUp, FaFire, FaRocket, FaBolt,
  FaGear, FaWrench, FaMagnifyingGlass, FaFilter,
  FaPlus, FaArrowLeft, FaArrowRight,
  FaLayerGroup, FaWarehouse,
  FaPalette, FaWandMagicSparkles,
  FaGauge, FaBriefcase,
  FaNewspaper, FaBook, FaBookOpen, FaImage, FaImages,
  FaCalendar, FaCalendarDays, FaClock,
  FaTag, FaTags, FaHashtag,
  FaGlobe, FaLink, FaDownload, FaUpload, FaCloudArrowUp,
  FaHeadset, FaLifeRing, FaQuestion,
  FaCode, FaDatabase, FaServer,
  FaStore, FaLandmark,
  FaAward, FaMedal, FaTrophy, FaCrown,
  FaHandshake, FaGraduationCap,
  FaBullhorn, FaPen, FaRss,
};

const ALL_ICONS = Object.keys(ICON_MAP);

export function resolveIcon(name) {
  return ICON_MAP[name] || FaStar;
}

export default function IconPicker({ value, onChange, label = 'الأيقونة' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    ALL_ICONS.filter(n => n.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const CurrentIcon = ICON_MAP[value] || FaStar;

  return (
    <div className="relative">
      {label && <label className="label mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-sm transition-colors hover:border-red-800"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        <CurrentIcon className="text-xl flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
        <span className="text-gray-500 flex-1 text-right">{value || 'اختر أيقونة'}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-80 rounded-2xl border bg-white shadow-2xl overflow-hidden" dir="rtl">
          <div className="p-3 border-b">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن أيقونة..."
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
              style={{ border: '1px solid #e5e7eb' }}
            />
          </div>
          <div className="grid grid-cols-7 gap-1 p-3 max-h-56 overflow-y-auto">
            {filtered.map(name => {
              const Icon = ICON_MAP[name];
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { onChange(name); setOpen(false); setSearch(''); }}
                  className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  style={{ background: value === name ? '#da1f2715' : '' }}
                >
                  <Icon className="text-base" style={{ color: value === name ? '#da1f27' : '#6b7280' }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
