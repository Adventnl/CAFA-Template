/**
 * Placeholder photography for the template.
 *
 * This is not part of the build. It exists because the repo ships as a template
 * and a portfolio with no pictures cannot be judged: the whole design rests on
 * imagery carrying the colour while the interface stays monochrome
 * (DESIGN-SYSTEM.md §2). Run it once after adding a work, then commit the JPEGs.
 *
 *   npm run placeholders
 *
 * It never invents its own file list. It scans src/content for every `src:`
 * on an ImageRef and draws whatever is missing, so the rule in CLAUDE.md §4 —
 * a new work is one content file and its images, nothing else — still holds.
 * Existing files are left alone unless --force is passed.
 *
 * Output is deterministic: the path is the seed, so the same path always yields
 * the same picture and a rerun produces no diff.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const SOURCE_DIR = path.join(ROOT, 'public', 'media', 'source');

/** Long edge. build-images.mjs emits 480/768/1200/1800 from this. */
const LONG_EDGE = 1800;

/*
 * Hue families, as HSL. Every one is under 20% saturation: the reference sites
 * are monochrome and the photography is what carries colour, so these have to
 * read as a tinted grey and not as a palette. DESIGN-SYSTEM.md §2.
 */
const PALETTES = [
  { name: 'clay', hue: 24, saturation: 14 },
  { name: 'ochre', hue: 41, saturation: 17 },
  { name: 'sage', hue: 96, saturation: 9 },
  { name: 'slate', hue: 214, saturation: 11 },
  { name: 'ash', hue: 40, saturation: 4 },
  { name: 'rose', hue: 8, saturation: 10 },
  { name: 'moss', hue: 140, saturation: 7 },
];

/** Long-edge ÷ short-edge, and whether the long edge is horizontal. */
const RATIOS = [
  { w: 3, h: 2 },
  { w: 4, h: 5 },
  { w: 1, h: 1 },
  { w: 16, h: 9 },
  { w: 5, h: 4 },
  { w: 2, h: 3 },
  { w: 4, h: 3 },
];

/**
 * Weighted, because an even draw put a ruled grid in a third of the set and the
 * page read as graph paper. The first three carry the tone; the rest punctuate.
 */
const COMPOSITION_WEIGHTS = {
  wall: 4,
  terrain: 3,
  drape: 3,
  paper: 2,
  object: 2,
  grid: 1,
};

