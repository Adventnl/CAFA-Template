import type { Work } from '@/lib/types';

export const guoXiaomeng: Work = {
  slug: 'guo-xiaomeng',
  index: 13,
  title: { zh: '郭晓萌', en: 'Guo Xiaomeng' },
  status: 'private',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '纯艺术', en: 'Fine Art' },
  ],
  year: 2024,
  summary: {
    zh: '一份围绕家庭档案与失焦影像展开的申请作品集，最终收束为四个彼此呼应的项目。作者要求全案不公开。',
    en: 'An application portfolio built from family archives and out-of-focus images, resolved into four projects that answer one another. Withheld in full at the author’s request.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '郭晓萌', en: 'Guo Xiaomeng' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈牧', en: 'Shen Mu' } },
  ],
  cover: {
    src: 'works/guo-xiaomeng/01.jpg',
    alt: { zh: '作品集封面，哑光黑卡纸压印', en: 'Portfolio cover, blind-embossed matte black board' },
    width: 1800,
    height: 2250,
  },
  media: [
    {
      src: 'works/guo-xiaomeng/01.jpg',
      alt: { zh: '作品集封面，哑光黑卡纸压印', en: 'Portfolio cover, blind-embossed matte black board' },
      width: 1800,
      height: 2250,
    },
  ],
};
