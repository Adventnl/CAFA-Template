/**
 * Moves the exported /404/ route to out/404.html, which is the file a static
 * host serves for unmatched paths, and removes the directory so the page is not
 * reachable — or crawlable — at a URL of its own.
 *
 * Runs as `postbuild`. See src/app/(root)/404/page.tsx for why the page is a
 * route instead of app/not-found.tsx.
 */
import { rename, rm } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '..', 'out');

await rename(path.join(OUT, 'not-found', 'index.html'), path.join(OUT, '404.html'));

// The route's own directory, plus the two copies of Next's built-in error page
// that the exporter leaves at /404/ and /_not-found/. None of them is linked to.
for (const stale of ['not-found', '404', '_not-found']) {
  await rm(path.join(OUT, stale), { recursive: true, force: true });
}

console.info('404: out/not-found/index.html → out/404.html');
