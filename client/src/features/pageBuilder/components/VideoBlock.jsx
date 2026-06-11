import React from 'react';
import { useNode } from '@craftjs/core';
import { FaVideo } from 'react-icons/fa6';

function toEmbed(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function VideoSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رابط الفيديو (YouTube / Vimeo)</label>
        <input value={props.url} onChange={e => setProp(p => p.url = e.target.value)} className="input text-sm" placeholder="https://youtube.com/watch?v=..." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">العرض الأقصى (px)</label>
          <input type="number" value={props.maxWidth} onChange={e => setProp(p => p.maxWidth = Number(e.target.value))} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الحواف (px)</label>
          <input type="number" value={props.borderRadius} onChange={e => setProp(p => p.borderRadius = Number(e.target.value))} className="input text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الحشو العمودي (px)</label>
        <input type="number" value={props.paddingY} onChange={e => setProp(p => p.paddingY = Number(e.target.value))} className="input text-sm" />
      </div>
    </div>
  );
}

export function VideoBlock({ url = '', maxWidth = 800, borderRadius = 12, paddingY = 24 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const embed = toEmbed(url);
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ padding: `${paddingY}px 16px`, outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        {embed ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius, overflow: 'hidden' }}>
            <iframe src={embed} title="video" allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
        ) : (
          <div style={{ height: 280, borderRadius, background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#9ca3af' }}>
            <FaVideo size={32} />
            <span style={{ fontSize: 13 }}>أضف رابط فيديو من الإعدادات</span>
          </div>
        )}
      </div>
    </div>
  );
}

VideoBlock.craft = {
  displayName: 'فيديو',
  props: { url: '', maxWidth: 800, borderRadius: 12, paddingY: 24 },
  related: { settings: VideoSettings },
};
