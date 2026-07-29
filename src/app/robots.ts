import type { MetadataRoute } from 'next';

import { getSite } from '@/lib/content';

// Required under `output: export` — these are files on disk, not handlers.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', getSite().url).toString(),
  };
}
