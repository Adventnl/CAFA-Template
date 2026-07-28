/*
 * TEMPORARY — the design-system specimen from Phase 1, now also the route the image
 * pipeline is inspected on. It exists to be looked at next to docs/DESIGN-SYSTEM.md
 * §2–§4, and it is the one file in the repo allowed to hold literal display strings.
 * Delete it when the real home page lands.
 */
import { Media } from '@/components/primitives/Media';
import { Text, type TextRole } from '@/components/primitives/Text';
import { getWorks } from '@/lib/content';
import { getImageEntry } from '@/lib/image-manifest';
import { resolveLocale } from '@/lib/locale';

import styles from './page.module.css';

const TYPE: { role: TextRole; spec: string; latin: string; zh: string }[] = [
  {
    role: 'display',
    spec: 'display — clamp(2.25→4.5rem) / 1.02 / −0.02em / 400',
    latin: 'Confidence through absence',
    zh: '以空白为形',
  },
  {
    role: 'title',
    spec: 'title — clamp(1.25→1.75rem) / 1.15 / −0.012em / 400',
    latin: 'Portfolio mentorship',
    zh: '作品集辅导',
  },
  {
    role: 'body',
    spec: 'body — clamp(0.9375→1.0625rem) / 1.62 / 0 / 400',
    latin:
      'A dense, quiet list of works. Structure comes from alignment to a grid, never from a border or a card. When unsure between adding and removing, remove.',
    zh: '一份安静而密实的作品目录。结构只来自于网格的对齐，而不是边框或卡片。在增与减之间犹豫时，选择减。',
  },
  {
    role: 'index',
    spec: 'index — 13px / 1.7 / 0 / 400',
    latin: '012  Edible House  Architecture  2024',
    zh: '012  可食之屋  建筑  二〇二四',
  },
  {
    role: 'meta',
    spec: 'meta — 11px / 1.55 / 0.01em / 400',
    latin: 'Photography by the studio. Completed, Beijing.',
    zh: '摄影：工作室。已完成，北京。',
  },
  {
    role: 'label',
    spec: 'label — 11px / 1 / 0.09em / 500 / uppercase',
    latin: 'Works  Programmes  About  Contact',
    zh: '作品  课程  关于  联系',
  },
];

const SPACE: { token: string; bar: string | undefined }[] = [
  { token: '--space-3xs', bar: styles.bar3xs },
  { token: '--space-2xs', bar: styles.bar2xs },
  { token: '--space-xs', bar: styles.barXs },
  { token: '--space-s', bar: styles.barS },
  { token: '--space-m', bar: styles.barM },
  { token: '--space-l', bar: styles.barL },
  { token: '--space-xl', bar: styles.barXl },
  { token: '--space-2xl', bar: styles.bar2xl },
  { token: '--space-3xl', bar: styles.bar3xl },
];

const COLOUR: { token: string; chip: string | undefined }[] = [
  { token: '--c-paper', chip: styles.chipPaper },
  { token: '--c-paper-raised', chip: styles.chipPaperRaised },
  { token: '--c-ink', chip: styles.chipInk },
  { token: '--c-ink-70', chip: styles.chipInk70 },
  { token: '--c-ink-45', chip: styles.chipInk45 },
  { token: '--c-ink-dim', chip: styles.chipInkDim },
  { token: '--c-ink-16', chip: styles.chipInk16 },
  { token: '--c-inverse', chip: styles.chipInverse },
  { token: '--c-focus', chip: styles.chipFocus },
  { token: '--c-scrim', chip: styles.chipScrim },
];

export default async function SpecimenPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  // Only the works whose derivatives actually exist — the rest of the registry names
  // images that have not been shot yet.
  const plates = getWorks()
    .filter((work) => getImageEntry(work.cover.src) !== undefined)
    .slice(0, 3);

  return (
    <div className={styles.page}>
      <header className={styles.row}>
        <Text role="label">c.a.f.a atelier 央艺</Text>
        <Text role="display" as="h1">
          Design system specimen
        </Text>
      </header>

      <section className={styles.section}>
        <Text role="label" as="h2" className={styles.sectionHead}>
          Type
        </Text>
        <div className={styles.rows}>
          {TYPE.map(({ role, spec, latin, zh }) => (
            <div key={role} className={styles.row}>
              <Text role="meta" className={styles.spec}>
                {spec}
              </Text>
              <div lang="en">
                <Text role={role}>{latin}</Text>
              </div>
              <div lang="zh">
                <Text role={role}>{zh}</Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Text role="label" as="h2" className={styles.sectionHead}>
          Space
        </Text>
        <div className={styles.rows}>
          {SPACE.map(({ token, bar }) => (
            <div key={token} className={styles.measure}>
              <Text role="meta" className={styles.spec}>
                {token}
              </Text>
              <div className={[styles.bar, bar].filter(Boolean).join(' ')} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Text role="label" as="h2" className={styles.sectionHead}>
          Colour
        </Text>
        <div className={styles.swatches}>
          {COLOUR.map(({ token, chip }) => (
            <div key={token} className={styles.swatch}>
              <div className={[styles.chip, chip].filter(Boolean).join(' ')} />
              <Text role="meta" className={styles.spec}>
                {token}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Text role="label" as="h2" className={styles.sectionHead}>
          Media
        </Text>
        <div className={styles.plates}>
          {plates.map((work) => (
            <Media
              key={work.slug}
              image={work.cover}
              locale={locale}
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
