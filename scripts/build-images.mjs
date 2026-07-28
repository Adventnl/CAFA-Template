/**
 * ARCHITECTURE.md §6 — the whole image pipeline.
 *
 * Walks public/media/source, writes AVIF + WebP derivatives into
 * public/media/derived (gitignored), and records intrinsic dimensions and the
 * variant list in src/lib/image-manifest.generated.json, which Media.tsx reads.
 *
 * Incremental: a source file whose mtime and size are unchanged and whose
 * outputs are all still on disk is skipped. Run via `npm run prebuild`.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'public', 'media', 'source');
const DERIVED_DIR = path.join(ROOT, 'public', 'media', 'derived');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'image-manifest.generated.json');
const CACHE = path.join(ROOT, '.cache', 'images.json');

const WIDTHS = [480, 768, 1200, 1800, 2400];
const FORMATS = [
  { ext: 'avif', encode: (pipeline) => pipeline.avif({ quality: 55 }) },
  { ext: 'webp', encode: (pipeline) => pipeline.webp({ quality: 78 }) },
];
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

/** Every source image, as paths relative to SOURCE_DIR, in POSIX form. */
async function collectSources(dir = SOURCE_DIR, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      found.push(...(await collectSources(path.join(dir, entry.name), key)));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(key);
    }
  }
  return found;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * The widths worth emitting: every step below the source's own width, plus the
 * source width itself capped at the largest step. A 900px original yields 480
 * and 900, never an upscaled 1200.
 */
function targetWidths(sourceWidth) {
  const cap = Math.min(sourceWidth, WIDTHS[WIDTHS.length - 1]);
  return [...new Set([...WIDTHS.filter((width) => width < cap), cap])];
}

async function derive(key) {
  const sourceFile = path.join(SOURCE_DIR, key);
  const { width, height } = await sharp(sourceFile).metadata();
  if (!width || !height) throw new Error(`Cannot read the dimensions of ${key}`);

  const stem = key.replace(/\.[^.]+$/, '');
  await mkdir(path.join(DERIVED_DIR, path.dirname(key)), { recursive: true });

  const formats = { avif: [], webp: [] };
  for (const target of targetWidths(width)) {
    for (const { ext, encode } of FORMATS) {
      const outputKey = `${stem}-${target}.${ext}`;
      await encode(sharp(sourceFile).resize({ width: target })).toFile(
        path.join(DERIVED_DIR, outputKey),
      );
      formats[ext].push({ src: `/media/derived/${outputKey}`, width: target });
    }
  }

  return { width, height, formats };
}

const sources = await collectSources().catch(() => []);
const cache = await readJson(CACHE, {});
const manifest = {};
const nextCache = {};
let built = 0;

for (const key of sources) {
  const { mtimeMs, size } = await stat(path.join(SOURCE_DIR, key));
  const cached = cache[key];
  const outputs = cached
    ? [...cached.entry.formats.avif, ...cached.entry.formats.webp].map((variant) =>
        path.join(ROOT, 'public', variant.src),
      )
    : [];
  const reusable =
    cached !== undefined &&
    cached.mtimeMs === mtimeMs &&
    cached.size === size &&
    (await Promise.all(outputs.map(exists))).every(Boolean);

  const entry = reusable ? cached.entry : await derive(key);
  if (!reusable) built += 1;
  manifest[key] = entry;
  nextCache[key] = { mtimeMs, size, entry };
}

await mkdir(path.dirname(CACHE), { recursive: true });
await writeFile(CACHE, JSON.stringify(nextCache));
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.info(`images: ${sources.length} source, ${built} rebuilt`);
