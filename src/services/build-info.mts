/**
 * The contract with CAFA-Admin, answer half.
 *
 * The site reads a published revision from the admin; this is what it says
 * back. scripts/emit-build-info.mjs writes the result to out/build-info.json,
 * and the admin's DeployService fetches that from the deployed origin to answer
 * the one question the studio actually asks after pressing publish: "is it live
 * yet?". Comparing the newest published revision to what the site itself is
 * serving is ground truth, and needs no Cloudflare API credentials to obtain.
 *
 * It reported a commit SHA when the repository was the database. The revision
 * number replaces it exactly: a production build reads the newest revision, a
 * preview build reads a fingerprint of the draft, and the admin compares
 * whichever applies.
 */

export interface BuildInfo {
  /** The revision this build read, or null if there was no bundle to read. */
  revision: number | null;
  builtAt: string;
}

/**
 * Deliberately total: an unreadable bundle reports `null` rather than throwing.
 *
 * This runs as `postbuild`, after a build that has already succeeded, and the
 * bundle it reads has already been through lib/content-schema. There is no
 * failure left for it to catch that would not have stopped the build long
 * before — so the only honest answer to "which revision" for a build that
 * somehow has no bundle is that it does not know, and the admin already reads
 * `null` as "unknown" rather than as an error.
 */
export function buildInfo(bundle: unknown): BuildInfo {
  const revision =
    typeof bundle === 'object' && bundle !== null && 'revision' in bundle
      ? bundle.revision
      : undefined;

  return {
    revision: typeof revision === 'number' ? revision : null,
    builtAt: new Date().toISOString(),
  };
}
