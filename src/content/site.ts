import { panels, routes } from '@/lib/routes';
import type { SiteContent } from '@/lib/types';

export const site: SiteContent = {
  name: { zh: 'c.a.f.a atelier 央艺', en: 'c.a.f.a atelier 央艺' },

  // The one placeholder in this file. Canonical URLs, hreflang alternates and
  // og:image are all built from it, so it is the first thing to change on deploy.
  url: 'https://cafa-atelier.example',

  locales: ['zh', 'en'],
  localeNames: { zh: '中文', en: 'EN' },

  nav: [
    { label: { zh: '作品', en: 'Works' }, href: routes.works },
    { label: { zh: '课程', en: 'Programmes' }, href: routes.programs },
    { label: { zh: '关于', en: 'About' }, href: routes.about },
    // The one item that goes nowhere: it pins the contact card over the page you
    // are on. Still last in the bar, so the nav reads the same as it always did.
    { label: { zh: '联系', en: 'Contact' }, opens: panels.contact },
  ],

  studio: [
    {
      src: 'studio/01.jpg',
      alt: {
        zh: '工作室的主厅，长桌沿窗排开。',
        en: 'The main room of the studio, long tables set out along the windows.',
      },
    },
    {
      src: 'studio/02.jpg',
      alt: {
        zh: '模型架，按项目分层。',
        en: 'The model shelves, one project to a shelf.',
      },
    },
    {
      src: 'studio/03.jpg',
      alt: {
        zh: '评图用的那面墙，通常是满的。',
        en: 'The wall used for reviews, usually full.',
      },
    },
    {
      src: 'studio/04.jpg',
      alt: {
        zh: '材料间，样品按材质排。',
        en: 'The material room, samples ordered by what they are made of.',
      },
    },
    {
      src: 'studio/05.jpg',
      alt: {
        zh: '院子，天气好的时候在这里晒图纸。',
        en: 'The yard, where drawings are put out to dry in good weather.',
      },
    },
  ],

  contact: {
    email: 'atelier@cafa-atelier.example',
    wechat: 'cafa_atelier',
    address: {
      zh: '北京市朝阳区花家地南街八号',
      en: '8 Huajiadi South Street, Chaoyang, Beijing',
    },
    hours: {
      zh: '周二至周六 10:00–19:00，需预约',
      en: 'Tuesday to Saturday, 10:00–19:00, by appointment',
    },
  },
};
