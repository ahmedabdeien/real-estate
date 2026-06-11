/**
 * CmsPage — fetches a CMS page by key and renders it via CmsRenderer.
 * Falls back to static children if CMS has no data.
 * Does NOT wrap in PublicLayout — each page handles its own layout.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/axios';
import CmsRenderer from './CmsRenderer';

const CmsPage = ({ pageKey, fallback = null }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms-public', pageKey],
    queryFn: () => publicApi.get(`/cms/${pageKey}`).then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const sections = data?.sections || [];
  const hasCmsContent = sections.some(s => s.visible !== false);

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#c8161d', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if ((isError || !hasCmsContent) && fallback) {
    return fallback;
  }

  return <CmsRenderer sections={sections} />;
};

export default CmsPage;
