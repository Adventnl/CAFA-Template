import type { Work } from '@/lib/types';

export const paperTopography: Work = {
  slug: 'paper-topography',
  index: 11,
  title: { zh: '纸上地形', en: 'Paper Topography' },
  status: 'completed',
  discipline: [{ zh: '空间插画', en: 'Spatial Illustration' }],
  year: 2024,
  summary: {
    zh: '把一段两公里的河岸按等高线拆成十七张纸，再逐层叠回去。观众可以抽出任何一层，河就在那一刻少掉一米。',
    en: 'Two kilometres of riverbank cut into seventeen sheets along its contour lines, then stacked back up. A visitor can pull out any one layer, and at that moment the river loses a metre.',
  },
  credits: [
    { role: { zh: '设计', en: 'Design' }, name: { zh: '周砚', en: 'Zhou Yan' } },
    { role: { zh: '指导', en: 'Mentor' }, name: { zh: '许清和', en: 'Xu Qinghe' } },
  ],
  cover: {
    src: 'works/paper-topography/cover.jpg',
    alt: {
      zh: '十七层纸质等高线叠成的河岸模型。',
      en: 'A riverbank modelled as seventeen stacked paper contours.',
    },
  },
  media: [
    {
      src: 'works/paper-topography/01.jpg',
      alt: {
        zh: '抽出第九层时露出的空腔。',
        en: 'The cavity left when the ninth layer is pulled out.',
      },
    },
    {
      src: 'works/paper-topography/02.jpg',
      alt: { zh: '单层等高线的切割图纸。', en: 'The cutting drawing for a single contour.' },
    },
    {
      src: 'works/paper-topography/03.jpg',
      alt: { zh: '展厅里的侧光下的叠层边缘。', en: 'Stacked edges under raking gallery light.' },
    },
    {
      src: 'works/paper-topography/04.jpg',
      alt: {
        zh: '十七层全部抽出后平铺在地上。',
        en: 'All seventeen layers drawn out and laid flat on the floor.',
      },
    },
    {
      src: 'works/paper-topography/05.jpg',
      alt: { zh: '等高线之间的落差，从侧面看。', en: 'The drop between contours, seen from the side.' },
    },
    {
      src: 'works/paper-topography/06.jpg',
      alt: {
        zh: '观众抽层时留下的手印，第三周。',
        en: 'Fingerprints left by visitors pulling layers, in the third week.',
      },
    },
  ],
};
