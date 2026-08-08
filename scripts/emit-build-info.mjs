/**
 * Writes out/build-info.json — the commit this build came from.
 *
 * CAFA-Admin reads it from the deployed origin to answer the one question the
 * studio actually asks after pressing publish: "is it live yet?". Comparing a
 * branch head to what the site itself is serving is ground truth, and needs no
 * host API credentials to obtain.
 *
 * Runs as `postbuild`.
 */
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '..', 'out');

/** Cloudflare Workers Builds, then Pages, then Actions, then a local checkout. */
function commit() {
  const fromCi =
    process.env.WORKERS_CI_COMMIT_SHA ??
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.GITHUB_SHA;
  if (fromCi) return fromCi;

  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // A build from a tarball with no git and no CI. Saying so beats guessing.
    return null;
  }
}

const info = { commit: commit(), builtAt: new Date().toISOString() };

await writeFile(path.join(OUT, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`, 'utf8');

console.info(`build-info: ${info.commit ?? 'unknown commit'}`);
