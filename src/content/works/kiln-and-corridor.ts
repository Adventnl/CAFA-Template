import type { Work } from '@/lib/types';

export const kilnAndCorridor: Work = {
  slug: 'kiln-and-corridor',
  index: 10,
  title: { zh: '窑与廊', en: 'Kiln and Corridor' },
  status: 'completed',
  discipline: [
    { zh: '建筑', en: 'Architecture' },
    { zh: '陶瓷', en: 'Ceramics' },
  ],
  year: 2023,
  summary: {
    zh: '一座柴窑和通向它的六十米长廊。廊子的坡度只由排烟决定，因此走进去的人是顺着烟的路线走的。',
    en: 'A wood-fired kiln and the sixty metres of corridor that lead to it. The slope of the corridor is set by the flue and nothing else, so anyone walking in is walking the path of the smoke.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '何一鸣', en: 'He Yiming' } },
    { role: { zh: '烧制', en: 'Firing' }, name: { zh: '景德镇工坊', en: 'A workshop in Jingdezhen' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈知白', en: 'Shen Zhibai' } },
  ],
  cover: {
    src: 'works/kiln-and-corridor/cover.jpg',
    alt: { zh: '长廊尽头的柴窑口。', en: 'The mouth of the wood-fired kiln at the end of the corridor.' },
  },
  media: [
    {
      src: 'works/kiln-and-corridor/01.jpg',
      alt: { zh: '长廊的纵剖面，坡度随排烟升高。', en: 'The corridor in long section, rising with the flue.' },
    },
    {
      src: 'works/kiln-and-corridor/02.jpg',
      alt: { zh: '烧制中的窑体外壁。', en: 'The outer wall of the kiln during a firing.' },
    },
    {
      src: 'works/kiln-and-corridor/03.jpg',
      alt: { zh: '出窑后的试片，按窑位排列。', en: 'Test tiles after unloading, arranged by their position in the kiln.' },
    },
    {
      src: 'works/kiln-and-corridor/04.jpg',
      alt: { zh: '长廊入口，坡度从这里开始。', en: 'The corridor entrance, where the slope begins.' },
    },
    {
      src: 'works/kiln-and-corridor/05.jpg',
      alt: {
        zh: '排烟道的剖面，决定了整条廊子的高度。',
        en: 'The flue in section — the thing that set the height of the whole corridor.',
      },
    },
    {
      src: 'works/kiln-and-corridor/06.jpg',
      alt: { zh: '烧到第三天夜里的窑口。', en: 'The kiln mouth on the third night of firing.' },
    },
  ],
};
