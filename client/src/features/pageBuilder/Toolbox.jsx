import React from 'react';
import { useEditor } from '@craftjs/core';
import {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock,
  HeroBlock, SpacerBlock, ColumnsBlock, DividerBlock,
  FeatureGrid, ContactSection, VideoBlock, GalleryBlock,
  FaqBlock, CtaBlock, StatsBlock, TestimonialsBlock, PricingBlock,
} from './components';
import {
  FaFont, FaArrowPointer, FaSquare, FaImage, FaRocket,
  FaMinus, FaTableColumns, FaGripLines, FaStar, FaAddressCard,
  FaVideo, FaImages, FaCircleQuestion, FaBullhorn, FaChartSimple,
  FaQuoteRight, FaTags,
} from 'react-icons/fa6';

const CATEGORIES = [
  {
    label: 'عناصر أساسية',
    tools: [
      { label: 'نص',          component: TextBlock,      icon: FaFont },
      { label: 'زر',          component: ButtonBlock,    icon: FaArrowPointer },
      { label: 'صورة',         component: ImageBlock,     icon: FaImage },
      { label: 'فيديو',        component: VideoBlock,     icon: FaVideo },
      { label: 'قسم حاوي',     component: ContainerBlock, icon: FaSquare },
      { label: 'أعمدة',        component: ColumnsBlock,   icon: FaTableColumns },
      { label: 'خط فاصل',     component: DividerBlock,   icon: FaGripLines },
      { label: 'مسافة',        component: SpacerBlock,    icon: FaMinus },
    ],
  },
  {
    label: 'أقسام جاهزة',
    tools: [
      { label: 'بطولة',        component: HeroBlock,         icon: FaRocket },
      { label: 'مميزات',       component: FeatureGrid,       icon: FaStar },
      { label: 'إحصائيات',     component: StatsBlock,        icon: FaChartSimple },
      { label: 'آراء العملاء', component: TestimonialsBlock, icon: FaQuoteRight },
      { label: 'باقات أسعار',  component: PricingBlock,      icon: FaTags },
      { label: 'أسئلة شائعة',  component: FaqBlock,          icon: FaCircleQuestion },
      { label: 'معرض صور',     component: GalleryBlock,      icon: FaImages },
      { label: 'دعوة لإجراء',  component: CtaBlock,          icon: FaBullhorn },
      { label: 'تواصل معنا',   component: ContactSection,    icon: FaAddressCard },
    ],
  },
];

export function Toolbox() {
  const { connectors: { create } } = useEditor();
  return (
    <div className="p-3 space-y-4">
      {CATEGORIES.map(cat => (
        <div key={cat.label}>
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{cat.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.tools.map(({ label, component: Comp, icon: Icon }) => (
              <div
                key={label}
                ref={ref => create(ref, <Comp />)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 bg-white cursor-grab hover:border-red-300 hover:bg-red-50/50 active:cursor-grabbing transition-colors select-none"
                title={`اسحب "${label}" إلى الصفحة`}
              >
                <Icon size={16} className="text-gray-500" />
                <span className="text-[11px] text-gray-700 font-medium leading-none">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-400 leading-relaxed border-t pt-3">
        اسحب أي عنصر وأفلته داخل الصفحة، ثم اضغط عليه لتعديل خصائصه من اللوحة اليمنى.
      </p>
    </div>
  );
}
