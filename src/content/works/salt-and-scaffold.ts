import type { Work } from '@/lib/types';

export const saltAndScaffold: Work = {
  slug: 'salt-and-scaffold',
  index: 13,
  title: { zh: '盐与脚手架', en: 'Salt and Scaffold' },
  status: 'in-progress',
  discipline: [
    { zh: '建筑', en: 'Architecture' },
    { zh: '材料', en: 'Materials' },
  ],
  year: 2025,
  summary: {
    zh: '一座只打算存在一个雨季的亭子。墙是压制的盐砖，脚手架是租来的，雨停时墙会矮四十公分。合同里写明了拆除日期，但没写墙那时还剩多少。',
    en: 'A pavilion meant to last one rainy season. The walls are pressed salt block, the scaffold is hired, and by the end of the rain the walls stand forty centimetres lower. The contract names a date for dismantling it; it does not say how much wall will be left by then.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '祁南', en: 'Qi Nan' } },
    { role: { zh: '结构', en: 'Structure' }, name: { zh: '陈立', en: 'Chen Li' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '沈知白', en: 'Shen Zhibai' } },
  ],
  cover: {
    src: 'works/salt-and-scaffold/cover.jpg',
    alt: {
      zh: '盐砖墙与租来的脚手架，第一场雨之前。',
      en: 'The salt-block wall and its hired scaffold, before the first rain.',
    },
  },
  media: [
    {
      src: 'works/salt-and-scaffold/01.jpg',
      alt: { zh: '压制盐砖的模具与半成品。', en: 'The press mould and a half-finished salt block.' },
    },
    {
      src: 'works/salt-and-scaffold/02.jpg',
      alt: {
        zh: '第一周的墙面，棱角还是直的。',
        en: 'The wall in its first week, the arrises still straight.',
      },
    },
    {
      src: 'works/salt-and-scaffold/03.jpg',
      alt: {
        zh: '第六周，雨水在墙脚冲出一道沟。',
        en: 'Week six, with rainwater cutting a channel at the foot of the wall.',
      },
    },
    {
      src: 'works/salt-and-scaffold/04.jpg',
      alt: {
        zh: '脚手架的接头，唯一不会溶掉的部分。',
        en: 'A scaffold coupler — the only part of the building that will not dissolve.',
      },
    },
    {
      src: 'works/salt-and-scaffold/05.jpg',
      alt: {
        zh: '每周同一角度拍摄的墙高对照。',
        en: 'The weekly height comparison, photographed from the same spot each time.',
      },
    },
    {
      src: 'works/salt-and-scaffold/06.jpg',
      alt: { zh: '雨季结束时的地面结晶。', en: 'Crystal left on the ground at the end of the season.' },
    },
  ],
};
