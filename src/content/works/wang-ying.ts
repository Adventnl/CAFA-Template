import type { Work } from '@/lib/types';

export const wangYing: Work = {
  slug: 'wang-ying',
  index: 11,
  title: { zh: '王莹', en: 'Wang Ying' },
  status: 'completed',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '室内设计', en: 'Interior Design' },
  ],
  year: 2023,
  summary: {
    zh: '以一间租来的旧公寓为唯一场地，完成的四轮改造记录构成了整份作品集。空间没有变大，只是变得清楚了。',
    en: 'Four rounds of renovation in one rented old apartment, the record of which became the entire portfolio. The space never grew; it only became legible.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '王莹', en: 'Wang Ying' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '柳岸', en: 'Liu An' } },
  ],
  cover: {
    src: 'works/wang-ying/01.jpg',
    alt: { zh: '改造后的起居空间，午后光线', en: 'The living space after renovation, afternoon light' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/wang-ying/01.jpg',
      alt: { zh: '改造后的起居空间，午后光线', en: 'The living space after renovation, afternoon light' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/wang-ying/02.jpg',
      alt: { zh: '四轮改造的平面对照', en: 'Plans of the four renovation rounds side by side' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/wang-ying/03.jpg',
      alt: { zh: '窗边收纳的细部', en: 'Detail of the storage built into the window reveal' },
      width: 1800,
      height: 2250,
    },
  ],
};
