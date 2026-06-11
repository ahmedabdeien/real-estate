import React from 'react';
import { useEditor } from '@craftjs/core';
import {
  TextBlock, ButtonBlock, ContainerBlock, ImageBlock,
  HeroBlock, SpacerBlock, ColumnsBlock, DividerBlock,
  FeatureGrid, ContactSection,
} from './components';
import {
  FaFont, FaArrowPointer, FaSquare, FaImage, FaRocket,
  FaMinus, FaTableColumns, FaGripLines, FaStar, FaAddressCard,
} from 'react-icons/fa6';

const TOOLS = [
  { label: 'نص',         component: TextBlock,       icon: FaFont,         create: { text: 'انقر لتعديل النص', tag: 'p', fontSize: 16 } },
  { label: 'زر',         component: ButtonBlock,     icon: FaArrowPointer, create: {} },
  { label: 'صورة',        component: ImageBlock,      icon: FaImage,        create: {} },
  { label: 'قسم',         component: ContainerBlock,  icon: FaSquare,       create: {} },
  { label: 'أعمدة',       component: ColumnsBlock,    icon: FaTableColumns, create: {} },
  { label: 'بطولة',       component: HeroBlock,       icon: FaRocket,       create: {} },
  { label: 'مميزات',      component: FeatureGrid,     icon: FaStar,         create: {} },
  { label: 'تواصل',       component: ContactSection,  icon: FaAddressCard,  create: {} },
  { label: 'خط فاصل',    component: DividerBlock,    icon: FaGripLines,    create: {} },
  { label: 'مسافة فارغة', component: SpacerBlock,    icon: FaMinus,        create: {} },
];

export function Toolbox() {
  const { connectors: { create } } = useEditor();
  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">العناصر</p>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map(({ label, component: Comp, icon: Icon, create: props }) => (
          <div
            key={label}
            ref={ref => create(ref, <Comp {...props} />)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 bg-white cursor-grab hover:border-primary hover:bg-red-50 transition-colors select-none"
          >
            <Icon size={18} className="text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
