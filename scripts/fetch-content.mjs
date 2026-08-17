/**
 * Fetches the published content from CAFA-Admin, before Next starts.
 *
 * This is the whole of "the site now reads from a database". The site is still
 * a static export with no server runtime and no client-side data fetching — the
 * content simply arrives over the wire at build time instead of sitting in six
 * files in this repository. Every performance budget in CLAUDE.md §7 is
 * unaffected, because by the time a browser is involved the HTML is already
 * built.
 *
 * The conversation with the admin lives in src/services/content-api.mts, where
 * the compiler can see it. What is left here is the part that is a command
 * rather than a contract: the environment, the disk, and the exit code.
 *
 * Runs as `prebuild`, and as part of `npm run dev`.
 *
 *   CONTENT_API    the endpoint to read. Production builds point it at
 *                  /api/content/published; the preview build points it at
 *                  /api/content/draft and sends PREVIEW_TOKEN with it.
 *   PREVIEW_TOKEN  optional; only the preview build has one.
 *
 * With CONTENT_API unset it reuses whatever bundle is already on disk, so a
 * local checkout can build offline once it has fetched once. A build that was
 * *told* where to look and could not reach it fails instead — quietly shipping
 * yesterday's content because a network call timed out is the one outcome worth
 * refusing.
 */
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ContentApiError, describeBundle, readBundle } from '../src/services/content-api.mts';

const OUT = path.resolve(import.meta.dirname, '..', 'src', 'content', 'bundle.generated.json');
const API = process.env.CONTENT_API;
const TOKEN = process.env.PREVIEW_TOKEN;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

if (!API) {
  if (await exists(OUT)) {
    console.info('content: CONTENT_API unset, reusing the bundle already on disk');
    process.exit(0);
  }
  console.error(
    [
      'content: CONTENT_API is not set and there is no bundle to fall back on.',
      '',
      'Point it at the admin, for example:',
      '  CONTENT_API=https://admin.cafa-studio.com/api/content/published npm run build',
    ].join('\n'),
  );
  process.exit(1);
}

let bundle;
try {
  bundle = await readBundle({ endpoint: API, previewToken: TOKEN });
} catch (error) {
  if (!(error instanceof ContentApiError)) throw error;
  console.error(`content: ${error.message}`);
  process.exit(1);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

console.info(`content: ${describeBundle(bundle)}`);
