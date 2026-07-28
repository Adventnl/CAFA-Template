import type { Work } from '@/lib/types';

export const edibleHouse: Work = {
  slug: 'edible-house',
  index: 14,
  title: { zh: '可食之屋', en: 'Edible House' },
  status: 'completed',
  discipline: [{ zh: '建筑', en: 'Architecture' }],
  year: 2024,
  summary: {
    zh: '一栋以耕作为结构的住宅：立面是可采摘的，屋顶随季节改变颜色。设计把维护成本转译成一年一次的收成。',
    en: 'A house whose structure is cultivation: the façade can be picked and the roof changes colour with the season. Maintenance is translated into a harvest, once a year.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '周语桐', en: 'Zhou Yutong' } },
    { role: { zh: '结构顾问', en: 'Structure' }, name: { zh: '何嘉', en: 'He Jia' } },
    { role: { zh: '摄影', en: 'Photography' }, name: { zh: '工作室', en: 'Studio' } },
  ],
  cover: {
    src: 'works/edible-house/01.jpg',
    alt: { zh: '住宅东立面，攀爬植物覆盖木格栅', en: 'The east façade, climbing plants across a timber lattice' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/edible-house/01.jpg',
      alt: { zh: '住宅东立面，攀爬植物覆盖木格栅', en: 'The east façade, climbing plants across a timber lattice' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/edible-house/02.jpg',
      alt: { zh: '剖面模型，展示屋顶种植层', en: 'Section model showing the planted roof layer' },
      width: 2000,
      height: 2000,
    },
    {
      src: 'works/edible-house/03.jpg',
      alt: { zh: '内院在夏末的状态', en: 'The courtyard in late summer' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/edible-house/04.jpg',
      alt: { zh: '格栅节点的一比一样品', en: 'A full-scale sample of the lattice joint' },
      width: 1800,
      height: 2250,
    },
  ],
};
