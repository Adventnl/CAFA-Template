import type { Work } from '@/lib/types';

export const abelMoose: Work = {
  slug: 'abel-moose',
  index: 7,
  title: { zh: '阿贝尔·穆斯', en: 'Abel Moose' },
  status: 'completed',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '平面设计', en: 'Graphic Design' },
  ],
  year: 2022,
  summary: {
    zh: '一份完全用单一字号排版的作品集，层级只靠位置与留白区分。评图时没有人问过为什么标题不更大。',
    en: 'A portfolio set entirely at one type size, where hierarchy comes only from position and white space. At the review, nobody asked why the titles were not bigger.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '阿贝尔·穆斯', en: 'Abel Moose' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈牧', en: 'Shen Mu' } },
  ],
  cover: {
    src: 'works/abel-moose/01.jpg',
    alt: { zh: '单一字号排版的内页', en: 'An inside spread set at a single type size' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/abel-moose/01.jpg',
      alt: { zh: '单一字号排版的内页', en: 'An inside spread set at a single type size' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/abel-moose/02.jpg',
      alt: { zh: '全书的页面缩览', en: 'Thumbnails of every page in the book' },
      width: 2400,
      height: 1350,
    },
  ],
};
