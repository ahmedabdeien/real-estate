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
} from './components';

const RESOLVER = {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
  VideoBlock, GalleryBlock, FaqBlock, CtaBlock, StatsBlock,
  TestimonialsBlock, PricingBlock,
};

export default function PublicPage() {
  const { slug } = useParams();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['public-page', slug],
    queryFn: () => pagesAPI.getBySlug(slug).then(r => r.data.data),
    retry: false,
  });

  useEffect(() => {
    if (page?.seo?.title || page?.title) document.title = page.seo?.title || page.title;
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

  return (
    <div dir="rtl">
      <RenderBoundary>
        <Editor resolver={RESOLVER} enabled={false}>
          <Frame data={safeJson} />
        </Editor>
      </RenderBoundary>
    </div>
  );
}
