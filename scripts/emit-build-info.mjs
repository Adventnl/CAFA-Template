/**
 * Writes out/build-info.json — the content revision this build came from.
 *
 * CAFA-Admin reads it back from the deployed origin to answer "is it live
 * yet?". What it means, and why it is a revision number rather than a commit
 * SHA, lives with the rest of the admin contract in src/services/build-info.mts.
 *
 * Runs as `postbuild`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildInfo } from '../src/services/build-info.mts';

const ROOT = path.resolve(import.meta.dirname, '..');
const BUNDLE = path.join(ROOT, 'src', 'content', 'bundle.generated.json');

/** The bundle prebuild fetched. Absent means the build should not have got here. */
async function fetched() {
  try {
    return JSON.parse(await readFile(BUNDLE, 'utf8'));
  } catch {
    return undefined;
  }
}

const info = buildInfo(await fetched());

await writeFile(
  path.join(ROOT, 'out', 'build-info.json'),
  `${JSON.stringify(info, null, 2)}\n`,
  'utf8',
);

console.info(`build-info: revision ${info.revision ?? 'unknown'}`);
