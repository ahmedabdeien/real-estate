import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Editor, Frame } from '@craftjs/core';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '../../api/services';
import { validCraftJson } from './PageBuilderPage';

class RenderBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
          <p style={{ fontSize: 17, fontWeight: 700 }}>تعذر عرض محتوى الصفحة</p>
          <p style={{ fontSize: 14 }}>محتوى الصفحة تالف — افتحها في محرر الصفحات وأعد حفظها.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock,
  HeroBlock, SpacerBlock, ColumnsBlock, DividerBlock,
  FeatureGrid, ContactSection, VideoBlock, GalleryBlock,
  FaqBlock, CtaBlock, StatsBlock, TestimonialsBlock, PricingBlock,
  TeamBlock, LogosBlock, MapBlock, SocialBlock, CountdownBlock, StepsBlock,
  NavbarBlock, FooterBlock, IconBoxBlock, QuoteBlock,
} from './components';

const RESOLVER = {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
  VideoBlock, GalleryBlock, FaqBlock, CtaBlock, StatsBlock,
  TestimonialsBlock, PricingBlock,
  TeamBlock, LogosBlock, MapBlock, SocialBlock, CountdownBlock, StepsBlock,
  NavbarBlock, FooterBlock, IconBoxBlock, QuoteBlock,
};

export default function PublicPage() {
  const { slug } = useParams();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['public-page', slug],
    queryFn: () => pagesAPI.getBySlug(slug).then(r => r.data.data),
    retry: false,
  });

  useEffect(() => {
    if (!page) return;
    if (page.seo?.title || page.title) document.title = page.seo?.title || page.title;

    // meta description / keywords / robots / og:image
    const setMeta = (selector, attr, value, create) => {
      let el = document.head.querySelector(selector);
      if (!el && value) { el = create(); document.head.appendChild(el); }
      if (el && value) el.setAttribute(attr, value);
      if (el && !value) el.remove();
    };
    setMeta('meta[name="description"]', 'content', page.seo?.description,
      () => Object.assign(document.createElement('meta'), { name: 'description' }));
    setMeta('meta[name="keywords"]', 'content', page.seo?.keywords,
      () => Object.assign(document.createElement('meta'), { name: 'keywords' }));
    setMeta('meta[property="og:image"]', 'content', page.seo?.ogImage,
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:image'); return m; });
    setMeta('meta[name="robots"]', 'content', page.seo?.noIndex ? 'noindex, nofollow' : null,
      () => Object.assign(document.createElement('meta'), { name: 'robots' }));

    // CSS مخصص للصفحة
    let styleEl = document.getElementById('page-custom-css');
    if (page.settings?.customCss) {
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'page-custom-css'; document.head.appendChild(styleEl); }
      styleEl.textContent = page.settings.customCss;
    } else if (styleEl) {
      styleEl.remove();
    }
    return () => { document.getElementById('page-custom-css')?.remove(); };
  }, [page]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: '#c8161d' }} />
      </div>
    );
  }

  const safeJson = validCraftJson(page?.craftJson);

  if (isError || !page || !safeJson) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, color: '#c8161d', margin: 0 }}>404</h1>
        <p style={{ fontSize: 18, color: '#6b7280', marginTop: 10 }}>الصفحة غير موجودة أو غير منشورة</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 24, background: '#c8161d', color: '#fff', padding: '12px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
          العودة للرئيسية
        </a>
      </div>
    );
  }

  const settings = page.settings || {};
  return (
    <div dir={settings.direction || 'rtl'} style={{ background: settings.bgColor || '#ffffff', minHeight: '100vh' }}>
      <div style={settings.maxWidth === 'boxed' ? { maxWidth: 1200, margin: '0 auto', boxShadow: '0 0 30px rgba(0,0,0,0.06)' } : undefined}>
        <RenderBoundary>
          <Editor resolver={RESOLVER} enabled={false}>
            <Frame data={safeJson} />
          </Editor>
        </RenderBoundary>
      </div>
    </div>
  );
}
