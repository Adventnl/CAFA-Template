import type { Work } from '@/lib/types';

export const gasStationRenovation: Work = {
  slug: 'gas-station-renovation',
  index: 2,
  title: { zh: '加油站改造', en: 'Gas Station Renovation' },
  status: 'completed',
  discipline: [
    { zh: '建筑', en: 'Architecture' },
    { zh: '室内设计', en: 'Interior Design' },
  ],
  year: 2021,
  summary: {
    zh: '把一座停用的国道加油站改成村镇图书室，原有的雨棚一根柱子都没有拆。加油岛的位置现在放着借阅台。',
    en: 'A disused highway filling station turned into a village reading room, with not one column of the canopy removed. The lending desk now stands where the pumps were.',
  },
  credits: [
    { role: { zh: '主创', en: 'Lead' }, name: { zh: '柳岸', en: 'Liu An' } },
    { role: { zh: '施工', en: 'Construction' }, name: { zh: '本地工班', en: 'Local crew' } },
    { role: { zh: '摄影', en: 'Photography' }, name: { zh: '毕辰', en: 'Bi Chen' } },
  ],
  cover: {
    src: 'works/gas-station-renovation/01.jpg',
    alt: { zh: '保留的雨棚与新的图书室体量', en: 'The retained canopy over the new reading room volume' },
    width: 2400,
    height: 1600,
  },
  media: [
    {
      src: 'works/gas-station-renovation/01.jpg',
      alt: { zh: '保留的雨棚与新的图书室体量', en: 'The retained canopy over the new reading room volume' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/gas-station-renovation/02.jpg',
      alt: { zh: '改造前的加油岛', en: 'The pump island before the conversion' },
      width: 2400,
      height: 1600,
    },
    {
      src: 'works/gas-station-renovation/03.jpg',
      alt: { zh: '借阅台与后方书架', en: 'The lending desk and the shelves behind it' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/gas-station-renovation/04.jpg',
      alt: { zh: '夜间从国道望向图书室', en: 'The reading room seen from the highway at night' },
      width: 2400,
      height: 1600,
    },
  ],
};
