import type { Mentor } from '@/lib/types';

export const mentors: readonly Mentor[] = [
  {
    slug: 'shen-mu',
    name: { zh: '沈牧', en: 'Shen Mu' },
    role: { zh: '平面设计 / 出版', en: 'Graphic Design / Publishing' },
    institution: { zh: '皇家艺术学院', en: 'Royal College of Art' },
    bio: {
      zh: '做了九年书籍设计，相信一本册子的顺序比它的封面重要。在工作室负责排版与叙事方向的课程。',
      en: 'Nine years in book design, and convinced that the order of a volume matters more than its cover. Leads the typography and narrative teaching.',
    },
    portrait: {
      src: 'mentors/shen-mu/portrait.jpg',
      alt: { zh: '沈牧在工作室的肖像', en: 'Portrait of Shen Mu in the studio' },
      width: 1600,
      height: 2000,
    },
  },
  {
    slug: 'liu-an',
    name: { zh: '柳岸', en: 'Liu An' },
    role: { zh: '建筑 / 室内', en: 'Architecture / Interior' },
    institution: { zh: '代尔夫特理工大学', en: 'TU Delft' },
    bio: {
      zh: '长期做小尺度改造，主张先量再画。带建筑方向的作品集与研究课程。',
      en: 'Works on small-scale conversions and insists on measuring before drawing. Leads the architecture portfolio and research teaching.',
    },
    portrait: {
      src: 'mentors/liu-an/portrait.jpg',
      alt: { zh: '柳岸在工地上的肖像', en: 'Portrait of Liu An on site' },
      width: 1600,
      height: 2000,
    },
  },
  {
    slug: 'ren-xiaoman',
    name: { zh: '任小满', en: 'Ren Xiaoman' },
    role: { zh: '插画 / 服装', en: 'Illustration / Fashion' },
    institution: { zh: '中央圣马丁学院', en: 'Central Saint Martins' },
    bio: {
      zh: '从展墙画到布料，关心的一直是同一件事：一条线怎样才不多余。负责手作与材料方向。',
      en: 'From gallery walls to cloth, always asking the same question: when is a line unnecessary. Leads the making and materials teaching.',
    },
    portrait: {
      src: 'mentors/ren-xiaoman/portrait.jpg',
      alt: { zh: '任小满在工作台前的肖像', en: 'Portrait of Ren Xiaoman at the bench' },
      width: 1600,
      height: 2000,
    },
  },
  {
    slug: 'chen-yu',
    name: { zh: '陈屿', en: 'Chen Yu' },
    role: { zh: '研究 / 测绘', en: 'Research / Survey' },
    institution: { zh: '东京艺术大学', en: 'Tokyo University of the Arts' },
    bio: {
      zh: '带着学生到现场测绘已经六年，档案是他唯一承认的作品形式。负责研究与论文课程。',
      en: 'Six years of taking students out to survey, and the archive is the only form of work he will call finished. Leads the thesis and research teaching.',
    },
    portrait: {
      src: 'mentors/chen-yu/portrait.jpg',
      alt: { zh: '陈屿在测绘现场的肖像', en: 'Portrait of Chen Yu on a survey' },
      width: 1600,
      height: 2000,
    },
  },
];
