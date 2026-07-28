import type { Work } from '@/lib/types';

export const humanRemains: Work = {
  slug: 'human-remains',
  index: 8,
  title: { zh: '遗存', en: 'Human Remains' },
  status: 'private',
  discipline: [
    { zh: '雕塑', en: 'Sculpture' },
    { zh: '装置', en: 'Installation' },
  ],
  year: 2023,
  summary: {
    zh: '以石膏翻模保存日常器物被手磨损的部位，再把它们按人体尺度重新排列。展出条件受限，此处不作图像展示。',
    en: 'Plaster casts preserving the parts of everyday objects worn down by hands, rearranged at the scale of a body. Exhibition terms restrict reproduction, so no images are shown here.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '毕辰', en: 'Bi Chen' } },
    { role: { zh: '翻模', en: 'Casting' }, name: { zh: '李慕', en: 'Li Mu' } },
  ],
  cover: {
    src: 'works/human-remains/01.jpg',
    alt: { zh: '石膏翻模的局部', en: 'A detail of one plaster cast' },
    width: 2000,
    height: 2000,
  },
  media: [
    {
      src: 'works/human-remains/01.jpg',
      alt: { zh: '石膏翻模的局部', en: 'A detail of one plaster cast' },
      width: 2000,
      height: 2000,
    },
  ],
};
