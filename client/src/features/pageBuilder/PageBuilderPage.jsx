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
} from './components';
import {
  FaArrowRight, FaFloppyDisk, FaEye, FaEyeSlash, FaCircleCheck,
  FaDesktop, FaTabletScreenButton, FaMobileScreen, FaPen, FaPlay,
  FaRotateLeft, FaRotateRight,
} from 'react-icons/fa6';

const RESOLVER = {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
  VideoBlock, GalleryBlock, FaqBlock, CtaBlock, StatsBlock,
  TestimonialsBlock, PricingBlock,
};

/* craftJson must contain a ROOT node, otherwise Craft.js throws "Invariant failed" */
export const validCraftJson = (json) => {
  if (!json || typeof json !== 'string') return undefined;
  try {
    const parsed = JSON.parse(json);
    return parsed && parsed.ROOT ? json : undefined;
  } catch { return undefined; }
};

const VIEWPORTS = [
  { key: 'desktop', label: 'كمبيوتر', icon: FaDesktop,            width: '100%' },
  { key: 'tablet',  label: 'تابلت',   icon: FaTabletScreenButton, width: 768 },
  { key: 'mobile',  label: 'موبايل',  icon: FaMobileScreen,       width: 390 },
];

/* Seed content per page type for brand-new pages */
function TemplateSeed({ type }) {
  switch (type) {
    case 'landing':
      return (<>
        <HeroBlock />
        <StatsBlock />
        <FeatureGrid />
        <TestimonialsBlock />
        <PricingBlock />
        <FaqBlock />
        <CtaBlock />
      </>);
    case 'about':
      return (<>
        <HeroBlock title="من نحن" subtitle="تعرف على قصتنا وفريقنا وقيمنا التي نعمل بها." />
        <TextBlock text="نحن شركة متخصصة في تقديم حلول عقارية متكاملة، نسعى دائمًا لتقديم أفضل خدمة لعملائنا." fontSize={17} textAlign="center" />
        <StatsBlock />
        <CtaBlock />
      </>);
    case 'contact':
      return (<>
        <HeroBlock title="تواصل معنا" subtitle="فريقنا جاهز للرد على استفساراتك في أي وقت." paddingY={56} />
        <ContactSection />
      </>);
    case 'features':
      return (<>
        <HeroBlock title="مميزات المنصة" subtitle="اكتشف كل ما تقدمه منصتنا لإدارة أعمالك العقارية." paddingY={56} />
        <FeatureGrid />
        <FaqBlock />
        <CtaBlock />
      </>);
    case 'pricing':
      return (<>
        <HeroBlock title="باقات الأسعار" subtitle="اختر الباقة المناسبة لحجم أعمالك." paddingY={56} />
        <PricingBlock />
        <FaqBlock />
      </>);
    default:
      return <HeroBlock />;
  }
}

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
          <Frame data={!isNew ? validCraftJson(page?.craftJson) : undefined}>
            <Element is={ContainerBlock} canvas id="root" bg="#ffffff" padding={0} maxWidth="100%">
              {isNew && <TemplateSeed type={type} />}
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
    saveMut.mutate({ title, slug: slug.trim(), type, isPublished, craftJson });
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

      {/* ── Editor ── */}
      <Editor resolver={RESOLVER}>
        <EditorShell page={page} isNew={isNew} type={type} onSave={handleSave} viewport={viewport} previewMode={previewMode} />
      </Editor>
    </div>
  );
}
