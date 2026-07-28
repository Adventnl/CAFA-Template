import type { Work } from '@/lib/types';

export const maxWang: Work = {
  slug: 'max-wang',
  index: 6,
  title: { zh: '王沐', en: 'Max Wang' },
  status: 'completed',
  discipline: [
    { zh: '作品集', en: 'Portfolio' },
    { zh: '工业设计', en: 'Industrial Design' },
  ],
  year: 2022,
  summary: {
    zh: '围绕一件家用工具的十一次原型迭代，作品集把失败的九次也完整收进去了。最终稿放在最后一页，只占四分之一版面。',
    en: 'Eleven prototype iterations of one household tool, with the nine failures kept in the portfolio in full. The final version sits on the last page, taking up a quarter of it.',
  },
  credits: [
    { role: { zh: '作者', en: 'Author' }, name: { zh: '王沐', en: 'Max Wang' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '柳岸', en: 'Liu An' } },
    { role: { zh: '原型', en: 'Prototyping' }, name: { zh: '央艺工作室', en: 'c.a.f.a Studio' } },
  ],
  cover: {
    src: 'works/max-wang/01.jpg',
    alt: { zh: '十一件原型按顺序排开', en: 'Eleven prototypes laid out in sequence' },
    width: 2400,
    height: 1350,
  },
  media: [
    {
      src: 'works/max-wang/01.jpg',
      alt: { zh: '十一件原型按顺序排开', en: 'Eleven prototypes laid out in sequence' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/max-wang/02.jpg',
      alt: { zh: '第七次原型的手持测试', en: 'The seventh prototype held in the hand' },
      width: 1800,
      height: 2250,
    },
    {
      src: 'works/max-wang/03.jpg',
      alt: { zh: '最终稿的正视图', en: 'Front view of the final version' },
      width: 2000,
      height: 2000,
    },
  ],
};
