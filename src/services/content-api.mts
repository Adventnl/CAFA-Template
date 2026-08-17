/**
 * The contract with CAFA-Admin, read half — and the only module in this
 * repository that knows the admin exists.
 *
 * **This is a build-time service, not a runtime one.** It is called once, by
 * scripts/fetch-content.mjs, before Next starts; the result is written to
 * src/content/bundle.generated.json and everything downstream imports that
 * file. Nothing here is reachable from a page, and nothing here ships to a
 * browser. Calling it from a component would put three serial round trips
 * ahead of the LCP image and leave intrinsic dimensions unavailable until
 * after first paint, which breaks CLAUDE.md §7 structurally rather than
 * marginally — see §1.
 *
 * It lives in src/ rather than in the script that calls it for one reason
 * worth the file: here it is type-checked. `next build` runs tsc over src/
 * under `strict` and `noUncheckedIndexedAccess`, so the shape the admin
 * promises is checked by the compiler on every build, where as a plain .mjs
 * it was checked by nobody.
 *
 * The two endpoints it reads are the two the admin answers *outside* its usual
 * `{ success, data }` envelope, which is deliberate on that side and documented
 * there: they are a contract with a build script, not with a client that shows
 * `msg` to a person.
 */

/** The envelope both build endpoints answer. */
interface BundleEnvelope {
  revision: number;
  bundle: Record<string, unknown>;
}

/**
 * The envelope flattened, which is what goes to disk.
 *
 * lib/content and lib/media each import that file and reach for their own part
 * of it; neither cares about an envelope, so it is unwrapped once here rather
 * than stepped through twice down there. The fields stay `unknown`: every one
 * of them is checked by lib/content-schema at module scope, and re-describing
 * them here would be a second declaration of the same shape for the compiler
 * to believe and nobody to verify.
 */
export type ContentBundle = Record<string, unknown> & { revision: number };

export interface ContentRead {
  /**
   * The endpoint to read. Production builds point it at
   * /api/content/published; the preview build points it at
   * /api/content/draft.
   */
  endpoint: string;
  /** Only the preview build has one. It is what unlocks unpublished work. */
  previewToken?: string;
}

/**
 * Every reason a read can fail, as one type the caller can report and exit on.
 *
 * A build that was *told* where to look and could not reach it fails — quietly
 * shipping yesterday's content because a network call timed out is the one
 * outcome worth refusing.
 */
export class ContentApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentApiError';
  }
}

function isEnvelope(payload: unknown): payload is BundleEnvelope {
  if (typeof payload !== 'object' || payload === null) return false;
  const found = payload as Record<string, unknown>;
  return (
    typeof found.revision === 'number' &&
    typeof found.bundle === 'object' &&
    found.bundle !== null &&
    !Array.isArray(found.bundle)
  );
}

export async function readBundle({ endpoint, previewToken }: ContentRead): Promise<ContentBundle> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: previewToken === undefined ? {} : { 'X-Preview-Token': previewToken },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ContentApiError(`could not reach ${endpoint}\n  ${reason}`);
  }

  if (!response.ok) {
    throw new ContentApiError(`${endpoint} answered ${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json().catch(() => undefined);
  if (!isEnvelope(payload)) {
    throw new ContentApiError('the response was not a { revision, bundle } envelope');
  }

  return { revision: payload.revision, ...payload.bundle };
}

/** What the fetch prints, so the log says what arrived rather than that it did. */
export function describeBundle(bundle: ContentBundle): string {
  const works = Array.isArray(bundle.works) ? bundle.works.length : 0;
  const media = bundle.media;
  const images = typeof media === 'object' && media !== null ? Object.keys(media).length : 0;
  return `revision ${bundle.revision}, ${works} works, ${images} images`;
}
