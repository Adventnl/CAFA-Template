import type { Mentor } from '@/lib/types';

export const mentors: readonly Mentor[] = [
  {
    slug: 'shen-zhibai',
    name: { zh: '沈知白', en: 'Shen Zhibai' },
    discipline: { zh: '建筑', en: 'Architecture' },
    note: {
      zh: '做了十一年施工图，之后才开始教书。',
      en: 'Eleven years of construction drawings before ever teaching.',
    },
    portrait: {
      src: 'mentors/shen-zhibai.jpg',
      alt: { zh: '沈知白在工作室的肖像。', en: 'Shen Zhibai photographed in the studio.' },
    },
  },
  {
    slug: 'xu-qinghe',
    name: { zh: '许清和', en: 'Xu Qinghe' },
    discipline: { zh: '视觉传达', en: 'Visual Communication' },
    note: {
      zh: '收集印刷错误，已经收了两千多张。',
      en: 'Collects printing errors; the count is past two thousand.',
    },
    portrait: {
      src: 'mentors/xu-qinghe.jpg',
      alt: { zh: '许清和在工作室的肖像。', en: 'Xu Qinghe photographed in the studio.' },
    },
  },
  {
    slug: 'luo-man',
    name: { zh: '罗蔓', en: 'Luo Man' },
    discipline: { zh: '室内与装置', en: 'Interior and Installation' },
    note: {
      zh: '认为一个房间的问题通常在天花板上。',
      en: 'Holds that a room’s problem is usually in its ceiling.',
    },
    portrait: {
      src: 'mentors/luo-man.jpg',
      alt: { zh: '罗蔓在工作室的肖像。', en: 'Luo Man photographed in the studio.' },
    },
  },
  {
    slug: 'gao-yuan',
    name: { zh: '高原', en: 'Gao Yuan' },
    discipline: { zh: '陶瓷与材料', en: 'Ceramics and Materials' },
    note: {
      zh: '每年在景德镇待四个月，其余时间在北京。',
      en: 'Four months a year in Jingdezhen, the rest in Beijing.',
    },
    portrait: {
      src: 'mentors/gao-yuan.jpg',
      alt: { zh: '高原在工作室的肖像。', en: 'Gao Yuan photographed in the studio.' },
    },
  },
];
