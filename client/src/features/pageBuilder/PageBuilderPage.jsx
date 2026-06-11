import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesAPI } from '../../api/services';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { ContainerBlock } from './components/ContainerBlock';
import { TextBlock } from './components/TextBlock';
import { ButtonBlock } from './components/ButtonBlock';
import { ImageBlock } from './components/ImageBlock';
import { HeroBlock } from './components/HeroBlock';
import { SpacerBlock } from './components/SpacerBlock';
import { ColumnsBlock } from './components/ColumnsBlock';
import { DividerBlock } from './components/DividerBlock';
import { FeatureGrid } from './components/FeatureGrid';
import { ContactSection } from './components/ContactSection';
import { FaArrowRight, FaFloppyDisk, FaEye, FaEyeSlash, FaCircleCheck } from 'react-icons/fa6';

const RESOLVER = {
  ContainerBlock, TextBlock, ButtonBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
};

function EditorShell({ page, isNew, title, slug, type, isPublished, setIsPublished, saveMut, onSave, navigate }) {
  const { query, actions } = useEditor();

  const handleSave = () => {
    const craftJson = query.serialize();
    onSave(craftJson);
  };

  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (saveMut.isSuccess) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }, [saveMut.isSuccess]);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Left: Toolbox */}
      <div style={{ width: 196, background: '#fff', borderLeft: '1px solid #e5e7eb', overflow: 'auto', flexShrink: 0 }}>
        <Toolbox />
      </div>

      {/* Center: Canvas */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#f3f4f6' }}>
        <div style={{ background: '#fff', minHeight: 600, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflow: 'hidden', maxWidth: 1200, margin: '0 auto' }}>
          <Frame data={!isNew && page?.craftJson ? page.craftJson : undefined}>
            <Element is={ContainerBlock} canvas id="root" bg="#ffffff" padding={0} maxWidth="100%">
              {isNew && <HeroBlock />}
            </Element>
          </Frame>
        </div>
      </div>

      {/* Right: Settings */}
      <div style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>الخصائص</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => actions.history.undo()} title="تراجع"
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 14 }}>↩</button>
            <button onClick={() => actions.history.redo()} title="إعادة"
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 14 }}>↪</button>
          </div>
        </div>
        <SettingsPanel />
      </div>

      {/* Save button injected via top bar slot — handled in parent's top bar via query callback */}
      <div style={{ display: 'none' }}>
        <button id="__craft_save" onClick={handleSave} />
      </div>
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
  const [type, setType] = useState('custom');
  const [isPublished, setIsPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [craftJsonRef, setCraftJsonRef] = useState(null);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isNew) navigate(`/page-builder/${res.data.data._id}`, { replace: true });
    },
  });

  const handleSave = (craftJson) => {
    saveMut.mutate({ title, slug, type, isPublished, craftJson });
  };

  const autoSlug = (val) => {
    setTitle(val);
    if (isNew) setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^؀-ۿ\w-]/g, ''));
  };

  const triggerSave = () => {
    document.getElementById('__craft_save')?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ background: '#231f20', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 50, flexShrink: 0 }}>
        <button onClick={() => navigate('/page-builder')}
          style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' }}>
          <FaArrowRight /> قائمة الصفحات
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={title} onChange={e => autoSlug(e.target.value)} placeholder="عنوان الصفحة"
            style={{ background: '#3a3435', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 14, width: 200 }} />
          <span style={{ color: '#6b7280', fontSize: 12 }}>/</span>
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="slug"
            style={{ background: '#3a3435', color: '#9ca3af', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, width: 150, direction: 'ltr' }} />
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ background: '#3a3435', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13 }}>
            <option value="landing">صفحة هبوط</option>
            <option value="about">من نحن</option>
            <option value="contact">اتصل بنا</option>
            <option value="features">المميزات</option>
            <option value="pricing">الأسعار</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setIsPublished(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: isPublished ? '#059669' : '#6b7280', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
            {isPublished ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
            {isPublished ? 'منشور' : 'مسودة'}
          </button>
          <button onClick={triggerSave} disabled={saveMut.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: saved ? '#059669' : '#c8161d', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
            {saved ? <FaCircleCheck size={13} /> : <FaFloppyDisk size={13} />}
            {saved ? 'تم الحفظ' : saveMut.isPending ? 'جاري...' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Craft Editor */}
      <Editor resolver={RESOLVER}>
        <EditorShell
          page={page} isNew={isNew}
          title={title} slug={slug} type={type}
          isPublished={isPublished} setIsPublished={setIsPublished}
          saveMut={saveMut} onSave={handleSave} navigate={navigate}
        />
      </Editor>
    </div>
  );
}
