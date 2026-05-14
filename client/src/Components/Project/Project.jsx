import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import {
  BsSearch, BsBuilding, BsDoorOpen, BsGeoAlt, BsFilter,
  BsGrid3X3Gap, BsList, BsX, BsChevronDown,
  BsArrowRightShort, BsHouseDoor
} from "react-icons/bs";
import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from "react-leaflet";
import { FaBath } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── ألوان الشركة ──────────────────────────────────────────
const C = {
  gold:    "#8A6924",
  goldLt:  "#DFBA6B",
  navy:    "#12283C",
  bg:      "#faf8f4",
  text:    "#1a1509",
  muted:   "#6b5e3e",
};

// ── API ──────────────────────────────────────────────────
const API_BASE     = import.meta.env.VITE_API_BASE_URL || "/api";
const API_ENDPOINT = `${API_BASE}/listing/getListings`;

// ── إصلاح أيقونة Leaflet الافتراضية ─────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── أيقونات الخريطة المخصصة ──────────────────────────────
const makeIcon = (available, active = false) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        position:relative;
        width:${active ? 48 : 38}px;
        display:flex;
        flex-direction:column;
        align-items:center;
        filter:${active ? "drop-shadow(0 6px 14px rgba(0,0,0,.45))" : "drop-shadow(0 3px 7px rgba(0,0,0,.30))"};
        transition:all .2s;
      ">
        <div style="
          background:${available ? C.gold : "#dc2626"};
          color:white;
          font-size:10px;
          font-weight:900;
          padding:4px 8px;
          border-radius:4px;
          white-space:nowrap;
          border:2px solid ${active ? C.goldLt : "white"};
          letter-spacing:.03em;
        ">${available ? "متاح" : "مباع"}</div>
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:9px solid ${available ? C.gold : "#dc2626"};
          margin-top:-1px;
        "></div>
      </div>`,
    iconSize:   [active ? 48 : 38, active ? 46 : 38],
    iconAnchor: [active ? 24 : 19, active ? 46 : 38],
    popupAnchor:[0, -38],
  });

// ── تحريك الخريطة نحو الماركر النشط ─────────────────────
function MapFlyTo({ project }) {
  const map = useMap();
  useEffect(() => {
    if (project?.location?.lat && project?.location?.lng) {
      map.flyTo([project.location.lat, project.location.lng], 14, { duration: 0.8 });
    }
  }, [project, map]);
  return null;
}

// ── الاسم بالعربي ─────────────────────────────────────────
const getName = (v) =>
  typeof v === "object" ? v?.ar || v?.en || "" : v || "";

// ── كارت المشروع في القائمة ───────────────────────────────
const ProjectCard = React.memo(({ item, active, onHover }) => {
  const { currentUser } = useSelector((s) => s.user);
  const isAvail = item.available !== false;
  const name    = getName(item.name);
  const city    = getName(item.city);
  const addr    = getName(item.address);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      className="group cursor-pointer"
      style={{
        background: "white",
        border: `1.5px solid ${active ? C.gold : "rgba(138,105,36,.10)"}`,
        boxShadow: active
          ? `0 8px 28px rgba(138,105,36,.18)`
          : "0 2px 10px rgba(18,40,60,.04)",
        transition: "all .25s",
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* الصورة */}
      <div className="relative overflow-hidden" style={{ height: 170 }}>
        <Link to={`/Projects/${item.slug}`}>
          <img
            src={item.imageUrls?.[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(18,40,60,.45) 0%, transparent 60%)",
          }}
        />
        {/* شارة الحالة */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: isAvail ? C.gold : "#dc2626",
            color: "white",
            fontSize: 10,
            fontWeight: 900,
            padding: "3px 10px",
            letterSpacing: ".06em",
            borderRadius: 2,
          }}
        >
          {isAvail ? "متاح" : "مباع"}
        </span>
        {/* زر تعديل للأدمن */}
        {currentUser && (currentUser.isAdmin || currentUser.role === "Sales") && (
          <Link
            to={`/Update-Page/${item._id}`}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: C.navy,
              color: "white",
              fontSize: 10,
              fontWeight: 900,
              padding: "3px 10px",
              letterSpacing: ".04em",
              borderRadius: 2,
            }}
          >
            تعديل
          </Link>
        )}
        {/* السعر في أسفل الصورة */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            color: C.goldLt,
            fontSize: 14,
            fontWeight: 900,
            textShadow: "0 1px 6px rgba(0,0,0,.5)",
          }}
        >
          {item.price?.toLocaleString()} ج.م
        </div>
      </div>

      {/* المحتوى */}
      <div style={{ padding: "12px 14px 14px" }}>
        <h3
          style={{
            color: C.navy,
            fontWeight: 900,
            fontSize: 13,
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </h3>

        {(city || addr) && (
          <p
            style={{
              color: C.muted,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 8,
            }}
          >
            <BsGeoAlt size={11} style={{ color: C.gold }} />
            {city}{addr ? ` — ${addr}` : ""}
          </p>
        )}

        {/* التفاصيل */}
        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 11,
            color: C.gold,
            paddingTop: 8,
            borderTop: `1px solid rgba(138,105,36,.10)`,
          }}
        >
          {item.rooms > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <BsDoorOpen size={12} /> {item.rooms} غرف
            </span>
          )}
          {item.bathrooms > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <FaBath size={11} /> {item.bathrooms} حمام
            </span>
          )}
          {item.propertySize > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <BsBuilding size={12} /> {item.propertySize} م²
            </span>
          )}
        </div>

        {/* رابط التفاصيل */}
        <Link
          to={`/Projects/${item.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 10,
            fontSize: 11,
            fontWeight: 900,
            color: C.navy,
            letterSpacing: ".04em",
            textDecoration: "none",
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.navy)}
        >
          عرض التفاصيل
          <BsArrowRightShort size={16} />
        </Link>
      </div>
    </motion.div>
  );
});

