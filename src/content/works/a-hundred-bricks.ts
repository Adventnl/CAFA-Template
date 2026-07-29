import type { Work } from '@/lib/types';

export const aHundredBricks: Work = {
  slug: 'a-hundred-bricks',
  index: 5,
  title: { zh: '一百块砖', en: 'A Hundred Bricks' },
  status: 'completed',
  discipline: [
    { zh: '陶瓷', en: 'Ceramics' },
    { zh: '建筑', en: 'Architecture' },
  ],
  year: 2021,
  summary: {
    zh: '泥全部取自窑口一百米以内，每块砖标着自己被挖出来的位置。砌成的墙因此是一张地图：颜色最深的一段来自水沟边，最浅的一段来自路面下三十公分。',
    en: 'All the clay was dug within a hundred metres of the kiln, and every brick is marked with the spot it came out of. The wall built from them is therefore a map: its darkest stretch came from beside the ditch, its palest from thirty centimetres under the road.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '沈迟', en: 'Shen Chi' } },
    { role: { zh: '烧制', en: 'Firing' }, name: { zh: '高原', en: 'Gao Yuan' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '高原', en: 'Gao Yuan' } },
  ],
  cover: {
    src: 'works/a-hundred-bricks/cover.jpg',
    alt: {
      zh: '砌好的墙，颜色由深到浅横过整面。',
      en: 'The finished wall, running dark to pale across its face.',
    },
  },
  media: [
    {
      src: 'works/a-hundred-bricks/01.jpg',
      alt: {
        zh: '取土点的平面图，一百个编号。',
        en: 'The plan of digging points, numbered to a hundred.',
      },
    },
    {
      src: 'works/a-hundred-bricks/02.jpg',
      alt: { zh: '未烧的砖坯按取土点排开。', en: 'Green bricks laid out by the point they came from.' },
    },
    {
      src: 'works/a-hundred-bricks/03.jpg',
      alt: {
        zh: '同一次烧成里最深与最浅的两块。',
        en: 'The darkest and the palest brick from a single firing.',
      },
    },
    {
      src: 'works/a-hundred-bricks/04.jpg',
      alt: { zh: '砖背面的取土点编号。', en: 'The digging-point number on the back of a brick.' },
    },
    {
      src: 'works/a-hundred-bricks/05.jpg',
      alt: {
        zh: '水沟边取土处，回填之后。',
        en: 'The digging point beside the ditch, after backfilling.',
      },
    },
    {
      src: 'works/a-hundred-bricks/06.jpg',
      alt: { zh: '墙在侧光下的表面。', en: 'The wall’s surface under raking light.' },
    },
  ],
};
