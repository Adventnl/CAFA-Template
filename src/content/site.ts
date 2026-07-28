import { routes } from '@/lib/routes';
import type { SiteContent } from '@/lib/types';

export const site: SiteContent = {
  name: { zh: 'c.a.f.a atelier 央艺', en: 'c.a.f.a atelier 央艺' },

  locales: ['zh', 'en'],
  localeNames: { zh: '中文', en: 'EN' },

  nav: [
    { label: { zh: '作品', en: 'Works' }, href: routes.works },
    { label: { zh: '课程', en: 'Programmes' }, href: routes.programs },
    { label: { zh: '关于', en: 'About' }, href: routes.about },
    { label: { zh: '联系', en: 'Contact' }, href: routes.contact },
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
