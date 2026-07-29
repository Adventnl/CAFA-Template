import type { Work } from '@/lib/types';

export const theLongTable: Work = {
  slug: 'the-long-table',
  index: 7,
  title: { zh: '长桌', en: 'The Long Table' },
  status: 'completed',
  discipline: [
    { zh: '家具', en: 'Furniture' },
    { zh: '室内', en: 'Interior' },
  ],
  year: 2022,
  summary: {
    zh: '一张十四米的桌子，木料全部来自它所在的那间屋子的地板。地板没有补，缺口按桌子的排布留着，所以站在门口就能看出桌子是从哪里长出来的。',
    en: 'A table fourteen metres long, made entirely from the floorboards of the room it stands in. The floor was never patched: the gaps are left in the pattern the table was cut from, so from the doorway you can read where it grew out of.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '梁允', en: 'Liang Yun' } },
    { role: { zh: '木工', en: 'Joinery' }, name: { zh: '通州的一家作坊', en: 'A workshop in Tongzhou' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '罗蔓', en: 'Luo Man' } },
  ],
  cover: {
    src: 'works/the-long-table/cover.jpg',
    alt: {
      zh: '长桌沿着房间的长边摆放，地板上留着缺口。',
      en: 'The table set along the length of the room, gaps left in the floor.',
    },
  },
  media: [
    {
      src: 'works/the-long-table/01.jpg',
      alt: {
        zh: '起板前在地板上放的样，编号写在每一条上。',
        en: 'The setting-out on the floor before lifting, each board numbered.',
      },
    },
    {
      src: 'works/the-long-table/02.jpg',
      alt: { zh: '桌面拼缝处的木纹对齐。', en: 'Grain matched across a joint in the table top.' },
    },
    {
      src: 'works/the-long-table/03.jpg',
      alt: {
        zh: '地板上的缺口，正对桌腿的位置。',
        en: 'A gap in the floor, directly opposite the leg it became.',
      },
    },
    {
      src: 'works/the-long-table/04.jpg',
      alt: { zh: '桌腿与地板缺口的对照图。', en: 'The legs drawn against the gaps they came from.' },
    },
    {
      src: 'works/the-long-table/05.jpg',
      alt: {
        zh: '开学第一天，二十个人坐满长桌。',
        en: 'The first day of term, twenty people filling the table.',
      },
    },
  ],
};
