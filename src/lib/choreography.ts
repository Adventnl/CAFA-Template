/**
 * Which trigger and effect each surface gets. MOTION.md §5.4–5.5.
 *
 * The combinations are data, not hand-written CSS per surface: a component reads
 * one of these presets and hands it to <ScrollScene>, which sets the attributes
 * styles/motion/triggers.css and effects.css key off. That is why "give the
 * mentor grid a shallower focus" is an edit here, not a new stylesheet — and why
 * the §5.5 coverage audit can be read straight off this object.
 *
 * Depth 0–3 scales an effect's magnitude (§5.4); the focus curve reads it as one
 * of its four tuned steps (§6).
 */
export type SceneKind =
  | 'scrub'
  | 'enter'
  | 'progress'
  | 'batch'
  | 'pin'
  | 'pin-scrub'
  | 'snap';

export type SceneEffect =
  | 'focus'
  | 'drift'
  | 'rise'
  | 'fall'
  | 'slide'
  | 'unmask'
  | 'tilt'
  | 'shear'
  | 'dim'
  | 'recede';

export type Depth = 0 | 1 | 2 | 3;

export interface Scene {
  kind: SceneKind;
  effect: SceneEffect;
  depth: Depth;
}

/**
 * One entry per surface in the §5.5 audit that the current DOM has. The plan's
 * more elaborate kinds — the home statement's pinned unmask, the works rail's
 * linked timeline — arrive with the structure they need (the rail is Phase 6);
 * where a surface here reads a lighter kind than the audit's ideal, it is because
 * that ideal wants markup this surface does not yet have, and `enter` is the
 * honest degradation until it does.
 */
export const scenes = {
  /** Home, the studio plates below the fold: biggest at centre, drifting. */
  studioPlate: { kind: 'scrub', effect: 'focus', depth: 3 },
  /** Works index rows: assemble as the list scrolls in. */
  worksRows: { kind: 'batch', effect: 'slide', depth: 1 },
  /** Work detail media column: the focus curve, at column depth. */
  workMedia: { kind: 'scrub', effect: 'focus', depth: 2 },
  /** Work detail pager: rises in as the document nears its end. */
  workPager: { kind: 'progress', effect: 'rise', depth: 1 },
  /** Programme entries: each unmasks as it enters. */
  programmeEntry: { kind: 'enter', effect: 'unmask', depth: 1 },
  /** Mentor grid: a shallow focus, staggered by the batch. */
  mentors: { kind: 'batch', effect: 'focus', depth: 1 },
  /** Contact: slides in from the direction the navigation arrived. */
  contact: { kind: 'enter', effect: 'slide', depth: 1 },
  /** Footer: rises in at the end of the document. */
  footer: { kind: 'progress', effect: 'rise', depth: 1 },
} as const satisfies Record<string, Scene>;

/** The data attributes triggers.css and effects.css key off. */
interface SceneAttrs {
  'data-scene': SceneKind;
  'data-effect': SceneEffect;
  'data-depth': Depth;
}

/**
 * A scene as a spreadable set of attributes, so it lands on the element that is
 * already there — `<ul {...sceneAttrs(scenes.worksRows)}>` — rather than in a
 * wrapper div that would sit between a grid and its placed children. This is the
 * "<ScrollScene> that does nothing but set attributes" of §5.3, minus the DOM
 * node. It is pure and server-side, so it ships nothing.
 */
export function sceneAttrs(scene: Scene): SceneAttrs {
  return { 'data-scene': scene.kind, 'data-effect': scene.effect, 'data-depth': scene.depth };
}
