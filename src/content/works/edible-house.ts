import type { Work } from '@/lib/types';

export const edibleHouse: Work = {
  slug: 'edible-house',
  index: 12,
  title: { zh: '可食之屋', en: 'Edible House' },
  status: 'completed',
  discipline: [
    { zh: '建筑', en: 'Architecture' },
    { zh: '景观', en: 'Landscape' },
  ],
  year: 2024,
  summary: {
    zh: '一座把菜地折进剖面的小屋。屋顶收集雨水，走廊同时是苗床，冬天关掉一半房间。造价与一间普通农舍相当，但每年产出约四百公斤蔬菜。',
    en: 'A small house that folds a vegetable plot into its section. The roof collects rain, the corridor doubles as a seed bed, and half the rooms close down for winter. It cost about what an ordinary farmhouse costs and yields roughly four hundred kilograms of vegetables a year.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '林未', en: 'Lin Wei' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈知白', en: 'Shen Zhibai' } },
    { role: { zh: '摄影', en: 'Photography' }, name: { zh: '工作室', en: 'The studio' } },
  ],
  cover: {
    src: 'works/edible-house/cover.jpg',
    alt: {
      zh: '可食之屋的南立面，屋顶的集水槽向院子倾斜。',
      en: 'The south elevation of Edible House, its roof gutter tilting towards the yard.',
    },
  },
  media: [
    {
      src: 'works/edible-house/01.jpg',
      alt: {
        zh: '剖面模型，苗床沿走廊排开。',
        en: 'A section model with seed beds running the length of the corridor.',
      },
    },
    {
      src: 'works/edible-house/02.jpg',
      alt: {
        zh: '夏季的走廊，两侧种满攀爬作物。',
        en: 'The corridor in summer, climbing crops on both sides.',
      },
    },
    {
      src: 'works/edible-house/03.jpg',
      alt: {
        zh: '关掉一半房间之后的冬季平面。',
        en: 'The winter plan, with half the rooms shut down.',
      },
    },
  ],
};
