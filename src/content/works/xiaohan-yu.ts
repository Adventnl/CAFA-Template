import type { Work } from '@/lib/types';

export const xiaohanYu: Work = {
  slug: 'xiaohan-yu',
  index: 3,
  title: { zh: '于晓涵', en: 'Xiaohan Yu' },
  status: 'private',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '建筑', en: 'Architecture' },
  ],
  year: 2021,
  summary: {
    zh: '一份以家乡水厂改造为主线的申请作品集，最终录取于三所院校。作者在校期间要求全案暂不公开。',
    en: 'An application portfolio built around the conversion of a hometown waterworks, which led to three offers. The author asked that it stay closed while they are still studying.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '于晓涵', en: 'Xiaohan Yu' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '陈屿', en: 'Chen Yu' } },
  ],
  cover: {
    src: 'works/xiaohan-yu/01.jpg',
    alt: { zh: '水厂改造的剖面图局部', en: 'Part of the waterworks conversion section' },
    width: 2400,
    height: 1350,
  },
  media: [
    {
      src: 'works/xiaohan-yu/01.jpg',
      alt: { zh: '水厂改造的剖面图局部', en: 'Part of the waterworks conversion section' },
      width: 2400,
      height: 1350,
    },
  ],
};
