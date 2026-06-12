import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesAPI } from '../../api/services';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock,
  HeroBlock, SpacerBlock, ColumnsBlock, DividerBlock,
  FeatureGrid, ContactSection, VideoBlock, GalleryBlock,
  FaqBlock, CtaBlock, StatsBlock, TestimonialsBlock, PricingBlock,
  TeamBlock, LogosBlock, MapBlock, SocialBlock, CountdownBlock, StepsBlock,
  NavbarBlock, FooterBlock, IconBoxBlock, QuoteBlock,
} from './components';
import {
  FaArrowRight, FaFloppyDisk, FaEye, FaEyeSlash, FaCircleCheck,
  FaDesktop, FaTabletScreenButton, FaMobileScreen, FaPen, FaPlay,
  FaRotateLeft, FaRotateRight, FaGear, FaXmark, FaMagnifyingGlass, FaSliders,
} from 'react-icons/fa6';

const RESOLVER = {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
  VideoBlock, GalleryBlock, FaqBlock, CtaBlock, StatsBlock,
  TestimonialsBlock, PricingBlock,
  TeamBlock, LogosBlock, MapBlock, SocialBlock, CountdownBlock, StepsBlock,
  NavbarBlock, FooterBlock, IconBoxBlock, QuoteBlock,
};

/* craftJson must contain a ROOT node, otherwise Craft.js throws "Invariant failed".
   كما نحذف أي عقدة مكوّنها غير مسجل في الـ resolver (بلوكات قديمة/محذوفة)
   حتى لا تكسر الصفحة بالكامل */
export const validCraftJson = (json, resolver = RESOLVER) => {
  if (!json || typeof json !== 'string') return undefined;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || !parsed.ROOT) return undefined;

    const known = new Set(Object.keys(resolver));
    const bad = new Set(
      Object.entries(parsed)
        .filter(([id, n]) => id !== 'ROOT' && n?.type?.resolvedName && !known.has(n.type.resolvedName))
        .map(([id]) => id)
    );
    if (bad.size === 0) return json;

    const clean = {};
    for (const [id, n] of Object.entries(parsed)) {
      if (bad.has(id)) continue;
      clean[id] = {
        ...n,
        nodes: (n.nodes || []).filter(c => !bad.has(c)),
        linkedNodes: Object.fromEntries(Object.entries(n.linkedNodes || {}).filter(([, v]) => !bad.has(v))),
      };
    }
    return JSON.stringify(clean);
  } catch { return undefined; }
};

const VIEWPORTS = [
  { key: 'desktop', label: 'كمبيوتر', icon: FaDesktop,            width: '100%' },
  { key: 'tablet',  label: 'تابلت',   icon: FaTabletScreenButton, width: 768 },
  { key: 'mobile',  label: 'موبايل',  icon: FaMobileScreen,       width: 390 },
];

/* Build a craftJson seed from a list of block descriptors.
   Passing JSX Fragments inside <Frame> causes "Invariant failed" because
   React.Fragment is not in the resolver — using the data prop avoids this. */
const buildSeed = (blocks) => {
  const ids = blocks.map((_, i) => `n${i}`);
  const nodes = {
    ROOT: {
      type: { resolvedName: 'ContainerBlock' },
      isCanvas: true,
      props: { bg: '#ffffff', padding: 0, maxWidth: '100%' },
      displayName: 'ContainerBlock',
      custom: {},
      hidden: false,
      nodes: ids,
      linkedNodes: {},
    },
  };
  blocks.forEach((b, i) => {
    nodes[ids[i]] = {
      type: { resolvedName: b.name },
      isCanvas: false,
      props: b.props || {},
      displayName: b.name,
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT',
    };
  });
  return JSON.stringify(nodes);
};

