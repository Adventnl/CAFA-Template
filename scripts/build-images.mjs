/*
 * Responsive derivative generator — ARCHITECTURE.md §6.
 *
 * Walks public/media/source, emits AVIF + WebP at the widths below (never above a
 * source's intrinsic width), and writes the manifest that Media.tsx reads. Runs as
 * `prebuild`, so `next build` always sees a current manifest.
 *
 * next/image cannot optimise under output: 'export'. This script is the replacement,
 * and the manifest is the only contract between it and the app.
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'public', 'media', 'source');
const MANIFEST_FILE = path.join(ROOT, 'src', 'lib', 'image-manifest.generated.json');
const CACHE_FILE = path.join(ROOT, '.cache', 'build-images.json');

const WIDTHS = [480, 768, 1200, 1800, 2400];
const AVIF_QUALITY = 55;
const WEBP_QUALITY = 78;
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

/** EXIF orientations 5–8 rotate the frame, so the stored dimensions are swapped. */
const SWAPPED_ORIENTATIONS = new Set([5, 6, 7, 8]);

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return {};
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

/** Every source image, as paths relative to SOURCE_DIR, in a stable order. */
async function collectSources(directory = SOURCE_DIR, prefix = '') {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await collectSources(path.join(directory, entry.name), relative)));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(relative);
    }
  }
  return files;
}

function targetWidths(intrinsicWidth) {
  const widths = WIDTHS.filter((width) => width <= intrinsicWidth);
  return widths.length > 0 ? widths : [intrinsicWidth];
}

/** "works/edible-house/01.jpg" + 1200 + "avif" → "/media/derived/works/edible-house/01-1200.avif" */
function derivedPath(relativeSource, width, format) {
  const withoutExtension = relativeSource.slice(0, -path.extname(relativeSource).length);
  return `/media/derived/${withoutExtension}-${width}.${format}`;
}

async function buildOne(relativeSource) {
  const absoluteSource = path.join(SOURCE_DIR, relativeSource);
  const pipeline = sharp(absoluteSource).rotate();
  const metadata = await pipeline.metadata();

  const swapped = SWAPPED_ORIENTATIONS.has(metadata.orientation ?? 1);
  const width = swapped ? metadata.height : metadata.width;
  const height = swapped ? metadata.width : metadata.height;

  const entry = { width, height, avif: [], webp: [] };
  let written = 0;

  for (const target of targetWidths(width)) {
    const resized = pipeline.clone().resize({ width: target, withoutEnlargement: true });

    for (const [format, options] of [
      ['avif', { quality: AVIF_QUALITY }],
      ['webp', { quality: WEBP_QUALITY }],
    ]) {
      const publicPath = derivedPath(relativeSource, target, format);
      const outputFile = path.join(ROOT, 'public', publicPath);
      await mkdir(path.dirname(outputFile), { recursive: true });
      await resized.clone().toFormat(format, options).toFile(outputFile);
      entry[format].push({ width: target, path: publicPath });
      written += 1;
    }
  }

  return { entry, written };
}

/** Every derivative the cached entry claims still has to be on disk. */
async function cacheIsUsable(cached, source) {
  if (!cached || cached.mtimeMs !== source.mtimeMs || cached.size !== source.size) return false;
  const files = [...cached.entry.avif, ...cached.entry.webp];
  const present = await Promise.all(files.map((file) => exists(path.join(ROOT, 'public', file.path))));
  return present.every(Boolean);
}

async function main() {
  const startedAt = Date.now();
  const sources = await collectSources();
  const cache = await readJson(CACHE_FILE);

  const manifest = {};
  const nextCache = {};
  let rebuilt = 0;
  let reused = 0;
  let derivatives = 0;

  for (const relativeSource of sources) {
    const { mtimeMs, size } = await stat(path.join(SOURCE_DIR, relativeSource));
    const cached = cache[relativeSource];

    if (await cacheIsUsable(cached, { mtimeMs, size })) {
      manifest[relativeSource] = cached.entry;
      nextCache[relativeSource] = cached;
      derivatives += cached.entry.avif.length + cached.entry.webp.length;
      reused += 1;
      continue;
    }

    const { entry, written } = await buildOne(relativeSource);
    manifest[relativeSource] = entry;
    nextCache[relativeSource] = { mtimeMs, size, entry };
    derivatives += written;
    rebuilt += 1;
  }

  await mkdir(path.dirname(MANIFEST_FILE), { recursive: true });
  await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, `${JSON.stringify(nextCache, null, 2)}\n`);

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `images: ${sources.length} source${sources.length === 1 ? '' : 's'}, ` +
      `${rebuilt} rebuilt, ${reused} cached, ${derivatives} derivatives, ${seconds}s`,
  );
  if (sources.length === 0) {
    console.log(`images: nothing found under ${path.relative(ROOT, SOURCE_DIR)}`);
  }
}

await main();
