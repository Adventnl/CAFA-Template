import { routes } from '@/lib/routes';
import type { Locale, LocalisedText } from '@/lib/types';

import type { Dictionary } from './dictionaries/zh';

export interface NavItem {
  /** Key into `dictionary.nav`. A label is never stored here. */
  key: keyof Dictionary['nav'];
  /** A function from lib/routes — never a path string. */
  href: (locale: Locale) => string;
}

export interface SocialLink {
  label: LocalisedText;
  href: string;
}

export interface Site {
  /** Absolute origin, used for canonical URLs and og:url. No trailing slash. */
  url: string;
  nav: readonly NavItem[];
  contact: {
    email: LocalisedText;
    wechat: LocalisedText;
    address: LocalisedText;
  };
  socials: readonly SocialLink[];
}

export const site: Site = {
  url: 'https://cafa-atelier.com',

  nav: [
    { key: 'works', href: routes.works },
    { key: 'programs', href: routes.programs },
    { key: 'about', href: routes.about },
    { key: 'contact', href: routes.contact },
  ],

  contact: {
    email: {
      zh: 'studio@cafa-atelier.com',
      en: 'studio@cafa-atelier.com',
    },
    wechat: {
      zh: 'cafa_atelier',
      en: 'cafa_atelier',
    },
    address: {
      zh: '北京市朝阳区酒仙桥路 4 号 798 艺术区 B12',
      en: 'B12, 798 Art District, 4 Jiuxianqiao Road, Chaoyang, Beijing',
    },
  },

  socials: [
    {
      label: { zh: 'Instagram', en: 'Instagram' },
      href: 'https://instagram.com/cafa.atelier',
    },
    {
      label: { zh: '小红书', en: 'Xiaohongshu' },
      href: 'https://xiaohongshu.com/user/profile/cafa-atelier',
    },
    {
      label: { zh: 'Behance', en: 'Behance' },
      href: 'https://behance.net/cafa-atelier',
    },
  ],
};
