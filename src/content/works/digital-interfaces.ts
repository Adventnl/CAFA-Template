import type { Work } from '@/lib/types';

export const digitalInterfaces: Work = {
  slug: 'digital-interfaces',
  index: 10,
  title: { zh: '数字界面', en: 'Digital Interfaces' },
  status: 'completed',
  discipline: [{ zh: '交互设计', en: 'Interaction Design' }],
  year: 2023,
  summary: {
    zh: '为一家档案馆重做的检索界面，把三十年的卡片目录压缩成一条可以滚动的时间轴。检索结果不排序，只按年份落位。',
    en: 'A search interface for an archive, compressing thirty years of card catalogue into one scrollable timeline. Results are never ranked; they simply fall on their year.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '苏黎', en: 'Su Li' } },
    { role: { zh: '前端', en: 'Front-end' }, name: { zh: '方越', en: 'Fang Yue' } },
  ],
  cover: {
    src: 'works/digital-interfaces/01.jpg',
    alt: { zh: '检索时间轴在宽屏上的状态', en: 'The search timeline on a wide display' },
    width: 2400,
    height: 1350,
  },
  media: [
    {
      src: 'works/digital-interfaces/01.jpg',
      alt: { zh: '检索时间轴在宽屏上的状态', en: 'The search timeline on a wide display' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/digital-interfaces/02.jpg',
      alt: { zh: '卡片目录原件与数字条目的对照', en: 'An original catalogue card beside its digital entry' },
      width: 2400,
      height: 1600,
    },
  ],
};
