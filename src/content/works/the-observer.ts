import type { Work } from '@/lib/types';

export const theObserver: Work = {
  slug: 'the-observer',
  index: 1,
  title: { zh: '观察者', en: 'The Observer' },
  status: 'completed',
  discipline: [
    { zh: '影像', en: 'Moving Image' },
    { zh: '纯艺术', en: 'Fine Art' },
  ],
  year: 2020,
  summary: {
    zh: '一部十四分钟的单镜头影片，摄影机固定在一间自习室的后墙上。整部片子里唯一移动的是光和坐姿。',
    en: 'A fourteen-minute single-take film, the camera fixed to the back wall of a study room. The only things that move are the light and the way people sit.',
  },
  credits: [
    { role: { zh: '导演', en: 'Director' }, name: { zh: '苏黎', en: 'Su Li' } },
    { role: { zh: '摄影', en: 'Cinematography' }, name: { zh: '方越', en: 'Fang Yue' } },
    { role: { zh: '声音', en: 'Sound' }, name: { zh: '李慕', en: 'Li Mu' } },
  ],
  cover: {
    src: 'works/the-observer/01.jpg',
    alt: { zh: '影片中的自习室固定机位画面', en: 'The fixed frame of the study room from the film' },
    width: 2400,
    height: 1350,
  },
  media: [
    {
      src: 'works/the-observer/01.jpg',
      alt: { zh: '影片中的自习室固定机位画面', en: 'The fixed frame of the study room from the film' },
      width: 2400,
      height: 1350,
    },
    {
      src: 'works/the-observer/02.jpg',
      alt: { zh: '同一机位在片尾的画面', en: 'The same frame at the end of the film' },
      width: 2400,
      height: 1350,
    },
  ],
};
