import type { Dictionary } from './zh';

/**
 * `satisfies` rather than an annotation: the shape is enforced against zh.ts, but the
 * object keeps its own literal types. Delete a key below and the build fails.
 */
export const en = {
  site: {
    name: 'c.a.f.a Atelier 央艺',
    lockupMark: 'c.a.f.a',
    lockupName: 'Atelier 央艺',
    description:
      'A Beijing atelier for art, design and architecture, built around portfolio mentorship.',
    titleTemplate: '%s — c.a.f.a Atelier 央艺',
  },

  nav: {
    works: 'Works',
    programs: 'Programmes',
    about: 'About',
    contact: 'Contact',
  },

  a11y: {
    skipToContent: 'Skip to content',
    primaryNavigation: 'Primary navigation',
    localeSwitch: 'Switch language',
    openMenu: 'Menu',
    closeMenu: 'Close',
    menuPanel: 'Navigation menu',
    homeLink: 'Back to home',
  },

  status: {
    completed: 'Completed',
    'in-progress': 'In progress',
    private: 'Private',
  },

  pages: {
    home: {
      title: 'Home',
      intro: 'Confidence through absence.',
    },
    works: {
      title: 'Works',
      intro: 'Projects and portfolio archives, newest first. Private work is listed but not shown.',
    },
    programs: {
      title: 'Programmes',
      intro:
        'Four programmes covering the full cycle, from foundation to application interview. Each ends in a portfolio you can send.',
    },
    about: {
      title: 'About',
      intro: 'c.a.f.a is a small atelier. We believe the restraint is the design.',
    },
    contact: {
      title: 'Contact',
      intro: 'Write to arrange a conversation, or come and sit in the Beijing studio.',
    },
  },

  work: {
    indexColumn: 'No.',
    titleColumn: 'Project',
    disciplineColumn: 'Discipline',
    yearColumn: 'Year',
    statusColumn: 'Status',
    creditsHeading: 'Credits',
    summaryHeading: 'Summary',
    privateNotice: 'This project is withheld at the author’s request.',
  },

  program: {
    durationLabel: 'Duration',
    formatLabel: 'Format',
    audienceLabel: 'For',
    outcomesLabel: 'Outcomes',
  },

  mentor: {
    heading: 'Mentors',
    roleLabel: 'Field',
    institutionLabel: 'School',
  },

  contact: {
    emailLabel: 'Email',
    wechatLabel: 'WeChat',
    addressLabel: 'Address',
    followLabel: 'Follow',
  },

  footer: {
    copyright: '© {year} c.a.f.a Atelier 央艺 · All rights reserved',
  },

  localeSwitch: {
    zh: '中',
    en: 'EN',
  },
} satisfies Dictionary;