const SEED_JSON = {
  landing: buildSeed([
    { name: 'HeroBlock' },
    { name: 'StatsBlock' },
    { name: 'FeatureGrid' },
    { name: 'TestimonialsBlock' },
    { name: 'PricingBlock' },
    { name: 'FaqBlock' },
    { name: 'CtaBlock' },
  ]),
  about: buildSeed([
    { name: 'HeroBlock', props: { title: 'من نحن', subtitle: 'تعرف على قصتنا وفريقنا وقيمنا التي نعمل بها.' } },
    { name: 'TextBlock', props: { text: 'نحن شركة متخصصة في تقديم حلول عقارية متكاملة، نسعى دائمًا لتقديم أفضل خدمة لعملائنا.', fontSize: 17, textAlign: 'center' } },
    { name: 'StatsBlock' },
    { name: 'CtaBlock' },
  ]),
  contact: buildSeed([
    { name: 'HeroBlock', props: { title: 'تواصل معنا', subtitle: 'فريقنا جاهز للرد على استفساراتك في أي وقت.', paddingY: 56 } },
    { name: 'ContactSection' },
  ]),
  features: buildSeed([
    { name: 'HeroBlock', props: { title: 'مميزات المنصة', subtitle: 'اكتشف كل ما تقدمه منصتنا لإدارة أعمالك العقارية.', paddingY: 56 } },
    { name: 'FeatureGrid' },
    { name: 'FaqBlock' },
    { name: 'CtaBlock' },
  ]),
  pricing: buildSeed([
    { name: 'HeroBlock', props: { title: 'باقات الأسعار', subtitle: 'اختر الباقة المناسبة لحجم أعمالك.', paddingY: 56 } },
    { name: 'PricingBlock' },
    { name: 'FaqBlock' },
  ]),
};
const DEFAULT_SEED = buildSeed([{ name: 'HeroBlock' }]);

function EditorShell({ page, isNew, type, onSave, viewport, previewMode }) {
  const { actions, query, enabled } = useEditor(s => ({ enabled: s.options.enabled }));

  useEffect(() => {
    actions.setOptions(o => { o.enabled = !previewMode; });
  }, [previewMode, actions]);

  // expose serialize to top bar via hidden button
  const handleSave = () => onSave(query.serialize());
  const vp = VIEWPORTS.find(v => v.key === viewport) || VIEWPORTS[0];

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Toolbox (hidden in preview) */}
      {!previewMode && (
        <div style={{ width: 200, background: '#fff', borderLeft: '1px solid #e5e7eb', overflow: 'auto', flexShrink: 0 }}>
          <Toolbox />
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#eceef1' }}>
        <div style={{
          background: '#fff', minHeight: 600, borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,.12)', overflow: 'hidden',
          maxWidth: vp.width, margin: '0 auto', transition: 'max-width .25s ease',
        }}>
          <Frame data={isNew ? (SEED_JSON[type] ?? DEFAULT_SEED) : validCraftJson(page?.craftJson)}>
            <Element is={ContainerBlock} canvas id="root" bg="#ffffff" padding={0} maxWidth="100%">
              <HeroBlock />
            </Element>
          </Frame>
        </div>
      </div>

      {/* Settings (hidden in preview) */}
      {!previewMode && (
        <div style={{ width: 250, background: '#fff', borderRight: '1px solid #e5e7eb', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>الخصائص</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => actions.history.undo()} title="تراجع"
                style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <FaRotateRight size={11} />
              </button>
              <button onClick={() => actions.history.redo()} title="إعادة"
                style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                <FaRotateLeft size={11} />
              </button>
            </div>
          </div>
          <SettingsPanel />
        </div>
      )}

      <button id="__craft_save" onClick={handleSave} style={{ display: 'none' }} />
    </div>
  );
}

