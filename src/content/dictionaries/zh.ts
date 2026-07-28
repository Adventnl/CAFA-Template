/**
 * The Chinese dictionary — and, because of the type below, the schema every other
 * locale is checked against.
 *
 * Only *chrome* strings live here: labels, headings, notices. Anything that belongs
 * to a work, a programme or a mentor lives in that record as LocalisedText.
 */
export const zh = {
  site: {
    name: 'c.a.f.a Atelier 央艺',
    /** The two halves of the header lockup. Never an image. */
    lockupMark: 'c.a.f.a',
    lockupName: 'Atelier 央艺',
    description: '一间以作品集辅导为核心的艺术、设计与建筑工作室，位于北京。',
    /** `%s` is the page title. Separator included, because it is punctuation and punctuation is localised. */
    titleTemplate: '%s — c.a.f.a Atelier 央艺',
  },

  nav: {
    works: '作品',
    programs: '课程',
    about: '关于',
    contact: '联系',
  },

  a11y: {
    skipToContent: '跳至正文',
    primaryNavigation: '主导航',
    localeSwitch: '切换语言',
    openMenu: '菜单',
    closeMenu: '关闭',
    menuPanel: '导航菜单',
    homeLink: '返回首页',
  },

  status: {
    completed: '完成',
    'in-progress': '进行中',
    private: '非公开',
  },

  pages: {
    home: {
      title: '首页',
      intro: '以空白为形。',
    },
    works: {
      title: '作品',
      intro: '按年份倒序排列的项目与作品集档案。非公开项目仅列出条目。',
    },
    programs: {
      title: '课程',
      intro: '四门课程，覆盖从基础到申请面试的完整周期。每门课程都以一份可投递的作品集为终点。',
    },
    about: {
      title: '关于',
      intro: '央艺是一间小型工作室。我们相信克制本身就是设计。',
    },
    contact: {
      title: '联系',
      intro: '欢迎来信预约面谈，或到北京的工作室坐一坐。',
    },
  },

  work: {
    indexColumn: '编号',
    titleColumn: '项目',
    disciplineColumn: '领域',
    yearColumn: '年份',
    statusColumn: '状态',
    creditsHeading: '参与',
    summaryHeading: '简介',
    privateNotice: '该项目应作者要求不公开展示。',
  },

  program: {
    durationLabel: '周期',
    formatLabel: '形式',
    audienceLabel: '对象',
    outcomesLabel: '产出',
  },

  mentor: {
    heading: '导师',
    roleLabel: '方向',
    institutionLabel: '院校',
  },

  contact: {
    emailLabel: '邮箱',
    wechatLabel: '微信',
    addressLabel: '地址',
    followLabel: '关注',
  },

  footer: {
    /** `{year}` is substituted at build time. */
    copyright: '© {year} c.a.f.a Atelier 央艺 · 保留所有权利',
  },

  localeSwitch: {
    zh: '中',
    en: 'EN',
  },
} as const;

/** Widens every string literal back to `string`, leaving the shape intact. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/**
 * The contract for a locale. `en.ts` is written `satisfies Dictionary`, so a missing
 * key, an extra key or a restructured group is a build error rather than a blank
 * space on the page.
 */
export type Dictionary = Widen<typeof zh>;
