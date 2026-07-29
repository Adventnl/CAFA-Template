import type { Work } from '@/lib/types';

/**
 * status: 'private' — renders in the index as an unlinked, dimmed row with no
 * hover image, and is excluded from the detail routes. See ARCHITECTURE.md §3.
 */
export const commissionNo14: Work = {
  slug: 'commission-no-14',
  index: 14,
  title: { zh: '第十四号委托', en: 'Commission No. 14' },
  status: 'private',
  discipline: [{ zh: '空间设计', en: 'Spatial Design' }],
  year: 2025,
  summary: {
    zh: '受委托的私人项目，按约定不公开。',
    en: 'A private commission, withheld by agreement.',
  },
  credits: [],
  cover: {
    src: 'works/commission-no-14/cover.jpg',
    alt: '',
  },
  media: [],
};
