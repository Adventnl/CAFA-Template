import type { Work } from '@/lib/types';

export const spatialIllustration: Work = {
  slug: 'spatial-illustration',
  index: 9,
  title: { zh: '空间插画', en: 'Spatial Illustration' },
  status: 'completed',
  discipline: [
    { zh: '插画', en: 'Illustration' },
    { zh: '展陈', en: 'Exhibition' },
  ],
  year: 2023,
  summary: {
    zh: '一组画在展墙上、随观众动线展开的连续插画，没有画框也没有开头。走完一圈才会发现最后一幅接回了第一幅。',
    en: 'A continuous illustration drawn straight onto the gallery walls, unfolding along the visitor’s path with no frame and no first page. Only at the end of the loop does the last panel meet the first.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '任小满', en: 'Ren Xiaoman' } },
    { role: { zh: '布展', en: 'Install' }, name: { zh: '央艺工作室', en: 'c.a.f.a Studio' } },
  ],
  cover: {
    src: 'works/spatial-illustration/01.jpg',
    alt: { zh: '展墙上的连续插画，转角处', en: 'The continuous wall illustration at a corner' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/spatial-illustration/01.jpg',
      alt: { zh: '展墙上的连续插画，转角处', en: 'The continuous wall illustration at a corner' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/spatial-illustration/02.jpg',
      alt: { zh: '铅笔底稿与最终线条的重叠', en: 'Pencil underdrawing showing through the final line' },
      width: 2000,
      height: 2000,
    },
    {
      src: 'works/spatial-illustration/03.jpg',
      alt: { zh: '观众在展厅中的动线', en: 'A visitor moving through the gallery' },
      width: 2400,
      height: 1350,
    },
  ],
};