/** A string seed to a repeatable 0–1 generator. */
function random(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Helpers over a generator, so the drawing code reads as intent. */
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const between = (rng, low, high) => low + rng() * (high - low);
const tone = (palette, lightness) =>
  `hsl(${palette.hue} ${palette.saturation}% ${Math.round(lightness)}%)`;

/**
 * Six compositions. They are abstract on purpose — a placeholder that pretends
 * to be a photograph of a specific building invites someone to ship it. These
 * read as light on a surface, which is enough to judge tone, weight and rhythm.
 */
const COMPOSITIONS = {
  /** Two planes meeting at an edge, lit from one side. */
  wall(rng, palette, width, height) {
    const split = between(rng, 0.28, 0.68) * width;
    const dark = between(rng, 26, 44);
    const light = between(rng, 72, 88);
    const skew = between(rng, -0.09, 0.09) * height;
    return `
      <rect width="${width}" height="${height}" fill="${tone(palette, light)}"/>
      <path d="M0 0 L${split} ${skew} L${split} ${height + skew} L0 ${height} Z"
            fill="${tone(palette, dark)}"/>
      <rect x="${split}" y="0" width="${width - split}" height="${height}"
            fill="url(#sweep)" opacity="0.85"/>
      <rect x="${split - between(rng, 1, 3)}" y="0" width="${between(rng, 1, 3)}"
            height="${height}" fill="${tone(palette, dark - 12)}" opacity="0.5"/>`;
  },

  /** A single form against a graded ground, with a cast shadow. */
  object(rng, palette, width, height) {
    const cx = between(rng, 0.34, 0.66) * width;
    const cy = between(rng, 0.36, 0.6) * height;
    const radius = between(rng, 0.17, 0.3) * Math.min(width, height);
    const solid = tone(palette, between(rng, 30, 58));
    const arc = rng() > 0.5;
    return `
      <rect width="${width}" height="${height}" fill="${tone(palette, between(rng, 74, 89))}"/>
      <rect width="${width}" height="${height}" fill="url(#sweep)"/>
      <ellipse cx="${cx + radius * 0.5}" cy="${cy + radius * 1.05}"
               rx="${radius * 1.25}" ry="${radius * 0.22}"
               fill="${tone(palette, 34)}" opacity="0.2" filter="url(#soft)"/>
      ${
        arc
          ? `<path d="M${cx - radius} ${cy + radius} A${radius} ${radius} 0 0 1 ${cx + radius} ${cy + radius} Z"
                   fill="${solid}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${solid}"/>`
      }
      <rect x="0" y="${cy + radius}" width="${width}" height="${height - cy - radius}"
            fill="${tone(palette, between(rng, 60, 72))}" opacity="0.6"/>`;
  },

  /** Overlapping sheets at slight angles. The closest thing here to a still life. */
  paper(rng, palette, width, height) {
    const sheets = Math.round(between(rng, 3, 5));
    let out = `<rect width="${width}" height="${height}" fill="${tone(palette, between(rng, 62, 76))}"/>`;
    for (let index = 0; index < sheets; index += 1) {
      const w = between(rng, 0.34, 0.6) * width;
      const h = between(rng, 0.34, 0.62) * height;
      const x = between(rng, -0.06, 0.62) * width;
      const y = between(rng, -0.06, 0.58) * height;
      const angle = between(rng, -7, 7);
      out += `
        <g transform="rotate(${angle} ${x + w / 2} ${y + h / 2})">
          <rect x="${x + 6}" y="${y + 10}" width="${w}" height="${h}"
                fill="${tone(palette, 34)}" opacity="0.14" filter="url(#soft)"/>
          <rect x="${x}" y="${y}" width="${w}" height="${h}"
                fill="${tone(palette, between(rng, 78, 94))}"/>
        </g>`;
    }
    return `${out}<rect width="${width}" height="${height}" fill="url(#sweep)" opacity="0.7"/>`;
  },

  /** Horizontal bands. Reads as a landscape or as a drawn section. */
  terrain(rng, palette, width, height) {
    const bands = Math.round(between(rng, 4, 8));
    let out = `<rect width="${width}" height="${height}" fill="${tone(palette, 84)}"/>`;
    let y = 0;
    for (let index = 0; index < bands; index += 1) {
      const h = (height / bands) * between(rng, 0.6, 1.5);
      const drop = between(rng, -0.04, 0.04) * height;
      out += `
        <path d="M0 ${y} L${width} ${y + drop} L${width} ${y + h + drop} L0 ${y + h} Z"
              fill="${tone(palette, between(rng, 28, 82))}" opacity="${between(rng, 0.55, 1)}"/>`;
      y += h;
    }
    return `${out}<rect width="${width}" height="${height}" fill="url(#sweep)" opacity="0.8"/>`;
  },

  /** A ruled field, out of focus at one end. Reads as a plan. */
  grid(rng, palette, width, height) {
    const step = between(rng, 0.055, 0.11) * Math.min(width, height);
    const ink = tone(palette, between(rng, 30, 46));
    let out = `<rect width="${width}" height="${height}" fill="${tone(palette, between(rng, 80, 91))}"/>`;
    out += `<g stroke="${ink}" stroke-width="${Math.max(1, width / 900)}" opacity="0.45">`;
    for (let x = step; x < width; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`;
    for (let y = step; y < height; y += step) out += `<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`;
    out += '</g>';
    const bx = between(rng, 0.1, 0.5) * width;
    const by = between(rng, 0.1, 0.5) * height;
    out += `<rect x="${bx}" y="${by}" width="${between(rng, 0.22, 0.44) * width}"
                  height="${between(rng, 0.2, 0.42) * height}" fill="${ink}" opacity="0.65"/>`;
    return `${out}<rect width="${width}" height="${height}" fill="url(#sweep)" opacity="0.9"/>`;
  },

  /** Soft overlapping curves. The one composition with no straight edge. */
  drape(rng, palette, width, height) {
    let out = `<rect width="${width}" height="${height}" fill="${tone(palette, between(rng, 70, 86))}"/>`;
    const folds = Math.round(between(rng, 3, 6));
    for (let index = 0; index < folds; index += 1) {
      const y = between(rng, -0.1, 0.9) * height;
      const amp = between(rng, 0.08, 0.26) * height;
      out += `
        <path d="M0 ${y} C ${width * 0.3} ${y - amp}, ${width * 0.7} ${y + amp}, ${width} ${y}
                 L${width} ${height} L0 ${height} Z"
              fill="${tone(palette, between(rng, 30, 78))}" opacity="${between(rng, 0.4, 0.85)}"/>`;
    }
    return `${out}<rect width="${width}" height="${height}" fill="url(#sweep)" opacity="0.75"/>`;
  },
};

/** The weights above, expanded into a list `pick` can draw from evenly. */
const COMPOSITION_DRAW = Object.entries(COMPOSITION_WEIGHTS).flatMap(([name, weight]) =>
  Array.from({ length: weight }, () => name),
);

/**
 * The pass every composition gets on top of it. Without it each one is a single
 * flat idea, and a page of them reads as a wireframe rather than as pictures:
 * what makes a photograph feel like one at this size is incident — an edge
 * catching light, a rule, one small dark thing to anchor the eye.
 */
function incident(rng, palette, width, height) {
  let out = '';

  // A shaft of light across the frame. The commonest reason a flat wall reads
  // as photographed rather than filled.
  if (rng() > 0.35) {
    const x = between(rng, -0.1, 0.7) * width;
    const w = between(rng, 0.08, 0.3) * width;
    const lean = between(rng, -0.3, 0.3) * width;
    out += `
      <path d="M${x} 0 L${x + w} 0 L${x + w + lean} ${height} L${x + lean} ${height} Z"
            fill="${tone(palette, 97)}" opacity="${between(rng, 0.06, 0.16).toFixed(2)}"/>`;
  }

  // Hairlines. Always fewer than they want to be.
  const rules = Math.round(between(rng, 0, 3));
  for (let index = 0; index < rules; index += 1) {
    const horizontal = rng() > 0.45;
    const at = between(rng, 0.1, 0.9);
    out += horizontal
      ? `<line x1="0" y1="${at * height}" x2="${width}" y2="${at * height}"
               stroke="${tone(palette, between(rng, 18, 40))}" stroke-width="${Math.max(1, width / 1400)}"
               opacity="${between(rng, 0.2, 0.5).toFixed(2)}"/>`
      : `<line x1="${at * width}" y1="0" x2="${at * width}" y2="${height}"
               stroke="${tone(palette, between(rng, 18, 40))}" stroke-width="${Math.max(1, width / 1400)}"
               opacity="${between(rng, 0.2, 0.5).toFixed(2)}"/>`;
  }

  // The dark anchor. One per frame at most, never centred, and often running
  // off an edge — at postage-stamp size a fully contained one read as a dead
  // pixel rather than as something in the room.
  if (rng() > 0.4) {
    const w = between(rng, 0.08, 0.26) * width;
    const h = between(rng, 0.12, 0.42) * height;
    out += `
      <rect x="${between(rng, -0.05, 0.9) * width}" y="${between(rng, -0.05, 0.85) * height}"
            width="${w}" height="${h}" fill="${tone(palette, between(rng, 12, 28))}"
            opacity="${between(rng, 0.5, 0.85).toFixed(2)}"/>`;
  }

  return out;
}

/**
 * Film grain, done in sharp rather than SVG. librsvg silently drops
 * `feTurbulence` at these raster sizes — the surfaces came out perfectly flat,
 * which is the one thing a photograph never is. Mid-grey is the identity value
 * under `overlay`, so noise around 128 tints nothing and only breaks up the
 * gradients.
 */
function grain(rng, width, height) {
  const amplitude = between(rng, 26, 46);
  const pixels = Buffer.allocUnsafe(width * height);
  for (let index = 0; index < pixels.length; index += 1) {
    pixels[index] = 128 + Math.round((rng() - 0.5) * amplitude);
  }
  return { input: pixels, raw: { width, height, channels: 1 }, blend: 'overlay' };
}

/**
 * A cover is the full-bleed hover backdrop, so it is always landscape; a
 * portrait is always portrait. Everything else varies, which is the point —
 * DESIGN-SYSTEM.md §8 rule 5 keeps the column constant and lets the ratio move.
 */
function dimensions(rng, key) {
  const portrait = key.startsWith('mentors/');
  const landscape = key.endsWith('/cover.jpg') || key === 'studio.jpg';
  const ratio = landscape ? { w: 3, h: 2 } : portrait ? { w: 4, h: 5 } : pick(rng, RATIOS);
  return ratio.w >= ratio.h
    ? { width: LONG_EDGE, height: Math.round((LONG_EDGE * ratio.h) / ratio.w) }
    : { width: Math.round((LONG_EDGE * ratio.w) / ratio.h), height: LONG_EDGE };
}

function draw(key) {
  const rng = random(key);
  const palette = pick(rng, PALETTES);
  const { width, height } = dimensions(rng, key);
  // A portrait is a person: one form against a ground, never a ruled grid.
  const composition = key.startsWith('mentors/') ? 'object' : pick(rng, COMPOSITION_DRAW);

  const angle = between(rng, 0, 360);
  const x2 = Math.cos((angle * Math.PI) / 180);
  const y2 = Math.sin((angle * Math.PI) / 180);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="sweep" x1="0" y1="0" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}">
        <stop offset="0" stop-color="${tone(palette, 96)}" stop-opacity="${between(rng, 0.1, 0.4).toFixed(2)}"/>
        <stop offset="0.55" stop-color="${tone(palette, 60)}" stop-opacity="0"/>
        <stop offset="1" stop-color="${tone(palette, 12)}" stop-opacity="${between(rng, 0.22, 0.5).toFixed(2)}"/>
      </linearGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.48" r="0.75">
        <stop offset="0.4" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="${between(rng, 0.14, 0.3).toFixed(2)}"/>
      </radialGradient>
      <filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="${(Math.min(width, height) * 0.02).toFixed(1)}"/>
      </filter>
    </defs>
    ${COMPOSITIONS[composition](rng, palette, width, height)}
    ${incident(rng, palette, width, height)}
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
  </svg>`;

  return { svg, grain: grain(rng, width, height) };
}

/**
 * Every ImageRef in content/, by reading the files rather than repeating them.
 * A `src:` on an ImageRef is the one shape being matched; nothing else in
 * content/ uses that key.
 */
async function referencedImages(dir = CONTENT_DIR) {
  const found = new Set();
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const key of await referencedImages(full)) found.add(key);
    } else if (entry.name.endsWith('.ts')) {
      const source = await readFile(full, 'utf8');
      for (const [, key] of source.matchAll(/\bsrc:\s*'([^']+\.(?:jpg|jpeg|png))'/g)) {
        found.add(key);
      }
    }
  }
  return found;
}

const force = process.argv.includes('--force');
const keys = [...(await referencedImages())].sort();
let written = 0;

for (const key of keys) {
  const file = path.join(SOURCE_DIR, key);
  if (!force) {
    const exists = await readFile(file).then(
      () => true,
      () => false,
    );
    if (exists) continue;
  }
  await mkdir(path.dirname(file), { recursive: true });
  const { svg, grain: noise } = draw(key);
  await writeFile(
    file,
    await sharp(Buffer.from(svg)).composite([noise]).jpeg({ quality: 84 }).toBuffer(),
  );
  written += 1;
}

console.info(`placeholders: ${keys.length} referenced, ${written} drawn`);
