import type { Program } from '@/lib/types';

/** Ordered as they are taught, foundation first. */
export const programs: readonly Program[] = [
  {
    slug: 'foundation',
    title: { zh: '基础', en: 'Foundation' },
    duration: { zh: '十二周', en: 'Twelve weeks' },
    format: { zh: '每周一次，小组四人', en: 'Weekly, groups of four' },
    audience: { zh: '尚未确定方向的申请者', en: 'Applicants who have not yet chosen a direction' },
    summary: {
      zh: '从观察与记录开始，用十二周建立一套自己的工作方法。结课时手上有三个未完成的项目，而不是一个完成的。',
      en: 'Twelve weeks spent building a way of working, starting from observation and record. You finish with three unfinished projects rather than one finished one.',
    },
    outcomes: [
      { zh: '一本手稿册', en: 'One sketchbook' },
      { zh: '三个项目提案', en: 'Three project proposals' },
      { zh: '一次公开评图', en: 'One public review' },
    ],
  },
  {
    slug: 'portfolio-intensive',
    title: { zh: '作品集密集', en: 'Portfolio Intensive' },
    duration: { zh: '二十四周', en: 'Twenty-four weeks' },
    format: { zh: '一对一，线上或北京工作室', en: 'One to one, online or in the Beijing studio' },
    audience: { zh: '已有方向、准备当季申请的人', en: 'Those with a direction, applying this season' },
    summary: {
      zh: '把手上的材料整理成一份可以投递的作品集，四到六个项目，排版与叙事同时推进。每两周一次全案评审。',
      en: 'Turning what you already have into a portfolio you can send: four to six projects, with layout and narrative developed together. A full review every second week.',
    },
    outcomes: [
      { zh: '一份完整作品集', en: 'One complete portfolio' },
      { zh: '印刷与屏幕两个版本', en: 'A print and a screen version' },
      { zh: '项目陈述文本', en: 'Written project statements' },
    ],
  },
  {
    slug: 'thesis-research',
    title: { zh: '研究与论文', en: 'Thesis & Research' },
    duration: { zh: '十六周', en: 'Sixteen weeks' },
    format: { zh: '一对一，每两周一次', en: 'One to one, every second week' },
    audience: { zh: '研究生阶段与研究型申请者', en: 'Postgraduate and research-led applicants' },
    summary: {
      zh: '为研究型项目建立方法、文献与图示三条线索，并让它们在同一本册子里对齐。写作与制图同等重要。',
      en: 'Building the three threads of a research project — method, literature and drawing — and aligning them inside one volume. Writing counts as much as drawing.',
    },
    outcomes: [
      { zh: '一份研究计划书', en: 'One research proposal' },
      { zh: '一套图示系统', en: 'One drawing system' },
      { zh: '文献综述', en: 'A literature review' },
    ],
  },
  {
    slug: 'application-interview',
    title: { zh: '申请与面试', en: 'Application & Interview' },
    duration: { zh: '六周', en: 'Six weeks' },
    format: { zh: '一对一，含两次模拟面试', en: 'One to one, with two mock interviews' },
    audience: { zh: '作品集已完成、准备递交的人', en: 'Those with a finished portfolio, ready to submit' },
    summary: {
      zh: '把作品集翻译成十分钟的口头陈述，并针对每所院校调整材料顺序。模拟面试全程录像回看。',
      en: 'Translating a portfolio into a ten-minute spoken account, and reordering the material for each school. Mock interviews are recorded and watched back in full.',
    },
    outcomes: [
      { zh: '十分钟陈述稿', en: 'A ten-minute statement' },
      { zh: '各校材料清单', en: 'A per-school submission list' },
      { zh: '两次录像面试', en: 'Two recorded interviews' },
    ],
  },
];
