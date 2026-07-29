/**
 * The spine of the motion system. MOTION.md §1 (idea one) and §2.
 *
 * A route change here is not a document swap — it has a *figure*: entering a
 * work, stepping through the pager, coming back out, moving laterally along the
 * nav, switching locale. Every piece of choreography in styles/motion/ is keyed
 * off the figure, which is what lets one named element have a different exit in
 * each. This module is the pure classifier that turns a (from, to) pair into
 * that figure; NavStage writes the result onto <html> before the transition
 * begins, and CSS does the rest.
 *
 * Pure: no DOM, no React, no content imports — so nothing here drags the works
 * registry into the client bundle. The layout assembles the NavContext from
 * content on the server (see `sectionSegment`) and passes it down.
 */
export type NavFigure =
  | 'enter-work'
  | 'exit-work'
  | 'step-work'
  | 'lateral'
  | 'descend'
  | 'ascend'
  | 'locale'
  | 'restore';

export interface NavIntent {
  figure: NavFigure;
  /** 1 or -1. Only `step-work` and `lateral` carry a real direction; the rest
      default to 1, since their figures are the same whichever way you came. */
  dir: 1 | -1;
}

/**
 * The small amount of content the classifier needs, resolved once on the server
 * and handed to NavStage as a plain object so the whole works registry never
 * has to reach the client bundle to answer "which way is work B from work A".
 */
export interface NavContext {
  locales: readonly string[];
  /** The URL segment whose children are detail pages — `works`, sourced from
      routes so the segment is never written here as a literal. */
  worksSection: string;
  /** slug → editorial index, for the sign that gives `step-work` its direction. */
  workIndex: Readonly<Record<string, number>>;
  /** Top-level section segments in nav order, for `lateral`'s direction. */
  sectionOrder: readonly string[];
}

interface Parts {
  locale: string | undefined;
  section: string | undefined;
  slug: string | undefined;
}

/** `/zh/works/the-long-table/` → { locale: 'zh', section: 'works', slug: '…' }.
    `filter(Boolean)` drops the empty segments a trailing slash leaves behind. */
function parse(path: string, locales: readonly string[]): Parts {
  const seg = path.split('/').filter(Boolean);
  const first = seg[0];
  if (first !== undefined && locales.includes(first)) {
    return { locale: first, section: seg[1], slug: seg[2] };
  }
  return { locale: undefined, section: first, slug: seg[1] };
}

/** Where `to` sits relative to `from` along the nav bar: after → 1, before → -1. */
function sectionDir(
  from: string | undefined,
  to: string | undefined,
  order: readonly string[],
): 1 | -1 {
  const a = from === undefined ? -1 : order.indexOf(from);
  const b = to === undefined ? -1 : order.indexOf(to);
  return b < a ? -1 : 1;
}

export function classifyNavigation(
  from: string,
  to: string,
  popstate: boolean,
  ctx: NavContext,
): NavIntent {
  // Going back or forward is a restoration, not a performance — MOTION.md §0.3.
  // It short-circuits every other figure, whatever the two paths are.
  if (popstate) return { figure: 'restore', dir: 1 };

  const f = parse(from, ctx.locales);
  const t = parse(to, ctx.locales);

  // Same page, other locale: the one figure that reads the first segment.
  if (f.locale !== t.locale && f.section === t.section && f.slug === t.slug) {
    return { figure: 'locale', dir: 1 };
  }

  const fromHome = f.section === undefined;
  const toHome = t.section === undefined;
  if (fromHome && toHome) return { figure: 'lateral', dir: 1 };
  if (fromHome) return { figure: 'descend', dir: 1 };
  if (toHome) return { figure: 'ascend', dir: -1 };

  if (f.section === ctx.worksSection && t.section === ctx.worksSection) {
    const fromWork = f.slug !== undefined;
    const toWork = t.slug !== undefined;
    if (!fromWork && toWork) return { figure: 'enter-work', dir: 1 };
    if (fromWork && !toWork) return { figure: 'exit-work', dir: -1 };
    if (fromWork && toWork) {
      const a = ctx.workIndex[f.slug as string];
      const b = ctx.workIndex[t.slug as string];
      const dir: 1 | -1 = a !== undefined && b !== undefined && b < a ? -1 : 1;
      return { figure: 'step-work', dir };
    }
  }

  return { figure: 'lateral', dir: sectionDir(f.section, t.section, ctx.sectionOrder) };
}

/** The second path segment — the section — of a locale-prefixed route, so the
    layout can build a NavContext from routes without spelling `works` out. */
export function sectionSegment(path: string): string | undefined {
  return path.split('/').filter(Boolean)[1];
}
