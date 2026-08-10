/**
 * Writes out/build-info.json — the content revision this build came from.
 *
 * CAFA-Admin reads it from the deployed origin to answer the one question the
 * studio actually asks after pressing publish: "is it live yet?". Comparing the
 * newest published revision to what the site itself is serving is ground truth,
 * and needs no host API credentials to obtain.
 *
 * It used to report a commit SHA, because the repository was the database. The
 * revision number replaces it exactly: the production build reads the newest
 * revision, the preview build reads a fingerprint of the draft, and the admin
 * compares whichever applies.
 *
 * Runs as `postbuild`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');
const BUNDLE = path.join(ROOT, 'src', 'content', 'bundle.generated.json');

/** The bundle prebuild fetched. Absent means the build should not have got here. */
async function revision() {
  try {
    const bundle = JSON.parse(await readFile(BUNDLE, 'utf8'));
    return typeof bundle.revision === 'number' ? bundle.revision : null;
  } catch {
    return null;
  }
}

const info = { revision: await revision(), builtAt: new Date().toISOString() };

await writeFile(path.join(OUT, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`, 'utf8');

console.info(`build-info: revision ${info.revision ?? 'unknown'}`);
