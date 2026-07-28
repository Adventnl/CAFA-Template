import type { Work } from '@/lib/types';

export const xiranZhang: Work = {
  slug: 'xiran-zhang',
  index: 5,
  title: { zh: '张熙然', en: 'Xiran Zhang' },
  status: 'completed',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '服装设计', en: 'Fashion' },
  ],
  year: 2022,
  summary: {
    zh: '从祖母的一件旧棉袄拆解出的结构，被重新裁成六件互不相同的外衣。缝线全部外露，作为唯一的装饰。',
    en: 'The structure unpicked from a grandmother’s padded jacket, recut into six coats that share nothing but their pattern. Every seam is left on the outside as the only ornament.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '张熙然', en: 'Xiran Zhang' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '任小满', en: 'Ren Xiaoman' } },
  ],
  cover: {
    src: 'works/xiran-zhang/01.jpg',
    alt: { zh: '六件外衣挂成一排', en: 'Six coats hung in a row' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/xiran-zhang/01.jpg',
      alt: { zh: '六件外衣挂成一排', en: 'Six coats hung in a row' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/xiran-zhang/02.jpg',
      alt: { zh: '外露缝线的细部', en: 'Detail of the exposed seams' },
      width: 1800,
      height: 2250,
    },
    {
      src: 'works/xiran-zhang/03.jpg',
      alt: { zh: '拆解后的原始裁片', en: 'The original pattern pieces after unpicking' },
      width: 2400,
      height: 1350,
    },
  ],
};
