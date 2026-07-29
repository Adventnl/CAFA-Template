import type { WorkStatus } from '@/lib/types';

/**
 * The source of truth for UI copy. `en.ts` is typed as `Dictionary`, so a key
 * added here and forgotten there is a build error.
 */
export const zh = {
  meta: {
    title: 'c.a.f.a atelier 央艺',
    titleTemplate: '%s — c.a.f.a atelier 央艺',
    description: '一间作品集辅导工作室，位于北京。建筑、空间、视觉与陶瓷。',
  },

  a11y: {
    skipToContent: '跳到正文',
    primaryNav: '主导航',
    localeSwitch: '切换语言',
    worksList: '作品目录',
    workPager: '作品导航',
  },

  home: {
    statement: '我们和学生一起，一次做一个项目，做完为止。',
    worksLink: '作品',
  },

  works: {
    title: '作品',
    description: '工作室与学生共同完成的项目。',
    // `satisfies` without `as const`: the keys are checked against WorkStatus,
    // the values stay `string` so en.ts is not forced to repeat these literals.
    status: {
      completed: '已完成',
      'in-progress': '进行中',
      private: '未公开',
    } satisfies Record<WorkStatus, string>,
  },

  work: {
    index: '编号',
    status: '状态',
    year: '年份',
    discipline: '类型',
    credits: '参与',
    previous: '上一个',
    next: '下一个',
  },

  programs: {
    title: '课程',
    description: '四种参与方式，从一对一辅导到对外开放的读书会。',
    intro: '我们只开四种课。每一种都要求你自己动手，没有一种可以旁听完事。',
  },

  about: {
    title: '关于',
    description: '关于 c.a.f.a atelier 央艺：我们是谁，怎么工作。',
    body: [
      '央艺是一间小工作室。我们不办讲座，不做批量辅导，同时在做的学生不超过二十人。',
      '我们相信作品集不是把作业排版好，而是把一个想法从头做到能站住。因此这里的每一个项目都从选题开始，也常常在中途推翻重来。',
      '工作室在北京，导师来自建筑、视觉、室内与陶瓷。多数时候我们和学生一起待在同一个房间里画图。',
    ],
    mentorsTitle: '导师',
  },

  contact: {
    title: '联系',
    description: '工作室地址、邮件与申请方式。',
    email: '邮件',
    wechat: '微信',
    address: '地址',
    hours: '开放时间',
    note: '申请请直接写邮件，附一份你现在手上的东西，不必整理。我们通常在三个工作日内回复，之后约一次面谈。这里没有报名表。',
  },

  notFound: {
    title: '这里没有页面',
    body: '你要找的地址不存在，或者已经改名。',
    home: '回到首页',
  },

  footer: {
    note: '本站由工作室自行搭建与维护。',
  },
};

export type Dictionary = typeof zh;
