import type { Work } from '@/lib/types';

export const nineGreyRooms: Work = {
  slug: 'nine-grey-rooms',
  index: 9,
  title: { zh: '九个灰房间', en: 'Nine Grey Rooms' },
  status: 'in-progress',
  discipline: [
    { zh: '室内', en: 'Interior' },
    { zh: '装置', en: 'Installation' },
  ],
  year: 2023,
  summary: {
    zh: '同一个房间刷九遍。每一遍的灰只比上一遍深一点，肉眼分不出，但九遍之后人不愿意再进去。',
    en: 'One room painted nine times. Each grey is barely darker than the last, too close to tell apart by eye, and after the ninth nobody wants to go back in.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '崔言', en: 'Cui Yan' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '罗蔓', en: 'Luo Man' } },
  ],
  cover: {
    src: 'works/nine-grey-rooms/cover.jpg',
    alt: { zh: '第七遍灰之后的房间角落。', en: 'A corner of the room after the seventh coat of grey.' },
  },
  media: [
    {
      src: 'works/nine-grey-rooms/01.jpg',
      alt: { zh: '九个色样并排，差别几乎看不出。', en: 'Nine samples side by side, the difference almost invisible.' },
    },
    {
      src: 'works/nine-grey-rooms/02.jpg',
      alt: { zh: '刷到第四遍时的墙面。', en: 'The wall at the fourth coat.' },
    },
  ],
};
