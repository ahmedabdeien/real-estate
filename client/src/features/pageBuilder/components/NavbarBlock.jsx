import React, { useState, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash, FaBuilding, FaBars, FaXmark, FaChevronDown, FaPlus } from 'react-icons/fa6';
import { pagesAPI } from '../../../api/services';

/* ─── Settings Panel ─── */
function NavbarSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  const [expandedLink, setExpandedLink] = useState(null);

  const links = props.links || [];

  return (
    <div style={{ fontSize: 12 }}>

      {/* Brand & colors */}
      <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>العلامة</p>
        <input value={props.brand} onChange={e => setProp(p => p.brand = e.target.value)}
          placeholder="اسم الشركة" className="input text-xs w-full mb-2" />
        <input value={props.logoUrl || ''} dir="ltr" onChange={e => setProp(p => p.logoUrl = e.target.value)}
          placeholder="رابط اللوجو (اختياري)" className="input text-xs w-full" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>خلفية</p>
            <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)}
              style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: '1px solid #e5e7eb' }} />
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>نص</p>
            <input type="color" value={props.textColor} onChange={e => setProp(p => p.textColor = e.target.value)}
              style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: '1px solid #e5e7eb' }} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase' }}>زر الدعوة</p>
        <input value={props.ctaText} onChange={e => setProp(p => p.ctaText = e.target.value)}
          placeholder="نص الزر" className="input text-xs w-full mb-2" />
        <input value={props.ctaHref || '/login'} dir="ltr" onChange={e => setProp(p => p.ctaHref = e.target.value)}
          placeholder="رابط الزر" className="input text-xs w-full mb-2" />
        <input type="color" value={props.ctaColor} onChange={e => setProp(p => p.ctaColor = e.target.value)}
          style={{ width: '100%', height: 32, borderRadius: 6, cursor: 'pointer', border: '1px solid #e5e7eb' }} />
      </div>

      {/* Auto-load toggle */}
      <div style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>تحميل الصفحات تلقائياً</p>
          <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>صفحات "في القائمة" تظهر مباشرة</p>
        </div>
        <button onClick={() => setProp(p => p.autoLoadPages = !p.autoLoadPages)}
          style={{ position: 'relative', width: 40, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: props.autoLoadPages ? '#da1f27' : '#d1d5db', transition: 'background .2s' }}>
          <div style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s', left: props.autoLoadPages ? 22 : 2 }} />
        </button>
      </div>

      {/* Manual links */}
      {!props.autoLoadPages && (
        <div style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>
            الروابط ({links.length})
          </p>

          {links.map((l, i) => (
            <div key={i} style={{ marginBottom: 6, border: '1px solid #e5e7eb', borderRadius: 8 }}>

              {/* Row: expand + label + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 6px 6px 8px' }}>
                <button onClick={() => setExpandedLink(expandedLink === i ? null : i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, flexShrink: 0 }}>
                  <FaChevronDown size={9} style={{ transform: expandedLink === i ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                </button>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.label || 'رابط'}
                </span>
                {(l.children || []).length > 0 && (
                  <span style={{ fontSize: 9, background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '1px 4px', fontWeight: 700 }}>
                    {l.children.length} فرعي
                  </span>
                )}
                <button onClick={() => setProp(p => p.links.splice(i, 1))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, flexShrink: 0 }}>
                  <FaTrash size={9} />
                </button>
              </div>

              {/* Expanded: edit + sub-links */}
              {expandedLink === i && (
                <div style={{ padding: '0 8px 8px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
                    <input value={l.label} onChange={e => setProp(p => { p.links[i].label = e.target.value; })}
                      placeholder="النص" className="input text-xs" />
                    <input value={l.href} dir="ltr" onChange={e => setProp(p => { p.links[i].href = e.target.value; })}
                      placeholder="/رابط" className="input text-xs" />
                  </div>

                  {/* Sub-links */}
                  {(l.children || []).length > 0 && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e5e7eb' }}>
                      <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>الروابط الفرعية</p>
                      {(l.children || []).map((c, ci) => (
                        <div key={ci} style={{ display: 'flex', gap: 3, marginBottom: 3, alignItems: 'center', paddingRight: 8, borderRight: '2px solid #e5e7eb' }}>
                          <input value={c.label} onChange={e => setProp(p => { p.links[i].children[ci].label = e.target.value; })}
                            placeholder="النص" className="input text-xs flex-1" />
                          <input value={c.href} dir="ltr" onChange={e => setProp(p => { p.links[i].children[ci].href = e.target.value; })}
                            placeholder="/رابط" className="input text-xs" style={{ width: 60 }} />
                          <button onClick={() => setProp(p => { p.links[i].children.splice(ci, 1); })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 1 }}>
                            <FaXmark size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add sub-link button — واضح ومحدد */}
                  <button
                    onClick={() => setProp(p => {
                      if (!p.links[i].children) p.links[i].children = [];
                      p.links[i].children.push({ label: 'رابط فرعي جديد', href: '#' });
                    })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      width: '100%', marginTop: 6, padding: '6px 10px',
                      background: '#eff6ff', border: '1px dashed #93c5fd',
                      borderRadius: 6, cursor: 'pointer', fontSize: 11,
                      color: '#1d4ed8', fontWeight: 700,
                    }}>
                    <FaPlus size={9} />
                    إضافة رابط فرعي (Dropdown)
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add main link */}
          <button onClick={() => {
            setProp(p => { if (!p.links) p.links = []; p.links.push({ label: 'رابط جديد', href: '#', children: [] }); });
            setExpandedLink(links.length);
          }}
            style={{ width: '100%', padding: '7px', borderRadius: 7, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <FaPlus size={10} /> إضافة رابط رئيسي
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Dropdown Item ─── */
function DropdownLink({ link, textColor, hoverBg }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasChildren = link.children && link.children.length > 0;

  if (!hasChildren) {
    return (
      <a href={link.href}
        style={{ color: textColor, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, opacity: 0.85, whiteSpace: 'nowrap' }}>
        {link.label}
      </a>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ color: textColor, fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 8, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
        {link.label}
        <FaChevronDown size={9} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.06)', minWidth: 180, zIndex: 100, padding: '6px 0',
        }}>
          {link.children.map((c, ci) => (
            <a key={ci} href={c.href}
              style={{ display: 'block', padding: '9px 16px', fontSize: 13, color: '#231f20', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {c.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const defaultLinks = [
  { label: 'الرئيسية', href: '/', children: [] },
  { label: 'المميزات', href: '#features', children: [] },
  { label: 'الأسعار', href: '#pricing', children: [] },
  { label: 'تواصل معنا', href: '#contact', children: [] },
];

/* ─── NavbarBlock ─── */
export function NavbarBlock({
  brand = 'شركتك', logoUrl = '', links = defaultLinks,
  bg = '#ffffff', textColor = '#231f20', ctaText = 'ابدأ الآن',
  ctaColor = '#da1f27', ctaHref = '/login', autoLoadPages = false,
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const [navPages, setNavPages] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!autoLoadPages) { setNavPages([]); return; }
    pagesAPI.getNavPages()
      .then(r => setNavPages(r.data.data || []))
      .catch(() => setNavPages([]));
  }, [autoLoadPages]);

  const displayLinks = autoLoadPages
    ? navPages.map(p => ({ label: p.title, href: `/p/${p.slug}`, children: [] }))
    : (links || []);

  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        background: bg, padding: '0 24px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
        position: 'relative',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {logoUrl ? (
            <img src={logoUrl} alt={brand} style={{ height: 36, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 9, background: ctaColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaBuilding style={{ color: '#fff', fontSize: 15 }} />
            </div>
          )}
          <span style={{ fontSize: 18, fontWeight: 900, color: textColor, whiteSpace: 'nowrap' }}>{brand}</span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap' }}>
          {displayLinks.map((l, i) => (
            <DropdownLink key={i} link={l} textColor={textColor} />
          ))}
          {autoLoadPages && navPages.length === 0 && (
            <span style={{ fontSize: 12, color: '#9ca3af', padding: '0 8px' }}>لا توجد صفحات مفعّلة في القائمة</span>
          )}
        </nav>

        {/* CTA + Mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {ctaText && (
            <a href={ctaHref} onClick={e => e.preventDefault()}
              style={{ background: ctaColor, color: '#fff', fontSize: 13, fontWeight: 800, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {ctaText}
            </a>
          )}
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 6 }}
            className="navbar-mobile-toggle">
            {mobileOpen ? <FaXmark size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '12px 0 16px' }}>
          {displayLinks.map((l, i) => (
            <div key={i}>
              <a href={l.href} onClick={e => e.preventDefault()}
                style={{ display: 'block', padding: '10px 8px', color: textColor, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                {l.label}
              </a>
              {(l.children || []).map((c, ci) => (
                <a key={ci} href={c.href} onClick={e => e.preventDefault()}
                  style={{ display: 'block', padding: '8px 24px', color: textColor, fontSize: 13, opacity: 0.7, textDecoration: 'none' }}>
                  {c.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

NavbarBlock.craft = {
  displayName: 'شريط تنقل',
  props: {
    brand: 'شركتك', logoUrl: '', links: defaultLinks,
    bg: '#ffffff', textColor: '#231f20',
    ctaText: 'ابدأ الآن', ctaColor: '#da1f27', ctaHref: '/login',
    autoLoadPages: false,
  },
  related: { settings: NavbarSettings },
};