export default function PageBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('صفحة جديدة');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('landing');
  const [isPublished, setIsPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewport, setViewport] = useState('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('seo');
  const [seo, setSeo] = useState({});
  const [pageSettings, setPageSettings] = useState({});

  const { data: page } = useQuery({
    queryKey: ['page', id],
    queryFn: () => pagesAPI.getOne(id).then(r => r.data.data),
    enabled: !isNew,
  });

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setType(page.type);
      setIsPublished(page.isPublished);
      setSeo(page.seo || {});
      setPageSettings(page.settings || {});
    }
  }, [page]);

  const saveMut = useMutation({
    mutationFn: (data) => isNew ? pagesAPI.create(data) : pagesAPI.update(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page', id] });
      setErrMsg('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isNew) navigate(`/page-builder/${res.data.data._id}`, { replace: true });
    },
    onError: (err) => {
      setErrMsg(err?.response?.data?.message || 'فشل الحفظ، حاول مرة أخرى');
    },
  });

  const handleSave = (craftJson) => {
    if (!slug.trim()) { setErrMsg('أدخل رابط (slug) للصفحة قبل الحفظ'); return; }
    saveMut.mutate({ title, slug: slug.trim(), type, isPublished, craftJson, seo, settings: pageSettings });
  };

  const autoSlug = (val) => {
    setTitle(val);
    if (isNew) setSlug(val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^؀-ۿ\w-]/g, ''));
  };

  const inputStyle = { background: '#3a3435', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Top bar ── */}
      <div style={{ background: '#231f20', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/page-builder')}
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' }}>
          <FaArrowRight /> الصفحات
        </button>

        <input value={title} onChange={e => autoSlug(e.target.value)} placeholder="عنوان الصفحة"
          style={{ ...inputStyle, fontSize: 14, width: 170 }} />
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="slug"
          style={{ ...inputStyle, color: '#9ca3af', width: 130, direction: 'ltr' }} />
        <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
          <option value="landing">صفحة هبوط</option>
          <option value="about">من نحن</option>
          <option value="contact">اتصل بنا</option>
          <option value="features">المميزات</option>
          <option value="pricing">الأسعار</option>
          <option value="custom">مخصص</option>
        </select>

        {/* Viewport switcher */}
        <div style={{ display: 'flex', gap: 2, background: '#3a3435', borderRadius: 8, padding: 3, marginRight: 'auto' }}>
          {VIEWPORTS.map(v => {
            const Icon = v.icon;
            return (
              <button key={v.key} onClick={() => setViewport(v.key)} title={v.label}
                style={{
                  background: viewport === v.key ? '#c8161d' : 'transparent',
                  color: viewport === v.key ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', display: 'flex',
                }}>
                <Icon size={13} />
              </button>
            );
          })}
        </div>

        {/* Page settings */}
        <button onClick={() => setShowSettings(true)} title="إعدادات الصفحة"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3a3435', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>
          <FaGear size={12} />
        </button>

        {/* Preview toggle */}
        <button onClick={() => setPreviewMode(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: previewMode ? '#fbb140' : '#3a3435',
            color: previewMode ? '#231f20' : '#fff',
            border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}>
          {previewMode ? <FaPen size={12} /> : <FaPlay size={11} />}
          {previewMode ? 'تحرير' : 'معاينة'}
        </button>

        {/* Publish toggle */}
        <button onClick={() => setIsPublished(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: isPublished ? '#059669' : '#6b7280', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
          {isPublished ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
          {isPublished ? 'منشور' : 'مسودة'}
        </button>

        {/* Save */}
        <button onClick={() => document.getElementById('__craft_save')?.click()} disabled={saveMut.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: saved ? '#059669' : '#c8161d', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
          {saved ? <FaCircleCheck size={13} /> : <FaFloppyDisk size={13} />}
          {saved ? 'تم الحفظ' : saveMut.isPending ? 'جاري...' : 'حفظ'}
        </button>

        {isPublished && slug && !isNew && (
          <a href={`/p/${slug}`} target="_blank" rel="noreferrer"
            style={{ color: '#fbb140', fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            /p/{slug} ↗
          </a>
        )}
      </div>

      {errMsg && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 13, padding: '8px 16px', fontWeight: 600 }}>
          {errMsg}
        </div>
      )}

      {/* ── Page settings modal ── */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowSettings(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, width: 'min(560px, 92vw)', maxHeight: '85vh', overflow: 'auto', direction: 'rtl' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#231f20', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaGear size={13} style={{ color: '#da1f27' }} /> إعدادات الصفحة
              </p>
              <button onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 6 }}>
                <FaXmark size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 20px 0' }}>
              {[
                { id: 'seo',     label: 'SEO',           icon: FaMagnifyingGlass },
                { id: 'display', label: 'العرض والتخطيط', icon: FaSliders },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setSettingsTab(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      background: settingsTab === t.id ? '#da1f27' : '#f3f4f6',
                      color: settingsTab === t.id ? '#fff' : '#6b7280',
                      border: 'none', cursor: 'pointer',
                    }}>
                    <Icon size={11} /> {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: 20 }}>
              {settingsTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="label">عنوان SEO (يظهر في تبويب المتصفح ونتائج البحث)</label>
                    <input className="input" value={seo.title || ''} placeholder={title}
                      onChange={e => setSeo(s => ({ ...s, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">وصف الصفحة (Meta Description)</label>
                    <textarea className="input resize-none" rows={3} value={seo.description || ''}
                      placeholder="وصف مختصر يظهر في نتائج البحث (يفضل أقل من 160 حرف)"
                      onChange={e => setSeo(s => ({ ...s, description: e.target.value }))} />
                    <p style={{ fontSize: 11, color: (seo.description?.length || 0) > 160 ? '#dc2626' : '#9ca3af', margin: '4px 0 0' }}>
                      {seo.description?.length || 0} / 160
                    </p>
                  </div>
                  <div>
                    <label className="label">كلمات مفتاحية (مفصولة بفاصلة)</label>
                    <input className="input" value={seo.keywords || ''} placeholder="عقارات, شقق, القاهرة"
                      onChange={e => setSeo(s => ({ ...s, keywords: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">صورة المشاركة (OG Image)</label>
                    <input className="input" dir="ltr" value={seo.ogImage || ''} placeholder="https://..."
                      onChange={e => setSeo(s => ({ ...s, ogImage: e.target.value }))} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!seo.noIndex}
                      onChange={e => setSeo(s => ({ ...s, noIndex: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: '#da1f27' }} />
                    إخفاء الصفحة من محركات البحث (noindex)
                  </label>
                </div>
              )}

              {settingsTab === 'display' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="label">لون خلفية الصفحة</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={pageSettings.bgColor || '#ffffff'}
                        onChange={e => setPageSettings(s => ({ ...s, bgColor: e.target.value }))}
                        style={{ width: 42, height: 38, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }} />
                      <input className="input" dir="ltr" style={{ flex: 1 }} value={pageSettings.bgColor || '#ffffff'}
                        onChange={e => setPageSettings(s => ({ ...s, bgColor: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="label">عرض المحتوى</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { value: 'full',  label: 'كامل العرض' },
                        { value: 'boxed', label: 'صندوق محدود (1200px)' },
                      ].map(o => (
                        <button key={o.value} onClick={() => setPageSettings(s => ({ ...s, maxWidth: o.value }))}
                          style={{
                            padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: '2px solid', cursor: 'pointer',
                            borderColor: (pageSettings.maxWidth || 'full') === o.value ? '#da1f27' : '#e5e7eb',
                            background: (pageSettings.maxWidth || 'full') === o.value ? '#fef2f2' : '#fff',
                            color: (pageSettings.maxWidth || 'full') === o.value ? '#da1f27' : '#6b7280',
                          }}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">اتجاه الصفحة</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { value: 'rtl', label: 'يمين ← يسار (عربي)' },
                        { value: 'ltr', label: 'يسار ← يمين (English)' },
                      ].map(o => (
                        <button key={o.value} onClick={() => setPageSettings(s => ({ ...s, direction: o.value }))}
                          style={{
                            padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: '2px solid', cursor: 'pointer',
                            borderColor: (pageSettings.direction || 'rtl') === o.value ? '#da1f27' : '#e5e7eb',
                            background: (pageSettings.direction || 'rtl') === o.value ? '#fef2f2' : '#fff',
                            color: (pageSettings.direction || 'rtl') === o.value ? '#da1f27' : '#6b7280',
                          }}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">CSS مخصص لهذه الصفحة فقط</label>
                    <textarea className="input resize-none" rows={5} dir="ltr"
                      style={{ fontFamily: 'monospace', fontSize: 12 }}
                      placeholder=".my-section { padding: 40px; }"
                      value={pageSettings.customCss || ''}
                      onChange={e => setPageSettings(s => ({ ...s, customCss: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowSettings(false)}
                style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer' }}>
                إغلاق
              </button>
              <button onClick={() => { setShowSettings(false); document.getElementById('__craft_save')?.click(); }}
                style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#da1f27', color: '#fff', border: 'none', cursor: 'pointer' }}>
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Editor ── */}
      <Editor resolver={RESOLVER}>
        <EditorShell page={page} isNew={isNew} type={type} onSave={handleSave} viewport={viewport} previewMode={previewMode} />
      </Editor>
    </div>
  );
}
