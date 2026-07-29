import type { Work } from '@/lib/types';

export const weatherForARoom: Work = {
  slug: 'weather-for-a-room',
  index: 6,
  title: { zh: '一个房间的天气', en: 'Weather for a Room' },
  status: 'completed',
  discipline: [
    { zh: '装置', en: 'Installation' },
    { zh: '室内', en: 'Interior' },
  ],
  year: 2021,
  summary: {
    zh: '房间里的光按去年同一天的气象记录走，晚一年播放。阴天就一直阴着，谁也没法调。开放的三个月里有十一天完全没有直射光。',
    en: 'The light in the room follows the weather record for the same date a year earlier, played back twelve months late. An overcast day stays overcast and nobody can override it. Over three months of opening, eleven days had no direct light at all.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '尹之', en: 'Yin Zhi' } },
    { role: { zh: '控制', en: 'Controls' }, name: { zh: '徐鹤', en: 'Xu He' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '罗蔓', en: 'Luo Man' } },
  ],
  cover: {
    src: 'works/weather-for-a-room/cover.jpg',
    alt: {
      zh: '房间在一个复播的晴天下午。',
      en: 'The room during a replayed clear afternoon.',
    },
  },
  media: [
    {
      src: 'works/weather-for-a-room/01.jpg',
      alt: { zh: '灯具与遮片的排布图。', en: 'The layout of the fittings and their shutters.' },
    },
    {
      src: 'works/weather-for-a-room/02.jpg',
      alt: {
        zh: '同一个角落，复播的阴天。',
        en: 'The same corner on a replayed overcast day.',
      },
    },
    {
      src: 'works/weather-for-a-room/03.jpg',
      alt: {
        zh: '三个月的日照记录，打印成一张长表。',
        en: 'Three months of readings, printed as one long table.',
      },
    },
    {
      src: 'works/weather-for-a-room/04.jpg',
      alt: { zh: '控制柜，没有手动挡。', en: 'The control cabinet, with no manual override.' },
    },
    {
      src: 'works/weather-for-a-room/05.jpg',
      alt: {
        zh: '连续十一个无直射光的日子里的第七天。',
        en: 'The seventh of eleven consecutive days without direct light.',
      },
    },
  ],
};
