import type { Work } from '@/lib/types';

export const lettersToARiverbed: Work = {
  slug: 'letters-to-a-riverbed',
  index: 8,
  title: { zh: '致河床的信', en: 'Letters to a Riverbed' },
  status: 'completed',
  discipline: [{ zh: '视觉传达', en: 'Visual Communication' }],
  year: 2022,
  summary: {
    zh: '连续四百天，每天给一条已经干掉的河写一封信，用当天的水位数据决定字号。最后一封只有一个字，因为水位是零。',
    en: 'A letter a day to a river that had already dried, for four hundred days, the type size set by that day’s water-level reading. The last letter is a single character, because the reading was zero.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '苏眠', en: 'Su Mian' } },
    { role: { zh: '数据', en: 'Data' }, name: { zh: '流域水文站', en: 'The basin hydrology station' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '许清和', en: 'Xu Qinghe' } },
  ],
  cover: {
    src: 'works/letters-to-a-riverbed/cover.jpg',
    alt: { zh: '四百封信摊开在长桌上。', en: 'Four hundred letters laid out on a long table.' },
  },
  media: [
    {
      src: 'works/letters-to-a-riverbed/01.jpg',
      alt: { zh: '第三十七封，水位较高，字号很大。', en: 'Letter thirty-seven, a high reading and very large type.' },
    },
    {
      src: 'works/letters-to-a-riverbed/02.jpg',
      alt: { zh: '最后一封信，只有一个字。', en: 'The last letter, a single character.' },
    },
    {
      src: 'works/letters-to-a-riverbed/03.jpg',
      alt: { zh: '装订成册后的书口。', en: 'The fore-edge of the bound volume.' },
    },
    {
      src: 'works/letters-to-a-riverbed/04.jpg',
      alt: {
        zh: '四百天的水位曲线，字号跟着它走。',
        en: 'Four hundred days of readings, the curve the type size followed.',
      },
    },
    {
      src: 'works/letters-to-a-riverbed/05.jpg',
      alt: { zh: '干掉的河床，写信的地方。', en: 'The dry bed itself, where the letters were written.' },
    },
  ],
};
