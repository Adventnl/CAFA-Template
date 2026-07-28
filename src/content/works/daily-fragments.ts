import type { Work } from '@/lib/types';

export const dailyFragments: Work = {
  slug: 'daily-fragments',
  index: 4,
  title: { zh: '日常碎片', en: 'Daily Fragments' },
  status: 'in-progress',
  discipline: [{ zh: '摄影', en: 'Photography' }],
  year: 2021,
  summary: {
    zh: '一个仍在进行的拍摄计划：每天同一时刻，在同一段路上拍一张。四年之后，变化的只有光。',
    en: 'An ongoing project: one frame a day, at the same hour, along the same stretch of road. Four years in, the only thing that changes is the light.',
  },
  credits: [{ role: { zh: '摄影', en: 'Photography' }, name: { zh: '毕辰', en: 'Bi Chen' } }],
  cover: {
    src: 'works/daily-fragments/01.jpg',
    alt: { zh: '同一段路在冬日清晨', en: 'The same stretch of road on a winter morning' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/daily-fragments/01.jpg',
      alt: { zh: '同一段路在冬日清晨', en: 'The same stretch of road on a winter morning' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/daily-fragments/02.jpg',
      alt: { zh: '一年份底片的接触印样', en: 'A contact sheet of one year of frames' },
      width: 2000,
      height: 2000,
    },
  ],
};
