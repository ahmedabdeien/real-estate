import React from 'react';
import { useParams } from 'react-router-dom';
import { Editor, Frame } from '@craftjs/core';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '../../api/services';
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

const RESOLVER = {
  ContainerBlock, TextBlock, ButtonBlock, ImageBlock, HeroBlock,
  SpacerBlock, ColumnsBlock, DividerBlock, FeatureGrid, ContactSection,
};

export default function PublicPage() {
  const { slug } = useParams();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['public-page', slug],
    queryFn: () => pagesAPI.getBySlug(slug).then(r => r.data.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#c8161d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#c8161d' }}>404</h1>
        <p style={{ fontSize: 18, color: '#6b7280', marginTop: 8 }}>الصفحة غير موجودة</p>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {page.seo?.title && <title>{page.seo.title}</title>}
      <Editor resolver={RESOLVER} enabled={false}>
        <Frame data={page.craftJson}>
          <div />
        </Frame>
      </Editor>
    </div>
  );
}
