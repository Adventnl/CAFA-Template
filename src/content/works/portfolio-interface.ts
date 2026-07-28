import type { Work } from '@/lib/types';

export const portfolioInterface: Work = {
  slug: 'portfolio-interface',
  index: 15,
  title: { zh: '作品集 / 界面', en: 'Portfolio / Interface' },
  status: 'in-progress',
  discipline: [
    { zh: '平面设计', en: 'Graphic Design' },
    { zh: '交互设计', en: 'Interaction Design' },
  ],
  year: 2025,
  summary: {
    zh: '一套把作品集当作界面来设计的排版系统，索引本身即是导航。它在纸本与屏幕之间保持同一套栅格与同一种沉默。',
    en: 'A typographic system that treats a portfolio as an interface, where the index is the navigation. It holds the same grid and the same silence across paper and screen.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '林知远', en: 'Lin Zhiyuan' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈牧', en: 'Shen Mu' } },
  ],
  cover: {
    src: 'works/portfolio-interface/01.jpg',
    alt: { zh: '摊开的作品集内页，左页为索引', en: 'An open portfolio spread with the index on the left page' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/portfolio-interface/01.jpg',
      alt: { zh: '摊开的作品集内页，左页为索引', en: 'An open portfolio spread with the index on the left page' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/portfolio-interface/02.jpg',
      alt: { zh: '栅格系统的十二栏结构图', en: 'The twelve-column structure of the grid system' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/portfolio-interface/03.jpg',
      alt: { zh: '屏幕端索引页的滚动状态', en: 'The screen index mid-scroll' },
      width: 1800,
      height: 2250,
    },
  ],
};