// ── هيكل التحميل ─────────────────────────────────────────
const Skeleton = () => (
  <div style={{ padding: "0 16px" }}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        style={{
          background: "white",
          border: "1px solid rgba(138,105,36,.08)",
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div className="skeleton" style={{ height: 170 }} />
        <div style={{ padding: "12px 14px" }}>
          <div className="skeleton" style={{ height: 13, width: "70%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, width: "45%", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="skeleton" style={{ height: 11, width: 50 }} />
            <div className="skeleton" style={{ height: 11, width: 50 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── الصفحة الرئيسية ───────────────────────────────────────
export default function Project() {
  const [search,       setSearch]       = useState("");
  const [propType,     setPropType]     = useState("");
  const [availability, setAvailability] = useState(""); // "available" | "sold" | ""
  const [minPrice,     setMinPrice]     = useState("");
  const [maxPrice,     setMaxPrice]     = useState("");
  const [view,         setView]         = useState("list"); // "list" | "grid"
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [activeItem,   setActiveItem]   = useState(null);

  const listRef = useRef(null);

  // ── جلب البيانات ─────────────────────────────────────────
  const { data: projects = [], isLoading, error } = useQuery(
    "dataListings",
    async () => {
      const res  = await fetch(`${API_ENDPOINT}?limit=200`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.listings || [];
    },
    { staleTime: 300000, cacheTime: 3600000, retry: 3 }
  );

  // ── الفلترة ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return projects.filter((p) => {
      const nm   = getName(p.name).toLowerCase();
      const desc = getName(p.description).toLowerCase();
      const ct   = getName(p.city).toLowerCase();
      if (term && !nm.includes(term) && !desc.includes(term) && !ct.includes(term)) return false;
      if (propType && p.propertyType !== propType) return false;
      if (availability === "available" && p.available === false)  return false;
      if (availability === "sold"      && p.available !== false)  return false;
      if (minPrice && p.price < parseInt(minPrice)) return false;
      if (maxPrice && p.price > parseInt(maxPrice)) return false;
      return true;
    });
  }, [projects, search, propType, availability, minPrice, maxPrice]);

  // ── مركز الخريطة ─────────────────────────────────────────
  const mapCenter = useMemo(() => {
    const withCoords = projects.filter((p) => p.location?.lat && p.location?.lng);
    if (!withCoords.length) return [30.0444, 31.2357]; // القاهرة
    const lat = withCoords.reduce((s, p) => s + p.location.lat, 0) / withCoords.length;
    const lng = withCoords.reduce((s, p) => s + p.location.lng, 0) / withCoords.length;
    return [lat, lng];
  }, [projects]);

  const resetFilters = () => {
    setSearch(""); setPropType(""); setAvailability("");
    setMinPrice(""); setMaxPrice("");
  };

  const hasFilters = search || propType || availability || minPrice || maxPrice;

  return (
    <div dir="rtl" style={{ height: "calc(100vh - 72px)", display: "flex", flexDirection: "column", background: C.bg }}>
      <Helmet>
        <title>المشاريع العقارية | الصرح للتطوير العقاري</title>
      </Helmet>

      {/* ═══ شريط الأدوات ═══════════════════════════════════ */}
      <div
        style={{
          background: C.navy,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(18,40,60,.25)",
          zIndex: 10,
          flexWrap: "wrap",
        }}
      >
        {/* بحث */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <BsSearch
            size={13}
            style={{ position: "absolute", top: "50%", right: 11, transform: "translateY(-50%)", color: "rgba(255,255,255,.45)" }}
          />
          <input
            type="text"
            placeholder="ابحث عن مشروع أو مدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              paddingRight: 30,
              paddingLeft: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 12,
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              color: "white",
              outline: "none",
              borderRadius: 0,
            }}
            onFocus={(e)  => (e.target.style.borderColor = C.goldLt)}
            onBlur={(e)   => (e.target.style.borderColor = "rgba(255,255,255,.15)")}
          />
        </div>

        {/* نوع العقار */}
        <select
          value={propType}
          onChange={(e) => setPropType(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: propType ? C.goldLt : "rgba(255,255,255,.7)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value=""    style={{ background: C.navy }}>كل الأنواع</option>
          <option value="Apartment" style={{ background: C.navy }}>شقة</option>
          <option value="Villa"     style={{ background: C.navy }}>فيلا</option>
          <option value="Office"    style={{ background: C.navy }}>مكتب</option>
          <option value="Shop"      style={{ background: C.navy }}>محل</option>
          <option value="Land"      style={{ background: C.navy }}>أرض</option>
        </select>

        {/* متاح / مباع */}
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: availability ? C.goldLt : "rgba(255,255,255,.7)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value=""          style={{ background: C.navy }}>الحالة</option>
          <option value="available" style={{ background: C.navy }}>متاح</option>
          <option value="sold"      style={{ background: C.navy }}>مباع</option>
        </select>

        {/* فلتر متقدم */}
        <button
          onClick={() => setFilterOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 900,
            background: filterOpen ? C.gold : "rgba(138,105,36,.25)",
            border: `1px solid rgba(223,186,107,.3)`,
            color: C.goldLt,
            cursor: "pointer",
            letterSpacing: ".04em",
          }}
        >
          <BsFilter size={14} />
          فلاتر
          <BsChevronDown
            size={11}
            style={{ transition: "transform .2s", transform: filterOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {/* إعادة ضبط */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 900,
              background: "rgba(220,38,38,.2)",
              border: "1px solid rgba(220,38,38,.35)",
              color: "#fca5a5",
              cursor: "pointer",
            }}
          >
            <BsX size={14} /> مسح
          </button>
        )}

        {/* تبديل العرض (grid / list) */}
        <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.15)", marginRight: "auto" }}>
          {[["list", BsList], ["grid", BsGrid3X3Gap]].map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "7px 10px",
                background: view === v ? C.gold : "transparent",
                border: "none",
                color: view === v ? "white" : "rgba(255,255,255,.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        {/* عدد النتائج */}
        <span style={{ color: "rgba(255,255,255,.5)", fontSize: 11, whiteSpace: "nowrap" }}>
          {filtered.length} مشروع
        </span>
      </div>

      {/* ═══ فلاتر متقدمة (قابلة للطي) ═══════════════════════ */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", background: "#0e1f2e", flexShrink: 0, zIndex: 9 }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                padding: "14px 20px",
                flexWrap: "wrap",
                borderTop: `2px solid ${C.gold}`,
              }}
            >
              <div>
                <label style={{ fontSize: 10, color: C.goldLt, fontWeight: 900, letterSpacing: ".08em", display: "block", marginBottom: 6 }}>
                  الحد الأدنى للسعر
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={filterInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: C.goldLt, fontWeight: 900, letterSpacing: ".08em", display: "block", marginBottom: 6 }}>
                  الحد الأقصى للسعر
                </label>
                <input
                  type="number"
                  placeholder="بلا حد"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={filterInputStyle}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ الجسم الرئيسي (قائمة + خريطة) ═════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── القائمة اليمنى ─────────────────────────────── */}
        <div
          ref={listRef}
          style={{
            width: "42%",
            minWidth: 300,
            maxWidth: 480,
            overflowY: "auto",
            background: C.bg,
            borderLeft: "1px solid rgba(138,105,36,.1)",
            flexShrink: 0,
          }}
          className="custom-scrollbar"
        >
          {/* رأس القائمة */}
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid rgba(138,105,36,.1)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 900, color: C.navy }}>
              نتائج البحث
            </span>
            <span
              style={{
                fontSize: 11,
                color: C.gold,
                fontWeight: 700,
                background: "rgba(138,105,36,.08)",
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              {filtered.length} مشروع
            </span>
          </div>

          {/* المحتوى */}
          <div style={{ padding: "14px 14px 20px" }}>
            {isLoading ? (
              <Skeleton />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <BsHouseDoor size={40} style={{ color: "rgba(138,105,36,.25)", margin: "0 auto 14px" }} />
                <p style={{ fontSize: 13, fontWeight: 900, color: C.navy, marginBottom: 6 }}>
                  لا توجد نتائج
                </p>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
                  جرب تغيير معايير البحث
                </p>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: "8px 20px",
                    fontSize: 11,
                    fontWeight: 900,
                    background: C.gold,
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  عرض الكل
                </button>
              </div>
            ) : view === "list" ? (
              <AnimatePresence>
                {filtered.map((item) => (
                  <ProjectCard
                    key={item._id}
                    item={item}
                    active={activeItem?._id === item._id}
                    onHover={setActiveItem}
                  />
                ))}
              </AnimatePresence>
            ) : (
              /* عرض الشبكة */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AnimatePresence>
                  {filtered.map((item) => (
                    <GridCard
                      key={item._id}
                      item={item}
                      active={activeItem?._id === item._id}
                      onHover={setActiveItem}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── الخريطة اليسرى ─────────────────────────────── */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ماركرات المشاريع */}
            {filtered.map((item) => {
              if (!item.location?.lat || !item.location?.lng) return null;
              const isAvail  = item.available !== false;
              const isActive = activeItem?._id === item._id;
              return (
                <Marker
                  key={item._id}
                  position={[item.location.lat, item.location.lng]}
                  icon={makeIcon(isAvail, isActive)}
                  eventHandlers={{ click: () => setActiveItem(item) }}
                  zIndexOffset={isActive ? 1000 : 0}
                >
                  <Popup>
                    <div dir="rtl" style={{ minWidth: 200, fontFamily: "Cairo, sans-serif" }}>
                      {item.imageUrls?.[0] && (
                        <img
                          src={item.imageUrls[0]}
                          alt=""
                          style={{ width: "100%", height: 100, objectFit: "cover", marginBottom: 8, borderRadius: 4 }}
                        />
                      )}
                      <strong style={{ display: "block", color: C.navy, fontSize: 13, marginBottom: 4 }}>
                        {getName(item.name)}
                      </strong>
                      <span
                        style={{
                          display: "inline-block",
                          background: isAvail ? C.gold : "#dc2626",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 900,
                          padding: "2px 8px",
                          borderRadius: 2,
                          marginBottom: 6,
                        }}
                      >
                        {isAvail ? "متاح" : "مباع"}
                      </span>
                      <p style={{ color: C.gold, fontSize: 13, fontWeight: 900, marginBottom: 6 }}>
                        {item.price?.toLocaleString()} ج.م
                      </p>
                      <Link
                        to={`/Projects/${item.slug}`}
                        style={{
                          display: "block",
                          textAlign: "center",
                          background: C.navy,
                          color: "white",
                          fontSize: 11,
                          fontWeight: 900,
                          padding: "5px 0",
                          borderRadius: 2,
                          textDecoration: "none",
                        }}
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* تحريك الخريطة نحو المشروع المحدد */}
            {activeItem && <MapFlyTo project={activeItem} />}
          </MapContainer>

          {/* مفتاح الخريطة */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 16,
              background: "white",
              padding: "10px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,.15)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              borderRight: `3px solid ${C.gold}`,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, color: C.navy, marginBottom: 2, letterSpacing: ".06em" }}>
              المفتاح
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: C.text }}>
              <span style={{ width: 14, height: 14, background: C.gold, borderRadius: 2, flexShrink: 0 }} />
              متاح
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: C.text }}>
              <span style={{ width: 14, height: 14, background: "#dc2626", borderRadius: 2, flexShrink: 0 }} />
              مباع
            </span>
          </div>

          {/* عداد المشاريع على الخريطة */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: C.navy,
              color: "white",
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 900,
              zIndex: 1000,
              boxShadow: "0 2px 10px rgba(0,0,0,.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BsGeoAlt size={13} style={{ color: C.goldLt }} />
            {filtered.filter((p) => p.location?.lat).length} موقع على الخريطة
          </div>
        </div>
      </div>
    </div>
  );
}

// ── استايل حقل الفلتر ─────────────────────────────────────
const filterInputStyle = {
  padding: "7px 10px",
  fontSize: 12,
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.15)",
  color: "white",
  outline: "none",
  width: 140,
};

// ── كارت الشبكة (grid view) ───────────────────────────────
const GridCard = React.memo(({ item, active, onHover }) => {
  const isAvail = item.available !== false;
  const name    = getName(item.name);
  return (
    <motion.div
      initial={{ opacity: 0, scale: .96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: "white",
        border: `1.5px solid ${active ? C.gold : "rgba(138,105,36,.10)"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      <div style={{ position: "relative", height: 110 }}>
        <Link to={`/Projects/${item.slug}`}>
          <img src={item.imageUrls?.[0]} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Link>
        <span
          style={{
            position: "absolute", top: 6, right: 6,
            background: isAvail ? C.gold : "#dc2626",
            color: "white", fontSize: 9, fontWeight: 900,
            padding: "2px 7px", letterSpacing: ".05em",
          }}
        >
          {isAvail ? "متاح" : "مباع"}
        </span>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{ fontSize: 11, fontWeight: 900, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
          {name}
        </p>
        <p style={{ fontSize: 12, fontWeight: 900, color: C.gold }}>
          {item.price?.toLocaleString()} ج.م
        </p>
      </div>
    </motion.div>
  );
});
