import type { Work } from '@/lib/types';

export const islandArchive: Work = {
  slug: 'island-archive',
  index: 12,
  title: { zh: '岛屿档案', en: 'The Island Archive' },
  status: 'completed',
  discipline: [
    { zh: '建筑', en: 'Architecture' },
    { zh: '研究', en: 'Research' },
  ],
  year: 2024,
  summary: {
    zh: '为一座正在缩小的岛屿建立的测绘档案，收录了三十七处即将消失的构筑物。图纸是唯一会比对象活得更久的部分。',
    en: 'A survey archive of a shrinking island, recording thirty-seven structures about to disappear. The drawings are the only part that will outlive their subject.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '陈屿', en: 'Chen Yu' } },
    { role: { zh: '测绘', en: 'Survey' }, name: { zh: '央艺研究组', en: 'c.a.f.a Research Unit' } },
  ],
  cover: {
    src: 'works/island-archive/01.jpg',
    alt: { zh: '摊在长桌上的测绘图纸', en: 'Survey drawings laid across a long table' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/island-archive/01.jpg',
      alt: { zh: '摊在长桌上的测绘图纸', en: 'Survey drawings laid across a long table' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/island-archive/02.jpg',
      alt: { zh: '岛屿北岸的石砌仓房', en: 'A stone store house on the island’s north shore' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/island-archive/03.jpg',
      alt: { zh: '档案册的装订侧面', en: 'The bound edge of the archive volume' },
      width: 2000,
      height: 2000,
    },
  ],
};
